// 개발 서버 안에서 돌아가는 작은 API: POST /api/brief
// API 키는 여기(서버 쪽)에서만 .env로 읽는다. 브라우저 코드에는 절대 들어가지 않는다.
import { GoogleGenAI } from '@google/genai';
import { init, span, log } from 'neatlogs';
import { wrapGoogleGenAI } from 'neatlogs/google-genai';

function buildPrompt({ company, topic, direction, reference }) {
  const dir = direction === 'en-ko' ? '영어 → 한국어' : '한국어 → 영어';
  return `너는 한국어-영어 프리랜서 통역사의 사전 준비를 돕는 리서치 어시스턴트다.
내일 통역 일을 위한 한 화면짜리 브리프를 만들어라.

[통역 정보]
- 회사명: ${company}
- 행사/미팅 주제: ${topic}
- 통역 방향: ${dir}
${reference ? `- 통역사가 받은 참고 자료:\n"""\n${reference}\n"""` : '- 참고 자료: 없음'}

[가장 중요한 규칙 — 지어내지 말 것]
- 회사에 대한 사실(설립연도, 투자, 고객사, 제품 기능, 수치, 인명)은 검색 결과나 참고 자료에서 확인된 것만 쓴다.
- 확인되지 않은 내용은 추측하지 말고 문장 안에 "확인 필요"라고 명시한다. 예: "주요 고객사는 확인 필요."
- 업계 일반 지식(용어 정의 등)은 써도 되지만, 회사 고유의 사실과 섞지 않는다.

[출력 형식] 아래 JSON 하나만 출력한다. 마크다운, 설명 문장 금지.
{
  "summary": "회사/업계 한 줄 요약 (한국어)",
  "background": ["꼭 알아야 할 배경 문장", "... 정확히 5개"],
  "glossary": [{"en": "영어 용어", "ko": "한국어 용어", "note": "한 줄 설명 (한국어)"}],
  "flow": [{"stage": "단계 이름", "detail": "이 단계에서 오갈 내용"}],
  "phrases": [{"ko": "한국어 표현", "en": "영어 표현", "when": "쓰는 상황 2~4단어"}]
}
- glossary: 20~30개. 이 미팅에서 실제로 귀에 들릴 용어(명사/고유명사) 위주. 참고 자료에 나온 고유 용어 우선. "~ 최적화", "~ 단축" 같은 일반 구절은 넣지 말 것. 한국어는 업계에서 실제 쓰는 말로.
- flow: 4~6단계. stage에 번호를 붙이지 말 것.
- phrases: 정확히 10개. 통역사가 현장에서 실제로 입으로 말할 문장만. "확인 필요"나 통역사 메모는 넣지 말 것.
  - 6개: 이 미팅에서 나올 핵심 문장(회사 소개, 기능 설명, 상대의 예상 질문)의 모범 번역
  - 4개: 통역사 운영 표현(다시 말씀 요청, 숫자/고유명사 확인, 속도 조절 등)
- 맞춤법을 지킬 것.`;
}

// LLM 답에서 JSON만 꺼낸다 (가끔 ```json ... ``` 로 감싸서 줌)
function extractJson(text) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end < 0) throw new Error('LLM 응답에서 JSON을 찾지 못했어요.');
  return JSON.parse(text.slice(start, end + 1));
}

function validate(b) {
  const ok =
    b && typeof b.summary === 'string' &&
    Array.isArray(b.background) && Array.isArray(b.glossary) &&
    Array.isArray(b.flow) && Array.isArray(b.phrases);
  if (!ok) throw new Error('LLM 응답 형식이 예상과 달라요. 다시 시도해 주세요.');
  b.glossary = b.glossary.filter((g) => g && g.en && g.ko);
  return b;
}

export function briefApiPlugin(env) {
  const primary = env.GEMINI_MODEL || 'gemini-3.8-flash';
  // 메인 모델이 과부하(5xx)·할당량(429)이면 순서대로 다른 모델로 넘어감
  const models = [...new Set([primary, 'gemini-3.5-flash', 'gemini-3.1-flash-lite'])];
  let ready = null;

  async function setup() {
    // neatlogs: 해커톤 LLM 호출 기록. 키가 없으면 기록만 꺼지고 앱은 정상 동작.
    if (env.NEATLOGS_API_KEY) {
      try {
        await init({ apiKey: env.NEATLOGS_API_KEY, workflowName: 'brief-buddy', registerShutdownHandlers: false, debug: env.NEATLOGS_DEBUG === '1' });
      } catch (e) {
        console.warn('[neatlogs] init 실패, 기록 없이 계속:', e.message);
      }
    }
    // wrapGoogleGenAI: neatlogs에 프롬프트/응답/토큰 수가 LLM 호출 단위로 기록됨
    // timeout: 한 모델이 2분 넘게 안 답하면 포기하고 다음 모델로
    const ai = wrapGoogleGenAI(new GoogleGenAI({ apiKey: env.GEMINI_API_KEY, httpOptions: { timeout: 120000 } }));
    // 검색이 한 번 막히면(할당량 0 등) 서버를 다시 켤 때까지 검색 시도를 건너뜀
    let searchBlocked = false;

    // 1차: 구글 검색으로 근거를 찾으며 생성 (지어내기 줄이기)
    const withSearch = span({ kind: 'TOOL', name: 'gemini-with-search' }, async (prompt) => {
      const res = await ai.models.generateContent({
        model: primary,
        contents: prompt,
        config: { tools: [{ googleSearch: {} }], temperature: 0.3 },
      });
      const sources = (res.candidates?.[0]?.groundingMetadata?.groundingChunks || [])
        .map((c) => c.web)
        .filter(Boolean)
        .map((w) => ({ title: w.title, uri: w.uri }));
      return { brief: validate(extractJson(res.text || '')), sources, model: primary, searched: true };
    });

    // 2차: 검색 없이 JSON 모드로 생성. 실패하면 다음 모델로.
    const withoutSearch = span({ kind: 'TOOL', name: 'gemini-no-search' }, async (prompt) => {
      let lastErr;
      for (const model of models) {
        try {
          const res = await ai.models.generateContent({
            model,
            contents: prompt,
            config: { responseMimeType: 'application/json', temperature: 0.3 },
          });
          return { brief: validate(extractJson(res.text || '')), sources: [], model, searched: false };
        } catch (e) {
          lastErr = e;
          // 키가 틀림(400/401/403) 같은 건 다른 모델로 바꿔도 안 되니 바로 중단
          if (e.status && e.status < 500 && e.status !== 429 && e.status !== 404) throw e;
          log('{model} 실패 → 다음 모델: {msg}', { model, msg: String(e.message).slice(0, 120) });
        }
      }
      throw lastErr;
    });

    const generateBrief = span({ kind: 'WORKFLOW', name: 'generate-brief' }, async (input) => {
      const prompt = buildPrompt(input);
      let out = null;
      if (!searchBlocked) {
        try {
          out = await withSearch(prompt);
        } catch (e) {
          log('검색 생성 실패 → 검색 없이 진행: {msg}', { msg: String(e.message).slice(0, 120) });
          if (e.status === 429 || e.status === 403) searchBlocked = true;
        }
      }
      if (!out) out = await withoutSearch(prompt);
      const brief = out.brief;
      brief.sources = out.sources;
      brief.searched = out.searched;
      brief.model = out.model;
      return brief;
    });
    return generateBrief;
  }

  return {
    name: 'brief-api',
    configureServer(server) {
      server.middlewares.use('/api/brief', async (req, res) => {
        const send = (code, obj) => {
          res.statusCode = code;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify(obj));
        };
        if (req.method !== 'POST') return send(405, { error: 'POST만 가능' });
        if (!env.GEMINI_API_KEY) {
          return send(500, { error: '.env 파일에 GEMINI_API_KEY가 없어요. README의 설정 방법을 봐 주세요.' });
        }
        try {
          let body = '';
          for await (const chunk of req) body += chunk;
          const input = JSON.parse(body || '{}');
          if (!input.company || !input.topic) return send(400, { error: '회사명과 주제는 꼭 입력해 주세요.' });
          ready ||= setup();
          const generateBrief = await ready;
          const brief = await generateBrief(input);
          send(200, { brief });
        } catch (e) {
          console.error('[brief-api]', e);
          send(500, { error: `브리프 생성 실패: ${e.message}` });
        }
      });
    },
  };
}

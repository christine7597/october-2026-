// 개발 서버 안에서 돌아가는 작은 API: POST /api/brief
// API 키는 여기(서버 쪽)에서만 .env로 읽는다. 브라우저 코드에는 절대 들어가지 않는다.
import { GoogleGenAI } from '@google/genai';
import { init, span, log } from 'neatlogs';

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
- glossary: 20~30개. 이 미팅에서 실제로 나올 법한 회사/업계 용어 위주. 참고 자료에 나온 고유 용어 우선.
- flow: 4~6단계.
- phrases: 정확히 10개. 통역사가 현장에서 바로 쓸 수 있는 실전 표현(확인 요청, 숫자 확인, 이 업계 질문 등).`;
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
  const model = env.GEMINI_MODEL || 'gemini-3.8-flash';
  let ready = null;

  async function setup() {
    // neatlogs: 해커톤 LLM 호출 기록. 키가 없으면 기록만 꺼지고 앱은 정상 동작.
    if (env.NEATLOGS_API_KEY) {
      try {
        await init({ apiKey: env.NEATLOGS_API_KEY, workflowName: 'brief-buddy', registerShutdownHandlers: false });
      } catch (e) {
        console.warn('[neatlogs] init 실패, 기록 없이 계속:', e.message);
      }
    }
    const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

    // 1차: 구글 검색으로 근거를 찾으며 생성 (지어내기 줄이기)
    const withSearch = span({ kind: 'TOOL', name: 'gemini-with-search' }, async (prompt) => {
      const res = await ai.models.generateContent({
        model,
        contents: prompt,
        config: { tools: [{ googleSearch: {} }], temperature: 0.3 },
      });
      const sources = (res.candidates?.[0]?.groundingMetadata?.groundingChunks || [])
        .map((c) => c.web)
        .filter(Boolean)
        .map((w) => ({ title: w.title, uri: w.uri }));
      return { text: res.text || '', sources };
    });

    // 2차: 검색이 막힌 키(무료 할당량 0 등)면 검색 없이 생성
    const withoutSearch = span({ kind: 'TOOL', name: 'gemini-no-search' }, async (prompt) => {
      const res = await ai.models.generateContent({
        model,
        contents: prompt,
        config: { responseMimeType: 'application/json', temperature: 0.3 },
      });
      return { text: res.text || '', sources: [] };
    });

    const generateBrief = span({ kind: 'WORKFLOW', name: 'generate-brief' }, async (input) => {
      const prompt = buildPrompt(input);
      let out;
      let searched = true;
      try {
        out = await withSearch(prompt);
      } catch (e) {
        log('검색 생성 실패 → 검색 없이 재시도: {msg}', { msg: e.message?.slice(0, 120) });
        searched = false;
        out = await withoutSearch(prompt);
      }
      const brief = validate(extractJson(out.text));
      brief.sources = out.sources;
      brief.searched = searched;
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

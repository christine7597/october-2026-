// 개발 서버 안에서 돌아가는 작은 API: POST /api/brief
// API 키는 여기(서버 쪽)에서만 .env로 읽는다. 브라우저 코드에는 절대 들어가지 않는다.
import { GoogleGenAI } from '@google/genai';
import { init, span, log } from 'neatlogs';
import { wrapGoogleGenAI } from 'neatlogs/google-genai';
import { buildPrompt } from '../src/prompt.js';


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
  const models = [...new Set([primary, 'gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-3.1-flash-lite'])];
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
    // 검색이 한 번 막히면(할당량 0 등) 서버를 다시 켤 때까지 검색 시도를 건너뜀.
    // GEMINI_SEARCH=off 면 처음부터 검색을 시도하지 않음 (검색 할당량이 없는 키용)
    let searchBlocked = env.GEMINI_SEARCH === 'off';

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
          console.warn(`[brief-api] ${model} 실패 (${e.status ?? e.name}) → 다음 모델`);
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

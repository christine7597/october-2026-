# Brief Buddy

한국어-영어 프리랜서 통역사가 **통역 전날 밤 20분 안에** 준비를 끝내도록 돕는 작은 웹앱 (neatHack).

1. **입력** — 회사명, 미팅 주제, 통역 방향(한→영/영→한), 참고 자료(선택)
2. **브리프** — LLM(Gemini)이 한 화면짜리 브리프 생성: 한 줄 요약 · 배경 5줄 · 용어집 20~30개 · 예상 대화 흐름 · 현장 표현 10개. 모르는 건 **"확인 필요"**(노란 표시)
3. **연습** — 용어집 플래시카드 (영→한 / 한→영). 틀린 것만 다음 라운드에 다시
4. **인쇄 / PDF 저장** — 브리프 화면의 버튼 → 인쇄 창에서 "PDF로 저장"

로그인·DB 없음. 마지막 입력과 브리프는 브라우저(localStorage)에만 저장됩니다.

## 심사위원 안내

**미리보기 (설치 없이 브라우저에서 바로):** https://claude.ai/artifact/2w9PBpwEgQM1Z2tv8xkuDM

| 미리보기에서 | 되는 것 |
|---|---|
| 샘플 브리프 (쿼드비 / MOLDWORK 실제 케이스) | ✅ 열자마자 보임 |
| 1. 입력 / 2. 브리프 / 3. 연습 탭, 플래시카드 맞음·틀림 | ✅ 누구나 |
| "브리프 만들기" | ⚠️ 미리보기에서는 Gemini 대신 **보는 사람의 Claude 계정**으로 생성해요. claude.ai에 로그인하고 첫 클릭 때 허용해야 동작하고, 아니면 안내 문구만 떠요 |
| 인쇄 / PDF 저장 | ❌ claude.ai 화면 안에서는 인쇄 창이 열리지 않아 숨겼어요 |

**전체 기능(Gemini 생성, 모델 자동 전환, 인쇄)** 은 아래 [실행 방법](#실행-방법)대로 로컬에서 확인할 수 있어요. 키가 없어도 "샘플 브리프 보기"와 연습은 동작합니다.

**작업 기록**
- 개발 과정은 Claude Code로 진행했고, Entire 체크포인트 8개가 이 저장소의 `refs/entire/checkpoints/*`에 올라가 있어요.
  로컬에서 보려면 `git fetch origin 'refs/entire/*:refs/entire/*'` 후 `entire checkpoint list`.
- LLM 호출은 neatlogs로 기록됩니다 ([아래](#neatlogs-기록-해커톤) 참고).
- 실제 케이스 검증: 참고 자료 없이 만든 브리프가 회사 기능을 잘못 추측한 것을 웹 기사와 대조해 찾아냈고,
  확인된 사실만 [docs/quadbe-moldwork-reference.md](docs/quadbe-moldwork-reference.md)에 출처와 함께 정리해 샘플에 반영했어요.

## 실행 방법

필요한 것: [Node.js](https://nodejs.org) 20 이상

```bash
npm install
cp .env.example .env      # 그다음 .env 를 열어 GEMINI_API_KEY= 뒤에 키 붙여넣기
npm run dev               # 브라우저에서 http://localhost:5173 열기
```

- Gemini 키 발급: https://aistudio.google.com/apikey
- `.env` 는 `.gitignore` 에 있어서 깃허브에 올라가지 않습니다.
- 키는 개발 서버(`server/briefApi.js`)에서만 쓰이고 브라우저로 전달되지 않습니다.
- 키가 없어도 "샘플 브리프 보기"로 화면과 연습 기능은 확인할 수 있어요.

## 정확도 관련

- 키에 **Google 검색** 기능이 허용돼 있으면 검색 근거로 만들고 출처 링크를 보여줍니다.
- 검색이 막힌 키(무료 할당량 0 등)면 자동으로 검색 없이 만들고 ⚠️ 경고를 띄웁니다. 이때 회사 고유 정보는 AI 기억에 의존하므로 꼭 확인하세요.
- **회사 소개서/아젠다/기사 요약을 "참고 자료"에 붙여넣는 게 정확도를 가장 크게 올립니다.**
  실제로 쿼드비 케이스에서 참고 자료 없이 만들면 MOLDWORK 기능을 "금형 매칭/견적 비교"로 잘못 추측했고,
  확인된 사실을 넣자 "이기종 부품 호환성 분석 → 3D 시뮬레이션 → 제조 사양서"로 정확해졌습니다.
  → [docs/quadbe-moldwork-reference.md](docs/quadbe-moldwork-reference.md) (출처 포함)
- 메인 모델(기본 `gemini-3.8-flash`)이 과부하/할당량 초과면 `gemini-3.5-flash` → `gemini-3.5-flash-lite` → `gemini-3.1-flash-lite` 순으로 자동 전환합니다. 어떤 모델이 만들었는지는 브리프 제목 아래 작게 표시됩니다.
- 생성에는 보통 30초~1분 걸립니다.

## neatlogs 기록 (해커톤)

- `.env`에 `NEATLOGS_API_KEY`를 넣으면 브리프를 만들 때마다 neatlogs에 기록이 남습니다:
  `generate-brief`(전체) → `gemini-with-search` / `gemini-no-search` → Gemini 호출(프롬프트·응답·토큰 수).
- 키에 구글 검색 할당량이 없으면 `.env`에 `GEMINI_SEARCH=off`를 넣으세요. 실패하는 검색 시도가 빠져 기록이 깔끔해집니다.
- 2026-10-12 `npx @neatlogs/wizard verify`로 기록이 neatlogs 서버에 저장되는 것까지 확인했습니다.
- `scripts/cloud-proxy-preload.cjs`는 Claude Code 클라우드 컨테이너 전용 보정입니다(일반 PC에서는 동작 안 함).

## 구조

```
server/briefApi.js   /api/brief — Gemini 호출 (키는 여기서만), neatlogs 기록
src/App.jsx          탭 전환 + localStorage 저장
src/InputForm.jsx    기능 1 입력
src/BriefView.jsx    기능 2 브리프 화면 (+인쇄 스타일)
src/Practice.jsx     기능 3 플래시카드
src/sampleBrief.js   하드코딩 샘플 (쿼드비 / MOLDWORK)
src/prompt.js        브리프 생성 프롬프트 (서버와 미리보기가 같이 씀)
```

`npm run dev` 로만 동작합니다 (API가 개발 서버 안에 있음).
미리보기는 `VITE_PREVIEW=1 npx vite build --base ./`로 만든 별도 빌드입니다.

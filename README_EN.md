# Brief Buddy

A small web app that helps freelance Korean-English interpreters finish their preparation **in 20 minutes the night before an interpreting assignment** (neatHack).

1. **Input** - Company name, meeting topic, interpreting direction (Korean → English / English → Korean), and reference material (optional)
2. **Brief** - An LLM (Gemini) generates a one-screen brief: a one-line summary, five lines of background, a glossary of 20-30 terms, an expected conversation flow, and 10 expressions for use on site. Anything uncertain is marked **"Needs verification"** in yellow.
3. **Practice** - Glossary flashcards (English → Korean / Korean → English). Only missed cards return in the next round.
4. **Print / Save as PDF** - Use the button on the brief screen, then select "Save as PDF" in the print dialog.

No login or database. Your latest input and brief are stored only in your browser (localStorage).

## Guide for judges

**Preview (open directly in your browser, no installation):** https://claude.ai/artifact/2w9PBpwEgQM1Z2tv8xkuDM

| In the preview | Availability |
|---|---|
| Sample brief (real QuadB / MOLDWORK case) | ✅ Visible as soon as you open it |
| 1. Input / 2. Brief / 3. Practice tabs; marking flashcards correct or incorrect | ✅ Available to everyone |
| "Generate brief" | ⚠️ The preview generates briefs using **the viewer's Claude account**, rather than Gemini. You must sign in to claude.ai and grant permission on the first click. Otherwise, only an explanatory message appears. |
| Print / Save as PDF | ❌ Hidden because the print dialog does not open inside the claude.ai interface |

You can try **all features (Gemini generation, automatic model fallback, and printing)** locally by following the [run instructions](#how-to-run) below. "View sample brief" and practice work even without an API key.

**Work log**
- Development was done with Claude Code. Eight Entire checkpoints are uploaded to this repository under `refs/entire/checkpoints/*`.
  To view them locally, run `git fetch origin 'refs/entire/*:refs/entire/*'`, then `entire checkpoint list`.
- LLM calls are logged with neatlogs (see [below](#neatlogs-logging-hackathon)).
- Real-case verification: comparing a brief generated without reference material against web articles revealed incorrect guesses about the company's product features.
  Only verified facts were documented with sources in [docs/quadbe-moldwork-reference.md](docs/quadbe-moldwork-reference.md) and incorporated into the sample.

## How to run

Requirement: [Node.js](https://nodejs.org) 20 or later

```bash
npm install
cp .env.example .env      # Then open .env and paste your key after GEMINI_API_KEY=
npm run dev               # Open http://localhost:5173 in your browser
```

- Get a Gemini API key: https://aistudio.google.com/apikey
- `.env` is listed in `.gitignore`, so it is not uploaded to GitHub.
- The key is used only by the development server (`server/briefApi.js`) and is not sent to the browser.
- Even without a key, you can use "View sample brief" to explore the interface and practice features.

## Accuracy notes

- If your key allows **Google Search**, the brief is grounded in search results and includes source links.
- If search is unavailable for your key (for example, a free-tier quota of zero), the app automatically generates without search and displays a ⚠️ warning. In this case, company-specific information relies on the AI's memory, so be sure to verify it.
- **Pasting a company introduction, agenda, or article summary into "Reference material" makes the biggest improvement to accuracy.**
  In the real QuadB case, generation without reference material incorrectly guessed that MOLDWORK offered "mold matching / quote comparison."
  After verified facts were supplied, it correctly described "compatibility analysis of heterogeneous parts → 3D simulation → manufacturing specifications."
  → [docs/quadbe-moldwork-reference.md](docs/quadbe-moldwork-reference.md) (includes sources)
- If the main model (default: `gemini-3.8-flash`) is overloaded or exceeds its quota, the app automatically falls back in this order: `gemini-3.5-flash` → `gemini-3.5-flash-lite` → `gemini-3.1-flash-lite`. The model used appears in small text below the brief title.
- Generation usually takes 30 seconds to one minute.

## neatlogs logging (hackathon)

- Add `NEATLOGS_API_KEY` to `.env` to log every brief generation in neatlogs:
  `generate-brief` (overall) → `gemini-with-search` / `gemini-no-search` → Gemini call (prompt, response, and token count).
- If your key has no Google Search quota, add `GEMINI_SEARCH=off` to `.env`. This skips failed search attempts and keeps the logs cleaner.
- On 2026-10-12, `npx @neatlogs/wizard verify` confirmed that the logs were saved to the neatlogs server.
- `scripts/cloud-proxy-preload.cjs` is a workaround specifically for Claude Code cloud containers (it does not run on a regular PC).

## Project structure

```
server/briefApi.js   /api/brief - Gemini calls (the key is used only here), neatlogs logging
src/App.jsx          Tab switching + localStorage persistence
src/InputForm.jsx    Feature 1: input
src/BriefView.jsx    Feature 2: brief screen (+ print styles)
src/Practice.jsx     Feature 3: flashcards
src/sampleBrief.js   Hard-coded sample (QuadB / MOLDWORK)
src/prompt.js        Brief-generation prompt (shared by the server and preview)
```

The app runs only with `npm run dev` (the API lives inside the development server).
The preview is a separate build created with `VITE_PREVIEW=1 npx vite build --base ./`.

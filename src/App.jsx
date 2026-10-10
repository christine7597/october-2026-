import React, { useEffect, useState } from 'react';
import InputForm from './InputForm.jsx';
import BriefView from './BriefView.jsx';
import Practice from './Practice.jsx';
import { sampleInput, sampleBrief } from './sampleBrief.js';
import { loadState, saveState } from './storage.js';

const emptyInput = { company: '', topic: '', direction: 'ko-en', reference: '' };

export default function App() {
  const saved = loadState();
  const [tab, setTab] = useState(saved?.brief ? 'brief' : 'input');
  const [input, setInput] = useState(saved?.input || emptyInput);
  // 브리프와 함께, 그 브리프를 만든 입력값도 저장 (폼을 고쳐도 브리프 제목은 그대로)
  const [result, setResult] = useState(saved?.brief ? { input: saved.briefInput, brief: saved.brief } : null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    saveState({ input, briefInput: result?.input, brief: result?.brief });
  }, [input, result]);

  async function generate() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `서버 오류 (${res.status})`);
      setResult({ input: { ...input }, brief: data.brief });
      setTab('brief');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function showSample() {
    setInput(sampleInput);
    setResult({ input: sampleInput, brief: { ...sampleBrief, sample: true } });
    setTab('brief');
  }

  return (
    <div className="app">
      <h1 className="no-print">Brief Buddy <small>통역 전날 밤 20분 준비</small></h1>
      <nav className="tabs no-print">
        <button className={tab === 'input' ? 'active' : ''} onClick={() => setTab('input')}>1. 입력</button>
        <button className={tab === 'brief' ? 'active' : ''} onClick={() => setTab('brief')} disabled={!result}>2. 브리프</button>
        <button className={tab === 'practice' ? 'active' : ''} onClick={() => setTab('practice')} disabled={!result}>3. 연습</button>
      </nav>

      {tab === 'input' && (
        <InputForm input={input} setInput={setInput} onGenerate={generate} onSample={showSample} loading={loading} error={error} />
      )}

      {tab === 'brief' && result && (
        <>
          <div className="brief-actions no-print">
            <button onClick={() => window.print()}>인쇄 / PDF 저장</button>
            <button className="ghost" onClick={() => setTab('practice')}>용어 연습하기 →</button>
          </div>
          {result.brief.sample && (
            <p className="notice no-print">저장된 샘플 브리프예요 (쿼드비/MOLDWORK, 2026-10-10 생성). 입력 칸에 같은 내용이 채워져 있으니 "1. 입력"에서 바로 다시 만들 수 있어요.</p>
          )}
          {result.brief.searched === false && !result.input.reference?.trim() && (
            <p className="notice no-print">
              ⚠️ 웹 검색도 참고 자료도 없이 AI 기억만으로 만든 브리프예요. 회사 고유 정보(기능, 수치, 고객사)는 틀릴 수 있어요.
              회사 소개서나 기사 내용을 "참고 자료"에 붙여넣고 다시 만들면 정확도가 크게 올라가요.
            </p>
          )}
          {result.brief.searched === false && result.input.reference?.trim() && (
            <p className="notice no-print">
              웹 검색 없이 붙여넣은 참고 자료 + AI 지식으로 만든 브리프예요. 참고 자료에 없던 회사 정보는 한 번 더 확인하세요.
            </p>
          )}
          <BriefView input={result.input} brief={result.brief} />
        </>
      )}

      {tab === 'practice' && result && <Practice key={result.brief.summary} glossary={result.brief.glossary} />}
    </div>
  );
}

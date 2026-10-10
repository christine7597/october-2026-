import React from 'react';

export default function InputForm({ input, setInput, onGenerate, onSample, loading, error }) {
  const set = (k) => (e) => setInput({ ...input, [k]: e.target.value });
  const canSubmit = input.company.trim() && input.topic.trim() && !loading;

  return (
    <form
      className="form"
      onSubmit={(e) => {
        e.preventDefault();
        if (canSubmit) onGenerate();
      }}
    >
      <label>
        회사명 *
        <input value={input.company} onChange={set('company')} placeholder="예: 쿼드비 (Quad.BE)" />
      </label>
      <label>
        행사/미팅 주제 *
        <input value={input.topic} onChange={set('topic')} placeholder="예: 화장품 패키징 플랫폼 MOLDWORK 관련 미팅" />
      </label>
      <div>
        <strong style={{ fontSize: 14 }}>통역 방향</strong>
        <div className="radio">
          <label><input type="radio" checked={input.direction === 'ko-en'} onChange={() => setInput({ ...input, direction: 'ko-en' })} /> 한 → 영</label>
          <label><input type="radio" checked={input.direction === 'en-ko'} onChange={() => setInput({ ...input, direction: 'en-ko' })} /> 영 → 한</label>
        </div>
      </div>
      <label>
        참고 자료 (선택) — 회사 소개서, 아젠다, 이메일 등을 붙여넣으면 훨씬 정확해져요
        <textarea value={input.reference} onChange={set('reference')} placeholder="여기에 텍스트 붙여넣기" />
      </label>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button type="submit" disabled={!canSubmit}>
          {loading ? '브리프 만드는 중… (30초~1분)' : '브리프 만들기'}
        </button>
        <button type="button" className="ghost" onClick={onSample} disabled={loading}>
          샘플 브리프 보기
        </button>
      </div>
      {error && <p className="error">{error}</p>}
    </form>
  );
}

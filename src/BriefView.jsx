import React from 'react';

// "확인 필요"가 들어간 문장은 눈에 띄게 노란 표시
function Mark({ text }) {
  if (!text) return null;
  const parts = String(text).split(/(확인 필요)/g);
  return parts.map((p, i) =>
    p === '확인 필요' ? <mark key={i}>확인 필요</mark> : <React.Fragment key={i}>{p}</React.Fragment>
  );
}

export default function BriefView({ input, brief }) {
  const dirLabel = input.direction === 'en-ko' ? '영 → 한' : '한 → 영';
  return (
    <article className="brief">
      <header className="brief-head">
        <h2>{input.company}</h2>
        <p className="muted">
          {input.topic} · {dirLabel}
          {brief.model && <span className="no-print"> · {brief.model}</span>}
        </p>
      </header>

      <section>
        <h3>한 줄 요약</h3>
        <p className="summary"><Mark text={brief.summary} /></p>
      </section>

      <section>
        <h3>꼭 알아야 할 배경</h3>
        <ol>
          {brief.background.map((b, i) => (
            <li key={i}><Mark text={b} /></li>
          ))}
        </ol>
      </section>

      <section>
        <h3>용어집 ({brief.glossary.length})</h3>
        <table className="glossary">
          <thead>
            <tr><th>English</th><th>한국어</th><th>설명</th></tr>
          </thead>
          <tbody>
            {brief.glossary.map((g, i) => (
              <tr key={i}>
                <td>{g.en}</td>
                <td><strong>{g.ko}</strong></td>
                <td className="muted"><Mark text={g.note} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h3>예상 대화 흐름</h3>
        <ol className="flow">
          {brief.flow.map((f, i) => (
            <li key={i}><strong>{String(f.stage).replace(/^\s*\d+[.)]\s*/, '')}</strong> — <Mark text={f.detail} /></li>
          ))}
        </ol>
      </section>

      <section>
        <h3>현장 통역 표현</h3>
        <ul className="phrases">
          {brief.phrases.map((p, i) => (
            <li key={i}>
              <span className="tag">{p.when}</span>
              <div>{p.ko}</div>
              <div className="muted">{p.en}</div>
            </li>
          ))}
        </ul>
      </section>

      {brief.sources?.length > 0 && (
        <section>
          <h3>참고한 출처</h3>
          <ul className="muted" style={{ fontSize: 13 }}>
            {brief.sources.map((s, i) => (
              <li key={i}><a href={s.uri} target="_blank" rel="noreferrer">{s.title || s.uri}</a></li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}

const NEEDS_CHECK = '확인 필요'

// Highlights any "확인 필요" marker so unverified facts stand out.
function Text({ children }) {
  const text = String(children ?? '')
  if (!text.includes(NEEDS_CHECK)) return text
  return text.split(NEEDS_CHECK).flatMap((part, i) =>
    i === 0 ? [part] : [<mark key={i} className="check">{NEEDS_CHECK}</mark>, part],
  )
}

export default function Brief({ brief }) {
  const { meta, summary, background, glossary, flow, phrases } = brief
  return (
    <article className="brief">
      <section className="brief-head">
        <h2>{meta.company}</h2>
        <p className="meta">
          {meta.topic} · <strong>{meta.direction === 'ko-en' ? '한→영' : '영→한'}</strong>
        </p>
        <p className="summary"><Text>{summary}</Text></p>
      </section>

      <div className="grid">
        <div>
          <section>
            <h3>꼭 알아야 할 배경</h3>
            <ol>
              {background.map((line, i) => <li key={i}><Text>{line}</Text></li>)}
            </ol>
          </section>
          <section>
            <h3>예상 대화 흐름</h3>
            <ol className="flow">
              {flow.map((step, i) => (
                <li key={i}><strong>{step.stage}</strong> — <Text>{step.detail}</Text></li>
              ))}
            </ol>
          </section>
          <section>
            <h3>현장 통역 표현</h3>
            <ul className="phrases">
              {phrases.map((p, i) => (
                <li key={i}>
                  <span className="ko">{p.ko}</span>
                  <span className="en">{p.en}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section>
          <h3>용어집 <span className="count">{glossary.length}개</span></h3>
          <table className="glossary">
            <thead>
              <tr><th>English</th><th>한국어</th><th>설명</th></tr>
            </thead>
            <tbody>
              {glossary.map((g, i) => (
                <tr key={i}>
                  <td>{g.en}</td>
                  <td>{g.ko}</td>
                  <td><Text>{g.note}</Text></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </article>
  )
}

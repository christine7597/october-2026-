import React, { useState } from 'react';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 용어집 플래시카드. 틀린 카드만 다음 라운드에 다시 나온다.
export default function Practice({ glossary }) {
  const [mode, setMode] = useState('en-ko'); // en-ko: 영어 보고 한국어 / ko-en: 반대
  const [deck, setDeck] = useState(() => shuffle(glossary));
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [wrong, setWrong] = useState([]);
  const [round, setRound] = useState(1);
  const [correctTotal, setCorrectTotal] = useState(0);

  function restart(newMode = mode) {
    setMode(newMode);
    setDeck(shuffle(glossary));
    setIdx(0);
    setFlipped(false);
    setWrong([]);
    setRound(1);
    setCorrectTotal(0);
  }

  function answer(isRight) {
    const card = deck[idx];
    const nextWrong = isRight ? wrong : [...wrong, card];
    if (isRight) setCorrectTotal((n) => n + 1);
    setFlipped(false);
    if (idx + 1 < deck.length) {
      setWrong(nextWrong);
      setIdx(idx + 1);
    } else {
      // 라운드 끝: 틀린 것만 모아서 다음 라운드
      setDeck(shuffle(nextWrong));
      setWrong([]);
      setIdx(0);
      setRound((r) => r + 1);
    }
  }

  const modeButtons = (
    <div className="tabs" style={{ justifyContent: 'center' }}>
      <button className={mode === 'en-ko' ? 'active' : ''} onClick={() => restart('en-ko')}>영어 → 한국어</button>
      <button className={mode === 'ko-en' ? 'active' : ''} onClick={() => restart('ko-en')}>한국어 → 영어</button>
    </div>
  );

  if (glossary.length === 0) return <div className="quiz">용어집이 비어 있어요.</div>;

  if (deck.length === 0) {
    return (
      <div className="quiz">
        {modeButtons}
        <h2>🎉 전부 맞혔어요!</h2>
        <p className="muted">{glossary.length}개 용어 · {round - 1}라운드 만에 완료</p>
        <button onClick={() => restart()}>처음부터 다시</button>
      </div>
    );
  }

  const card = deck[idx];
  const front = mode === 'en-ko' ? card.en : card.ko;
  const back = mode === 'en-ko' ? card.ko : card.en;

  return (
    <div className="quiz">
      {modeButtons}
      <p className="muted">
        {round === 1 ? '1라운드' : `${round}라운드 (틀린 것만)`} · {idx + 1} / {deck.length}
        {' · '}맞힌 누적 {correctTotal} / {glossary.length}
      </p>
      <div className="card" onClick={() => setFlipped(true)}>
        <div className="front">{front}</div>
        {flipped ? (
          <>
            <div className="back">{back}</div>
            {card.note && <div className="note">{card.note}</div>}
          </>
        ) : (
          <div className="note">소리 내어 말해 본 뒤 카드를 눌러 정답 확인</div>
        )}
      </div>
      {flipped ? (
        <div className="quiz-buttons">
          <button className="btn-bad" onClick={() => answer(false)}>✗ 틀림</button>
          <button className="btn-ok" onClick={() => answer(true)}>✓ 맞음</button>
        </div>
      ) : (
        <button className="ghost" onClick={() => setFlipped(true)}>정답 보기</button>
      )}
    </div>
  );
}

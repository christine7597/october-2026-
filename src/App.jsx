import Brief from './Brief.jsx'
import { sampleBrief } from './sampleBrief.js'

export default function App() {
  return (
    <div className="app">
      <header className="topbar">
        <h1>Brief Buddy</h1>
        <span className="tag">샘플 데이터</span>
      </header>
      <Brief brief={sampleBrief} />
    </div>
  )
}

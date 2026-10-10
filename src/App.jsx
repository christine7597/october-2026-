import React from 'react';
import BriefView from './BriefView.jsx';
import { sampleInput, sampleBrief } from './sampleBrief.js';

export default function App() {
  return (
    <div className="app">
      <h1>Brief Buddy</h1>
      <BriefView input={sampleInput} brief={sampleBrief} />
    </div>
  );
}

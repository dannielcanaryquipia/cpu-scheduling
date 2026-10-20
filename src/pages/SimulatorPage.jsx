import { useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import Simulator from '../components/Simulator.jsx';
import Callout from '../components/Callout.jsx';
import { ALGO_META } from '../lib/schedulers.js';
import { decodeProcesses } from '../lib/share.js';
import { DEFAULT_PROCESSES } from '../data/presets.js';

export default function SimulatorPage() {
  const [params] = useSearchParams();
  const location = useLocation();
  const [copied, setCopied] = useState(false);

  const algo = ALGO_META[params.get('algo')] ? params.get('algo') : 'fcfs';
  const processes = decodeProcesses(params.get('p')) || DEFAULT_PROCESSES;
  const quantum = Number(params.get('q')) || 2;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked — ignore */
    }
  }

  return (
    <article className="lesson wide">
      <header className="lesson-head">
        <p className="eyebrow">Tools</p>
        <h1>Simulator Playground</h1>
        <p className="lead">
          Choose any algorithm, design your own processes, and watch the schedule unfold one time unit at a time.
        </p>
      </header>

      <Callout type="tip" title="Tips">
        Use <strong>Step-by-step log</strong> to read the reason behind every decision. Click a <span className="mono">t=</span>{' '}
        badge in the log to jump the timeline to that moment.{' '}
        {location.search && (
          <button className="link-btn" onClick={copyLink}>
            {copied ? 'Link copied!' : 'Copy a link to this exact setup'}
          </button>
        )}
      </Callout>

      <Simulator
        key={location.search}
        title="Simulator"
        initialAlgo={algo}
        initialProcesses={processes}
        initialQuantum={quantum}
        showFullLink={false}
      />
    </article>
  );
}

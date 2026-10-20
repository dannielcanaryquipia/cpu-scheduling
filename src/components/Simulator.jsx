import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ALGO_META, ALGO_ORDER, simulate } from '../lib/schedulers.js';
import { buildColorMap } from '../lib/colors.js';
import { simulatorLink } from '../lib/share.js';
import { DEFAULT_PROCESSES } from '../data/presets.js';
import ProcessEditor from './ProcessEditor.jsx';
import GanttChart from './GanttChart.jsx';
import ResultsTable from './ResultsTable.jsx';
import QueueView from './QueueView.jsx';
import EventLog from './EventLog.jsx';

const SPEEDS = [
  { label: '0.5×', ms: 1400 },
  { label: '1×', ms: 800 },
  { label: '2×', ms: 400 },
  { label: '4×', ms: 180 },
];

/**
 * The interactive simulator used on every algorithm page and on /simulator.
 *  - algoChoices: which algorithms appear in the dropdown (defaults to all)
 *  - showFullLink: show "Open in Simulator" (hidden on the simulator page itself)
 */
export default function Simulator({
  initialProcesses = DEFAULT_PROCESSES,
  initialAlgo = 'fcfs',
  initialQuantum = 2,
  algoChoices = ALGO_ORDER,
  showFullLink = true,
  title = 'Try it yourself',
}) {
  const [processes, setProcesses] = useState(() => initialProcesses.map((p) => ({ pr: 1, q: 0, ...p })));
  const [algo, setAlgo] = useState(initialAlgo);
  const [quantum, setQuantum] = useState(initialQuantum);
  const [higherIsBetter, setHigherIsBetter] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(800);
  const [tab, setTab] = useState('queue');

  const meta = ALGO_META[algo];
  const needsQuantum = meta.needs.includes('quantum');
  const needsPriority = meta.needs.includes('priority');
  const needsQueue = meta.needs.includes('queue');

  const result = useMemo(
    () => simulate(algo, processes, { quantum: Number(quantum) || 1, higherIsBetter }),
    [algo, processes, quantum, higherIsBetter],
  );
  const colorMap = useMemo(() => buildColorMap(processes), [processes]);
  const [time, setTime] = useState(result.makespan);

  // Any change to the inputs shows the finished schedule again.
  useEffect(() => {
    setPlaying(false);
    setTime(result.makespan);
  }, [result]);

  // Animation clock.
  useEffect(() => {
    if (!playing) return undefined;
    const id = setInterval(() => setTime((t) => Math.min(t + 1, result.makespan)), speed);
    return () => clearInterval(id);
  }, [playing, speed, result.makespan]);

  useEffect(() => {
    if (playing && time >= result.makespan) setPlaying(false);
  }, [playing, time, result.makespan]);

  function play() {
    if (time >= result.makespan) setTime(0);
    setPlaying(true);
  }

  const step = (delta) => {
    setPlaying(false);
    setTime((t) => Math.max(0, Math.min(result.makespan, t + delta)));
  };

  return (
    <section className="simulator">
      <div className="sim-head">
        <h3>{title}</h3>
        {showFullLink && (
          <Link className="link-arrow" to={simulatorLink(algo, processes, needsQuantum ? quantum : null)}>
            Open in full simulator →
          </Link>
        )}
      </div>

      <div className="sim-controls">
        <label className="field">
          <span>Algorithm</span>
          <select
            className="select"
            value={algo}
            onChange={(e) => setAlgo(e.target.value)}
            disabled={algoChoices.length === 1}
          >
            {algoChoices.map((key) => (
              <option key={key} value={key}>
                {ALGO_META[key].name}
              </option>
            ))}
          </select>
        </label>

        {needsQuantum && (
          <label className="field field-narrow">
            <span>Time quantum{algo === 'mlfq' ? ' (Q0)' : ''}</span>
            <input
              className="num-input"
              type="number"
              min="1"
              max="20"
              value={quantum}
              onChange={(e) => setQuantum(e.target.value)}
            />
          </label>
        )}

        {needsPriority && (
          <label className="toggle">
            <input type="checkbox" checked={higherIsBetter} onChange={(e) => setHigherIsBetter(e.target.checked)} />
            <span>Larger number = higher priority</span>
          </label>
        )}

        <span className={`badge ${meta.preemptive ? 'badge-warm' : 'badge-cool'}`}>
          {meta.preemptive ? 'Preemptive' : 'Non-preemptive'}
        </span>
      </div>

      <ProcessEditor
        processes={processes}
        onChange={setProcesses}
        colorMap={colorMap}
        showPriority={needsPriority}
        showQueue={needsQueue}
      />

      <div className="sim-stage">
        <div className="stage-head">
          <p className="stage-title">
            Gantt chart <span className="mono muted">t = {time}</span>
          </p>
          <div className="player">
            <button className="icon-btn" onClick={() => { setPlaying(false); setTime(0); }} aria-label="Restart">
              ⏮
            </button>
            <button className="icon-btn" onClick={() => step(-1)} aria-label="Step back">
              ‹
            </button>
            {playing ? (
              <button className="btn btn-primary btn-small" onClick={() => setPlaying(false)}>
                ❚❚ Pause
              </button>
            ) : (
              <button className="btn btn-primary btn-small" onClick={play}>
                ▶ Play
              </button>
            )}
            <button className="icon-btn" onClick={() => step(1)} aria-label="Step forward">
              ›
            </button>
            <button className="icon-btn" onClick={() => { setPlaying(false); setTime(result.makespan); }} aria-label="Show final result">
              ⏭
            </button>
            <select className="select select-small" value={speed} onChange={(e) => setSpeed(Number(e.target.value))} aria-label="Playback speed">
              {SPEEDS.map((s) => (
                <option key={s.ms} value={s.ms}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <GanttChart result={result} colorMap={colorMap} time={time} showLevels={algo === 'mlq' || algo === 'mlfq'} />

        <input
          className="scrubber"
          type="range"
          min="0"
          max={result.makespan}
          value={time}
          onChange={(e) => {
            setPlaying(false);
            setTime(Number(e.target.value));
          }}
          aria-label="Timeline position"
        />

        <div className="tabs" role="tablist">
          <button role="tab" aria-selected={tab === 'queue'} className={tab === 'queue' ? 'active' : ''} onClick={() => setTab('queue')}>
            Queue view
          </button>
          <button role="tab" aria-selected={tab === 'log'} className={tab === 'log' ? 'active' : ''} onClick={() => setTab('log')}>
            Step-by-step log
          </button>
        </div>
        {tab === 'queue' ? (
          <QueueView result={result} colorMap={colorMap} time={time} />
        ) : (
          <EventLog log={result.log} time={time} onJump={(t) => { setPlaying(false); setTime(t); }} />
        )}
      </div>

      <ResultsTable result={result} colorMap={colorMap} time={time} showPriority={needsPriority} showQueue={needsQueue} />
    </section>
  );
}

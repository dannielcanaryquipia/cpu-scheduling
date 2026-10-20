import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import LessonShell from '../components/LessonShell.jsx';
import Callout from '../components/Callout.jsx';
import ProcessEditor from '../components/ProcessEditor.jsx';
import GanttChart from '../components/GanttChart.jsx';
import { ALGO_META, ALGO_ORDER, simulate, fmt } from '../lib/schedulers.js';
import { buildColorMap } from '../lib/colors.js';
import { simulatorLink } from '../lib/share.js';
import { DEFAULT_PROCESSES } from '../data/presets.js';

const TABLE = [
  { algo: 'FCFS', rule: 'Earliest arrival', mode: 'Non-preemptive', starve: 'No', complexity: 'Lowest', note: 'Simple, but average waiting time is often large (convoy effect).' },
  { algo: 'SJF', rule: 'Smallest burst', mode: 'Non-preemptive', starve: 'Yes', complexity: 'Low–medium', note: 'Best average waiting time among non-preemptive methods when bursts are known.' },
  { algo: 'SRTF', rule: 'Smallest remaining time', mode: 'Preemptive', starve: 'Yes', complexity: 'Medium', note: 'Lowest average waiting time overall; many context switches.' },
  { algo: 'Round Robin', rule: 'Arrival order + time quantum', mode: 'Preemptive', starve: 'No', complexity: 'Medium (depends on q)', note: 'Fair and responsive; waiting time usually higher than SJF.' },
  { algo: 'Priority (NP)', rule: 'Highest priority', mode: 'Non-preemptive', starve: 'Yes', complexity: 'Low', note: 'Good for batch systems with clear importance levels.' },
  { algo: 'Priority (P)', rule: 'Highest priority, re-checked on arrival', mode: 'Preemptive', starve: 'Yes', complexity: 'Medium', note: 'Urgent work starts at once; needs aging to stay fair.' },
  { algo: 'HRRN', rule: 'Highest (W+S)/S', mode: 'Non-preemptive', starve: 'No', complexity: 'Medium', note: 'Short jobs favored, but waiting jobs climb in ratio.' },
  { algo: 'MLQ', rule: 'Fixed queue priority', mode: 'Preemptive between queues', starve: 'Yes', complexity: 'High', note: 'Each job type gets its own policy; processes never move.' },
  { algo: 'MLFQ', rule: 'Queue level, adjusted by behavior', mode: 'Preemptive', starve: 'No (with aging/boost)', complexity: 'Highest', note: 'Adapts without knowing bursts; hardest to tune.' },
];

const METRICS = [
  { key: 'wt', label: 'Avg waiting time' },
  { key: 'tat', label: 'Avg turnaround' },
  { key: 'rt', label: 'Avg response time' },
];

export default function Compare() {
  const [processes, setProcesses] = useState(() => DEFAULT_PROCESSES.map((p) => ({ ...p })));
  const [quantum, setQuantum] = useState(2);
  const [metric, setMetric] = useState('wt');
  const colorMap = useMemo(() => buildColorMap(processes), [processes]);

  const runs = useMemo(
    () => ALGO_ORDER.map((algo) => ({ algo, result: simulate(algo, processes, { quantum: Number(quantum) || 1 }) })),
    [processes, quantum],
  );
  const max = Math.max(...runs.map((r) => r.result.averages[metric]), 0.01);
  const best = Math.min(...runs.map((r) => r.result.averages[metric]));
  const sorted = [...runs].sort((a, b) => a.result.averages[metric] - b.result.averages[metric]);

  return (
    <LessonShell title="Compare the Algorithms" lead="Run all nine variations on the same workload and see who wins — and why the winner changes with the workload.">
      <h2>Summary table</h2>
      <div className="table-wrap">
        <table className="data-table compare-table">
          <thead>
            <tr>
              <th>Algorithm</th>
              <th>Picks next…</th>
              <th>Mode</th>
              <th>Starvation</th>
              <th>Complexity</th>
              <th>In one line</th>
            </tr>
          </thead>
          <tbody>
            {TABLE.map((row) => (
              <tr key={row.algo}>
                <td>
                  <strong>{row.algo}</strong>
                </td>
                <td>{row.rule}</td>
                <td>{row.mode}</td>
                <td className={row.starve.startsWith('Yes') ? 'cell-bad' : 'cell-good'}>{row.starve}</td>
                <td>{row.complexity}</td>
                <td className="muted">{row.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Race them on your own workload</h2>
      <p>Edit the processes below. Every chart updates instantly. Priority and queue columns are used only by the algorithms that need them.</p>
      <div className="sim-controls">
        <label className="field field-narrow">
          <span>Time quantum (RR, MLQ, MLFQ)</span>
          <input className="num-input" type="number" min="1" max="20" value={quantum} onChange={(e) => setQuantum(e.target.value)} />
        </label>
      </div>
      <ProcessEditor processes={processes} onChange={setProcesses} colorMap={colorMap} showPriority showQueue />

      <div className="segmented">
        {METRICS.map((m) => (
          <button key={m.key} className={metric === m.key ? 'active' : ''} onClick={() => setMetric(m.key)}>
            {m.label}
          </button>
        ))}
      </div>

      <div className="bar-chart" role="img" aria-label={`Bar chart of ${metric} for each algorithm`}>
        {sorted.map(({ algo, result }) => {
          const value = result.averages[metric];
          return (
            <div key={algo} className={`bar-row ${value === best ? 'best' : ''}`}>
              <span className="bar-name">{ALGO_META[algo].short}</span>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${(value / max) * 100}%` }} />
              </div>
              <span className="bar-value mono">{fmt(value)}</span>
            </div>
          );
        })}
      </div>

      <h2>All schedules</h2>
      <div className="gantt-stack">
        {runs.map(({ algo, result }) => (
          <div key={algo} className="compare-run">
            <div className="compare-run-head">
              <strong>{ALGO_META[algo].name}</strong>
              <span className="mono muted">
                WT {fmt(result.averages.wt)} · TAT {fmt(result.averages.tat)} · RT {fmt(result.averages.rt)}
              </span>
              <Link className="link-arrow" to={simulatorLink(algo, processes, quantum)}>
                step through →
              </Link>
            </div>
            <GanttChart result={result} colorMap={colorMap} showLevels={algo === 'mlq' || algo === 'mlfq'} />
          </div>
        ))}
      </div>

      <Callout type="key" title="Patterns to notice">
        <ul>
          <li>SRTF almost always has the lowest average waiting time — it is provably optimal for that metric.</li>
          <li>Round Robin often has the best response time but a higher average waiting time.</li>
          <li>Load the "Convoy effect" preset and compare FCFS with SJF to see why arrival order alone is a poor rule.</li>
        </ul>
      </Callout>
    </LessonShell>
  );
}

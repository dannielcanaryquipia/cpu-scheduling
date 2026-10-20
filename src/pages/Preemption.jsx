import { useMemo, useState } from 'react';
import LessonShell from '../components/LessonShell.jsx';
import Callout from '../components/Callout.jsx';
import QuestionCard from '../components/QuestionCard.jsx';
import StateDiagram from '../components/StateDiagram.jsx';
import GanttChart from '../components/GanttChart.jsx';
import { simulate, fmt } from '../lib/schedulers.js';
import { buildColorMap } from '../lib/colors.js';

const WORKLOAD = [
  { id: 'P1', at: 0, bt: 8 },
  { id: 'P2', at: 1, bt: 4 },
  { id: 'P3', at: 2, bt: 2 },
  { id: 'P4', at: 3, bt: 1 },
];

function SideBySide() {
  const [p1Burst, setP1Burst] = useState(8);
  const processes = useMemo(() => WORKLOAD.map((p) => (p.id === 'P1' ? { ...p, bt: p1Burst } : p)), [p1Burst]);
  const colorMap = useMemo(() => buildColorMap(processes), [processes]);
  const runs = [
    { key: 'sjf', title: 'Non-preemptive (SJF)', result: simulate('sjf', processes) },
    { key: 'srtf', title: 'Preemptive (SRTF)', result: simulate('srtf', processes) },
  ];

  return (
    <div className="lab">
      <p className="mini-game-title">Same rule, with and without preemption</p>
      <p>
        Both schedulers prefer the shortest job. The only difference: the preemptive one may take the CPU away from P1 when a
        shorter job arrives.
      </p>
      <label className="inline-range">
        P1 burst time <span className="mono">{p1Burst}</span>
        <input type="range" min="2" max="14" value={p1Burst} onChange={(e) => setP1Burst(Number(e.target.value))} />
      </label>
      {runs.map((r) => (
        <div key={r.key} className="compare-run">
          <div className="compare-run-head">
            <strong>{r.title}</strong>
            <span className="mono muted">
              avg WT {fmt(r.result.averages.wt)} · avg RT {fmt(r.result.averages.rt)} · switches{' '}
              {r.result.timeline.filter((s) => s.pid).length - 1}
            </span>
          </div>
          <GanttChart result={r.result} colorMap={colorMap} />
        </div>
      ))}
    </div>
  );
}

export default function Preemption() {
  return (
    <LessonShell
      title="Preemptive vs Non-Preemptive"
      lead="Can the operating system take the CPU away from a running process? The answer splits every algorithm into two families."
    >
      <div className="split">
        <div className="split-card">
          <span className="badge badge-cool">Non-preemptive</span>
          <h3>Run until you let go</h3>
          <p>
            Once a process gets the CPU it keeps it until it either <strong>finishes</strong> or <strong>blocks</strong> (for example
            waiting for I/O). The OS never forces it off.
          </p>
          <p className="muted">Examples: FCFS, SJF, non-preemptive Priority, HRRN.</p>
        </div>
        <div className="split-card">
          <span className="badge badge-warm">Preemptive</span>
          <h3>The OS can interrupt</h3>
          <p>
            The OS may pause a running process and move it back to the <strong>ready</strong> state — because a time slice ran
            out or a more deserving process arrived. It resumes later from where it stopped.
          </p>
          <p className="muted">Examples: SRTF, Round Robin, preemptive Priority, MLFQ.</p>
        </div>
      </div>

      <h2>When are scheduling decisions made?</h2>
      <p>
        Think in terms of the process state model. A decision can be triggered by four transitions. Non-preemptive scheduling
        reacts only to the two where the running process gives up the CPU on its own; preemptive scheduling can react to all four.
      </p>
      <StateDiagram />

      <table className="data-table plain">
        <thead>
          <tr>
            <th>Event</th>
            <th>Non-preemptive</th>
            <th>Preemptive</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Running → Waiting (I/O request)</td>
            <td>✓ decides</td>
            <td>✓ decides</td>
          </tr>
          <tr>
            <td>Running → Terminated</td>
            <td>✓ decides</td>
            <td>✓ decides</td>
          </tr>
          <tr>
            <td>Running → Ready (interrupt / quantum)</td>
            <td>— never happens</td>
            <td>✓ decides</td>
          </tr>
          <tr>
            <td>Waiting → Ready (I/O done) or new arrival</td>
            <td>— keeps running process</td>
            <td>✓ may switch</td>
          </tr>
        </tbody>
      </table>

      <SideBySide />

      <h2>Trade-offs</h2>
      <div className="split">
        <div className="split-card">
          <h3>Non-preemptive strengths</h3>
          <ul>
            <li>Simple; fewer context switches (less overhead)</li>
            <li>No risk of interrupting a process in the middle of updating shared data</li>
          </ul>
          <h3>Weaknesses</h3>
          <ul>
            <li>One long process can hold up everyone</li>
            <li>Poor response time for interactive use</li>
          </ul>
        </div>
        <div className="split-card">
          <h3>Preemptive strengths</h3>
          <ul>
            <li>Better response time; urgent work starts sooner</li>
            <li>No single process can hog the CPU</li>
          </ul>
          <h3>Weaknesses</h3>
          <ul>
            <li>Each switch costs time (saving and loading process state)</li>
            <li>Needs care with shared data (race conditions)</li>
          </ul>
        </div>
      </div>

      <Callout type="info" title="Context switch">
        When the CPU moves from one process to another, the OS saves the old process's registers and state into its Process Control
        Block (PCB) and loads the new one's. This is pure overhead — no user work happens during it. The simulators in this lab treat
        it as zero time to keep the math clean, but real systems pay for it.
      </Callout>

      <QuestionCard
        prompt="A process's time quantum expires and it returns to the ready queue. This can only happen under…"
        options={['Non-preemptive scheduling', 'Preemptive scheduling', 'Both', 'Neither']}
        answer={1}
        explanation="Being forced from Running back to Ready is the definition of preemption."
      />
    </LessonShell>
  );
}

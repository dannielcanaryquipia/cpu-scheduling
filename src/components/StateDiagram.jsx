import { useState } from 'react';

// The five-state process model. Each transition says whether a scheduling
// decision happens there and which kind of scheduler makes it.
const TRANSITIONS = [
  {
    id: 'admit',
    from: 'New',
    to: 'Ready',
    label: 'admitted',
    path: 'M120 70 L215 70',
    lx: 167,
    ly: 60,
    decision: 'none',
    text: 'A newly created process enters the ready queue. By itself this does not force a decision, but a preemptive scheduler may re-check (for example SRTF compares the newcomer with the running process).',
  },
  {
    id: 'dispatch',
    from: 'Ready',
    to: 'Running',
    label: 'dispatch',
    path: 'M325 60 L420 60',
    lx: 372,
    ly: 50,
    decision: 'result',
    text: 'This is the result of a scheduling decision: the dispatcher hands the CPU to the chosen process.',
  },
  {
    id: 'interrupt',
    from: 'Running',
    to: 'Ready',
    label: 'interrupt / quantum expired',
    path: 'M420 84 L325 84',
    lx: 372,
    ly: 104,
    decision: 'preemptive',
    text: 'The running process is forced off the CPU (timer interrupt, quantum expired, or a better process arrived). Only PREEMPTIVE scheduling does this.',
  },
  {
    id: 'io',
    from: 'Running',
    to: 'Waiting',
    label: 'I/O or event wait',
    path: 'M470 98 C470 170 420 205 344 205',
    lx: 560,
    ly: 170,
    decision: 'both',
    text: 'The process voluntarily gives up the CPU to wait for I/O. The CPU is free, so BOTH preemptive and non-preemptive schedulers must pick someone new.',
  },
  {
    id: 'io-done',
    from: 'Waiting',
    to: 'Ready',
    label: 'I/O complete',
    path: 'M240 205 C195 200 270 150 270 99',
    lx: 170,
    ly: 150,
    decision: 'preemptive',
    text: 'The process is ready again. A preemptive scheduler may re-check and preempt the running process if this one is more deserving.',
  },
  {
    id: 'exit',
    from: 'Running',
    to: 'Terminated',
    label: 'exit',
    path: 'M530 70 L610 70',
    lx: 570,
    ly: 60,
    decision: 'both',
    text: 'The process finishes. The CPU is free, so BOTH kinds of schedulers must choose the next process.',
  },
];

const STATES = [
  { name: 'New', x: 20, y: 45, w: 100 },
  { name: 'Ready', x: 215, y: 45, w: 110 },
  { name: 'Running', x: 420, y: 45, w: 110 },
  { name: 'Waiting', x: 240, y: 180, w: 100 },
  { name: 'Terminated', x: 610, y: 45, w: 120 },
];

const DECISION_TEXT = {
  both: 'Decision needed — preemptive AND non-preemptive',
  preemptive: 'Decision only in preemptive scheduling',
  result: 'Outcome of a decision',
  none: 'Usually no decision',
};

export default function StateDiagram() {
  const [active, setActive] = useState('io');
  const current = TRANSITIONS.find((t) => t.id === active);

  return (
    <div className="state-diagram">
      <svg viewBox="0 0 750 240" role="img" aria-label="Process state diagram">
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" className="arrow-head" />
          </marker>
        </defs>

        {TRANSITIONS.map((t) => (
          <g
            key={t.id}
            className={`transition ${t.decision} ${active === t.id ? 'active' : ''}`}
            onClick={() => setActive(t.id)}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setActive(t.id)}
            tabIndex={0}
            role="button"
            aria-label={`${t.from} to ${t.to}: ${t.label}`}
          >
            <path d={t.path} className="hit" />
            <path d={t.path} className="edge" markerEnd="url(#arrow)" />
            <text x={t.lx} y={t.ly} textAnchor="middle" className="edge-label">
              {t.label}
            </text>
          </g>
        ))}

        {STATES.map((s) => (
          <g key={s.name} className={`state-node ${current.from === s.name || current.to === s.name ? 'lit' : ''}`}>
            <rect x={s.x} y={s.y} width={s.w} height="50" rx="12" />
            <text x={s.x + s.w / 2} y={s.y + 30} textAnchor="middle">
              {s.name}
            </text>
          </g>
        ))}
      </svg>

      <div className={`diagram-note ${current.decision}`}>
        <p className="diagram-note-title">
          {current.from} → {current.to} <span className="tag">{DECISION_TEXT[current.decision]}</span>
        </p>
        <p>{current.text}</p>
      </div>
      <p className="hint">Click any arrow in the diagram.</p>
    </div>
  );
}

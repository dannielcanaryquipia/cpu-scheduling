import { useState } from 'react';
import LessonShell from '../components/LessonShell.jsx';
import Callout from '../components/Callout.jsx';
import QuestionCard from '../components/QuestionCard.jsx';

const TERMS = [
  { abbr: 'AT', name: 'Arrival Time', text: 'The moment a process enters the ready queue.' },
  { abbr: 'BT', name: 'Burst Time', text: 'How much CPU time the process needs to finish its work (also called execution or service time).' },
  { abbr: 'CT', name: 'Completion Time', text: 'The moment the process finishes executing.' },
  { abbr: 'TAT', name: 'Turnaround Time', text: 'The total time from arrival to completion — everything the process went through.' },
  { abbr: 'WT', name: 'Waiting Time', text: 'The time spent sitting in the ready queue, not running.' },
  { abbr: 'RT', name: 'Response Time', text: 'The time from arrival until the process gets the CPU for the first time.' },
];

/** Drag the sliders and watch a single process's timeline and formulas update. */
function TimelineLab() {
  const [at, setAt] = useState(2);
  const [start, setStart] = useState(5);
  const [bt, setBt] = useState(4);
  const [paused, setPaused] = useState(0);

  const s = Math.max(start, at);
  const ct = s + bt + paused;
  const tat = ct - at;
  const wt = tat - bt;
  const rt = s - at;
  const scale = 22; // timeline length
  const pct = (v) => `${(v / scale) * 100}%`;
  const half = Math.ceil(bt / 2);

  return (
    <div className="lab">
      <p className="mini-game-title">Interactive: one process, all the formulas</p>
      <div className="lab-controls">
        <label>
          Arrival (AT) <span className="mono">{at}</span>
          <input type="range" min="0" max="6" value={at} onChange={(e) => setAt(Number(e.target.value))} />
        </label>
        <label>
          First gets CPU at <span className="mono">{s}</span>
          <input type="range" min="0" max="10" value={start} onChange={(e) => setStart(Number(e.target.value))} />
        </label>
        <label>
          Burst (BT) <span className="mono">{bt}</span>
          <input type="range" min="1" max="8" value={bt} onChange={(e) => setBt(Number(e.target.value))} />
        </label>
        <label>
          Preempted for <span className="mono">{paused}</span>
          <input type="range" min="0" max="4" value={paused} onChange={(e) => setPaused(Number(e.target.value))} />
        </label>
      </div>

      <div className="tl">
        <div className="tl-track">
          <div className="tl-seg wait" style={{ left: pct(at), width: pct(s - at) }} title="Waiting before first run" />
          {paused > 0 ? (
            <>
              <div className="tl-seg run" style={{ left: pct(s), width: pct(half) }} />
              <div className="tl-seg wait" style={{ left: pct(s + half), width: pct(paused) }} title="Waiting after being preempted" />
              <div className="tl-seg run" style={{ left: pct(s + half + paused), width: pct(bt - half) }} />
            </>
          ) : (
            <div className="tl-seg run" style={{ left: pct(s), width: pct(bt) }} />
          )}
          <span className="tl-mark" style={{ left: pct(at) }}>
            AT={at}
          </span>
          <span className="tl-mark bottom" style={{ left: pct(ct) }}>
            CT={ct}
          </span>
          <span className="tl-brace" style={{ left: pct(at), width: pct(tat) }}>
            TAT = {tat}
          </span>
        </div>
        <div className="tl-legend">
          <span>
            <i className="sw wait" /> waiting in ready queue
          </span>
          <span>
            <i className="sw run" /> running on CPU
          </span>
        </div>
      </div>

      <div className="formula-grid">
        <div className="formula">
          <span className="f-name">TAT = CT − AT</span>
          <span className="f-calc mono">
            {ct} − {at} = <strong>{tat}</strong>
          </span>
        </div>
        <div className="formula">
          <span className="f-name">WT = TAT − BT</span>
          <span className="f-calc mono">
            {tat} − {bt} = <strong>{wt}</strong>
          </span>
        </div>
        <div className="formula">
          <span className="f-name">RT = first run − AT</span>
          <span className="f-calc mono">
            {s} − {at} = <strong>{rt}</strong>
          </span>
        </div>
      </div>
      <p className="hint">
        {paused === 0
          ? 'With no preemption, waiting time and response time are equal. Now drag "Preempted for" above 0.'
          : 'After preemption, WT grows but RT stays the same — RT only cares about the FIRST time on the CPU.'}
      </p>
    </div>
  );
}

export default function Terminology() {
  return (
    <LessonShell title="Key Terms & Formulas" lead="Six measurements describe every process in a schedule. Learn them once and every algorithm becomes easy to analyze.">
      <div className="term-grid">
        {TERMS.map((t) => (
          <div key={t.abbr} className="term-card">
            <span className="term-abbr mono">{t.abbr}</span>
            <span className="term-name">{t.name}</span>
            <p>{t.text}</p>
          </div>
        ))}
      </div>

      <h2>The two formulas you will use constantly</h2>
      <div className="formula-hero">
        <div>
          <span className="mono">Turnaround Time</span>
          <strong>TAT = CT − AT</strong>
        </div>
        <div>
          <span className="mono">Waiting Time</span>
          <strong>WT = TAT − BT</strong>
        </div>
      </div>
      <p>
        Combine them and you get a handy shortcut: <code>WT = CT − AT − BT</code>. In words: out of the total time a process spent
        in the system, whatever was not spent running must have been spent waiting.
      </p>

      <TimelineLab />

      <h2>Reading a Gantt chart</h2>
      <p>
        Schedules are drawn as a <strong>Gantt chart</strong>: a horizontal bar divided into blocks, one block for each stretch of
        time a process held the CPU. The numbers underneath are the times where blocks begin and end. To find a process's
        completion time, look for the right edge of its <em>last</em> block.
      </p>
      <div className="gantt-sample">
        <div className="gs-bar">
          <span style={{ flex: 3 }} className="c1">P1</span>
          <span style={{ flex: 2 }} className="c2">P2</span>
          <span style={{ flex: 4 }} className="c1">P1</span>
        </div>
        <div className="gs-axis mono">
          <span style={{ left: '0%' }}>0</span>
          <span style={{ left: '33.3%' }}>3</span>
          <span style={{ left: '55.5%' }}>5</span>
          <span style={{ left: '100%' }}>9</span>
        </div>
      </div>
      <p>Here P1 runs, is interrupted by P2, then resumes. P1's completion time is 9 (its last block ends at 9), not 3.</p>

      <Callout type="tip" title="Averages">
        Algorithms are usually compared using the <strong>average</strong> TAT, WT and RT across all processes: add the values
        and divide by the number of processes.
      </Callout>

      <QuestionCard
        prompt="A process arrives at t = 3, needs 5 units of CPU, and completes at t = 14. What is its waiting time?"
        options={['11', '6', '9', '3']}
        answer={1}
        explanation="TAT = 14 − 3 = 11. WT = TAT − BT = 11 − 5 = 6."
      />
    </LessonShell>
  );
}

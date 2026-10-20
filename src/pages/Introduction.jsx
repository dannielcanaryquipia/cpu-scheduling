import { useMemo, useState } from 'react';
import LessonShell from '../components/LessonShell.jsx';
import Callout from '../components/Callout.jsx';
import QuestionCard from '../components/QuestionCard.jsx';
import GanttChart from '../components/GanttChart.jsx';
import { simulate } from '../lib/schedulers.js';
import { buildColorMap } from '../lib/colors.js';

const JOBS = [
  { id: 'P1', at: 0, bt: 8 },
  { id: 'P2', at: 0, bt: 2 },
  { id: 'P3', at: 0, bt: 3 },
];

/** A tiny "be the scheduler" game: click processes in the order you want them to run. */
function OrderGame() {
  const [order, setOrder] = useState([]);
  const colorMap = useMemo(() => buildColorMap(JOBS), []);
  const remaining = JOBS.filter((j) => !order.includes(j.id));

  const result = useMemo(() => {
    if (order.length < JOBS.length) return null;
    // Arriving 0, 0.., with FCFS on the chosen order == "run in this order".
    const ordered = order.map((id) => JOBS.find((j) => j.id === id));
    return simulate('fcfs', ordered);
  }, [order]);

  return (
    <div className="mini-game">
      <p className="mini-game-title">You are the scheduler</p>
      <p>
        Three processes are waiting at t = 0. Click them in the order you want them to use the CPU. Try to make the
        <strong> average waiting time</strong> as small as possible.
      </p>
      <div className="chip-row">
        {JOBS.map((j) => (
          <button
            key={j.id}
            className="job-chip"
            disabled={order.includes(j.id)}
            onClick={() => setOrder((o) => [...o, j.id])}
            style={{ '--chip': colorMap[j.id].bg, '--chip-fg': colorMap[j.id].fg }}
          >
            {j.id} <small>needs {j.bt}</small>
          </button>
        ))}
        {order.length > 0 && (
          <button className="link-btn" onClick={() => setOrder([])}>
            reset
          </button>
        )}
      </div>
      <p className="mono muted">Your order: {order.length ? order.join(' → ') : '—'}{remaining.length ? ' …' : ''}</p>
      {result && (
        <>
          <GanttChart result={result} colorMap={colorMap} />
          <p className={`game-verdict ${result.averages.wt <= 2.34 ? 'good' : ''}`}>
            Average waiting time: <strong>{result.averages.wt.toFixed(2)}</strong>{' '}
            {result.averages.wt <= 2.34
              ? '— optimal! Running the shortest jobs first gives the smallest average.'
              : '— the best possible is 2.33. Hint: who should go first?'}
          </p>
        </>
      )}
    </div>
  );
}

export default function Introduction() {
  return (
    <LessonShell
      title="What is CPU Scheduling?"
      lead="The operating system's way of deciding which ready process gets the processor, and for how long."
    >
      <h2>The problem</h2>
      <p>
        A single CPU core can execute only one process at a time. On a real computer, though, many processes are ready to run at
        once: your browser, a music player, a download, background services. Someone has to decide whose turn it is. That
        "someone" is the <strong>CPU scheduler</strong> (also called the short-term scheduler), a part of the operating system.
      </p>
      <p>
        Processes that are loaded in memory and waiting only for the CPU sit in the <strong>ready queue</strong>. Whenever the CPU
        becomes free, the scheduler picks one process from that queue, and a component called the <strong>dispatcher</strong> gives
        it control of the CPU.
      </p>

      <Callout type="key" title="Two goals the scheduler balances">
        <ul>
          <li>
            <strong>Keep the CPU busy</strong> — idle CPU time is wasted capacity.
          </li>
          <li>
            <strong>Keep waiting short</strong> — processes (and the people using them) should not sit in line longer than needed.
          </li>
        </ul>
      </Callout>

      <h2>Why it matters</h2>
      <p>
        Processes constantly alternate between using the CPU (a <em>CPU burst</em>) and waiting for something else, like reading a
        file or receiving network data (an <em>I/O burst</em>). While one process waits for I/O, the CPU would sit idle unless the
        scheduler hands it to another ready process. Good scheduling therefore makes the whole system faster and more responsive,
        without buying new hardware.
      </p>
      <p>
        The order also changes how long each process waits, even when the total amount of work is identical. Try it:
      </p>

      <OrderGame />

      <h2>What you will learn next</h2>
      <p>
        To compare scheduling strategies fairly we need a shared vocabulary — arrival time, burst time, completion time and the
        formulas that connect them. That is the next lesson. After that we look at the criteria used to judge an algorithm, the
        difference between preemptive and non-preemptive scheduling, and then each algorithm in turn.
      </p>

      <QuestionCard
        prompt="When does the CPU scheduler need to choose a new process?"
        options={[
          'Only when the computer starts up',
          'Whenever the CPU becomes free (and, in some systems, when a better process arrives)',
          'Only when the user opens a new program',
          'Every time memory is full',
        ]}
        answer={1}
        explanation="A choice is needed whenever the CPU is released — a process finishes or waits for I/O. Preemptive schedulers may also step in when a more deserving process arrives or a time slice runs out."
      />
    </LessonShell>
  );
}

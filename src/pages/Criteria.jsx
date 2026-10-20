import { useState } from 'react';
import LessonShell from '../components/LessonShell.jsx';
import Callout from '../components/Callout.jsx';
import QuestionCard from '../components/QuestionCard.jsx';

const CRITERIA = [
  {
    id: 'util',
    name: 'CPU Utilization',
    goal: 'Maximize',
    text: 'The percentage of time the CPU is doing useful work. In theory it can range from 0 to 100%; real systems commonly sit somewhere around 40% (light load) to 90% (heavy load).',
  },
  {
    id: 'throughput',
    name: 'Throughput',
    goal: 'Maximize',
    text: 'How many processes finish per unit of time. Many short jobs give high throughput; a few long jobs give low throughput.',
  },
  {
    id: 'tat',
    name: 'Turnaround Time',
    goal: 'Minimize',
    text: 'Total time from a process arriving to it finishing. It includes waiting in the ready queue, running, and waiting for I/O.',
  },
  {
    id: 'wt',
    name: 'Waiting Time',
    goal: 'Minimize',
    text: 'Time spent in the ready queue. This is the part the scheduler controls directly — it cannot make a process need less CPU, only wait less.',
  },
  {
    id: 'rt',
    name: 'Response Time',
    goal: 'Minimize',
    text: 'Time from arrival until the first response begins. For interactive programs, users feel this much more than total turnaround.',
  },
];

const SYSTEMS = [
  {
    id: 'batch',
    label: 'Batch system',
    desc: 'Payroll runs, overnight reports, scientific jobs. Nobody is watching the screen.',
    priorities: { util: 3, throughput: 3, tat: 3, wt: 2, rt: 1 },
  },
  {
    id: 'interactive',
    label: 'Interactive / time-sharing',
    desc: 'Desktops and phones. A person is waiting for every click to respond.',
    priorities: { util: 2, throughput: 1, tat: 2, wt: 2, rt: 3 },
  },
  {
    id: 'server',
    label: 'Busy web server',
    desc: 'Thousands of small requests per second from many users.',
    priorities: { util: 3, throughput: 3, tat: 2, wt: 2, rt: 3 },
  },
];

const LEVEL = ['', 'Low', 'Medium', 'High'];

export default function Criteria() {
  const [system, setSystem] = useState('interactive');
  const active = SYSTEMS.find((s) => s.id === system);

  return (
    <LessonShell title="Scheduling Criteria" lead="How do we decide whether one algorithm is better than another? We measure it with five criteria.">
      <p>
        No single algorithm is best at everything. Each one trades some criteria for others, so the first step is knowing what can
        be measured and which direction is "good".
      </p>

      <div className="criteria-list">
        {CRITERIA.map((c) => (
          <div key={c.id} className="criterion">
            <span className={`goal ${c.goal === 'Maximize' ? 'up' : 'down'}`}>{c.goal === 'Maximize' ? '▲ Maximize' : '▼ Minimize'}</span>
            <h3>{c.name}</h3>
            <p>{c.text}</p>
          </div>
        ))}
      </div>

      <Callout type="key" title="The scheduler only changes waiting">
        Once a process is running, the scheduler cannot make its work smaller. What the algorithm really controls is how long
        processes sit in the ready queue. That is why average waiting time is the most common yardstick in exam problems.
      </Callout>

      <h2>Different systems, different priorities</h2>
      <p>Pick a type of system to see which criteria matter most there.</p>
      <div className="segmented">
        {SYSTEMS.map((s) => (
          <button key={s.id} className={system === s.id ? 'active' : ''} onClick={() => setSystem(s.id)}>
            {s.label}
          </button>
        ))}
      </div>
      <p className="muted">{active.desc}</p>
      <div className="meter-list">
        {CRITERIA.map((c) => (
          <div key={c.id} className="meter">
            <span className="meter-name">{c.name}</span>
            <div className="meter-track">
              <div className="meter-fill" style={{ width: `${(active.priorities[c.id] / 3) * 100}%` }} />
            </div>
            <span className="meter-level mono">{LEVEL[active.priorities[c.id]]}</span>
          </div>
        ))}
      </div>

      <h2>Computing utilization and throughput</h2>
      <p>For a finished schedule running from its first arrival to its last completion:</p>
      <div className="formula-hero">
        <div>
          <span className="mono">CPU Utilization</span>
          <strong>busy time ÷ total time × 100%</strong>
        </div>
        <div>
          <span className="mono">Throughput</span>
          <strong>processes finished ÷ total time</strong>
        </div>
      </div>
      <p>
        Example: 4 processes finish within 20 time units, and the CPU was idle for 2 of them. Utilization = 18 ÷ 20 = 90%, and
        throughput = 4 ÷ 20 = 0.2 processes per unit. The simulator shows both numbers under every result table.
      </p>

      <QuestionCard
        prompt="For a text editor where a person is typing, which criterion matters MOST?"
        options={['Throughput', 'Response time', 'CPU utilization', 'Turnaround time of batch jobs']}
        answer={1}
        explanation="An interactive user notices how quickly the system starts responding to each keystroke, which is response time."
      />
    </LessonShell>
  );
}

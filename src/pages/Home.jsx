import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { SECTIONS, ALL_LESSONS } from '../data/lessons.js';
import { useApp } from '../context/AppContext.jsx';
import { simulate } from '../lib/schedulers.js';
import { buildColorMap } from '../lib/colors.js';
import GanttChart from '../components/GanttChart.jsx';

const DEMO = [
  { id: 'P1', at: 0, bt: 6 },
  { id: 'P2', at: 1, bt: 3 },
  { id: 'P3', at: 2, bt: 1 },
  { id: 'P4', at: 3, bt: 4 },
];

export default function Home() {
  const { completed, resetProgress } = useApp();
  const next = ALL_LESSONS.find((l) => !completed.includes(l.path)) || ALL_LESSONS[0];
  const doneCount = ALL_LESSONS.filter((l) => completed.includes(l.path)).length;

  const demo = useMemo(() => {
    const colorMap = buildColorMap(DEMO);
    return ['fcfs', 'srtf', 'rr'].map((algo) => ({ algo, result: simulate(algo, DEMO, { quantum: 2 }), colorMap }));
  }, []);

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-text">
          <p className="eyebrow">Operating Systems · Process Management</p>
          <h1>
            Who gets the CPU <em>next?</em>
          </h1>
          <p className="lead">
            A CPU core runs one process at a time, yet dozens of processes want it. CPU scheduling is the set of rules the
            operating system uses to decide the order. In this lab you will read short lessons, then watch every algorithm run
            step by step on processes you design.
          </p>
          <div className="hero-actions">
            <Link to={next.path} className="btn btn-primary">
              {doneCount ? 'Continue: ' : 'Start: '}
              {next.title} →
            </Link>
            <Link to="/simulator" className="btn">
              Open the simulator
            </Link>
          </div>
        </div>

        <div className="hero-demo" aria-label="Same four processes under three algorithms">
          <p className="demo-caption mono">same 4 processes · 3 different schedules</p>
          {demo.map(({ algo, result, colorMap }) => (
            <div key={algo} className="demo-row">
              <span className="demo-name mono">{algo.toUpperCase()}</span>
              <div className="demo-chart">
                <GanttChart result={result} colorMap={colorMap} compact />
              </div>
              <span className="demo-metric mono">WT {result.averages.wt.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="roadmap">
        <div className="section-head">
          <h2>Course roadmap</h2>
          <p className="muted">
            {doneCount} of {ALL_LESSONS.length} lessons complete
            {doneCount > 0 && (
              <button className="link-btn" onClick={resetProgress}>
                reset
              </button>
            )}
          </p>
        </div>

        {SECTIONS.map((section, si) => (
          <div key={section.title} className="roadmap-section">
            <h3>
              <span className="mono step-num">0{si + 1}</span> {section.title}
            </h3>
            <div className="card-grid">
              {section.lessons.map((lesson) => (
                <Link key={lesson.path} to={lesson.path} className={`lesson-card ${completed.includes(lesson.path) ? 'done' : ''}`}>
                  <span className="lesson-card-title">{lesson.title}</span>
                  <span className="lesson-card-meta mono">
                    {completed.includes(lesson.path) ? '✓ done' : `~${lesson.minutes} min`}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="how-to">
        <h2>How to use this lab</h2>
        <ol className="how-list">
          <li>
            <strong>Read the lesson.</strong> Each page explains one idea in plain language with an analogy.
          </li>
          <li>
            <strong>Play the simulation.</strong> Press ▶ to watch the Gantt chart fill in, or use the step buttons to move one time
            unit at a time.
          </li>
          <li>
            <strong>Break things.</strong> Edit arrival and burst times, add processes, and see how the averages change.
          </li>
          <li>
            <strong>Check yourself.</strong> Every lesson ends with a question; the Practice and Quiz pages test everything.
          </li>
        </ol>
      </section>
    </div>
  );
}

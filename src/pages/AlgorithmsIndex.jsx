import { Link } from 'react-router-dom';
import { ALGORITHMS } from '../data/algorithms.js';
import { useApp } from '../context/AppContext.jsx';

export default function AlgorithmsIndex() {
  const { isDone } = useApp();
  return (
    <article className="lesson">
      <header className="lesson-head">
        <p className="eyebrow">Algorithms</p>
        <h1>The scheduling algorithms</h1>
        <p className="lead">
          Eight classic strategies, from the simplest (FCFS) to the most adaptive (MLFQ). Each page has an explanation, pseudo-code
          and a live simulator.
        </p>
      </header>
      <div className="algo-grid">
        {ALGORITHMS.map((a) => (
          <Link key={a.slug} to={`/algorithms/${a.slug}`} className="algo-card">
            <div className="algo-card-top">
              <span className="algo-short mono">{a.short}</span>
              {isDone(`/algorithms/${a.slug}`) && <span className="done-tick">✓</span>}
            </div>
            <h3>{a.title}</h3>
            <p>{a.tagline}</p>
            <div className="algo-tags">
              <span className={`badge ${a.preemptive === true ? 'badge-warm' : a.preemptive === 'both' ? 'badge-mixed' : 'badge-cool'}`}>
                {a.preemptive === true ? 'Preemptive' : a.preemptive === 'both' ? 'Both modes' : 'Non-preemptive'}
              </span>
              <span className={`badge ${a.starvation ? 'badge-danger' : 'badge-ok'}`}>
                {a.starvation ? 'Can starve' : 'No starvation'}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </article>
  );
}

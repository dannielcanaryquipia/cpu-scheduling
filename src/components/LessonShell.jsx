import { Link, useLocation } from 'react-router-dom';
import { neighbors } from '../data/lessons.js';
import { useApp } from '../context/AppContext.jsx';

/** Wraps every lesson page: header, body, "mark complete" and prev/next navigation. */
export default function LessonShell({ eyebrow, title, lead, children, path }) {
  const location = useLocation();
  const here = path || location.pathname;
  const { prev, next, current, index } = neighbors(here);
  const { isDone, toggleDone, markDone } = useApp();
  const done = isDone(here);

  return (
    <article className="lesson">
      <header className="lesson-head">
        <p className="eyebrow">
          {eyebrow || current?.section}
          {index >= 0 && current?.minutes ? <span className="mono"> · ~{current.minutes} min</span> : null}
        </p>
        <h1>{title}</h1>
        {lead && <p className="lead">{lead}</p>}
      </header>

      <div className="lesson-body">{children}</div>

      {index >= 0 && (
        <footer className="lesson-foot">
          <button className={`btn ${done ? 'btn-ghost' : 'btn-primary'}`} onClick={() => toggleDone(here)}>
            {done ? '✓ Completed — click to undo' : 'Mark this lesson as complete'}
          </button>

          <div className="pager">
            {prev ? (
              <Link to={prev.path} className="pager-link">
                <span className="pager-dir">← Previous</span>
                <span>{prev.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link to={next.path} className="pager-link next" onClick={() => markDone(here)}>
                <span className="pager-dir">Next →</span>
                <span>{next.title}</span>
              </Link>
            )}
          </div>
        </footer>
      )}
    </article>
  );
}

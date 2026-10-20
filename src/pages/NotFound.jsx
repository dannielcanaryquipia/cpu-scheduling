import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <article className="lesson not-found">
      <p className="mono big-code">404</p>
      <h1>Process not found</h1>
      <p className="lead">This page was never admitted to the ready queue.</p>
      <Link to="/" className="btn btn-primary">
        Back to the start
      </Link>
    </article>
  );
}

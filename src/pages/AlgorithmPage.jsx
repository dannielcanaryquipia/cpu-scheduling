import { Navigate, useParams } from 'react-router-dom';
import { findAlgorithm } from '../data/algorithms.js';
import LessonShell from '../components/LessonShell.jsx';
import Callout from '../components/Callout.jsx';
import QuestionCard from '../components/QuestionCard.jsx';
import Simulator from '../components/Simulator.jsx';

export default function AlgorithmPage() {
  const { slug } = useParams();
  const a = findAlgorithm(slug);
  if (!a) return <Navigate to="/algorithms" replace />;

  const modeLabel = a.preemptive === 'both' ? 'Preemptive or non-preemptive' : a.preemptive ? 'Preemptive' : 'Non-preemptive';

  return (
    <LessonShell key={slug} title={`${a.title} (${a.short})`} lead={a.tagline}>
      <div className="fact-strip">
        <div>
          <span className="fact-label">Selection rule</span>
          <span>{a.rule}</span>
        </div>
        <div>
          <span className="fact-label">Mode</span>
          <span>{modeLabel}</span>
        </div>
        <div>
          <span className="fact-label">Starvation?</span>
          <span>{a.starvation ? 'Possible' : 'No'}</span>
        </div>
      </div>

      {a.formula && (
        <div className="formula-hero single">
          <div>
            <span className="mono">Key formula</span>
            <strong>{a.formula}</strong>
          </div>
        </div>
      )}

      <h2>How it works</h2>
      <ol className="steps">
        {a.steps.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ol>

      <Callout type="tip" title="Real-life analogy">
        {a.analogy}
      </Callout>

      <div className="split">
        <div className="split-card">
          <h3 className="good-head">Advantages</h3>
          <ul>
            {a.pros.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
        <div className="split-card">
          <h3 className="bad-head">Disadvantages</h3>
          <ul>
            {a.cons.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      </div>

      <h2>Pseudo-code</h2>
      <pre className="code">
        <code>{a.pseudo}</code>
      </pre>

      <Callout type="warn" title={a.watchOut.title}>
        {a.watchOut.body}
      </Callout>

      <Simulator
        key={slug}
        title={`Simulate ${a.short}`}
        initialProcesses={a.example}
        initialAlgo={a.algo}
        initialQuantum={a.quantum ?? 2}
        algoChoices={a.altAlgo ? [a.algo, a.altAlgo] : [a.algo]}
      />

      <QuestionCard {...a.check} />
    </LessonShell>
  );
}

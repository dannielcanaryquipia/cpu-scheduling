import { useState } from 'react';

/**
 * A single multiple-choice question with instant feedback.
 * Pass `onAnswer(correct)` to be notified (used by the Quiz page).
 */
export default function QuestionCard({ number, prompt, options, answer, explanation, onAnswer, children, label = 'Check your understanding' }) {
  const [picked, setPicked] = useState(null);
  const answered = picked !== null;
  const correct = picked === answer;

  function choose(i) {
    if (answered) return;
    setPicked(i);
    onAnswer?.(i === answer);
  }

  return (
    <section className="question-card">
      <p className="q-label">
        {number ? `Question ${number}` : label}
      </p>
      <p className="q-prompt">{prompt}</p>
      {children}
      <div className="q-options" role="list">
        {options.map((opt, i) => {
          let state = '';
          if (answered && i === answer) state = 'correct';
          else if (answered && i === picked) state = 'wrong';
          return (
            <button
              key={opt}
              role="listitem"
              className={`q-option ${state}`}
              onClick={() => choose(i)}
              disabled={answered}
            >
              <span className="q-letter">{String.fromCharCode(65 + i)}</span>
              <span>{opt}</span>
            </button>
          );
        })}
      </div>
      {answered && (
        <div className={`q-feedback ${correct ? 'good' : 'bad'}`}>
          <strong>{correct ? 'Correct!' : 'Not quite.'}</strong> {explanation}
          {!correct && !onAnswer && (
            <button className="link-btn" onClick={() => setPicked(null)}>
              Try again
            </button>
          )}
        </div>
      )}
    </section>
  );
}

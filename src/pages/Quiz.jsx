import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import LessonShell from '../components/LessonShell.jsx';
import QuestionCard from '../components/QuestionCard.jsx';
import { QUIZ } from '../data/quiz.js';
import { useApp } from '../context/AppContext.jsx';

export default function Quiz() {
  const [attempt, setAttempt] = useState(0);
  const [answers, setAnswers] = useState({});
  const { markDone } = useApp();

  const answered = Object.keys(answers).length;
  const score = Object.values(answers).filter(Boolean).length;
  const finished = answered === QUIZ.length;
  const percent = Math.round((score / QUIZ.length) * 100);

  useEffect(() => {
    if (finished && percent >= 70) markDone('/quiz');
  }, [finished, percent, markDone]);

  function record(i, correct) {
    setAnswers((a) => ({ ...a, [i]: correct }));
  }

  function retry() {
    setAnswers({});
    setAttempt((n) => n + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <LessonShell title="Final Quiz" lead={`${QUIZ.length} questions covering the whole lab. Score 70% or higher to complete the course.`}>
      <div className="quiz-status">
        <span className="mono">
          Answered {answered}/{QUIZ.length}
        </span>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${(answered / QUIZ.length) * 100}%` }} />
        </div>
        <span className="mono">Score {score}</span>
      </div>

      {QUIZ.map((q, i) => (
        <QuestionCard key={`${attempt}-${i}`} number={i + 1} {...q} onAnswer={(c) => record(i, c)} />
      ))}

      {finished && (
        <div className={`quiz-result ${percent >= 70 ? 'pass' : 'fail'}`}>
          <p className="quiz-score">
            {score} / {QUIZ.length} <span>({percent}%)</span>
          </p>
          <p>
            {percent >= 70
              ? 'Great work — you have completed the CPU Scheduling Lab!'
              : 'Not quite there yet. Review the lessons for the questions you missed, then try again.'}
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary" onClick={retry}>
              Retake quiz
            </button>
            <Link className="btn" to="/practice">
              More practice problems
            </Link>
          </div>
        </div>
      )}
    </LessonShell>
  );
}

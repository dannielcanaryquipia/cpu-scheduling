const KIND_LABEL = { arrive: 'arrive', run: 'dispatch', preempt: 'switch', done: 'finish', idle: 'idle' };

/** Step-by-step narration of every scheduling decision. */
export default function EventLog({ log, time, onJump }) {
  return (
    <ol className="event-log">
      {log.map((entry) => {
        const state = time === undefined || entry.t < time ? 'past' : entry.t === time ? 'now' : 'future';
        return (
          <li key={entry.order} className={`event ${state} kind-${entry.kind}`}>
            <button className="event-time mono" onClick={() => onJump?.(entry.t)} title="Jump to this moment">
              t={entry.t}
            </button>
            <span className={`event-kind kind-${entry.kind}`}>{KIND_LABEL[entry.kind]}</span>
            <span className="event-text">{entry.text}</span>
          </li>
        );
      })}
    </ol>
  );
}

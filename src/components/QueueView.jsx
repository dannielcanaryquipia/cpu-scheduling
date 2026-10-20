import { snapshotAt } from '../lib/schedulers.js';

function Chip({ id, colorMap, faded }) {
  const c = colorMap[id];
  return (
    <span className={`pid-chip ${faded ? 'faded' : ''}`} style={{ background: c?.bg, color: c?.fg }}>
      {id}
    </span>
  );
}

/** Shows where every process is at a given moment: not arrived, ready, on the CPU, or done. */
export default function QueueView({ result, colorMap, time }) {
  const snap = snapshotAt(result, time);
  const lanes = [
    { key: 'upcoming', title: 'Not arrived', items: snap.upcoming, faded: true },
    { key: 'ready', title: 'Ready queue', items: snap.ready },
    { key: 'cpu', title: 'CPU', items: snap.running ? [{ id: snap.running.pid }] : [] },
    { key: 'done', title: 'Finished', items: snap.done, faded: true },
  ];

  return (
    <div className="queue-view">
      {lanes.map((lane) => (
        <div key={lane.key} className={`lane lane-${lane.key}`}>
          <p className="lane-title">{lane.title}</p>
          <div className="lane-items">
            {lane.items.length ? (
              lane.items.map((p) => <Chip key={p.id} id={p.id} colorMap={colorMap} faded={lane.faded} />)
            ) : (
              <span className="lane-empty">{lane.key === 'cpu' ? 'idle' : '—'}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

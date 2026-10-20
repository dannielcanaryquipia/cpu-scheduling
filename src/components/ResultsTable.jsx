import { fmt } from '../lib/schedulers.js';

/** Per-process metrics. During playback, values appear as each process finishes. */
export default function ResultsTable({ result, colorMap, time, showPriority, showQueue }) {
  const atEnd = time === undefined || time >= result.makespan;
  const show = (r, value) => (time === undefined || time >= r.ct ? value : '…');

  return (
    <div className="results">
      <div className="table-wrap">
        <table className="data-table results-table">
          <thead>
            <tr>
              <th>Process</th>
              <th>AT</th>
              <th>BT</th>
              {showPriority && <th>Pr</th>}
              {showQueue && <th>Q</th>}
              <th title="Completion Time">CT</th>
              <th title="Turnaround Time = CT − AT">TAT</th>
              <th title="Waiting Time = TAT − BT">WT</th>
              <th title="Response Time = first run − AT">RT</th>
            </tr>
          </thead>
          <tbody>
            {result.results.map((r) => (
              <tr key={r.id} className={time !== undefined && time < r.ct ? 'pending' : ''}>
                <td>
                  <span className="pid-chip" style={{ background: colorMap[r.id]?.bg, color: colorMap[r.id]?.fg }}>
                    {r.id}
                  </span>
                </td>
                <td>{r.at}</td>
                <td>{r.bt}</td>
                {showPriority && <td>{r.pr}</td>}
                {showQueue && <td>{r.q}</td>}
                <td>{show(r, r.ct)}</td>
                <td title={`${r.ct} − ${r.at}`}>{show(r, r.tat)}</td>
                <td title={`${r.tat} − ${r.bt}`}>{show(r, r.wt)}</td>
                <td title={`${r.firstRun} − ${r.at}`}>{time === undefined || time >= r.firstRun ? r.rt : '…'}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3 + (showPriority ? 1 : 0) + (showQueue ? 1 : 0)}>Average</td>
              <td>{atEnd ? fmt(result.averages.ct) : '…'}</td>
              <td>{atEnd ? fmt(result.averages.tat) : '…'}</td>
              <td>{atEnd ? fmt(result.averages.wt) : '…'}</td>
              <td>{atEnd ? fmt(result.averages.rt) : '…'}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {atEnd && (
        <div className="stat-row">
          <div className="stat">
            <span className="stat-value">{fmt(result.averages.wt)}</span>
            <span className="stat-label">Avg waiting</span>
          </div>
          <div className="stat">
            <span className="stat-value">{fmt(result.averages.tat)}</span>
            <span className="stat-label">Avg turnaround</span>
          </div>
          <div className="stat">
            <span className="stat-value">{fmt(result.averages.rt)}</span>
            <span className="stat-label">Avg response</span>
          </div>
          <div className="stat">
            <span className="stat-value">{result.utilization.toFixed(1)}%</span>
            <span className="stat-label">CPU utilization</span>
          </div>
          <div className="stat">
            <span className="stat-value">{result.throughput.toFixed(3)}</span>
            <span className="stat-label">Throughput (jobs / unit)</span>
          </div>
        </div>
      )}
    </div>
  );
}

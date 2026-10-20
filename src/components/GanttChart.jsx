/**
 * Gantt chart: one horizontal bar, one block per time slice.
 * When `time` is given, only the part of the schedule up to `time` is filled in
 * (used for the play / step animation).
 */
export default function GanttChart({ result, colorMap, time, showLevels = false, compact = false }) {
  const span = result.makespan || 1;

  // Boundaries for the time axis, skipping labels that would overlap.
  const boundaries = [...new Set(result.timeline.flatMap((s) => [s.start, s.end]))].sort((a, b) => a - b);
  const minGap = compact ? 6 : 3.2;
  const ticks = [];
  boundaries.forEach((b, i) => {
    const pos = (b / span) * 100;
    const last = ticks[ticks.length - 1];
    const isEnd = i === boundaries.length - 1;
    if (!last || pos - last.pos >= minGap) ticks.push({ value: b, pos });
    else if (isEnd) ticks[ticks.length - 1] = { value: b, pos };
  });

  return (
    <div className={`gantt ${compact ? 'compact' : ''}`}>
      <div className="gantt-bar" role="img" aria-label="Gantt chart of the schedule">
        {result.timeline.map((s, i) => {
          const color = s.pid ? colorMap[s.pid] : null;
          const reveal = time === undefined ? 1 : Math.max(0, Math.min(1, (time - s.start) / (s.end - s.start)));
          const width = ((s.end - s.start) / span) * 100;
          return (
            <div
              key={i}
              className={`gantt-slice ${s.pid ? '' : 'idle'} ${reveal === 0 ? 'future' : ''}`}
              style={{ left: `${(s.start / span) * 100}%`, width: `${width}%` }}
              title={`${s.pid ?? 'Idle'}: ${s.start} → ${s.end}${s.lvl !== undefined ? ` (Q${s.lvl})` : ''}`}
            >
              {s.pid && (
                <div className="gantt-fill" style={{ width: `${reveal * 100}%`, background: color.bg }} />
              )}
              <span className="gantt-label" style={{ color: s.pid && reveal === 1 ? color.fg : undefined }}>
                {s.pid ?? (width > 6 ? 'idle' : '')}
                {showLevels && s.lvl !== undefined && width > 5 && <small>Q{s.lvl}</small>}
              </span>
            </div>
          );
        })}
        {time !== undefined && time < span && <div className="gantt-cursor" style={{ left: `${(time / span) * 100}%` }} />}
      </div>
      <div className="gantt-axis">
        {ticks.map((t) => (
          <span key={t.value} style={{ left: `${t.pos}%` }}>
            {t.value}
          </span>
        ))}
      </div>
    </div>
  );
}

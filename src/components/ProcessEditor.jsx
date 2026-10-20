import { PRESETS } from '../data/presets.js';

const MAX = 10;

function nextId(processes) {
  const nums = processes.map((p) => parseInt(String(p.id).replace(/\D/g, ''), 10)).filter((n) => !Number.isNaN(n));
  return `P${nums.length ? Math.max(...nums) + 1 : 1}`;
}

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

/** Editable table of processes (arrival, burst, priority, queue). */
export default function ProcessEditor({ processes, onChange, colorMap, showPriority, showQueue }) {
  function update(index, field, value) {
    onChange(processes.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
  }

  function add() {
    if (processes.length >= MAX) return;
    const lastAt = Math.max(0, ...processes.map((p) => Number(p.at) || 0));
    onChange([...processes, { id: nextId(processes), at: lastAt + 1, bt: rand(1, 6), pr: rand(1, 4), q: rand(0, 1) }]);
  }

  function remove(index) {
    if (processes.length <= 1) return;
    onChange(processes.filter((_, i) => i !== index));
  }

  function randomize() {
    const n = rand(4, 6);
    let at = 0;
    const list = Array.from({ length: n }, (_, i) => {
      const p = { id: `P${i + 1}`, at, bt: rand(1, 8), pr: rand(1, 5), q: rand(0, 1) };
      at += rand(0, 3);
      return p;
    });
    onChange(list);
  }

  function loadPreset(id) {
    const preset = PRESETS.find((p) => p.id === id);
    if (preset) onChange(preset.processes.map((p) => ({ ...p })));
  }

  return (
    <div className="editor">
      <div className="editor-toolbar">
        <select className="select" value="" onChange={(e) => loadPreset(e.target.value)} aria-label="Load a preset workload">
          <option value="" disabled>
            Load a preset…
          </option>
          {PRESETS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
        <button className="btn btn-small" onClick={randomize}>
          ⚄ Random
        </button>
        <button className="btn btn-small" onClick={add} disabled={processes.length >= MAX}>
          + Add process
        </button>
      </div>

      <div className="table-wrap">
        <table className="data-table editor-table">
          <thead>
            <tr>
              <th>Process</th>
              <th title="When the process enters the ready queue">Arrival</th>
              <th title="CPU time the process needs">Burst</th>
              {showPriority && <th title="Priority number">Priority</th>}
              {showQueue && <th title="0 = Foreground (RR), 1 = Background (FCFS)">Queue</th>}
              <th aria-label="Remove" />
            </tr>
          </thead>
          <tbody>
            {processes.map((p, i) => (
              <tr key={p.id}>
                <td>
                  <span className="pid-chip" style={{ background: colorMap[p.id]?.bg, color: colorMap[p.id]?.fg }}>
                    {p.id}
                  </span>
                </td>
                <td>
                  <input className="num-input" type="number" min="0" max="99" value={p.at} onChange={(e) => update(i, 'at', e.target.value)} aria-label={`${p.id} arrival time`} />
                </td>
                <td>
                  <input className="num-input" type="number" min="1" max="99" value={p.bt} onChange={(e) => update(i, 'bt', e.target.value)} aria-label={`${p.id} burst time`} />
                </td>
                {showPriority && (
                  <td>
                    <input className="num-input" type="number" min="0" max="99" value={p.pr ?? 0} onChange={(e) => update(i, 'pr', e.target.value)} aria-label={`${p.id} priority`} />
                  </td>
                )}
                {showQueue && (
                  <td>
                    <select className="select select-small" value={Number(p.q) === 1 ? 1 : 0} onChange={(e) => update(i, 'q', Number(e.target.value))} aria-label={`${p.id} queue`}>
                      <option value={0}>0 · Foreground</option>
                      <option value={1}>1 · Background</option>
                    </select>
                  </td>
                )}
                <td>
                  <button className="icon-btn small" onClick={() => remove(i)} disabled={processes.length <= 1} aria-label={`Remove ${p.id}`}>
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

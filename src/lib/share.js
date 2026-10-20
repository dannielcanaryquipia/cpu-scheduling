// Turn a workload into a URL query string (and back) so any example
// can be opened in the Simulator page: /simulator?algo=srtf&p=P1-0-5-0-0,P2-1-3-0-0

export function encodeProcesses(processes) {
  return processes.map((p) => [p.id, p.at, p.bt, p.pr ?? 0, p.q ?? 0].join('-')).join(',');
}

export function decodeProcesses(text) {
  if (!text) return null;
  const list = text
    .split(',')
    .map((chunk) => {
      const [id, at, bt, pr = 0, q = 0] = chunk.split('-');
      if (!id || bt === undefined) return null;
      return { id, at: Number(at) || 0, bt: Math.max(1, Number(bt) || 1), pr: Number(pr) || 0, q: Number(q) === 1 ? 1 : 0 };
    })
    .filter(Boolean);
  return list.length ? list.slice(0, 10) : null;
}

export function simulatorLink(algo, processes, quantum) {
  const params = new URLSearchParams({ algo, p: encodeProcesses(processes) });
  if (quantum) params.set('q', String(quantum));
  return `/simulator?${params.toString()}`;
}

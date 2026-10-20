// One color per process. `fg` is the readable text color on top of `bg`.
export const PALETTE = [
  { bg: '#2f6fde', fg: '#ffffff' },
  { bg: '#f2a516', fg: '#231a03' },
  { bg: '#1f9d6b', fg: '#ffffff' },
  { bg: '#d6407f', fg: '#ffffff' },
  { bg: '#7b55d6', fg: '#ffffff' },
  { bg: '#22a8c4', fg: '#04252c' },
  { bg: '#e0532e', fg: '#ffffff' },
  { bg: '#8fbf2b', fg: '#1b2604' },
  { bg: '#5b6b7f', fg: '#ffffff' },
  { bg: '#b8873a', fg: '#ffffff' },
];

export function buildColorMap(processes) {
  return Object.fromEntries(processes.map((p, i) => [p.id, PALETTE[i % PALETTE.length]]));
}

// Ready-made workloads for the process editor.
export const PRESETS = [
  {
    id: 'classic',
    label: 'Classic 5-process mix',
    processes: [
      { id: 'P1', at: 0, bt: 7, pr: 3, q: 1 },
      { id: 'P2', at: 2, bt: 4, pr: 1, q: 0 },
      { id: 'P3', at: 4, bt: 1, pr: 4, q: 0 },
      { id: 'P4', at: 5, bt: 4, pr: 2, q: 1 },
      { id: 'P5', at: 12, bt: 3, pr: 1, q: 0 },
    ],
  },
  {
    id: 'convoy',
    label: 'Convoy effect (one long job first)',
    processes: [
      { id: 'P1', at: 0, bt: 12, pr: 2, q: 1 },
      { id: 'P2', at: 1, bt: 2, pr: 1, q: 0 },
      { id: 'P3', at: 1, bt: 1, pr: 1, q: 0 },
      { id: 'P4', at: 2, bt: 2, pr: 3, q: 0 },
    ],
  },
  {
    id: 'same-time',
    label: 'Everyone arrives at t=0',
    processes: [
      { id: 'P1', at: 0, bt: 6, pr: 2, q: 0 },
      { id: 'P2', at: 0, bt: 8, pr: 1, q: 1 },
      { id: 'P3', at: 0, bt: 7, pr: 3, q: 0 },
      { id: 'P4', at: 0, bt: 3, pr: 4, q: 1 },
    ],
  },
  {
    id: 'idle-gap',
    label: 'With an idle gap',
    processes: [
      { id: 'P1', at: 0, bt: 3, pr: 2, q: 0 },
      { id: 'P2', at: 1, bt: 2, pr: 1, q: 0 },
      { id: 'P3', at: 9, bt: 4, pr: 3, q: 1 },
      { id: 'P4', at: 10, bt: 2, pr: 1, q: 0 },
    ],
  },
  {
    id: 'starvation',
    label: 'Starvation risk (stream of short jobs)',
    processes: [
      { id: 'P1', at: 0, bt: 9, pr: 5, q: 1 },
      { id: 'P2', at: 1, bt: 2, pr: 1, q: 0 },
      { id: 'P3', at: 3, bt: 2, pr: 1, q: 0 },
      { id: 'P4', at: 5, bt: 2, pr: 2, q: 0 },
      { id: 'P5', at: 7, bt: 2, pr: 1, q: 0 },
      { id: 'P6', at: 9, bt: 2, pr: 2, q: 0 },
    ],
  },
];

export const DEFAULT_PROCESSES = PRESETS[0].processes;

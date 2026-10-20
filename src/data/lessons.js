// The order here drives the sidebar, the "Next / Previous" buttons and progress tracking.
export const SECTIONS = [
  {
    title: 'Foundations',
    lessons: [
      { path: '/lesson/introduction', title: 'What is CPU Scheduling?', minutes: 6 },
      { path: '/lesson/terminology', title: 'Key Terms & Formulas', minutes: 8 },
      { path: '/lesson/criteria', title: 'Scheduling Criteria', minutes: 6 },
      { path: '/lesson/preemption', title: 'Preemptive vs Non-Preemptive', minutes: 8 },
    ],
  },
  {
    title: 'Algorithms',
    lessons: [
      { path: '/algorithms/fcfs', title: 'FCFS — First Come, First Serve', minutes: 7 },
      { path: '/algorithms/sjf', title: 'SJF — Shortest Job First', minutes: 7 },
      { path: '/algorithms/srtf', title: 'SRTF — Shortest Remaining Time', minutes: 8 },
      { path: '/algorithms/round-robin', title: 'Round Robin', minutes: 9 },
      { path: '/algorithms/priority', title: 'Priority Scheduling', minutes: 9 },
      { path: '/algorithms/hrrn', title: 'HRRN — Highest Response Ratio', minutes: 7 },
      { path: '/algorithms/mlq', title: 'Multilevel Queue', minutes: 7 },
      { path: '/algorithms/mlfq', title: 'Multilevel Feedback Queue', minutes: 9 },
    ],
  },
  {
    title: 'Review & Practice',
    lessons: [
      { path: '/compare', title: 'Compare the Algorithms', minutes: 8 },
      { path: '/practice', title: 'Worked Problems', minutes: 15 },
      { path: '/quiz', title: 'Final Quiz', minutes: 10 },
    ],
  },
];

export const ALL_LESSONS = SECTIONS.flatMap((s) => s.lessons.map((l) => ({ ...l, section: s.title })));

export function neighbors(path) {
  const i = ALL_LESSONS.findIndex((l) => l.path === path);
  return {
    current: ALL_LESSONS[i] || null,
    prev: i > 0 ? ALL_LESSONS[i - 1] : null,
    next: i >= 0 && i < ALL_LESSONS.length - 1 ? ALL_LESSONS[i + 1] : null,
    index: i,
  };
}

# CPU Scheduling Lab

An interactive lesson website about CPU scheduling in operating systems.
Built with **React 18 + React Router 6 + Vite**, styled with **plain (traditional) CSS** — no Tailwind, no UI library.

## Run it

You need [Node.js](https://nodejs.org) 18 or newer.

```bash
cd cpu-scheduling-lesson
npm install
npm run dev
```

Vite opens http://localhost:5173 in your browser.
For a production build: `npm run build`, then `npm run preview`.

## What's inside

| Route | Page |
| --- | --- |
| `/` | Home — roadmap and progress |
| `/lesson/introduction` | What is CPU scheduling? (+ "be the scheduler" mini game) |
| `/lesson/terminology` | AT, BT, CT, TAT, WT, RT with an interactive timeline |
| `/lesson/criteria` | Utilization, throughput, turnaround, waiting, response |
| `/lesson/preemption` | Clickable process-state diagram, SJF vs SRTF side by side |
| `/algorithms` | All algorithms |
| `/algorithms/:slug` | `fcfs`, `sjf`, `srtf`, `round-robin`, `priority`, `hrrn`, `mlq`, `mlfq` |
| `/compare` | Runs all 9 variants on one workload, bar chart + Gantt charts |
| `/practice` | Exam-style worked problems with step-by-step solutions |
| `/quiz` | 12-question final quiz (70% to pass) |
| `/simulator` | Full playground; accepts `?algo=srtf&p=P1-0-5-0-0,P2-1-3-0-0&q=2` |

Progress and theme (light/dark) are saved in `localStorage`.

## Project structure

```
src/
  main.jsx                 BrowserRouter + context provider + CSS imports
  App.jsx                  All routes (nested under <Layout/>)
  context/AppContext.jsx   Theme + lesson-progress state
  lib/
    schedulers.js          The scheduling engine (all algorithms, step log, metrics)
    colors.js              Process color palette
    share.js               Encode a workload into a /simulator URL
  data/                    Lesson list, algorithm content, practice problems, quiz, presets
  components/              Layout, Simulator, GanttChart, ProcessEditor, ResultsTable,
                           QueueView, EventLog, StateDiagram, QuestionCard, Callout, LessonShell
  pages/                   One file per route
  styles/                  base.css, layout.css, components.css, pages.css
```

## Conventions used by the simulator

- Ties are broken by earlier arrival, then by table order.
- Priority: a smaller number = higher priority (a checkbox flips this).
- Round Robin: processes that arrive during a slice join the queue before the preempted process.
- MLQ: Queue 0 = Foreground (Round Robin), Queue 1 = Background (FCFS); foreground preempts background.
- MLFQ: Q0 = RR (q), Q1 = RR (2q), Q2 = FCFS. Using a full quantum demotes a process; a new arrival in Q0 preempts lower levels.
- Context-switch time is treated as 0.

Lesson content is adapted from the GeeksforGeeks article "CPU Scheduling in Operating Systems" and standard OS textbooks.

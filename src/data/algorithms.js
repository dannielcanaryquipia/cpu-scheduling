// Content for every algorithm page (/algorithms/:slug).

const sharedFour = [
  { id: 'P1', at: 0, bt: 8, pr: 2, q: 1 },
  { id: 'P2', at: 1, bt: 4, pr: 1, q: 0 },
  { id: 'P3', at: 2, bt: 2, pr: 3, q: 0 },
  { id: 'P4', at: 3, bt: 1, pr: 2, q: 1 },
];

export const ALGORITHMS = [
  {
    slug: 'fcfs',
    algo: 'fcfs',
    title: 'First Come, First Serve',
    short: 'FCFS',
    tagline: 'The CPU is handed out in the exact order processes show up — like a line at the bank.',
    rule: 'Pick the process that arrived earliest.',
    preemptive: false,
    starvation: false,
    steps: [
      'Keep the ready queue sorted by arrival time (a plain FIFO queue).',
      'When the CPU is free, give it to the process at the front of the queue.',
      'That process keeps the CPU until it finishes — nobody can interrupt it.',
      'Repeat with the next process in line. If no one has arrived yet, the CPU stays idle.',
    ],
    analogy:
      'A single cashier serving customers in the order they lined up. If the first customer has a full cart, everyone behind them waits, even someone buying one item.',
    pros: ['Very easy to understand and implement', 'Fair in the "first in line" sense', 'No starvation — everyone eventually reaches the front'],
    cons: [
      'Average waiting time is often high',
      'Convoy effect: one long job holds up many short ones',
      'Poor for interactive systems because nobody can cut in',
    ],
    watchOut: {
      title: 'The convoy effect',
      body: 'Look at the example below. P1 needs 8 units and arrived first, so the three short jobs all wait behind it. Change P1’s arrival to 4 and watch the average waiting time drop.',
    },
    pseudo: `queue = processes sorted by arrival time
time = 0
for p in queue:
    if time < p.arrival:      # CPU idle
        time = p.arrival
    run p for p.burst units
    time += p.burst
    p.completion = time`,
    example: sharedFour,
    check: {
      prompt: 'Using the example workload above (P1 0/8, P2 1/4, P3 2/2, P4 3/1), what is the average waiting time under FCFS?',
      options: ['5.25', '7', '6', '8.5'],
      answer: 1,
      explanation: 'Order is P1 (0–8), P2 (8–12), P3 (12–14), P4 (14–15). Waiting times: 0, 7, 10, 11 → 28 / 4 = 7.',
    },
  },
  {
    slug: 'sjf',
    algo: 'sjf',
    title: 'Shortest Job First',
    short: 'SJF',
    tagline: 'Whenever the CPU frees up, the shortest waiting job goes next.',
    rule: 'Pick the ready process with the smallest burst time (non-preemptive).',
    preemptive: false,
    starvation: true,
    steps: [
      'Each time the CPU becomes free, look only at processes that have already arrived.',
      'Choose the one with the smallest burst time. Ties go to the earlier arrival.',
      'Let it run to completion — SJF does not interrupt a running process.',
      'Repeat until all processes are done.',
    ],
    analogy:
      'A teacher checking papers who always grabs the shortest quiz from the pile first. More students get their papers back sooner.',
    pros: [
      'Gives the minimum average waiting time among non-preemptive methods (when bursts are known)',
      'Short jobs finish quickly, so throughput feels high',
    ],
    cons: [
      'The real burst time is unknown in practice — it has to be predicted',
      'Long jobs can starve if short jobs keep arriving',
      'A long job that arrives first still blocks everyone (it is non-preemptive)',
    ],
    watchOut: {
      title: 'Only arrived processes count',
      body: 'At t=0 only P1 is present, so P1 runs first even though it is the longest. SJF can only choose among processes that are already in the ready queue.',
    },
    pseudo: `time = 0
while unfinished processes remain:
    ready = arrived and unfinished processes
    if ready is empty:
        time = next arrival; continue
    p = process in ready with smallest burst
    run p to completion
    time += p.burst`,
    example: sharedFour,
    check: {
      prompt: 'In the example, P1 is the longest job but it still runs first. Why?',
      options: [
        'SJF always runs the longest job first',
        'P1 is the only process in the ready queue at t=0, and SJF never interrupts a running job',
        'P1 has the highest priority',
        'Ties are broken randomly',
      ],
      answer: 1,
      explanation:
        'At t=0 nothing else has arrived, so P1 is picked. Because SJF is non-preemptive, the shorter jobs that arrive later must wait until P1 finishes at t=8.',
    },
  },
  {
    slug: 'srtf',
    algo: 'srtf',
    title: 'Shortest Remaining Time First',
    short: 'SRTF',
    tagline: 'The preemptive version of SJF: a newcomer with less work left can take the CPU away.',
    rule: 'Pick the ready process with the smallest remaining time; re-check whenever a process arrives.',
    preemptive: true,
    starvation: true,
    steps: [
      'Track how much work each process still needs (its remaining time).',
      'At every arrival and every completion, compare remaining times.',
      'If a new process needs less time than what the running process has left, preempt the running one.',
      'The preempted process goes back to the ready queue with its remaining time.',
    ],
    analogy:
      'A print shop that pauses a 200-page job whenever someone walks in needing a single page, then resumes the big job afterwards.',
    pros: ['Lowest possible average waiting time for a known workload', 'Very responsive to short jobs'],
    cons: [
      'Many context switches (each preemption has a cost)',
      'Long jobs can starve',
      'Still needs to know or predict burst times',
    ],
    watchOut: {
      title: 'Compare remaining time, not original burst',
      body: 'When P2 arrives at t=1, P1 has 7 units left (not 8). The comparison is always against what is left to do.',
    },
    pseudo: `time = 0
while unfinished processes remain:
    ready = arrived and unfinished processes
    p = process in ready with smallest remaining
    run p until it finishes OR the next arrival, whichever is first
    update p.remaining and time`,
    example: sharedFour,
    check: {
      prompt: 'Using the same workload (P1 0/8, P2 1/4, P3 2/2, P4 3/1), what is the average waiting time under SRTF?',
      options: ['5.5', '7', '2.75', '3.25'],
      answer: 2,
      explanation:
        'Gantt: P1 0–1, P2 1–2, P3 2–4, P4 4–5, P2 5–8, P1 8–15. Waiting: P1 = 15−0−8 = 7, P2 = 8−1−4 = 3, P3 = 0, P4 = 1 → 11 / 4 = 2.75. Compare with FCFS (7) and SJF (5.5).',
    },
  },
  {
    slug: 'round-robin',
    algo: 'rr',
    title: 'Round Robin',
    short: 'RR',
    tagline: 'Everyone gets a fixed time slice (the quantum), then goes to the back of the line.',
    rule: 'FIFO queue + a time quantum. When the quantum runs out, the process is preempted.',
    preemptive: true,
    starvation: false,
    steps: [
      'Put arriving processes at the back of a circular FIFO queue.',
      'Give the front process the CPU for at most one time quantum (q).',
      'If it finishes within q, it leaves. Otherwise it is preempted and rejoins the back of the queue.',
      'Processes that arrive during a slice join the queue before the preempted process does.',
    ],
    analogy:
      'Kids taking turns on a single game controller: two minutes each, then pass it on, even if you are mid-level.',
    pros: ['Fair: every process gets regular CPU time', 'Good response time — great for time-sharing and interactive systems', 'No starvation'],
    cons: [
      'Average waiting time is usually higher than SJF/SRTF',
      'Too small a quantum → too many context switches',
      'Too large a quantum → it behaves just like FCFS',
    ],
    watchOut: {
      title: 'Tune the quantum',
      body: 'Change the quantum in the simulator below to 1, then to 10. With q=1 the Gantt chart becomes a long strip of tiny slices; with a huge q it becomes identical to FCFS.',
    },
    pseudo: `queue = []
time = 0
add processes that arrived by time 0 to queue
while unfinished processes remain:
    if queue empty: time = next arrival; add arrivals; continue
    p = queue.pop_front()
    run = min(quantum, p.remaining)
    time += run; p.remaining -= run
    add processes that arrived by time to queue
    if p.remaining > 0: queue.push_back(p)`,
    example: [
      { id: 'P1', at: 0, bt: 5, pr: 1, q: 0 },
      { id: 'P2', at: 1, bt: 3, pr: 2, q: 0 },
      { id: 'P3', at: 2, bt: 1, pr: 3, q: 0 },
      { id: 'P4', at: 3, bt: 2, pr: 1, q: 0 },
      { id: 'P5', at: 4, bt: 3, pr: 2, q: 0 },
    ],
    quantum: 2,
    check: {
      prompt: 'If the time quantum is made larger than every burst time, Round Robin behaves exactly like…',
      options: ['SJF', 'FCFS', 'Priority scheduling', 'SRTF'],
      answer: 1,
      explanation: 'No process ever uses up its quantum, so each one runs to completion in arrival order — that is FCFS.',
    },
  },
  {
    slug: 'priority',
    algo: 'priority-np',
    altAlgo: 'priority-p',
    title: 'Priority Scheduling',
    short: 'Priority',
    tagline: 'Each process has a priority number; the most important ready process runs first.',
    rule: 'Pick the ready process with the highest priority. Comes in preemptive and non-preemptive forms.',
    preemptive: 'both',
    starvation: true,
    steps: [
      'Every process is given a priority number (by the OS or the user).',
      'Decide the convention: in this site, a smaller number means a higher priority by default (you can flip it in the simulator).',
      'Non-preemptive: when the CPU frees up, the highest-priority ready process runs to completion.',
      'Preemptive: if a higher-priority process arrives, it immediately takes the CPU from the running one.',
    ],
    analogy:
      'A hospital emergency room: a critical patient is treated before someone with a sprained ankle, no matter who walked in first.',
    pros: ['Important work gets done first', 'Flexible — priorities can reflect deadlines, user type, or cost', 'Preemptive version suits real-time needs'],
    cons: [
      'Starvation: low-priority processes may wait forever',
      'Needs a sensible way to assign priorities',
      'Equal priorities fall back to FCFS order',
    ],
    watchOut: {
      title: 'Starvation and the fix: aging',
      body: 'If high-priority jobs keep arriving, a low-priority job may never run. Aging solves this by slowly raising the priority of processes the longer they wait, until they eventually reach the top.',
    },
    pseudo: `# non-preemptive
while unfinished processes remain:
    ready = arrived and unfinished
    p = highest priority in ready
    run p to completion

# preemptive: re-check at every arrival
    run p until it finishes OR a higher-priority process arrives`,
    example: [
      { id: 'P1', at: 0, bt: 4, pr: 3, q: 0 },
      { id: 'P2', at: 1, bt: 3, pr: 1, q: 0 },
      { id: 'P3', at: 2, bt: 1, pr: 4, q: 0 },
      { id: 'P4', at: 3, bt: 5, pr: 2, q: 0 },
      { id: 'P5', at: 4, bt: 2, pr: 3, q: 0 },
    ],
    check: {
      prompt: 'Which technique prevents low-priority processes from starving forever?',
      options: ['Thrashing', 'Aging', 'Paging', 'Spooling'],
      answer: 1,
      explanation: 'Aging gradually increases the priority of a process the longer it waits, so it cannot be skipped indefinitely.',
    },
  },
  {
    slug: 'hrrn',
    algo: 'hrrn',
    title: 'Highest Response Ratio Next',
    short: 'HRRN',
    tagline: 'Like SJF, but a job’s chances improve the longer it waits — so nothing starves.',
    rule: 'Response Ratio = (Waiting time + Burst time) / Burst time. Pick the highest ratio (non-preemptive).',
    preemptive: false,
    starvation: false,
    formula: 'Response Ratio = (W + S) / S',
    steps: [
      'When the CPU becomes free, compute the response ratio for every ready process.',
      'W is how long it has waited so far; S is its burst (service) time.',
      'Run the process with the highest ratio to completion.',
      'Short jobs start with high ratios, but a long job’s ratio keeps climbing while it waits.',
    ],
    analogy:
      'A barber who normally prefers quick trims, but promises that anyone who has waited long enough moves to the front.',
    pros: ['Favors short jobs like SJF', 'Prevents starvation automatically (waiting raises the ratio)', 'Simple formula'],
    cons: ['Needs burst-time estimates', 'Ratios must be recomputed at every decision', 'Non-preemptive, so a long running job can still block others'],
    watchOut: {
      title: 'Recompute at every decision',
      body: 'Ratios change over time because W grows. Open the step log below to see the ratios calculated at each decision point.',
    },
    pseudo: `while unfinished processes remain:
    ready = arrived and unfinished
    for p in ready:
        W = time - p.arrival
        p.ratio = (W + p.burst) / p.burst
    p = ready process with the highest ratio
    run p to completion`,
    example: [
      { id: 'P1', at: 0, bt: 3, pr: 1, q: 0 },
      { id: 'P2', at: 2, bt: 6, pr: 1, q: 0 },
      { id: 'P3', at: 4, bt: 4, pr: 1, q: 0 },
      { id: 'P4', at: 6, bt: 5, pr: 1, q: 0 },
      { id: 'P5', at: 8, bt: 2, pr: 1, q: 0 },
    ],
    check: {
      prompt: 'In the example, P2 finishes at t=9. What is P3’s response ratio at that moment? (P3 arrived at 4, burst 4)',
      options: ['1.25', '2.25', '1.60', '3.50'],
      answer: 1,
      explanation: 'W = 9 − 4 = 5, S = 4 → (5 + 4) / 4 = 2.25. P4 has (3+5)/5 = 1.6 and P5 has (1+2)/2 = 1.5, so P3 runs next.',
    },
  },
  {
    slug: 'mlq',
    algo: 'mlq',
    title: 'Multilevel Queue',
    short: 'MLQ',
    tagline: 'Processes are sorted into separate queues by type, and each queue has its own rules.',
    rule: 'Fixed queues (here: Foreground = RR, Background = FCFS). A lower queue runs only when every higher queue is empty.',
    preemptive: true,
    starvation: true,
    steps: [
      'Each process is permanently assigned to a queue — e.g. interactive/system jobs to Foreground, batch jobs to Background.',
      'Each queue uses its own algorithm. In this simulator: Foreground uses Round Robin, Background uses FCFS.',
      'Queues have fixed priority: Background only runs when Foreground is empty.',
      'If a Foreground process arrives while a Background one is running, the Background process is preempted.',
    ],
    analogy:
      'An airport with a priority boarding lane and a regular lane. The regular lane only moves when the priority lane is empty, and passengers never switch lanes.',
    pros: ['Different job types get suitable algorithms', 'Low scheduling overhead — assignments never change', 'System/interactive work stays responsive'],
    cons: ['Inflexible: a process can never change queues', 'Lower queues can starve if higher queues stay busy', 'Requires classifying every process in advance'],
    watchOut: {
      title: 'Use the Queue column',
      body: 'In the editor below, Q = 0 means Foreground and Q = 1 means Background. Move P1 to the foreground and see how its completion time changes.',
    },
    pseudo: `foreground = RR queue (quantum q)
background = FCFS queue
loop:
    if foreground not empty:
        run front of foreground for up to q
    elif background not empty:
        run front of background until it finishes
            or a foreground process arrives (preempt)
    else: idle until next arrival`,
    example: [
      { id: 'P1', at: 0, bt: 7, pr: 1, q: 1 },
      { id: 'P2', at: 2, bt: 4, pr: 1, q: 0 },
      { id: 'P3', at: 4, bt: 1, pr: 1, q: 0 },
      { id: 'P4', at: 5, bt: 4, pr: 1, q: 1 },
      { id: 'P5', at: 12, bt: 3, pr: 1, q: 0 },
    ],
    quantum: 2,
    check: {
      prompt: 'In a multilevel queue, can a process in the Background queue run while a Foreground process is ready?',
      options: ['Yes, they alternate every quantum', 'No — the lower queue runs only when every higher queue is empty', 'Only if it has a shorter burst', 'Only after aging'],
      answer: 1,
      explanation: 'Queues have fixed priority between them. That strictness is exactly why lower queues can starve.',
    },
  },
  {
    slug: 'mlfq',
    algo: 'mlfq',
    title: 'Multilevel Feedback Queue',
    short: 'MLFQ',
    tagline: 'Like MLQ, but processes move between queues based on how they actually behave.',
    rule: 'Start in the top queue. Use your whole quantum → get demoted. Higher queues always go first.',
    preemptive: true,
    starvation: false,
    steps: [
      'There are several queues. In this simulator: Q0 (RR, quantum q), Q1 (RR, quantum 2q), Q2 (FCFS).',
      'Every new process starts in Q0, the highest priority.',
      'If a process uses its entire quantum, it is demoted one level — it looks CPU-hungry.',
      'Short or interactive jobs finish while still near the top. A new arrival in Q0 preempts anything running in a lower queue.',
      'Real systems also periodically boost old processes back up (aging) so nothing starves.',
    ],
    analogy:
      'A help desk where every ticket starts in the "quick fix" pile. If it is not solved in 5 minutes, it is moved to the "longer issue" pile, and so on.',
    pros: ['Learns job behavior without knowing burst times in advance', 'Favors short and interactive jobs', 'Very flexible — used (in some form) by real operating systems'],
    cons: ['Most complex to design and tune (number of queues, quanta, boost rules)', 'More overhead from moving processes around'],
    watchOut: {
      title: 'Follow P1 in the log',
      body: 'P1 is a long job. Watch it slide from Q0 to Q1 to Q2 in the step log while the short jobs finish near the top.',
    },
    pseudo: `queues = [Q0 (q), Q1 (2q), Q2 (FCFS)]
new process -> Q0
loop:
    L = highest non-empty level
    p = front of queues[L]
    run p for its quantum (or until a Q0 arrival, if L > 0)
    if p finished: done
    elif p used the full quantum: move p to level L+1
    else: put p back at the head of level L`,
    example: [
      { id: 'P1', at: 0, bt: 9, pr: 1, q: 0 },
      { id: 'P2', at: 1, bt: 2, pr: 1, q: 0 },
      { id: 'P3', at: 2, bt: 5, pr: 1, q: 0 },
      { id: 'P4', at: 4, bt: 1, pr: 1, q: 0 },
      { id: 'P5', at: 9, bt: 3, pr: 1, q: 0 },
    ],
    quantum: 2,
    check: {
      prompt: 'Under MLFQ, where does a long CPU-bound process usually end up?',
      options: ['In the top queue', 'In the lowest queue', 'It is removed from the system', 'In a separate I/O queue'],
      answer: 1,
      explanation: 'Each time it uses its full quantum it is demoted, so long CPU-bound jobs drift down to the bottom queue while short jobs stay near the top.',
    },
  },
];

export const findAlgorithm = (slug) => ALGORITHMS.find((a) => a.slug === slug);

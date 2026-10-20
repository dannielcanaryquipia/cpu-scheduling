export const QUIZ = [
  {
    prompt: 'What is the main goal of CPU scheduling?',
    options: ['Increase memory size', 'Keep the CPU as busy as possible while keeping waits short', 'Increase disk speed', 'Reduce file-system overhead'],
    answer: 1,
    explanation: 'The scheduler decides who gets the CPU next so it is rarely idle and processes do not wait longer than necessary.',
  },
  {
    prompt: 'Turnaround Time is computed as…',
    options: ['Burst Time − Arrival Time', 'Completion Time − Arrival Time', 'Completion Time − Burst Time', 'Waiting Time + Arrival Time'],
    answer: 1,
    explanation: 'Turnaround is the total time from arrival to completion: TAT = CT − AT.',
  },
  {
    prompt: 'Waiting Time is computed as…',
    options: ['Turnaround Time − Burst Time', 'Completion Time − Burst Time', 'Arrival Time − Burst Time', 'Burst Time − Response Time'],
    answer: 0,
    explanation: 'Out of the whole turnaround, the part that was not spent running is waiting: WT = TAT − BT.',
  },
  {
    prompt: 'Response Time measures the time from a process’s arrival until…',
    options: ['it finishes', 'it first gets the CPU', 'it performs I/O', 'its quantum expires'],
    answer: 1,
    explanation: 'Response time is about the first moment of service, which matters a lot in interactive systems.',
  },
  {
    prompt: 'Which algorithm is known for the "convoy effect"?',
    options: ['Round Robin', 'SRTF', 'FCFS', 'MLFQ'],
    answer: 2,
    explanation: 'In FCFS, one long job at the front makes every short job behind it wait.',
  },
  {
    prompt: 'SRTF is best described as…',
    options: ['Preemptive version of SJF', 'Non-preemptive version of Round Robin', 'FCFS with priorities', 'A multilevel queue'],
    answer: 0,
    explanation: 'SRTF uses the same "shortest first" idea as SJF but re-checks at every arrival and can preempt.',
  },
  {
    prompt: 'What happens when the Round Robin time quantum is very small?',
    options: ['It becomes FCFS', 'Context-switch overhead becomes very high', 'Starvation becomes common', 'Waiting time drops to zero'],
    answer: 1,
    explanation: 'Every slice ends with a context switch. Tiny slices mean the CPU spends a lot of time just switching.',
  },
  {
    prompt: 'The response ratio used by HRRN is…',
    options: ['S / (W + S)', '(W + S) / S', 'W / S', '(W − S) / S'],
    answer: 1,
    explanation: 'Ratio = (Waiting + Service) / Service. It grows while a process waits, which prevents starvation.',
  },
  {
    prompt: 'Throughput refers to…',
    options: ['How long one process waits', 'The number of processes completed per unit of time', 'The percentage of time the CPU is idle', 'The size of the ready queue'],
    answer: 1,
    explanation: 'Throughput counts finished processes per time unit — higher is better.',
  },
  {
    prompt: 'Which of these algorithms cannot cause starvation?',
    options: ['SJF', 'SRTF', 'Priority scheduling', 'Round Robin'],
    answer: 3,
    explanation: 'Round Robin cycles through every ready process, so each one gets a turn within a bounded time.',
  },
  {
    prompt: 'A running process requests I/O and moves to the waiting state. Which kinds of schedulers must make a decision at this moment?',
    options: ['Only preemptive schedulers', 'Only non-preemptive schedulers', 'Both preemptive and non-preemptive', 'Neither — the CPU just idles'],
    answer: 2,
    explanation: 'The CPU has just become free, so every scheduler must pick the next process. Non-preemptive schedulers only decide at moments like this (or on termination).',
  },
  {
    prompt: 'In a Multilevel Feedback Queue, a process that uses its entire time quantum is usually…',
    options: ['Terminated', 'Promoted to a higher queue', 'Demoted to a lower queue', 'Moved to the I/O queue'],
    answer: 2,
    explanation: 'Using the whole quantum suggests a CPU-bound job, so MLFQ lowers its priority level.',
  },
];

/*
 * CPU scheduling engine
 * ---------------------
 * Every algorithm receives a list of processes:
 *   { id: 'P1', at: arrivalTime, bt: burstTime, pr: priority, q: queue (0 = foreground, 1 = background) }
 * and returns:
 *   - timeline: [{ pid, start, end, lvl? }]   (pid = null means the CPU was idle)
 *   - results:  per-process CT, TAT, WT, RT
 *   - log:      step-by-step explanation of every scheduling decision
 *
 * Tie-breaking rule used everywhere: earlier arrival wins, then the order in the table.
 */

export const ALGO_META = {
  fcfs: { short: 'FCFS', name: 'First Come, First Serve', preemptive: false, needs: [] },
  sjf: { short: 'SJF', name: 'Shortest Job First', preemptive: false, needs: [] },
  srtf: { short: 'SRTF', name: 'Shortest Remaining Time First', preemptive: true, needs: [] },
  rr: { short: 'RR', name: 'Round Robin', preemptive: true, needs: ['quantum'] },
  'priority-np': { short: 'Priority (NP)', name: 'Priority — Non-Preemptive', preemptive: false, needs: ['priority'] },
  'priority-p': { short: 'Priority (P)', name: 'Priority — Preemptive', preemptive: true, needs: ['priority'] },
  hrrn: { short: 'HRRN', name: 'Highest Response Ratio Next', preemptive: false, needs: [] },
  mlq: { short: 'MLQ', name: 'Multilevel Queue', preemptive: true, needs: ['queue', 'quantum'] },
  mlfq: { short: 'MLFQ', name: 'Multilevel Feedback Queue', preemptive: true, needs: ['quantum'] },
};

export const ALGO_ORDER = ['fcfs', 'sjf', 'srtf', 'rr', 'priority-np', 'priority-p', 'hrrn', 'mlq', 'mlfq'];

/* ---------- helpers ---------- */

function normalize(processes) {
  return processes.map((p, idx) => ({
    id: String(p.id),
    at: Math.max(0, Math.floor(Number(p.at) || 0)),
    bt: Math.max(1, Math.floor(Number(p.bt) || 1)),
    pr: Math.floor(Number(p.pr) || 0),
    q: Number(p.q) === 1 ? 1 : 0,
    idx,
  }));
}

const byArrival = (a, b) => a.at - b.at || a.idx - b.idx;

function pickBest(list, compare) {
  return list.reduce((best, x) => (compare(x, best) < 0 ? x : best));
}

const names = (list) => (list.length ? list.map((p) => p.id).join(', ') : 'empty');
const units = (n) => `${n} unit${n === 1 ? '' : 's'}`;

/* ---------- non-preemptive family (FCFS, SJF, Priority NP, HRRN) ---------- */

function runNonPreemptive(ps, choose, explain) {
  const done = new Set();
  const timeline = [];
  const log = [];
  let t = 0;

  while (done.size < ps.length) {
    const ready = ps.filter((p) => !done.has(p.id) && p.at <= t);

    if (!ready.length) {
      const next = pickBest(ps.filter((p) => !done.has(p.id)), byArrival);
      log.push({ t, kind: 'idle', text: `Nothing is ready. The CPU sits idle until ${next.id} arrives at t=${next.at}.` });
      t = next.at;
      continue;
    }

    const p = choose(ready, t);
    const reason = ready.length === 1 ? `${p.id} is the only process ready.` : explain(p, ready, t);
    log.push({
      t,
      kind: 'run',
      text: `Ready queue: [${names(ready)}]. ${reason} ${p.id} runs to completion (${units(p.bt)}).`,
    });
    timeline.push({ pid: p.id, start: t, end: t + p.bt });
    t += p.bt;
    done.add(p.id);
    log.push({ t, kind: 'done', text: `${p.id} finishes at t=${t}.` });
  }
  return { timeline, log };
}

function fcfs(ps) {
  return runNonPreemptive(
    ps,
    (ready) => pickBest(ready, byArrival),
    (p) => `${p.id} arrived earliest (t=${p.at}).`,
  );
}

function sjf(ps) {
  return runNonPreemptive(
    ps,
    (ready) => pickBest(ready, (a, b) => a.bt - b.bt || byArrival(a, b)),
    (p, ready) =>
      `Bursts → ${ready.map((r) => `${r.id}:${r.bt}`).join(', ')}. ${p.id} has the shortest burst.`,
  );
}

function priorityRank(higherIsBetter) {
  return (p) => (higherIsBetter ? -p.pr : p.pr);
}

function priorityNP(ps, { higherIsBetter }) {
  const rank = priorityRank(higherIsBetter);
  return runNonPreemptive(
    ps,
    (ready) => pickBest(ready, (a, b) => rank(a) - rank(b) || byArrival(a, b)),
    (p, ready) =>
      `Priorities → ${ready.map((r) => `${r.id}:${r.pr}`).join(', ')}. ${p.id} has the highest priority.`,
  );
}

function hrrn(ps) {
  const ratio = (p, t) => (t - p.at + p.bt) / p.bt;
  return runNonPreemptive(
    ps,
    (ready, t) => pickBest(ready, (a, b) => ratio(b, t) - ratio(a, t) || byArrival(a, b)),
    (p, ready, t) =>
      `Response ratios (W+S)/S → ${ready
        .map((r) => `${r.id}: (${t - r.at}+${r.bt})/${r.bt} = ${ratio(r, t).toFixed(2)}`)
        .join(', ')}. ${p.id} has the highest ratio.`,
  );
}

/* ---------- preemptive family (SRTF, Priority P) ---------- */

function runPreemptive(ps, compare, describe) {
  const rem = Object.fromEntries(ps.map((p) => [p.id, p.bt]));
  const done = new Set();
  const announced = new Set();
  const timeline = [];
  const log = [];
  let t = 0;
  let current = null;

  while (done.size < ps.length) {
    ps.filter((p) => p.at <= t && !announced.has(p.id)).forEach((p) => {
      announced.add(p.id);
      log.push({ t: p.at, kind: 'arrive', text: `${p.id} arrives (burst ${p.bt}).` });
    });

    const ready = ps.filter((p) => !done.has(p.id) && p.at <= t);
    if (!ready.length) {
      const next = pickBest(ps.filter((p) => !done.has(p.id)), byArrival);
      log.push({ t, kind: 'idle', text: `Nothing is ready. The CPU sits idle until ${next.id} arrives at t=${next.at}.` });
      t = next.at;
      current = null;
      continue;
    }

    const p = pickBest(ready, (a, b) => compare(a, b, rem));
    if (current !== p.id) {
      const status = ready.map((r) => `${r.id}${describe.short(r, rem)}`).join(', ');
      if (current && !done.has(current)) {
        log.push({
          t,
          kind: 'preempt',
          text: `Check: [${status}]. ${p.id} ${describe.why(p, rem)}, so it preempts ${current} (${rem[current]} left).`,
        });
      } else {
        log.push({ t, kind: 'run', text: `Ready: [${status}]. ${p.id} ${describe.why(p, rem)}, so it gets the CPU.` });
      }
    }

    const nextArrival = Math.min(Infinity, ...ps.filter((x) => x.at > t).map((x) => x.at));
    const end = Math.min(t + rem[p.id], nextArrival);
    timeline.push({ pid: p.id, start: t, end });
    rem[p.id] -= end - t;
    t = end;
    current = p.id;

    if (rem[p.id] === 0) {
      done.add(p.id);
      log.push({ t, kind: 'done', text: `${p.id} finishes at t=${t}.` });
      current = null;
    }
  }
  return { timeline, log };
}

function srtf(ps) {
  return runPreemptive(ps, (a, b, rem) => rem[a.id] - rem[b.id] || byArrival(a, b), {
    short: (r, rem) => `(rem ${rem[r.id]})`,
    why: (p, rem) => `has the shortest remaining time (${rem[p.id]})`,
  });
}

function priorityP(ps, { higherIsBetter }) {
  const rank = priorityRank(higherIsBetter);
  return runPreemptive(ps, (a, b) => rank(a) - rank(b) || byArrival(a, b), {
    short: (r) => `(pr ${r.pr})`,
    why: (p) => `has the highest priority (${p.pr})`,
  });
}

/* ---------- Round Robin ---------- */

function rr(ps, { quantum }) {
  const q = Math.max(1, Math.floor(quantum) || 1);
  const sorted = [...ps].sort(byArrival);
  const rem = Object.fromEntries(ps.map((p) => [p.id, p.bt]));
  const queue = [];
  const timeline = [];
  const log = [];
  let i = 0;
  let t = 0;
  let finished = 0;

  const admit = (upTo) => {
    while (i < sorted.length && sorted[i].at <= upTo) {
      const p = sorted[i++];
      queue.push(p);
      log.push({ t: p.at, kind: 'arrive', text: `${p.id} arrives and joins the back of the ready queue.` });
    }
  };

  admit(0);
  while (finished < ps.length) {
    if (!queue.length) {
      const next = sorted[i];
      log.push({ t, kind: 'idle', text: `Ready queue is empty. CPU idles until ${next.id} arrives at t=${next.at}.` });
      t = next.at;
      admit(t);
      continue;
    }
    const p = queue.shift();
    const run = Math.min(q, rem[p.id]);
    log.push({
      t,
      kind: 'run',
      text: `${p.id} leaves the front of the queue and runs for ${units(run)}${
        run < q ? ' (it needs less than a full quantum)' : ''
      }. Still waiting: [${names(queue)}].`,
    });
    timeline.push({ pid: p.id, start: t, end: t + run });
    t += run;
    rem[p.id] -= run;
    admit(t); // arrivals during the slice line up BEFORE the preempted process

    if (rem[p.id] > 0) {
      queue.push(p);
      log.push({ t, kind: 'preempt', text: `Quantum expired. ${p.id} (${rem[p.id]} left) goes to the back of the queue.` });
    } else {
      finished++;
      log.push({ t, kind: 'done', text: `${p.id} finishes at t=${t}.` });
    }
  }
  return { timeline, log };
}

/* ---------- Multilevel Queue (2 fixed queues) ---------- */

function mlq(ps, { quantum }) {
  const q = Math.max(1, Math.floor(quantum) || 1);
  const sorted = [...ps].sort(byArrival);
  const rem = Object.fromEntries(ps.map((p) => [p.id, p.bt]));
  const fg = [];
  const bg = [];
  const timeline = [];
  const log = [];
  let i = 0;
  let t = 0;
  let finished = 0;
  let lastBg = null;

  const admit = (upTo) => {
    while (i < sorted.length && sorted[i].at <= upTo) {
      const p = sorted[i++];
      (p.q === 0 ? fg : bg).push(p);
      log.push({
        t: p.at,
        kind: 'arrive',
        text: `${p.id} arrives → ${p.q === 0 ? 'Foreground queue (Round Robin)' : 'Background queue (FCFS)'}.`,
      });
    }
  };

  admit(0);
  while (finished < ps.length) {
    if (fg.length) {
      lastBg = null;
      const p = fg.shift();
      const run = Math.min(q, rem[p.id]);
      log.push({ t, kind: 'run', text: `Foreground has work, so it goes first. ${p.id} runs for ${units(run)} (RR, q=${q}).` });
      timeline.push({ pid: p.id, start: t, end: t + run, lvl: 0 });
      t += run;
      rem[p.id] -= run;
      admit(t);
      if (rem[p.id] > 0) {
        fg.push(p);
        log.push({ t, kind: 'preempt', text: `Quantum expired. ${p.id} (${rem[p.id]} left) rejoins the foreground queue.` });
      } else {
        finished++;
        log.push({ t, kind: 'done', text: `${p.id} finishes at t=${t}.` });
      }
    } else if (bg.length) {
      const p = bg[0];
      const nextFg = sorted.slice(i).find((x) => x.q === 0);
      const end = Math.min(t + rem[p.id], nextFg ? nextFg.at : Infinity);
      if (lastBg !== p.id) {
        log.push({ t, kind: 'run', text: `Foreground queue is empty, so the background queue may run. ${p.id} gets the CPU (FCFS).` });
      }
      timeline.push({ pid: p.id, start: t, end, lvl: 1 });
      rem[p.id] -= end - t;
      t = end;
      lastBg = p.id;
      admit(t);
      if (rem[p.id] === 0) {
        bg.shift();
        finished++;
        lastBg = null;
        log.push({ t, kind: 'done', text: `${p.id} finishes at t=${t}.` });
      } else {
        lastBg = null;
        log.push({
          t,
          kind: 'preempt',
          text: `A foreground process arrived, so ${p.id} is preempted (${rem[p.id]} left) and waits at the head of the background queue.`,
        });
      }
    } else {
      const next = sorted[i];
      log.push({ t, kind: 'idle', text: `Both queues are empty. CPU idles until ${next.id} arrives at t=${next.at}.` });
      t = next.at;
      admit(t);
    }
  }
  return { timeline, log };
}

/* ---------- Multilevel Feedback Queue (3 levels) ---------- */

function mlfq(ps, { quantum }) {
  const q = Math.max(1, Math.floor(quantum) || 1);
  const quanta = [q, q * 2, Infinity];
  const sorted = [...ps].sort(byArrival);
  const rem = Object.fromEntries(ps.map((p) => [p.id, p.bt]));
  const queues = [[], [], []];
  const timeline = [];
  const log = [];
  let i = 0;
  let t = 0;
  let finished = 0;

  const admit = (upTo) => {
    while (i < sorted.length && sorted[i].at <= upTo) {
      const p = sorted[i++];
      queues[0].push(p);
      log.push({ t: p.at, kind: 'arrive', text: `${p.id} arrives → enters Q0 (the highest level).` });
    }
  };
  const label = (lvl) => (lvl < 2 ? `Q${lvl}, quantum ${quanta[lvl]}` : 'Q2, FCFS');

  admit(0);
  while (finished < ps.length) {
    const lvl = queues.findIndex((x) => x.length);
    if (lvl < 0) {
      const next = sorted[i];
      log.push({ t, kind: 'idle', text: `All queues are empty. CPU idles until ${next.id} arrives at t=${next.at}.` });
      t = next.at;
      admit(t);
      continue;
    }

    const p = queues[lvl].shift();
    const slice = Math.min(rem[p.id], quanta[lvl]);
    // Lower levels can be interrupted by a new arrival in Q0.
    const nextArrival = lvl > 0 && i < sorted.length ? sorted[i].at : Infinity;
    const end = Math.min(t + slice, nextArrival);
    const run = end - t;

    log.push({ t, kind: 'run', text: `Highest non-empty level is Q${lvl}. ${p.id} runs (${label(lvl)}).` });
    timeline.push({ pid: p.id, start: t, end, lvl });
    rem[p.id] -= run;
    t = end;
    admit(t);

    if (rem[p.id] === 0) {
      finished++;
      log.push({ t, kind: 'done', text: `${p.id} finishes at t=${t}.` });
    } else if (run === quanta[lvl]) {
      queues[lvl + 1].push(p);
      log.push({
        t,
        kind: 'preempt',
        text: `${p.id} used its whole quantum (${rem[p.id]} left), so it is demoted to Q${lvl + 1}.`,
      });
    } else {
      queues[lvl].unshift(p);
      log.push({
        t,
        kind: 'preempt',
        text: `A new arrival in Q0 preempts ${p.id} (${rem[p.id]} left). It keeps its place at the head of Q${lvl}.`,
      });
    }
  }
  return { timeline, log };
}

const RUNNERS = {
  fcfs,
  sjf,
  srtf,
  rr,
  'priority-np': priorityNP,
  'priority-p': priorityP,
  hrrn,
  mlq,
  mlfq,
};

/* ---------- results ---------- */

function finalize(ps, rawTimeline, log, mergeSlices) {
  const merged = [];
  for (const s of rawTimeline) {
    const last = merged[merged.length - 1];
    if (mergeSlices && last && last.pid === s.pid && last.end === s.start && last.lvl === s.lvl) {
      last.end = s.end;
    } else {
      merged.push({ ...s });
    }
  }

  const timeline = [];
  let cursor = 0;
  for (const s of merged) {
    if (s.start > cursor) timeline.push({ pid: null, start: cursor, end: s.start });
    timeline.push(s);
    cursor = s.end;
  }

  const results = ps.map((p) => {
    const mine = merged.filter((s) => s.pid === p.id);
    const ct = Math.max(...mine.map((s) => s.end));
    const firstRun = Math.min(...mine.map((s) => s.start));
    const tat = ct - p.at;
    return { id: p.id, at: p.at, bt: p.bt, pr: p.pr, q: p.q, ct, tat, wt: tat - p.bt, rt: firstRun - p.at, firstRun };
  });

  const n = results.length;
  const avg = (key) => results.reduce((sum, r) => sum + r[key], 0) / n;
  const makespan = cursor;
  const start = Math.min(...ps.map((p) => p.at));
  const busy = ps.reduce((sum, p) => sum + p.bt, 0);
  const span = Math.max(1, makespan - start);

  return {
    timeline,
    results,
    log: log
      .map((entry, order) => ({ ...entry, order }))
      .sort((a, b) => a.t - b.t || a.order - b.order),
    makespan,
    averages: { tat: avg('tat'), wt: avg('wt'), rt: avg('rt'), ct: avg('ct') },
    utilization: (busy / span) * 100,
    throughput: n / span,
  };
}

export function simulate(algo, processes, options = {}) {
  const ps = normalize(processes);
  if (!ps.length) return null;
  const opts = { quantum: 2, higherIsBetter: false, ...options };
  const { timeline, log } = RUNNERS[algo](ps, opts);
  const keepSlices = algo === 'rr' || algo === 'mlq' || algo === 'mlfq';
  return { algo, ...finalize(ps, timeline, log, !keepSlices) };
}

/** Where is every process at time t? Used by the playback view. */
export function snapshotAt(result, t) {
  const running = result.timeline.find((s) => s.pid && s.start <= t && t < s.end) || null;
  const state = { upcoming: [], ready: [], running, done: [] };
  for (const r of result.results) {
    if (r.at > t) state.upcoming.push(r);
    else if (r.ct <= t) state.done.push(r);
    else if (!running || running.pid !== r.id) state.ready.push(r);
  }
  return state;
}

export const fmt = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(2));

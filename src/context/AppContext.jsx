import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AppContext = createContext(null);

function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage may be disabled — the app still works */
  }
}

export function AppProvider({ children }) {
  const [completed, setCompleted] = useState(() => readStorage('cpu-lab:completed', []));
  const [theme, setTheme] = useState(() => {
    const saved = readStorage('cpu-lab:theme', null);
    if (saved) return saved;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => writeStorage('cpu-lab:completed', completed), [completed]);
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    writeStorage('cpu-lab:theme', theme);
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      toggleTheme: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')),
      completed,
      isDone: (path) => completed.includes(path),
      markDone: (path) => setCompleted((list) => (list.includes(path) ? list : [...list, path])),
      toggleDone: (path) =>
        setCompleted((list) => (list.includes(path) ? list.filter((p) => p !== path) : [...list, path])),
      resetProgress: () => setCompleted([]),
    }),
    [theme, completed],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}

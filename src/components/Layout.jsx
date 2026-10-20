import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { SECTIONS, ALL_LESSONS } from '../data/lessons.js';
import { useApp } from '../context/AppContext.jsx';

export default function Layout() {
  const { pathname } = useLocation();
  const { theme, toggleTheme, isDone, completed } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile drawer and jump to the top whenever the route changes.
  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo({ top: 0 });
  }, [pathname]);

  const doneCount = ALL_LESSONS.filter((l) => completed.includes(l.path)).length;
  const percent = Math.round((doneCount / ALL_LESSONS.length) * 100);

  return (
    <div className="app-shell">
      <header className="topbar">
        <button
          className="icon-btn menu-btn"
          aria-label="Toggle lesson menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span className="hamburger" />
        </button>

        <Link to="/" className="brand">
          <span className="brand-chip" aria-hidden="true">
            <span />
          </span>
          <span>
            CPU Scheduling <strong>Lab</strong>
          </span>
        </Link>

        <nav className="topnav">
          <NavLink to="/algorithms">Algorithms</NavLink>
          <NavLink to="/simulator">Simulator</NavLink>
          <NavLink to="/practice">Practice</NavLink>
        </nav>

        <button className="icon-btn" onClick={toggleTheme} aria-label="Toggle dark mode" title="Toggle theme">
          {theme === 'dark' ? '☀' : '☾'}
        </button>
      </header>

      <div className="body">
        <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
          <div className="progress-box">
            <div className="progress-label">
              <span>Your progress</span>
              <span className="mono">
                {doneCount}/{ALL_LESSONS.length}
              </span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${percent}%` }} />
            </div>
          </div>

          <NavLink to="/" end className="side-link home-link">
            Start here
          </NavLink>

          {SECTIONS.map((section) => (
            <div key={section.title} className="side-section">
              <p className="side-title">{section.title}</p>
              {section.lessons.map((lesson, i) => (
                <NavLink key={lesson.path} to={lesson.path} className="side-link">
                  <span className={`side-dot ${isDone(lesson.path) ? 'done' : ''}`}>
                    {isDone(lesson.path) ? '✓' : i + 1}
                  </span>
                  <span>{lesson.title}</span>
                </NavLink>
              ))}
            </div>
          ))}

          <div className="side-section">
            <p className="side-title">Tools</p>
            <NavLink to="/simulator" className="side-link">
              <span className="side-dot tool">▶</span>
              <span>Simulator Playground</span>
            </NavLink>
          </div>
        </aside>

        {menuOpen && <div className="scrim" onClick={() => setMenuOpen(false)} />}

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

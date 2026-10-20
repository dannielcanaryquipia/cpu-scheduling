const ICONS = { info: 'i', tip: '★', warn: '!', key: '◆' };

export default function Callout({ type = 'info', title, children }) {
  return (
    <aside className={`callout callout-${type}`}>
      <span className="callout-icon" aria-hidden="true">
        {ICONS[type]}
      </span>
      <div>
        {title && <p className="callout-title">{title}</p>}
        <div className="callout-body">{children}</div>
      </div>
    </aside>
  );
}

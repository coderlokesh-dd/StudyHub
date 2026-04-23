// Prototype.jsx — Interactive single-page prototype with routing, accent + intensity tweaks

const PROTO_PAGES = [
  { id: 'dash', label: 'Dashboard', Comp: 'DashboardDesktop' },
  { id: 'notes', label: 'Notes', Comp: 'NotesDesktop' },
  { id: 'tasks', label: 'Tasks', Comp: 'TasksDesktop' },
  { id: 'progress', label: 'Progress', Comp: 'ProgressDesktop' },
  { id: 'vault', label: 'Study Vault', Comp: 'VaultDesktop' },
  { id: 'zone', label: 'Study Zone', Comp: 'StudyZoneDesktop' },
  { id: 'timetable', label: 'Timetable', Comp: 'TimetableDesktop' },
  { id: 'journal', label: 'Journal', Comp: 'JournalDesktop' },
  { id: 'exams', label: 'Exams', Comp: 'ExamsDesktop' },
];

const ACCENT_MAP = {
  lavender: { primary: '#C7B8FF', deep: '#9B85F5' },
  coral:    { primary: '#FFB5B5', deep: '#FF7A7A' },
  mint:     { primary: '#B8F2D8', deep: '#6BDBA8' },
  butter:   { primary: '#FFE89C', deep: '#FFD456' },
  sky:      { primary: '#B8D9FF', deep: '#7AB0FF' },
};

function InteractiveApp({ tone, accent, intensity, route, setRoute }) {
  // Override sidebar nav behavior by stamping click handlers after render
  const rootRef = React.useRef(null);

  // Apply accent tint by overriding CSS vars on root
  React.useEffect(() => {
    const a = ACCENT_MAP[accent] || ACCENT_MAP.lavender;
    document.documentElement.style.setProperty('--accent', a.primary);
    document.documentElement.style.setProperty('--accent-deep', a.deep);
  }, [accent]);

  // Intensity controls: scale of comic shadow, outline thickness, halftone density
  const intensityClass = `intensity-${intensity}`;

  // Patch clicks on sidebar items to change route
  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const items = root.querySelectorAll('[data-nav-id]');
    const handlers = [];
    items.forEach((el) => {
      const id = el.getAttribute('data-nav-id');
      const h = (e) => { e.preventDefault(); setRoute(id); };
      el.addEventListener('click', h);
      el.style.cursor = 'pointer';
      handlers.push([el, h]);
    });
    return () => handlers.forEach(([el, h]) => el.removeEventListener('click', h));
  });

  const page = PROTO_PAGES.find((p) => p.id === route) || PROTO_PAGES[0];
  const Comp = window[page.Comp];

  // Inject accent override CSS for this render
  const accentVal = ACCENT_MAP[accent]?.primary || '#C7B8FF';

  return (
    <div ref={rootRef} className={intensityClass} style={{
      width: '100%',
      height: '100%',
      // CSS custom prop so we can swap accent globally if we want
      '--app-accent': accentVal,
    }}>
      <Comp tone={tone} />
    </div>
  );
}

window.InteractiveApp = InteractiveApp;
window.PROTO_PAGES = PROTO_PAGES;
window.ACCENT_MAP = ACCENT_MAP;

// Shared.jsx — shared layout (sidebar, header patterns) for all pages

const SIDEBAR_ITEMS_ALL = [
  { id: 'dash', icon: '◉', label: 'Dashboard' },
  { id: 'notes', icon: '✎', label: 'Notes' },
  { id: 'tasks', icon: '☰', label: 'Tasks' },
  { id: 'progress', icon: '≈', label: 'Progress' },
  { id: 'vault', icon: '▣', label: 'Study Vault' },
  { id: 'zone', icon: '◆', label: 'Study Zone' },
  { id: 'timetable', icon: '▦', label: 'Timetable' },
  { id: 'journal', icon: '◐', label: 'Journal' },
  { id: 'exams', icon: '⌛', label: 'Exams' },
];

const PALETTE = {
  lavender: '#C7B8FF',
  lavenderDeep: '#9B85F5',
  mint: '#B8F2D8',
  mintDeep: '#6BDBA8',
  butter: '#FFE89C',
  butterDeep: '#FFD456',
  coral: '#FFB5B5',
  coralDeep: '#FF7A7A',
  sky: '#B8D9FF',
  ink: '#0B0B0F',
  paper: '#FFF8EA',
};

// Shared sidebar
const Sidebar = ({ active }) => (
  <aside style={sharedStyles.sidebar}>
    <div style={sharedStyles.logo}>
      <div style={sharedStyles.logoBox}>S</div>
      <div>
        <div style={{ fontFamily: 'Bangers, cursive', fontSize: 22, letterSpacing: '0.05em', color: '#F5F5FA' }}>
          STUDYHUB
        </div>
        <div style={{ fontSize: 10, color: 'rgba(245,245,250,0.5)', letterSpacing: '0.15em' }}>
          COMIC EDITION
        </div>
      </div>
    </div>
    <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 24 }}>
      {SIDEBAR_ITEMS_ALL.map((item) => {
        const isActive = item.id === active;
        return (
          <div
            key={item.id}
            data-nav-id={item.id}
            style={{
              ...sharedStyles.navItem,
              ...(isActive ? sharedStyles.navItemActive : {}),
            }}
          >
            <span style={{ fontSize: 16, width: 20, textAlign: 'center' }}>{item.icon}</span>
            <span>{item.label}</span>
            {isActive && (
              <span style={sharedStyles.navActiveBadge}>
                <span style={{ fontFamily: 'Bangers, cursive', fontSize: 11, letterSpacing: '0.08em' }}>HERE</span>
              </span>
            )}
          </div>
        );
      })}
    </nav>
    <div style={sharedStyles.streakCard}>
      <div style={{ fontSize: 11, color: 'rgba(245,245,250,0.55)', letterSpacing: '0.12em' }}>
        DAY STREAK
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
        <div style={{ fontFamily: 'Bangers, cursive', fontSize: 42, letterSpacing: '0.02em', color: '#FFE89C' }}>
          14
        </div>
        <div style={{ fontFamily: 'Bangers, cursive', fontSize: 16, color: '#FFB5B5', transform: 'rotate(-6deg)' }}>
          ON FIRE!
        </div>
      </div>
      <div style={{ display: 'flex', gap: 3, marginTop: 10 }}>
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 18,
              borderRadius: 4,
              background: i < 6 ? '#FFE89C' : 'rgba(255,255,255,0.1)',
              border: '2px solid #0B0B0F',
              boxShadow: i < 6 ? '2px 2px 0 #0B0B0F' : 'none',
            }}
          />
        ))}
      </div>
    </div>
  </aside>
);

// Page shell
const PageShell = ({ active, children }) => (
  <div style={sharedStyles.root}>
    <div style={sharedStyles.halftone} />
    <Sidebar active={active} />
    <main style={sharedStyles.main}>{children}</main>
  </div>
);

// Comic card helpers
const ComicCardDark = ({ children, style, ...rest }) => (
  <div
    style={{
      background: 'rgba(24, 24, 34, 0.6)',
      backdropFilter: 'blur(12px)',
      border: '3px solid #0B0B0F',
      boxShadow: '4px 4px 0 #0B0B0F',
      borderRadius: 16,
      padding: 16,
      ...style,
    }}
    {...rest}
  >
    {children}
  </div>
);

const ComicCardPaper = ({ children, style, color = '#FFF8EA', ...rest }) => (
  <div
    style={{
      background: color,
      border: '4px solid #0B0B0F',
      boxShadow: '5px 5px 0 #0B0B0F',
      borderRadius: 18,
      padding: 18,
      color: '#0B0B0F',
      ...style,
    }}
    {...rest}
  >
    {children}
  </div>
);

const CardLabel = ({ children, color = '#C7B8FF' }) => (
  <div style={{ fontFamily: 'Bangers, cursive', fontSize: 12, letterSpacing: '0.15em', color }}>
    {children}
  </div>
);

const Chip = ({ children, color = '#FFE89C' }) => (
  <div style={{
    fontFamily: 'Bangers, cursive',
    fontSize: 11,
    letterSpacing: '0.1em',
    padding: '3px 9px',
    background: color,
    border: '2px solid #0B0B0F',
    borderRadius: 6,
    color: '#0B0B0F',
    display: 'inline-block',
  }}>{children}</div>
);

// Mobile phone shell wrapper
const PhoneShell = ({ children, tabActive }) => (
  <div style={sharedStyles.phone}>
    <div style={sharedStyles.statusBar}>
      <span style={{ fontWeight: 600 }}>9:41</span>
      <div style={{ display: 'flex', gap: 5 }}>
        <span>●●●●</span><span>􀙇</span><span>􀛨</span>
      </div>
    </div>
    <div style={sharedStyles.phoneHalftone} />
    <div style={{ position: 'relative', zIndex: 2, height: 'calc(100% - 44px)', display: 'flex', flexDirection: 'column' }}>
      {children}
    </div>
    <PhoneBottomNav active={tabActive} />
    <div style={sharedStyles.homeIndicator} />
  </div>
);

const PhoneBottomNav = ({ active }) => {
  const items = [
    { id: 'dash', icon: '◉', label: 'Home' },
    { id: 'zone', icon: '◆', label: 'Zone' },
    { id: 'vault', icon: '▣', label: 'Vault' },
    { id: 'progress', icon: '≈', label: 'Stats' },
    { id: 'you', icon: '◯', label: 'You' },
  ];
  return (
    <div style={sharedStyles.bottomNav}>
      {items.map((item) => {
        const isActive = item.id === active;
        return (
          <div key={item.id} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            padding: '6px 10px', borderRadius: 10,
            color: isActive ? '#0B0B0F' : 'rgba(245,245,250,0.55)',
            background: isActive ? '#C7B8FF' : 'transparent',
            border: isActive ? '2px solid #0B0B0F' : '2px solid transparent',
            boxShadow: isActive ? '2px 2px 0 #0B0B0F' : 'none',
          }}>
            <div style={{ fontSize: 18 }}>{item.icon}</div>
            <div style={{ fontSize: 9, fontFamily: 'Bangers, cursive', letterSpacing: '0.1em' }}>{item.label.toUpperCase()}</div>
          </div>
        );
      })}
    </div>
  );
};

const sharedStyles = {
  root: {
    position: 'relative',
    width: '100%',
    height: '100%',
    display: 'flex',
    background: 'linear-gradient(135deg, #0B0B0F 0%, #14141e 100%)',
    color: '#F5F5FA',
    overflow: 'hidden',
    fontFamily: 'Inter, sans-serif',
  },
  halftone: {
    position: 'absolute',
    inset: 0,
    backgroundImage: 'radial-gradient(circle, rgba(199, 184, 255, 0.06) 1px, transparent 1.5px)',
    backgroundSize: '14px 14px',
    pointerEvents: 'none',
  },
  sidebar: {
    width: 260,
    height: '100%',
    background: 'rgba(18, 18, 26, 0.7)',
    backdropFilter: 'blur(12px)',
    borderRight: '1px solid rgba(255,255,255,0.06)',
    padding: 20,
    display: 'flex',
    flexDirection: 'column',
    zIndex: 2,
    flexShrink: 0,
  },
  logo: { display: 'flex', alignItems: 'center', gap: 10 },
  logoBox: {
    width: 40, height: 40, background: '#C7B8FF',
    border: '3px solid #0B0B0F', borderRadius: 10, boxShadow: '3px 3px 0 #0B0B0F',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'Bangers, cursive', fontSize: 24, color: '#0B0B0F',
  },
  navItem: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
    color: 'rgba(245,245,250,0.65)', fontSize: 14, fontWeight: 500,
  },
  navItemActive: {
    background: 'rgba(199, 184, 255, 0.12)',
    border: '2px solid #0B0B0F', boxShadow: '3px 3px 0 #0B0B0F',
    color: '#F5F5FA',
  },
  navActiveBadge: {
    marginLeft: 'auto', padding: '2px 8px', background: '#FFE89C',
    border: '2px solid #0B0B0F', borderRadius: 6, color: '#0B0B0F',
    transform: 'rotate(4deg)',
  },
  streakCard: {
    marginTop: 'auto',
    background: 'rgba(255, 232, 156, 0.08)',
    border: '3px solid #0B0B0F', boxShadow: '4px 4px 0 #0B0B0F',
    borderRadius: 14, padding: 14,
  },
  main: {
    flex: 1, padding: '24px 32px', overflow: 'auto',
    position: 'relative', zIndex: 1,
  },
  phone: {
    position: 'relative', width: 390, height: 844,
    background: 'linear-gradient(160deg, #0B0B0F 0%, #14141e 60%, #1a1528 100%)',
    color: '#F5F5FA', fontFamily: 'Inter, sans-serif',
    overflow: 'hidden', borderRadius: 44,
    border: '10px solid #0B0B0F',
    boxShadow: '0 40px 80px rgba(0,0,0,0.5), 0 0 0 3px #1a1a24 inset',
  },
  statusBar: {
    height: 44, padding: '14px 28px 0',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    fontSize: 14, color: '#F5F5FA', position: 'relative', zIndex: 3,
  },
  phoneHalftone: {
    position: 'absolute', inset: 0,
    backgroundImage: 'radial-gradient(circle, rgba(199, 184, 255, 0.05) 1px, transparent 1.5px)',
    backgroundSize: '12px 12px', pointerEvents: 'none',
  },
  bottomNav: {
    position: 'absolute', bottom: 20, left: 16, right: 16,
    height: 64,
    background: 'rgba(18, 18, 26, 0.85)',
    backdropFilter: 'blur(12px)',
    border: '3px solid #0B0B0F', boxShadow: '4px 4px 0 #0B0B0F',
    borderRadius: 18,
    display: 'flex', justifyContent: 'space-around', alignItems: 'center',
    padding: '0 8px', zIndex: 3,
  },
  homeIndicator: {
    position: 'absolute', bottom: 6, left: '50%',
    width: 134, height: 4, background: 'rgba(255,255,255,0.4)',
    borderRadius: 3, transform: 'translateX(-50%)', zIndex: 4,
  },
};

// Page header helper
const PageHeader = ({ tag, tagColor = '#B8F2D8', title, subtitle, right }) => (
  <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
    <div>
      {tag && (
        <div style={{
          display: 'inline-flex', gap: 6, alignItems: 'center',
          fontFamily: 'Bangers, cursive', fontSize: 12, letterSpacing: '0.15em',
          color: tagColor, background: `${tagColor}1a`,
          border: '2px solid #0B0B0F', boxShadow: '2px 2px 0 #0B0B0F',
          padding: '4px 10px', borderRadius: 8,
        }}>
          <span>●</span><span>{tag}</span>
        </div>
      )}
      <h1 style={{
        fontFamily: 'Bangers, cursive', fontSize: 56,
        margin: '10px 0 4px', letterSpacing: '0.02em',
        color: '#F5F5FA', textTransform: 'lowercase',
      }}>{title}</h1>
      {subtitle && <p style={{ fontSize: 14, color: 'rgba(245,245,250,0.6)', margin: 0 }}>{subtitle}</p>}
    </div>
    {right && <div>{right}</div>}
  </header>
);

Object.assign(window, {
  Sidebar, PageShell, PhoneShell, ComicCardDark, ComicCardPaper,
  CardLabel, Chip, PageHeader, PALETTE, SIDEBAR_ITEMS_ALL,
});

// Pages.jsx — All pages except Study Zone

const { PageShell, PhoneShell, ComicCardDark, ComicCardPaper, CardLabel, Chip, PageHeader, PALETTE } = window;

// ─────────────────────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────────────────────
const DASH_COPY = {
  pro: {
    tag: 'GOOD AFTERNOON', title: 'welcome back, alex', sub: 'Keep the momentum going.',
    cta: 'Continue studying', next: 'Up next', focusTime: 'Focus today', tasksLabel: 'Tasks due',
    examsTitle: 'Upcoming Exams', recentTitle: 'Recent notes', noExams: 'Nothing scheduled. Clean.',
    quickActions: ['New note', 'Add task', 'Start timer', 'Log mood'],
  },
  genz: {
    tag: 'GOOD AFTERNOON BESTIE', title: 'welcome back, alex', sub: 'time to lock tf in ✌️',
    cta: 'keep cooking', next: 'next up', focusTime: 'focused today', tasksLabel: 'tasks rn',
    examsTitle: 'exam SZN', recentTitle: 'recent thoughts', noExams: 'no exams rn we free 🕊️',
    quickActions: ['new note', 'add task', 'start timer', 'log vibes'],
  },
};

const DashboardDesktop = ({ tone = 'genz' }) => {
  const c = DASH_COPY[tone];
  return (
    <PageShell active="dash">
      <PageHeader tag="DASHBOARD · MON APR 23" title={c.title} subtitle={c.sub} />

      {/* Hero row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 20, marginBottom: 20 }}>
        <ComicCardPaper color="#C7B8FF" style={{ padding: 24, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(11,11,15,0.1) 1px, transparent 1.5px)', backgroundSize: '10px 10px', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 20 }}>
            <window.Mascot state="idle" size={120} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'Bangers, cursive', fontSize: 14, letterSpacing: '0.15em', color: '#0B0B0F' }}>
                {c.tag}
              </div>
              <div style={{ fontFamily: 'Bangers, cursive', fontSize: 40, letterSpacing: '0.02em', lineHeight: 1, margin: '4px 0 6px', color: '#0B0B0F' }}>
                ready to cook?
              </div>
              <div style={{ fontSize: 14, color: 'rgba(11,11,15,0.7)', marginBottom: 14 }}>
                {c.next}: calc ch 7 · 25 min focus block
              </div>
              <button style={{
                fontFamily: 'Bangers, cursive', fontSize: 20, letterSpacing: '0.06em',
                padding: '10px 24px', background: '#FFE89C',
                border: '3px solid #0B0B0F', borderRadius: 14, boxShadow: '4px 4px 0 #0B0B0F',
                color: '#0B0B0F', cursor: 'pointer',
              }}>{c.cta} →</button>
            </div>
          </div>
          {/* POW sticker */}
          <div style={{ position: 'absolute', top: 16, right: 20, background: '#FFB5B5', border: '3px solid #0B0B0F', boxShadow: '3px 3px 0 #0B0B0F', padding: '6px 12px', borderRadius: 10, transform: 'rotate(8deg)' }}>
            <div style={{ fontFamily: 'Bangers, cursive', fontSize: 16, color: '#0B0B0F' }}>LET'S GO!</div>
          </div>
        </ComicCardPaper>

        <ComicCardDark style={{ padding: 18 }}>
          <CardLabel color="#FFE89C">STREAK · 14 DAYS</CardLabel>
          <div style={{ fontFamily: 'Bangers, cursive', fontSize: 48, color: '#FFE89C', lineHeight: 1, margin: '6px 0' }}>
            14 🔥
          </div>
          <div style={{ display: 'flex', gap: 4, marginTop: 10 }}>
            {Array.from({ length: 14 }).map((_, i) => (
              <div key={i} style={{
                flex: 1, height: 28, borderRadius: 4,
                background: i < 13 ? '#FFE89C' : 'rgba(255,255,255,0.1)',
                border: '2px solid #0B0B0F',
                boxShadow: i < 13 ? '2px 2px 0 #0B0B0F' : 'none',
              }} />
            ))}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(245,245,250,0.5)', marginTop: 10 }}>
            one more day and you hit 15. keep it
          </div>
        </ComicCardDark>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'NOTES', value: '42', color: PALETTE.lavender, sub: '+3 this week' },
          { label: c.tasksLabel.toUpperCase(), value: '7', color: PALETTE.coral, sub: '2 due today' },
          { label: c.focusTime.toUpperCase(), value: '2h 15m', color: PALETTE.mint, sub: '↑ 18%' },
          { label: 'BADGES', value: '11', color: PALETTE.butter, sub: '2 new!' },
        ].map((s, i) => (
          <ComicCardDark key={i} style={{ padding: 16 }}>
            <CardLabel color={s.color}>{s.label}</CardLabel>
            <div style={{ fontFamily: 'Bangers, cursive', fontSize: 40, color: s.color, lineHeight: 1, marginTop: 4 }}>
              {s.value}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(245,245,250,0.5)', marginTop: 4 }}>{s.sub}</div>
          </ComicCardDark>
        ))}
      </div>

      {/* Exams + Recent */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 20, marginBottom: 20 }}>
        <ComicCardDark>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <CardLabel color="#FFB5B5">{c.examsTitle.toUpperCase()}</CardLabel>
            <button style={smallBtn}>+ add</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { subj: 'CALC II · MIDTERM', date: 'Thu Apr 30', days: 7, color: '#FFB5B5' },
              { subj: 'ORG CHEM · QUIZ', date: 'Mon May 4', days: 11, color: '#FFE89C' },
              { subj: 'PSYCH 101 · FINAL', date: 'Wed May 20', days: 27, color: '#B8F2D8' },
            ].map((e, i) => (
              <div key={i} style={examRow}>
                <div style={{ ...examBadge, background: e.color }}>
                  <div style={{ fontFamily: 'Bangers, cursive', fontSize: 22, color: '#0B0B0F', lineHeight: 1 }}>{e.days}</div>
                  <div style={{ fontSize: 9, color: '#0B0B0F', letterSpacing: '0.1em' }}>DAYS</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'Space Grotesk', fontWeight: 600, fontSize: 15, color: '#F5F5FA' }}>{e.subj}</div>
                  <div style={{ fontSize: 12, color: 'rgba(245,245,250,0.5)' }}>{e.date}</div>
                </div>
                <div style={{ fontSize: 18, color: 'rgba(245,245,250,0.4)' }}>›</div>
              </div>
            ))}
          </div>
        </ComicCardDark>

        <ComicCardDark>
          <CardLabel>{c.recentTitle.toUpperCase()}</CardLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
            {[
              { t: 'Derivatives chain rule cheatsheet', d: '2h ago', tag: 'MATH' },
              { t: 'Benzene aromaticity notes', d: 'yesterday', tag: 'CHEM' },
              { t: 'Operant conditioning examples', d: '2d ago', tag: 'PSYCH' },
            ].map((n, i) => (
              <div key={i} style={{ padding: 10, border: '2px solid #0B0B0F', borderRadius: 10, background: 'rgba(255,255,255,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <Chip color="#B8D9FF">{n.tag}</Chip>
                  <div style={{ fontSize: 11, color: 'rgba(245,245,250,0.4)' }}>{n.d}</div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#F5F5FA' }}>{n.t}</div>
              </div>
            ))}
          </div>
        </ComicCardDark>
      </div>

      {/* Quick actions */}
      <ComicCardPaper color="#FFE89C" style={{ display: 'flex', gap: 10, padding: 16 }}>
        <div style={{ fontFamily: 'Bangers, cursive', fontSize: 20, letterSpacing: '0.04em', color: '#0B0B0F', alignSelf: 'center', paddingRight: 6, borderRight: '2px dashed #0B0B0F', marginRight: 6 }}>
          QUICK!
        </div>
        {c.quickActions.map((a, i) => (
          <button key={i} style={{
            flex: 1, fontFamily: 'Space Grotesk', fontWeight: 600, fontSize: 14,
            padding: '12px 10px', background: '#FFF8EA',
            border: '2.5px solid #0B0B0F', borderRadius: 12, boxShadow: '3px 3px 0 #0B0B0F',
            color: '#0B0B0F', cursor: 'pointer',
          }}>{a}</button>
        ))}
      </ComicCardPaper>
    </PageShell>
  );
};

const smallBtn = {
  fontFamily: 'Bangers, cursive', fontSize: 12, letterSpacing: '0.08em',
  padding: '4px 10px', background: '#FFF8EA',
  border: '2px solid #0B0B0F', borderRadius: 8, boxShadow: '2px 2px 0 #0B0B0F',
  color: '#0B0B0F', cursor: 'pointer',
};

const examRow = {
  display: 'flex', gap: 12, alignItems: 'center',
  padding: 10, background: 'rgba(255,255,255,0.03)',
  border: '2px solid #0B0B0F', borderRadius: 10,
};
const examBadge = {
  width: 54, height: 54,
  border: '2.5px solid #0B0B0F', borderRadius: 10, boxShadow: '2px 2px 0 #0B0B0F',
  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
};

// ─────────────────────────────────────────────────────────────
// NOTES
// ─────────────────────────────────────────────────────────────
const NOTES_COPY = {
  pro: { title: 'notes', sub: 'Your thoughts, organized.', search: 'Search notes…', newBtn: 'NEW NOTE' },
  genz: { title: 'the vault of thoughts', sub: 'ur big brain moments. all here.', search: 'find a thought…', newBtn: 'NEW DROP' },
};

const NotesDesktop = ({ tone = 'genz' }) => {
  const c = NOTES_COPY[tone];
  const notes = [
    { t: 'Derivatives chain rule', body: 'd/dx[f(g(x))] = f\'(g(x))·g\'(x). Apply outside-in.', tag: 'MATH', color: '#C7B8FF', date: '2h', starred: true },
    { t: 'Benzene aromaticity', body: 'Planar, cyclic, conjugated, follows Hückel\'s rule (4n+2 π electrons).', tag: 'CHEM', color: '#B8F2D8', date: '1d' },
    { t: 'Operant conditioning', body: 'Reinforcement ↑ behavior, punishment ↓ behavior. Positive = add, negative = remove.', tag: 'PSYCH', color: '#FFB5B5', date: '2d' },
    { t: 'French Revolution timeline', body: '1789 Bastille → 1793 Terror → 1799 Napoleon coup.', tag: 'HIST', color: '#FFE89C', date: '3d', starred: true },
    { t: 'Big O cheatsheet', body: 'O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2ⁿ) < O(n!)', tag: 'CS', color: '#B8D9FF', date: '4d' },
    { t: 'Mitochondria functions', body: 'Powerhouse of the cell. ATP synthesis via oxidative phosphorylation.', tag: 'BIO', color: '#C7B8FF', date: '5d' },
  ];

  return (
    <PageShell active="notes">
      <PageHeader
        tag="NOTES · 42 TOTAL" tagColor="#C7B8FF"
        title={c.title} subtitle={c.sub}
        right={
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 14px',
              background: 'rgba(24, 24, 34, 0.6)', backdropFilter: 'blur(12px)',
              border: '3px solid #0B0B0F', boxShadow: '3px 3px 0 #0B0B0F',
              borderRadius: 12, minWidth: 240,
            }}>
              <span style={{ color: 'rgba(245,245,250,0.5)' }}>⌕</span>
              <span style={{ color: 'rgba(245,245,250,0.5)', fontSize: 13 }}>{c.search}</span>
            </div>
            <button style={{
              fontFamily: 'Bangers, cursive', fontSize: 16, letterSpacing: '0.08em',
              padding: '8px 18px', background: '#C7B8FF',
              border: '3px solid #0B0B0F', borderRadius: 12, boxShadow: '3px 3px 0 #0B0B0F',
              color: '#0B0B0F', cursor: 'pointer',
            }}>+ {c.newBtn}</button>
          </div>
        }
      />

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['ALL · 42', 'MATH · 12', 'CHEM · 8', 'PSYCH · 7', 'HIST · 5', 'CS · 6', 'BIO · 4'].map((f, i) => (
          <button key={i} style={{
            fontFamily: 'Space Grotesk', fontSize: 12, fontWeight: 600,
            padding: '6px 14px',
            background: i === 0 ? '#C7B8FF' : 'transparent',
            border: '2px solid #0B0B0F', borderRadius: 18,
            boxShadow: i === 0 ? '2px 2px 0 #0B0B0F' : 'none',
            color: i === 0 ? '#0B0B0F' : '#F5F5FA',
            cursor: 'pointer',
          }}>{f}</button>
        ))}
      </div>

      {/* Notes grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {notes.map((n, i) => (
          <div key={i} style={{
            background: n.color,
            border: '3px solid #0B0B0F', boxShadow: '5px 5px 0 #0B0B0F',
            borderRadius: 14, padding: 16, position: 'relative',
            transform: i % 3 === 1 ? 'rotate(-0.8deg)' : i % 3 === 2 ? 'rotate(0.6deg)' : 'none',
            minHeight: 160,
          }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(11,11,15,0.08) 1px, transparent 1.5px)', backgroundSize: '10px 10px', pointerEvents: 'none', borderRadius: 10 }} />
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Chip color="#FFF8EA">{n.tag}</Chip>
                {n.starred && <div style={{ fontSize: 18 }}>★</div>}
              </div>
              <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 18, color: '#0B0B0F', marginBottom: 6, lineHeight: 1.2 }}>
                {n.t}
              </div>
              <div style={{ fontSize: 13, color: 'rgba(11,11,15,0.75)', lineHeight: 1.45 }}>
                {n.body}
              </div>
              <div style={{ position: 'absolute', bottom: -6, right: 0, fontFamily: 'Permanent Marker, cursive', fontSize: 13, color: 'rgba(11,11,15,0.55)' }}>
                {n.date} ago
              </div>
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
};

// ─────────────────────────────────────────────────────────────
// TASKS
// ─────────────────────────────────────────────────────────────
const TASKS_COPY = {
  pro: { title: 'tasks', sub: 'Stay on top of everything.', today: 'Today', later: 'Later', done: 'Done', addBtn: 'ADD TASK' },
  genz: { title: 'the to-do era', sub: 'slay this list bestie', today: 'today', later: 'later', done: 'crushed it', addBtn: 'ADD MISSION' },
};

const TasksDesktop = ({ tone = 'genz' }) => {
  const c = TASKS_COPY[tone];
  const tasks = {
    today: [
      { t: 'Finish calc ch 7 problems', p: 'HIGH', tag: 'MATH 201', due: '4pm' },
      { t: 'Read chem ch 12 (p. 340–360)', p: 'MED', tag: 'CHEM 110', due: '6pm' },
      { t: 'Reply to prof about essay', p: 'LOW', tag: 'ENGL 220', due: 'EOD' },
    ],
    later: [
      { t: 'Start psych essay draft', p: 'HIGH', tag: 'PSYCH 101', due: 'Wed' },
      { t: 'Lab report — reflux experiment', p: 'MED', tag: 'CHEM 110', due: 'Thu' },
      { t: 'Review hist timeline for quiz', p: 'MED', tag: 'HIST 205', due: 'Fri' },
      { t: 'Buy new highlighters', p: 'LOW', tag: 'LIFE', due: '—' },
    ],
    done: [
      { t: 'Submit math pset 6', tag: 'MATH 201' },
      { t: 'Print study guide', tag: 'HIST 205' },
    ],
  };

  const pColor = { HIGH: '#FFB5B5', MED: '#FFE89C', LOW: '#B8F2D8' };

  return (
    <PageShell active="tasks">
      <PageHeader
        tag="TASKS · 7 OPEN" tagColor="#FFB5B5"
        title={c.title} subtitle={c.sub}
        right={
          <button style={{
            fontFamily: 'Bangers, cursive', fontSize: 16, letterSpacing: '0.08em',
            padding: '8px 18px', background: '#FFB5B5',
            border: '3px solid #0B0B0F', borderRadius: 12, boxShadow: '3px 3px 0 #0B0B0F',
            color: '#0B0B0F', cursor: 'pointer',
          }}>+ {c.addBtn}</button>
        }
      />

      {/* Priority filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[
          { l: 'ALL', c: '#C7B8FF', active: true },
          { l: 'HIGH', c: '#FFB5B5' },
          { l: 'MED', c: '#FFE89C' },
          { l: 'LOW', c: '#B8F2D8' },
        ].map((f, i) => (
          <button key={i} style={{
            fontFamily: 'Bangers, cursive', fontSize: 13, letterSpacing: '0.1em',
            padding: '6px 16px',
            background: f.active ? f.c : 'transparent',
            border: '2px solid #0B0B0F', borderRadius: 18,
            boxShadow: f.active ? '2px 2px 0 #0B0B0F' : 'none',
            color: f.active ? '#0B0B0F' : '#F5F5FA',
            cursor: 'pointer',
          }}>{f.l}</button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 18 }}>
        {/* Today */}
        <ComicCardDark>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <CardLabel color="#FFB5B5">{c.today.toUpperCase()} · 3</CardLabel>
            <div style={{ fontFamily: 'Bangers, cursive', fontSize: 22, color: '#FFB5B5', transform: 'rotate(-4deg)' }}>
              LFG!
            </div>
          </div>
          {tasks.today.map((t, i) => (
            <div key={i} style={taskRow}>
              <div style={checkbox} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#F5F5FA', marginBottom: 4 }}>{t.t}</div>
                <div style={{ display: 'flex', gap: 5 }}>
                  <Chip color={pColor[t.p]}>{t.p}</Chip>
                  <Chip color="#B8D9FF">{t.tag}</Chip>
                  <Chip color="#FFF8EA">{t.due}</Chip>
                </div>
              </div>
            </div>
          ))}
        </ComicCardDark>

        {/* Later */}
        <ComicCardDark>
          <CardLabel color="#FFE89C">{c.later.toUpperCase()} · 4</CardLabel>
          <div style={{ marginTop: 10 }}>
            {tasks.later.map((t, i) => (
              <div key={i} style={taskRow}>
                <div style={checkbox} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#F5F5FA', marginBottom: 4 }}>{t.t}</div>
                  <div style={{ display: 'flex', gap: 5 }}>
                    <Chip color={pColor[t.p]}>{t.p}</Chip>
                    <Chip color="#B8D9FF">{t.tag}</Chip>
                    <Chip color="#FFF8EA">{t.due}</Chip>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ComicCardDark>

        {/* Done */}
        <div>
          <ComicCardDark>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <CardLabel color="#B8F2D8">{c.done.toUpperCase()} · 2</CardLabel>
              <div style={{ fontFamily: 'Bangers, cursive', fontSize: 20, color: '#B8F2D8', transform: 'rotate(6deg)' }}>
                BAM!
              </div>
            </div>
            <div style={{ marginTop: 10 }}>
              {tasks.done.map((t, i) => (
                <div key={i} style={{ ...taskRow, opacity: 0.6 }}>
                  <div style={{ ...checkbox, background: '#B8F2D8' }}>
                    <div style={{ fontFamily: 'Bangers, cursive', fontSize: 14, color: '#0B0B0F', lineHeight: '18px', textAlign: 'center' }}>✓</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, color: '#F5F5FA', textDecoration: 'line-through' }}>{t.t}</div>
                    <Chip color="#B8D9FF">{t.tag}</Chip>
                  </div>
                </div>
              ))}
            </div>
          </ComicCardDark>

          {/* Mascot celebrating */}
          <ComicCardPaper color="#B8F2D8" style={{ marginTop: 16, padding: 14, textAlign: 'center' }}>
            <window.Mascot state="celebrate" size={100} />
            <div style={{ fontFamily: 'Bangers, cursive', fontSize: 18, letterSpacing: '0.04em', color: '#0B0B0F', marginTop: 4 }}>
              {tone === 'genz' ? 'you ATE that!' : 'Great work today!'}
            </div>
          </ComicCardPaper>
        </div>
      </div>
    </PageShell>
  );
};

const taskRow = {
  display: 'flex', gap: 10, alignItems: 'flex-start',
  padding: 10, borderBottom: '2px dashed rgba(255,255,255,0.08)',
};
const checkbox = {
  width: 22, height: 22, background: '#FFF8EA',
  border: '2.5px solid #0B0B0F', borderRadius: 6, boxShadow: '2px 2px 0 #0B0B0F',
  flexShrink: 0, marginTop: 2,
};

Object.assign(window, { DashboardDesktop, NotesDesktop, TasksDesktop });

// Pages2.jsx — Journal, Progress, Vault, Timetable, Exams

const { PageShell, ComicCardDark, ComicCardPaper, CardLabel, Chip, PageHeader, PALETTE } = window;

// ─────────────────────────────────────────────────────────────
// JOURNAL
// ─────────────────────────────────────────────────────────────
const JOURNAL_COPY = {
  pro: { title: 'journal', sub: 'Reflect and reset.', newBtn: 'NEW ENTRY', moodTitle: 'How are you feeling?' },
  genz: { title: 'diary era', sub: 'spill the tea (to urself)', newBtn: 'NEW ENTRY', moodTitle: 'vibe check' },
};

const JournalDesktop = ({ tone = 'genz' }) => {
  const c = JOURNAL_COPY[tone];
  const moods = [
    { e: '😵', l: tone === 'genz' ? 'cooked' : 'Overwhelmed', c: '#FFB5B5' },
    { e: '😐', l: tone === 'genz' ? 'meh' : 'Neutral', c: '#FFE89C' },
    { e: '😌', l: tone === 'genz' ? 'locked in' : 'Calm', c: '#B8F2D8' },
    { e: '🤩', l: tone === 'genz' ? 'unstoppable' : 'Energized', c: '#C7B8FF', active: true },
    { e: '😴', l: tone === 'genz' ? 'NPC mode' : 'Tired', c: '#B8D9FF' },
  ];
  const entries = [
    { d: 'Today', dd: 'Mon 23', m: '🤩', title: tone === 'genz' ? 'absolutely cooked calc today' : 'Great calc session today', body: 'Locked in for 2h straight on chain rule. Finally clicked. Felt like a main character.', color: '#C7B8FF' },
    { d: 'Yesterday', dd: 'Sun 22', m: '😌', title: tone === 'genz' ? 'chill sunday reset' : 'Quiet reset day', body: 'Cleaned desk, organized notes into the vault. Feeling ready for the week.', color: '#B8F2D8' },
    { d: 'Saturday', dd: 'Sat 21', m: '😵', title: tone === 'genz' ? 'why does chem do this' : 'Rough chem day', body: 'Got stuck on benzene reactions for hours. Need to ask TA on Monday.', color: '#FFB5B5' },
  ];

  return (
    <PageShell active="journal">
      <PageHeader
        tag="JOURNAL · 28 ENTRIES" tagColor="#B8D9FF"
        title={c.title} subtitle={c.sub}
        right={<button style={{
          fontFamily: 'Bangers, cursive', fontSize: 16, letterSpacing: '0.08em',
          padding: '8px 18px', background: '#B8D9FF',
          border: '3px solid #0B0B0F', borderRadius: 12, boxShadow: '3px 3px 0 #0B0B0F',
          color: '#0B0B0F', cursor: 'pointer',
        }}>+ {c.newBtn}</button>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 20 }}>
        {/* Left: mood + today entry */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <ComicCardPaper color="#FFF8EA">
            <div style={{ fontFamily: 'Bangers, cursive', fontSize: 14, letterSpacing: '0.15em', color: '#0B0B0F' }}>
              {c.moodTitle.toUpperCase()}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
              {moods.map((m, i) => (
                <div key={i} style={{
                  flex: '1 1 calc(33% - 8px)',
                  minWidth: 80,
                  padding: '10px 4px',
                  background: m.active ? m.c : 'transparent',
                  border: '2.5px solid #0B0B0F', borderRadius: 12,
                  boxShadow: m.active ? '3px 3px 0 #0B0B0F' : 'none',
                  textAlign: 'center', cursor: 'pointer',
                }}>
                  <div style={{ fontSize: 28, lineHeight: 1 }}>{m.e}</div>
                  <div style={{ fontFamily: 'Bangers, cursive', fontSize: 11, letterSpacing: '0.08em', marginTop: 4, color: '#0B0B0F' }}>
                    {m.l.toUpperCase()}
                  </div>
                </div>
              ))}
            </div>
          </ComicCardPaper>

          <ComicCardDark>
            <CardLabel color="#B8D9FF">WEEKLY MOOD</CardLabel>
            <div style={{ display: 'flex', gap: 6, marginTop: 10, alignItems: 'flex-end', height: 90 }}>
              {[
                { d: 'M', e: '😵', h: 35, c: '#FFB5B5' },
                { d: 'T', e: '😐', h: 55, c: '#FFE89C' },
                { d: 'W', e: '😌', h: 70, c: '#B8F2D8' },
                { d: 'T', e: '🤩', h: 88, c: '#C7B8FF' },
                { d: 'F', e: '😌', h: 72, c: '#B8F2D8' },
                { d: 'S', e: '😴', h: 48, c: '#B8D9FF' },
                { d: 'S', e: '🤩', h: 92, c: '#C7B8FF' },
              ].map((d, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ fontSize: 16 }}>{d.e}</div>
                  <div style={{ width: '100%', height: `${d.h}%`, background: d.c, border: '2px solid #0B0B0F', borderRadius: 4, boxShadow: '2px 2px 0 #0B0B0F' }} />
                  <div style={{ fontSize: 10, color: 'rgba(245,245,250,0.5)', fontFamily: 'Bangers, cursive', letterSpacing: '0.1em' }}>{d.d}</div>
                </div>
              ))}
            </div>
          </ComicCardDark>
        </div>

        {/* Right: entries feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {entries.map((e, i) => (
            <div key={i} style={{
              background: e.color,
              border: '3px solid #0B0B0F', boxShadow: '5px 5px 0 #0B0B0F',
              borderRadius: 16, padding: 18,
              transform: i === 1 ? 'rotate(-0.5deg)' : 'none',
              position: 'relative',
            }}>
              <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(11,11,15,0.08) 1px, transparent 1.5px)', backgroundSize: '10px 10px', pointerEvents: 'none', borderRadius: 12 }} />
              <div style={{ position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ fontFamily: 'Bangers, cursive', fontSize: 16, letterSpacing: '0.08em', color: '#0B0B0F' }}>
                    {e.d.toUpperCase()} · {e.dd}
                  </div>
                  <div style={{ fontSize: 26 }}>{e.m}</div>
                </div>
                <div style={{ fontFamily: 'Permanent Marker, cursive', fontSize: 22, color: '#0B0B0F', marginBottom: 6, lineHeight: 1.2 }}>
                  "{e.title}"
                </div>
                <div style={{ fontSize: 14, color: 'rgba(11,11,15,0.75)', lineHeight: 1.5 }}>
                  {e.body}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
};

// ─────────────────────────────────────────────────────────────
// PROGRESS / STATS
// ─────────────────────────────────────────────────────────────
const PROGRESS_COPY = {
  pro: { title: 'progress', sub: 'Your study stats this month.' },
  genz: { title: 'the stats era', sub: 'receipts. all of them.' },
};

const ProgressDesktop = ({ tone = 'genz' }) => {
  const c = PROGRESS_COPY[tone];
  const badges = [
    { icon: '🔥', n: '14-day streak', earned: true, c: '#FFE89C' },
    { icon: '📚', n: '100 notes', earned: true, c: '#C7B8FF' },
    { icon: '⚡', n: 'Speed demon', earned: true, c: '#B8F2D8' },
    { icon: '🌙', n: 'Night owl', earned: true, c: '#B8D9FF' },
    { icon: '🧠', n: 'Big brain', earned: false, c: 'rgba(255,255,255,0.05)' },
    { icon: '🏆', n: '30-day streak', earned: false, c: 'rgba(255,255,255,0.05)' },
  ];
  const courses = [
    { n: 'Calculus II', pct: 82, c: '#C7B8FF' },
    { n: 'Organic Chem', pct: 64, c: '#B8F2D8' },
    { n: 'Psych 101', pct: 91, c: '#FFB5B5' },
    { n: 'History', pct: 47, c: '#FFE89C' },
    { n: 'CS Data Structures', pct: 73, c: '#B8D9FF' },
  ];

  return (
    <PageShell active="progress">
      <PageHeader tag="PROGRESS · APRIL" tagColor="#B8F2D8" title={c.title} subtitle={c.sub} />

      {/* Big stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        {[
          { v: '68h', l: 'TOTAL STUDIED', s: '↑ 24% vs last mo', c: '#C7B8FF' },
          { v: '186', l: 'SESSIONS', s: 'avg 22min', c: '#B8F2D8' },
          { v: '14', l: 'DAY STREAK', s: '🔥 personal best', c: '#FFE89C' },
          { v: '11', l: 'BADGES', s: '+2 this week', c: '#FFB5B5' },
        ].map((s, i) => (
          <ComicCardDark key={i}>
            <CardLabel color={s.c}>{s.l}</CardLabel>
            <div style={{ fontFamily: 'Bangers, cursive', fontSize: 48, color: s.c, lineHeight: 1, marginTop: 4 }}>{s.v}</div>
            <div style={{ fontSize: 11, color: 'rgba(245,245,250,0.5)', marginTop: 4 }}>{s.s}</div>
          </ComicCardDark>
        ))}
      </div>

      {/* Chart + courses */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20, marginBottom: 20 }}>
        <ComicCardPaper color="#FFF8EA" style={{ padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontFamily: 'Bangers, cursive', fontSize: 14, letterSpacing: '0.15em', color: '#0B0B0F' }}>
              FOCUS MINUTES · LAST 14 DAYS
            </div>
            <div style={{ fontFamily: 'Permanent Marker, cursive', fontSize: 14, color: '#9B85F5', transform: 'rotate(-2deg)' }}>
              // trending up //
            </div>
          </div>
          <div style={{ display: 'flex', gap: 5, alignItems: 'flex-end', height: 180, padding: '0 4px' }}>
            {[45, 62, 30, 80, 55, 92, 48, 105, 70, 88, 60, 120, 95, 135].map((h, i) => {
              const max = 135;
              const pct = (h / max) * 100;
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ fontSize: 9, color: 'rgba(11,11,15,0.5)', fontFamily: 'Space Grotesk', fontWeight: 600 }}>
                    {h}
                  </div>
                  <div style={{
                    width: '100%', height: `${pct}%`,
                    background: i === 13 ? '#FFB5B5' : i >= 10 ? '#C7B8FF' : '#B8F2D8',
                    border: '2px solid #0B0B0F', borderRadius: 4, boxShadow: '2px 2px 0 #0B0B0F',
                    minHeight: 12,
                  }} />
                </div>
              );
            })}
          </div>
        </ComicCardPaper>

        <ComicCardDark>
          <CardLabel>COURSE PROGRESS</CardLabel>
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {courses.map((c, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                  <span style={{ color: '#F5F5FA', fontWeight: 500 }}>{c.n}</span>
                  <span style={{ fontFamily: 'Bangers, cursive', color: c.c, letterSpacing: '0.05em' }}>{c.pct}%</span>
                </div>
                <div style={{ height: 14, background: 'rgba(255,255,255,0.08)', border: '2px solid #0B0B0F', borderRadius: 8, overflow: 'hidden', position: 'relative' }}>
                  <div style={{ width: `${c.pct}%`, height: '100%', background: c.c, borderRight: c.pct < 100 ? '2px solid #0B0B0F' : 'none' }} />
                </div>
              </div>
            ))}
          </div>
        </ComicCardDark>
      </div>

      {/* Badges */}
      <ComicCardDark>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <CardLabel color="#FFE89C">BADGES · 11 OF 24</CardLabel>
          <div style={{ fontFamily: 'Bangers, cursive', fontSize: 18, color: '#FFE89C', transform: 'rotate(-4deg)' }}>
            COLLECT EM ALL!
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12 }}>
          {badges.map((b, i) => (
            <div key={i} style={{
              padding: 14, textAlign: 'center',
              background: b.earned ? b.c : b.c,
              border: '3px solid #0B0B0F',
              boxShadow: b.earned ? '4px 4px 0 #0B0B0F' : 'none',
              borderRadius: 12,
              opacity: b.earned ? 1 : 0.4,
            }}>
              <div style={{ fontSize: 32 }}>{b.icon}</div>
              <div style={{ fontFamily: 'Bangers, cursive', fontSize: 12, letterSpacing: '0.06em', color: b.earned ? '#0B0B0F' : '#F5F5FA', marginTop: 4 }}>
                {b.n.toUpperCase()}
              </div>
              {!b.earned && <div style={{ fontSize: 10, color: 'rgba(245,245,250,0.5)', marginTop: 2 }}>locked</div>}
            </div>
          ))}
        </div>
      </ComicCardDark>
    </PageShell>
  );
};

// ─────────────────────────────────────────────────────────────
// STUDY VAULT
// ─────────────────────────────────────────────────────────────
const VAULT_COPY = {
  pro: { title: 'study vault', sub: 'All your course materials, organized.' },
  genz: { title: 'the vault', sub: 'where all ur course chaos lives' },
};

const VaultDesktop = ({ tone = 'genz' }) => {
  const c = VAULT_COPY[tone];
  const semesters = ['Spring 2026', 'Fall 2025', 'Summer 2025'];
  const courses = [
    { n: 'Calculus II', code: 'MATH 201', files: 38, c: '#C7B8FF', prof: 'Dr. Kim' },
    { n: 'Organic Chemistry', code: 'CHEM 110', files: 52, c: '#B8F2D8', prof: 'Prof. Reyes' },
    { n: 'Psychology 101', code: 'PSYCH 101', files: 24, c: '#FFB5B5', prof: 'Dr. Chen' },
    { n: 'World History', code: 'HIST 205', files: 19, c: '#FFE89C', prof: 'Prof. Dubois' },
    { n: 'Data Structures', code: 'CS 220', files: 41, c: '#B8D9FF', prof: 'Dr. Patel' },
    { n: 'English Lit', code: 'ENGL 220', files: 15, c: '#C7B8FF', prof: 'Dr. Ahmed' },
  ];

  return (
    <PageShell active="vault">
      <PageHeader tag="VAULT · SPRING 2026" tagColor="#C7B8FF" title={c.title} subtitle={c.sub} />

      {/* Semester tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {semesters.map((s, i) => (
          <button key={i} style={{
            fontFamily: 'Bangers, cursive', fontSize: 14, letterSpacing: '0.1em',
            padding: '8px 18px',
            background: i === 0 ? '#C7B8FF' : 'transparent',
            border: '2px solid #0B0B0F', borderRadius: 18,
            boxShadow: i === 0 ? '3px 3px 0 #0B0B0F' : 'none',
            color: i === 0 ? '#0B0B0F' : '#F5F5FA',
            cursor: 'pointer',
          }}>{s.toUpperCase()}</button>
        ))}
      </div>

      {/* Courses grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {courses.map((co, i) => (
          <div key={i} style={{
            background: 'rgba(24, 24, 34, 0.6)',
            backdropFilter: 'blur(12px)',
            border: '3px solid #0B0B0F', boxShadow: '5px 5px 0 #0B0B0F',
            borderRadius: 16, overflow: 'hidden',
          }}>
            {/* Folder tab */}
            <div style={{ position: 'relative', background: co.c, padding: '14px 16px', borderBottom: '3px solid #0B0B0F' }}>
              <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(11,11,15,0.1) 1px, transparent 1.5px)', backgroundSize: '10px 10px', pointerEvents: 'none' }} />
              <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontFamily: 'Bangers, cursive', fontSize: 12, letterSpacing: '0.1em', color: 'rgba(11,11,15,0.6)' }}>{co.code}</div>
                  <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 18, color: '#0B0B0F', lineHeight: 1.2 }}>{co.n}</div>
                </div>
                <Chip color="#FFF8EA">{co.files} FILES</Chip>
              </div>
            </div>
            <div style={{ padding: 14 }}>
              <div style={{ fontSize: 12, color: 'rgba(245,245,250,0.6)', marginBottom: 10 }}>{co.prof}</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <Chip color="#FFF8EA">NOTES · {Math.floor(co.files * 0.4)}</Chip>
                <Chip color="#FFE89C">SLIDES · {Math.floor(co.files * 0.3)}</Chip>
                <Chip color="#B8F2D8">PDFS · {Math.floor(co.files * 0.3)}</Chip>
              </div>
              <button style={{
                width: '100%', marginTop: 12,
                fontFamily: 'Bangers, cursive', fontSize: 13, letterSpacing: '0.08em',
                padding: '8px', background: '#FFF8EA',
                border: '2px solid #0B0B0F', borderRadius: 10, boxShadow: '2px 2px 0 #0B0B0F',
                color: '#0B0B0F', cursor: 'pointer',
              }}>OPEN FOLDER →</button>
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
};

// ─────────────────────────────────────────────────────────────
// TIMETABLE
// ─────────────────────────────────────────────────────────────
const TIMETABLE_COPY = {
  pro: { title: 'timetable', sub: 'Your week at a glance.' },
  genz: { title: 'the schedule', sub: 'ur week, mapped out' },
};

const TimetableDesktop = ({ tone = 'genz' }) => {
  const c = TIMETABLE_COPY[tone];
  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
  const hours = [9, 10, 11, 12, 13, 14, 15, 16, 17];
  const events = [
    { d: 0, s: 9, e: 10.5, t: 'CALC II', loc: 'Room 204', c: '#C7B8FF' },
    { d: 0, s: 14, e: 15.5, t: 'CHEM LAB', loc: 'Lab 3', c: '#B8F2D8' },
    { d: 1, s: 10, e: 11.5, t: 'PSYCH 101', loc: 'Hall A', c: '#FFB5B5' },
    { d: 1, s: 13, e: 14, t: 'LUNCH + STUDY', loc: 'Library', c: '#FFE89C' },
    { d: 2, s: 9, e: 10.5, t: 'CALC II', loc: 'Room 204', c: '#C7B8FF' },
    { d: 2, s: 15, e: 16.5, t: 'HISTORY', loc: 'Room 118', c: '#FFE89C' },
    { d: 3, s: 11, e: 12.5, t: 'CS 220', loc: 'Tech Bldg', c: '#B8D9FF' },
    { d: 3, s: 14, e: 16, t: 'CHEM', loc: 'Hall B', c: '#B8F2D8' },
    { d: 4, s: 10, e: 11, t: 'OFFICE HRS', loc: 'Prof. Kim', c: '#C7B8FF' },
    { d: 4, s: 13, e: 15, t: 'DEEP WORK', loc: 'Library', c: '#FFB5B5' },
  ];

  return (
    <PageShell active="timetable">
      <PageHeader
        tag="WEEK OF APR 23" tagColor="#B8D9FF" title={c.title} subtitle={c.sub}
        right={
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{ ...weekNavBtn }}>‹ prev</button>
            <button style={{ ...weekNavBtn, background: '#C7B8FF' }}>this week</button>
            <button style={{ ...weekNavBtn }}>next ›</button>
          </div>
        }
      />

      <ComicCardPaper color="#FFF8EA" style={{ padding: 16, position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 16, backgroundImage: 'radial-gradient(circle, rgba(11,11,15,0.06) 1px, transparent 1.5px)', backgroundSize: '12px 12px', pointerEvents: 'none', borderRadius: 12 }} />
        <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '50px repeat(5, 1fr)', gap: 6 }}>
          {/* Header row */}
          <div />
          {days.map((d, i) => (
            <div key={i} style={{
              fontFamily: 'Bangers, cursive', fontSize: 16, letterSpacing: '0.1em',
              textAlign: 'center', padding: '8px 0', color: '#0B0B0F',
              background: i === 0 ? '#FFE89C' : '#fff',
              border: '2.5px solid #0B0B0F', borderRadius: 10,
              boxShadow: '2px 2px 0 #0B0B0F',
            }}>
              {d}
              <div style={{ fontSize: 12, color: 'rgba(11,11,15,0.6)', marginTop: 2 }}>{23 + i}</div>
            </div>
          ))}

          {/* Time grid */}
          {hours.map((h) => (
            <React.Fragment key={h}>
              <div style={{ fontFamily: 'Space Grotesk', fontWeight: 600, fontSize: 11, color: 'rgba(11,11,15,0.5)', padding: '8px 4px', textAlign: 'right' }}>
                {h}:00
              </div>
              {days.map((_, di) => {
                const ev = events.find((e) => e.d === di && e.s === h);
                const inside = events.find((e) => e.d === di && e.s < h && e.e > h);
                if (ev) {
                  const height = (ev.e - ev.s) * 44;
                  return (
                    <div key={di} style={{
                      background: ev.c,
                      border: '2.5px solid #0B0B0F', borderRadius: 10,
                      boxShadow: '2px 2px 0 #0B0B0F',
                      padding: '6px 8px',
                      gridRow: `span ${Math.ceil(ev.e - ev.s)}`,
                      minHeight: height,
                      color: '#0B0B0F',
                    }}>
                      <div style={{ fontFamily: 'Bangers, cursive', fontSize: 13, letterSpacing: '0.05em', lineHeight: 1.1 }}>
                        {ev.t}
                      </div>
                      <div style={{ fontSize: 10, opacity: 0.7, marginTop: 2 }}>{ev.loc}</div>
                      <div style={{ fontSize: 10, opacity: 0.6 }}>{ev.s}:00 – {Math.floor(ev.e)}:{ev.e % 1 ? '30' : '00'}</div>
                    </div>
                  );
                }
                if (inside) return null;
                return <div key={di} style={{ minHeight: 40, border: '1.5px dashed rgba(11,11,15,0.12)', borderRadius: 6 }} />;
              })}
            </React.Fragment>
          ))}
        </div>
      </ComicCardPaper>
    </PageShell>
  );
};

const weekNavBtn = {
  fontFamily: 'Bangers, cursive', fontSize: 13, letterSpacing: '0.08em',
  padding: '6px 14px', background: 'transparent',
  border: '2px solid #0B0B0F', borderRadius: 18,
  color: '#F5F5FA', cursor: 'pointer',
};

// ─────────────────────────────────────────────────────────────
// EXAMS
// ─────────────────────────────────────────────────────────────
const EXAMS_COPY = {
  pro: { title: 'exams', sub: 'Countdown to every test.', addBtn: 'ADD EXAM' },
  genz: { title: 'exam szn', sub: 'tick tock it\'s boss battle time', addBtn: 'ADD BOSS' },
};

const ExamsDesktop = ({ tone = 'genz' }) => {
  const c = EXAMS_COPY[tone];
  const exams = [
    { s: 'Calculus II', t: 'Midterm', date: 'Thu Apr 30', days: 7, time: '9:00 AM', loc: 'Hall C · Seat 42', c: '#FFB5B5', prep: 65 },
    { s: 'Organic Chem', t: 'Quiz 3', date: 'Mon May 4', days: 11, time: '11:00 AM', loc: 'Lab 3', c: '#FFE89C', prep: 40 },
    { s: 'Psych 101', t: 'Final', date: 'Wed May 20', days: 27, time: '2:00 PM', loc: 'Hall A', c: '#B8F2D8', prep: 20 },
    { s: 'History', t: 'Essay due', date: 'Fri May 22', days: 29, time: '11:59 PM', loc: 'Online', c: '#B8D9FF', prep: 10 },
  ];

  return (
    <PageShell active="exams">
      <PageHeader
        tag="EXAMS · 4 UPCOMING" tagColor="#FFB5B5" title={c.title} subtitle={c.sub}
        right={<button style={{
          fontFamily: 'Bangers, cursive', fontSize: 16, letterSpacing: '0.08em',
          padding: '8px 18px', background: '#FFB5B5',
          border: '3px solid #0B0B0F', borderRadius: 12, boxShadow: '3px 3px 0 #0B0B0F',
          color: '#0B0B0F', cursor: 'pointer',
        }}>+ {c.addBtn}</button>}
      />

      {/* Next exam hero */}
      <ComicCardPaper color="#FFB5B5" style={{ padding: 24, marginBottom: 20, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(11,11,15,0.1) 1px, transparent 1.5px)', backgroundSize: '10px 10px', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{
            width: 140, height: 140,
            background: '#FFF8EA', border: '4px solid #0B0B0F', borderRadius: 20, boxShadow: '5px 5px 0 #0B0B0F',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ fontFamily: 'Bangers, cursive', fontSize: 72, color: '#0B0B0F', lineHeight: 1 }}>7</div>
            <div style={{ fontFamily: 'Bangers, cursive', fontSize: 14, letterSpacing: '0.15em', color: '#0B0B0F' }}>DAYS</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Bangers, cursive', fontSize: 13, letterSpacing: '0.15em', color: 'rgba(11,11,15,0.7)' }}>
              NEXT UP · {tone === 'genz' ? 'BOSS FIGHT' : 'IMPORTANT'}
            </div>
            <div style={{ fontFamily: 'Bangers, cursive', fontSize: 44, letterSpacing: '0.02em', color: '#0B0B0F', lineHeight: 1, margin: '4px 0' }}>
              CALC II · MIDTERM
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <Chip color="#FFF8EA">THU APR 30</Chip>
              <Chip color="#FFE89C">9:00 AM</Chip>
              <Chip color="#FFF8EA">HALL C</Chip>
            </div>
            <div style={{ fontFamily: 'Permanent Marker, cursive', fontSize: 18, color: '#9B85F5', marginTop: 14, transform: 'rotate(-1.5deg)' }}>
              {tone === 'genz' ? '"go study RIGHT NOW bestie"' : '"Prep is at 65%. Keep pushing."'}
            </div>
          </div>
          <div style={{ position: 'absolute', top: 16, right: 20, transform: 'rotate(8deg)' }}>
            <div style={{
              fontFamily: 'Bangers, cursive', fontSize: 36,
              color: '#0B0B0F', WebkitTextStroke: '1px #0B0B0F',
              textShadow: '3px 3px 0 #FFF8EA',
            }}>
              TICK TICK!
            </div>
          </div>
        </div>
      </ComicCardPaper>

      {/* All exams list */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {exams.map((e, i) => (
          <ComicCardDark key={i} style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 64, height: 64,
                background: e.c, border: '3px solid #0B0B0F', borderRadius: 12, boxShadow: '3px 3px 0 #0B0B0F',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <div style={{ fontFamily: 'Bangers, cursive', fontSize: 26, color: '#0B0B0F', lineHeight: 1 }}>{e.days}</div>
                <div style={{ fontSize: 9, color: '#0B0B0F', letterSpacing: '0.1em' }}>DAYS</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16, color: '#F5F5FA' }}>
                  {e.s} · <span style={{ color: e.c }}>{e.t}</span>
                </div>
                <div style={{ fontSize: 12, color: 'rgba(245,245,250,0.6)', marginTop: 2 }}>
                  {e.date} · {e.time} · {e.loc}
                </div>
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
                    <span style={{ color: 'rgba(245,245,250,0.55)', letterSpacing: '0.1em' }}>PREP</span>
                    <span style={{ fontFamily: 'Bangers, cursive', color: e.c }}>{e.prep}%</span>
                  </div>
                  <div style={{ height: 10, background: 'rgba(255,255,255,0.08)', border: '2px solid #0B0B0F', borderRadius: 6, overflow: 'hidden' }}>
                    <div style={{ width: `${e.prep}%`, height: '100%', background: e.c }} />
                  </div>
                </div>
              </div>
            </div>
          </ComicCardDark>
        ))}
      </div>
    </PageShell>
  );
};

Object.assign(window, { JournalDesktop, ProgressDesktop, VaultDesktop, TimetableDesktop, ExamsDesktop });

// StudyZoneDesktop.jsx — Desktop Study Zone using shared PageShell

const COPY_SZ = {
  pro: {
    greeting: 'Focus Session', subtitle: 'Lock in. 25 minutes of deep work.',
    startBtn: 'START FOCUS', pauseBtn: 'PAUSE', resumeBtn: 'RESUME', resetBtn: 'RESET',
    tasksTitle: 'Current Task', taskLabel: 'Calculus — Chapter 7 problem set',
    sessionLabel: 'Session',
    mascotIdle: 'Ready when you are.', mascotFocus: 'Deep focus activated.',
    mascotBreak: 'Break time. Well done.', mascotCelebrate: 'Session complete!',
    statsTodayLabel: 'Today', statsWeekLabel: 'This week',
    ambientTitle: 'Ambient Sound',
    modes: ['Focus · 25m', 'Short break · 5m', 'Long break · 15m'],
    ambients: ['Lo-fi café', 'Rain', 'Forest', 'Silence'],
    quoteTitle: 'Note to self', quote: 'Small blocks. Real progress.',
  },
  genz: {
    greeting: 'lock in era', subtitle: 'bestie we going 25 min no thoughts just grind',
    startBtn: 'LOCK IN', pauseBtn: 'HOLD UP', resumeBtn: 'BACK ON', resetBtn: 'REDO',
    tasksTitle: 'current mission', taskLabel: 'calc ch 7 (it\'s giving homework 💀)',
    sessionLabel: 'session',
    mascotIdle: 'lets cook 🧑‍🍳', mascotFocus: 'shhh im locked in',
    mascotBreak: 'touch grass real quick', mascotCelebrate: 'WE ATE THAT!!!',
    statsTodayLabel: 'today', statsWeekLabel: 'this week',
    ambientTitle: 'vibes',
    modes: ['deep lock in · 25m', 'lil break · 5m', 'big break · 15m'],
    ambients: ['lofi café', 'rain asmr', 'forest core', 'dead silence'],
    quoteTitle: 'affirmation', quote: 'you got this no cap',
  },
};

const StudyZoneDesktop = ({ tone = 'genz' }) => {
  const copy = COPY_SZ[tone];
  const { PageShell, PageHeader, ComicCardDark, ComicCardPaper, CardLabel, Chip } = window;
  const [running, setRunning] = React.useState(false);
  const [seconds, setSeconds] = React.useState(25 * 60);
  const [totalSeconds, setTotalSeconds] = React.useState(25 * 60);
  const [mode, setMode] = React.useState(0);
  const [ambient, setAmbient] = React.useState(0);
  const [celebrated, setCelebrated] = React.useState(false);

  React.useEffect(() => {
    const durations = [25 * 60, 5 * 60, 15 * 60];
    setSeconds(durations[mode]);
    setTotalSeconds(durations[mode]);
    setRunning(false);
    setCelebrated(false);
  }, [mode]);

  React.useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) { setRunning(false); setCelebrated(true); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running]);

  const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');
  const progress = 1 - seconds / totalSeconds;
  const mascotState = celebrated ? 'celebrate' : running ? 'focus' : mode > 0 ? 'break' : 'idle';
  const mascotMsg = celebrated ? copy.mascotCelebrate : running ? copy.mascotFocus : mode > 0 ? copy.mascotBreak : copy.mascotIdle;

  const handleStart = () => {
    if (seconds === 0) { setSeconds(totalSeconds); setCelebrated(false); }
    setRunning((r) => !r);
  };
  const handleReset = () => { setSeconds(totalSeconds); setRunning(false); setCelebrated(false); };

  const R = 140;
  const C = 2 * Math.PI * R;

  return (
    <window.PageShell active="zone">
      <window.PageHeader
        tag={`${copy.sessionLabel.toUpperCase()} 03 · MON`} tagColor="#B8F2D8"
        title={copy.greeting} subtitle={copy.subtitle}
        right={
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={szs.statPill}>
              <div style={{ fontSize: 10, letterSpacing: '0.12em', color: 'rgba(245,245,250,0.55)' }}>
                {copy.statsTodayLabel.toUpperCase()}
              </div>
              <div style={{ fontFamily: 'Bangers, cursive', fontSize: 28, color: '#B8F2D8' }}>2h 15m</div>
            </div>
            <div style={szs.statPill}>
              <div style={{ fontSize: 10, letterSpacing: '0.12em', color: 'rgba(245,245,250,0.55)' }}>
                {copy.statsWeekLabel.toUpperCase()}
              </div>
              <div style={{ fontFamily: 'Bangers, cursive', fontSize: 28, color: '#C7B8FF' }}>14h 40m</div>
            </div>
          </div>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Timer card */}
        <window.ComicCardPaper color="#FFF8EA" style={{ padding: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
              {copy.modes.map((m, i) => (
                <button key={i} onClick={() => setMode(i)}
                  style={{ ...szs.modeBtn, ...(i === mode ? szs.modeBtnActive : {}) }}>
                  {m}
                </button>
              ))}
            </div>

            <div style={{ position: 'relative', width: 320, height: 320 }}>
              <svg viewBox="0 0 320 320" width="320" height="320" style={{ position: 'absolute', inset: 0 }}>
                <defs>
                  <pattern id="dots-timer" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                    <circle cx="2" cy="2" r="1.2" fill="rgba(11,11,15,0.12)" />
                  </pattern>
                </defs>
                <circle cx="160" cy="160" r="150" fill="#FFF8EA" stroke="#0B0B0F" strokeWidth="4" />
                <circle cx="160" cy="160" r="150" fill="url(#dots-timer)" />
                <circle cx="160" cy="160" r={R} fill="none" stroke="rgba(11,11,15,0.12)" strokeWidth="16" />
                <circle cx="160" cy="160" r={R} fill="none" stroke="#C7B8FF" strokeWidth="16"
                  strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - progress)}
                  transform="rotate(-90 160 160)" style={{ transition: 'stroke-dashoffset 0.5s linear' }} />
              </svg>
              <div style={szs.timerCenter}>
                <div style={{ fontFamily: 'Bangers, cursive', fontSize: 88, letterSpacing: '0.05em', color: '#0B0B0F', lineHeight: 1 }}>
                  {mins}:{secs}
                </div>
                <div style={{ fontFamily: 'Permanent Marker, cursive', fontSize: 14, color: '#9B85F5', marginTop: 8, transform: 'rotate(-2deg)' }}>
                  {running ? '// in the zone //' : seconds === 0 ? '// done! //' : '// press start //'}
                </div>
              </div>
              {celebrated && (
                <div style={szs.powSticker}>
                  <div style={{ fontFamily: 'Bangers, cursive', fontSize: 36, color: '#0B0B0F', lineHeight: 1 }}>POW!</div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handleStart} style={szs.primaryBtn}>
                {seconds === 0 ? copy.startBtn : running ? copy.pauseBtn : seconds < totalSeconds ? copy.resumeBtn : copy.startBtn}
              </button>
              <button onClick={handleReset} style={szs.secondaryBtn}>{copy.resetBtn}</button>
            </div>
          </div>
        </window.ComicCardPaper>

        {/* Right col */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <window.ComicCardPaper color="#FFF8EA" style={{ padding: 18 }}>
            <div style={szs.speechBubble}>
              {mascotMsg}
              <div style={szs.speechTail} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: -4 }}>
              <window.Mascot state={mascotState} size={160} />
            </div>
            <div style={{ textAlign: 'center', marginTop: 6, color: '#0B0B0F' }}>
              <span style={{ fontFamily: 'Bangers, cursive', letterSpacing: '0.06em', fontSize: 18 }}>BEANIE</span>
              <span style={{ fontSize: 11, color: 'rgba(11,11,15,0.55)', marginLeft: 6 }}>· your study buddy</span>
            </div>
          </window.ComicCardPaper>

          <window.ComicCardDark>
            <window.CardLabel>{copy.tasksTitle.toUpperCase()}</window.CardLabel>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
              <div style={szs.checkbox} />
              <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 17, fontWeight: 600, color: '#F5F5FA' }}>
                {copy.taskLabel}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
              <window.Chip>MATH 201</window.Chip>
              <window.Chip color="#FFB5B5">DUE THU</window.Chip>
              <window.Chip color="#B8F2D8">HIGH</window.Chip>
            </div>
          </window.ComicCardDark>

          <window.ComicCardDark>
            <window.CardLabel>{copy.ambientTitle.toUpperCase()}</window.CardLabel>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 10 }}>
              {copy.ambients.map((a, i) => (
                <button key={i} onClick={() => setAmbient(i)}
                  style={{ ...szs.ambientBtn, ...(i === ambient ? szs.ambientBtnActive : {}) }}>
                  {a}
                </button>
              ))}
            </div>
          </window.ComicCardDark>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 20 }}>
        <window.ComicCardPaper color="#FFE89C" style={{ padding: 20, transform: 'rotate(-1deg)' }}>
          <div style={{ fontSize: 10, letterSpacing: '0.15em', color: 'rgba(11,11,15,0.55)' }}>
            {copy.quoteTitle.toUpperCase()}
          </div>
          <div style={{ fontFamily: 'Permanent Marker, cursive', fontSize: 26, color: '#0B0B0F', marginTop: 6, lineHeight: 1.2 }}>
            "{copy.quote}"
          </div>
        </window.ComicCardPaper>
        <window.ComicCardDark>
          <window.CardLabel>RECENT SESSIONS</window.CardLabel>
          <div style={{ display: 'flex', gap: 8, marginTop: 10, alignItems: 'flex-end', height: 60 }}>
            {[32, 52, 28, 68, 45, 80, 55].map((h, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ width: '100%', height: `${h}%`,
                  background: i === 5 ? '#C7B8FF' : i === 6 ? '#FFB5B5' : '#B8F2D8',
                  border: '2px solid #0B0B0F', borderRadius: 4, boxShadow: '2px 2px 0 #0B0B0F' }} />
                <div style={{ fontSize: 10, color: 'rgba(245,245,250,0.5)', fontFamily: 'Bangers, cursive', letterSpacing: '0.1em' }}>
                  {['M','T','W','T','F','S','S'][i]}
                </div>
              </div>
            ))}
          </div>
        </window.ComicCardDark>
      </div>
    </window.PageShell>
  );
};

const szs = {
  statPill: {
    background: 'rgba(18, 18, 26, 0.6)', backdropFilter: 'blur(12px)',
    border: '3px solid #0B0B0F', boxShadow: '3px 3px 0 #0B0B0F',
    borderRadius: 14, padding: '8px 14px', minWidth: 110,
  },
  modeBtn: {
    fontFamily: 'Space Grotesk, sans-serif', fontSize: 12, fontWeight: 600,
    padding: '6px 14px', border: '2px solid #0B0B0F', borderRadius: 20,
    background: 'transparent', color: '#0B0B0F', cursor: 'pointer',
  },
  modeBtnActive: { background: '#C7B8FF', boxShadow: '2px 2px 0 #0B0B0F' },
  timerCenter: {
    position: 'absolute', inset: 0,
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  },
  powSticker: {
    position: 'absolute', top: -10, right: -20,
    background: '#FFE89C', border: '4px solid #0B0B0F', boxShadow: '4px 4px 0 #0B0B0F',
    padding: '8px 14px', borderRadius: 12, transform: 'rotate(10deg)',
  },
  primaryBtn: {
    fontFamily: 'Bangers, cursive', fontSize: 22, letterSpacing: '0.06em',
    padding: '12px 32px', background: '#C7B8FF',
    border: '3px solid #0B0B0F', borderRadius: 14, boxShadow: '4px 4px 0 #0B0B0F',
    color: '#0B0B0F', cursor: 'pointer',
  },
  secondaryBtn: {
    fontFamily: 'Bangers, cursive', fontSize: 18, letterSpacing: '0.06em',
    padding: '12px 24px', background: '#FFF8EA',
    border: '3px solid #0B0B0F', borderRadius: 14, boxShadow: '4px 4px 0 #0B0B0F',
    color: '#0B0B0F', cursor: 'pointer',
  },
  speechBubble: {
    background: '#fff', border: '3px solid #0B0B0F', borderRadius: 14,
    padding: '8px 14px', fontFamily: 'Bangers, cursive', fontSize: 18, letterSpacing: '0.04em',
    color: '#0B0B0F', textAlign: 'center', boxShadow: '3px 3px 0 #0B0B0F',
    position: 'relative', marginBottom: 18,
  },
  speechTail: {
    position: 'absolute', left: '50%', bottom: -10, width: 16, height: 16,
    background: '#fff', borderRight: '3px solid #0B0B0F', borderBottom: '3px solid #0B0B0F',
    transform: 'translateX(-50%) rotate(45deg)',
  },
  checkbox: {
    width: 22, height: 22, background: '#FFF8EA',
    border: '2.5px solid #0B0B0F', borderRadius: 6, boxShadow: '2px 2px 0 #0B0B0F',
    flexShrink: 0,
  },
  ambientBtn: {
    fontFamily: 'Space Grotesk, sans-serif', fontSize: 12, fontWeight: 600,
    padding: '8px 10px', background: 'rgba(255,255,255,0.04)',
    border: '2px solid #0B0B0F', borderRadius: 8, color: '#F5F5FA', cursor: 'pointer',
  },
  ambientBtnActive: { background: '#B8F2D8', color: '#0B0B0F', boxShadow: '2px 2px 0 #0B0B0F' },
};

window.StudyZoneDesktop = StudyZoneDesktop;

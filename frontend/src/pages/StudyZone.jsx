import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { HiArrowLeft, HiPlay, HiClock, HiLightningBolt, HiLockClosed } from 'react-icons/hi';
import { useStudyTimer } from '../contexts/StudyTimerContext';
import { useTheme } from '../contexts/ThemeContext';
import GlareHover from '../components/GlareHover';
import TrueFocus from '../components/TrueFocus';
import './StudyZone.css';

const PRESETS = [
    { label: '25 min', minutes: 25 },
    { label: '45 min', minutes: 45 },
    { label: '60 min', minutes: 60 },
    { label: 'Unlimited', minutes: 0 },
];

const containerVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const itemVariants = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
};

// ─── MODE SELECTION ─────────────────────────────────────────
function ModeSelect({ onSelect, isActive }) {
    const [deepHovered, setDeepHovered] = useState(false);
    const [casualHovered, setCasualHovered] = useState(false);
    const { tone } = useTheme();
    const isPro = tone === 'pro';

    return (
        <motion.div
            className="page container studyzone-page"
            variants={containerVariants}
            initial="initial"
            animate="animate"
        >
            <motion.h1 className="sz-main-title" variants={itemVariants}>
                {isPro ? 'Study Zone' : 'the study zone'}
            </motion.h1>
            <motion.p className="sz-subtitle" variants={itemVariants}>
                {isActive ? (isPro ? 'A study session is in progress.' : 'session in progress bestie.') : (isPro ? 'Choose your study mode' : 'pick your vibe')}
            </motion.p>

            {!isActive && (
                <div className="sz-mode-grid sz-mode-grid-3">
                    <motion.div
                        variants={itemVariants}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSelect('casual')}
                        onMouseEnter={() => setCasualHovered(true)}
                        onMouseLeave={() => setCasualHovered(false)}
                    >
                        <GlareHover
                            width="100%"
                            height="100%"
                            background="transparent"
                            borderRadius="var(--radius-2xl)"
                            borderColor="transparent"
                            glareColor="#3B82F6"
                            glareOpacity={0.4}
                            glareAngle={-30}
                            glareSize={300}
                            transitionDuration={2000}
                            playOnce
                            className={`sz-mode-card casual ${casualHovered ? 'is-hovered' : ''}`}
                        >
                            <div className="sz-mode-card-inner">
                                <div className="sz-mode-icon-wrap casual">
                                    <HiClock size={32} />
                                </div>
                                <h2>Casual Study</h2>
                                <p>Flexible timer with preset or unlimited duration. Navigate freely while studying.</p>
                                <div className="sz-mode-tags">
                                    <span>Flexible</span>
                                    <span>Pausable</span>
                                    <span>Relaxed</span>
                                </div>
                            </div>
                        </GlareHover>
                    </motion.div>

                    <motion.div
                        variants={itemVariants}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSelect('pomodoro')}
                    >
                        <div className="sz-mode-card pomodoro">
                            <div className="sz-mode-icon-wrap pomodoro">
                                <span style={{ fontSize: '32px' }}>🍅</span>
                            </div>
                            <h2>Pomodoro</h2>
                            <p>Work in focused intervals with scheduled breaks. The proven technique for deep productivity.</p>
                            <div className="sz-mode-tags">
                                <span>25/5 Cycles</span>
                                <span>Auto-Break</span>
                                <span>Proven</span>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        variants={itemVariants}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSelect('deep')}
                        className="sz-deep-card-wrapper"
                        onMouseEnter={() => setDeepHovered(true)}
                        onMouseLeave={() => setDeepHovered(false)}
                    >
                        <div className="sz-mode-card deep">
                            <div className="sz-mode-icon-wrap deep">
                                <HiLightningBolt size={32} />
                            </div>
                            <div className="sz-deep-title">
                                <TrueFocus
                                    sentence="Deep Study"
                                    manualMode={false}
                                    blurAmount={4}
                                    borderColor="#A855F7"
                                    glowColor="rgba(168, 85, 247, 0.6)"
                                    animationDuration={0.5}
                                    pauseBetweenAnimations={1}
                                    active={deepHovered}
                                />
                            </div>
                            <p>Focused timer with exit protection. Browse your notes while staying on track.</p>
                            <div className="sz-mode-tags">
                                <span>Focused</span>
                                <span>Protected</span>
                                <span>Intense</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
}

// ─── CASUAL SETUP ───────────────────────────────────────────
function CasualSetup({ onBack, onStart }) {
    const [preset, setPreset] = useState(null);
    const [subject, setSubject] = useState('');

    const handleStart = () => {
        onStart({
            mode: 'casual',
            subject,
            totalSeconds: preset.minutes * 60,
            isUnlimited: preset.minutes === 0,
        });
    };

    return (
        <motion.div
            className="page container studyzone-page"
            variants={containerVariants}
            initial="initial"
            animate="animate"
        >
            <motion.div className="sz-header" variants={itemVariants}>
                <motion.button className="btn btn-ghost sz-back" onClick={onBack} whileHover={{ x: -3 }} whileTap={{ scale: 0.95 }}>
                    <HiArrowLeft size={20} /> <span>Back</span>
                </motion.button>
                <h1 className="sz-page-title"><HiClock size={24} /> Casual Study</h1>
                <div style={{ width: 90 }} />
            </motion.div>

            <motion.div className="sz-setup-card" variants={itemVariants}>
                <label className="sz-label">Duration</label>
                <div className="sz-presets">
                    {PRESETS.map(p => (
                        <motion.button
                            key={p.label}
                            className={`sz-preset-btn ${preset === p ? 'active' : ''}`}
                            onClick={() => setPreset(p)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {p.label}
                        </motion.button>
                    ))}
                </div>

                <label className="sz-label">Subject <span className="sz-optional">(optional)</span></label>
                <input
                    type="text"
                    className="sz-input"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder="e.g. Mathematics, Physics..."
                />

                <motion.button
                    className="btn btn-primary sz-start-btn"
                    onClick={handleStart}
                    disabled={!preset}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                >
                    <HiPlay size={20} /> Start Studying
                </motion.button>
            </motion.div>
        </motion.div>
    );
}

// ─── POMODORO SETUP ─────────────────────────────────────────
function PomodoroSetup({ onBack, onStart }) {
    const [workMin, setWorkMin] = useState(25);
    const [breakMin, setBreakMin] = useState(5);
    const [longBreakMin, setLongBreakMin] = useState(15);
    const [cycles, setCycles] = useState(4);
    const [subject, setSubject] = useState('');

    const handleStart = () => {
        onStart({
            mode: 'pomodoro',
            subject,
            workSeconds: workMin * 60,
            breakSeconds: breakMin * 60,
            longBreakSeconds: longBreakMin * 60,
            totalCycles: cycles,
        });
    };

    return (
        <motion.div
            className="page container studyzone-page"
            variants={containerVariants}
            initial="initial"
            animate="animate"
        >
            <motion.div className="sz-header" variants={itemVariants}>
                <motion.button className="btn btn-ghost sz-back" onClick={onBack} whileHover={{ x: -3 }} whileTap={{ scale: 0.95 }}>
                    <HiArrowLeft size={20} /> <span>Back</span>
                </motion.button>
                <h1 className="sz-page-title">🍅 Pomodoro</h1>
                <div style={{ width: 90 }} />
            </motion.div>

            <motion.div className="sz-setup-card" variants={itemVariants}>
                <label className="sz-label">Work Duration (minutes)</label>
                <div className="sz-duration-slider">
                    <input type="range" min="10" max="60" step="5" value={workMin} onChange={e => setWorkMin(Number(e.target.value))} className="sz-slider" />
                    <span className="sz-slider-value">{workMin} min</span>
                </div>

                <label className="sz-label">Short Break (minutes)</label>
                <div className="sz-duration-slider">
                    <input type="range" min="1" max="15" step="1" value={breakMin} onChange={e => setBreakMin(Number(e.target.value))} className="sz-slider" />
                    <span className="sz-slider-value">{breakMin} min</span>
                </div>

                <label className="sz-label">Long Break (minutes)</label>
                <div className="sz-duration-slider">
                    <input type="range" min="5" max="30" step="5" value={longBreakMin} onChange={e => setLongBreakMin(Number(e.target.value))} className="sz-slider" />
                    <span className="sz-slider-value">{longBreakMin} min</span>
                </div>

                <label className="sz-label">Number of Cycles</label>
                <div className="sz-presets">
                    {[2, 3, 4, 6, 8].map(c => (
                        <motion.button
                            key={c}
                            className={`sz-preset-btn ${cycles === c ? 'active' : ''}`}
                            onClick={() => setCycles(c)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {c}
                        </motion.button>
                    ))}
                </div>

                <label className="sz-label">Subject <span className="sz-optional">(optional)</span></label>
                <input
                    type="text"
                    className="sz-input"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder="e.g. Mathematics, Physics..."
                />

                <div className="sz-pomodoro-preview">
                    <span>🍅</span>
                    <span>Total: ~{Math.round((workMin * cycles + breakMin * (cycles - 1) + (cycles >= 4 ? longBreakMin : 0)) )} min</span>
                </div>

                <motion.button
                    className="btn btn-primary sz-start-btn pomodoro-btn"
                    onClick={handleStart}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                >
                    🍅 Start Pomodoro
                </motion.button>
            </motion.div>
        </motion.div>
    );
}

// ─── DEEP SETUP ─────────────────────────────────────────────
function DeepSetup({ onBack, onStart }) {
    const [duration, setDuration] = useState(25);
    const [exitDelay, setExitDelay] = useState(5);
    const [subject, setSubject] = useState('');

    const handleStart = () => {
        onStart({
            mode: 'deep',
            subject,
            totalSeconds: duration * 60,
            isUnlimited: false,
            exitDelay,
        });
    };

    return (
        <motion.div
            className="page container studyzone-page"
            variants={containerVariants}
            initial="initial"
            animate="animate"
        >
            <motion.div className="sz-header" variants={itemVariants}>
                <motion.button className="btn btn-ghost sz-back" onClick={onBack} whileHover={{ x: -3 }} whileTap={{ scale: 0.95 }}>
                    <HiArrowLeft size={20} /> <span>Back</span>
                </motion.button>
                <h1 className="sz-page-title"><HiLightningBolt size={24} /> Deep Study</h1>
                <div style={{ width: 90 }} />
            </motion.div>

            <motion.div className="sz-setup-card" variants={itemVariants}>
                <label className="sz-label">Duration (minutes)</label>
                <div className="sz-duration-slider">
                    <input
                        type="range"
                        min="5"
                        max="180"
                        step="5"
                        value={duration}
                        onChange={e => setDuration(Number(e.target.value))}
                        className="sz-slider"
                    />
                    <span className="sz-slider-value">{duration} min</span>
                </div>

                <label className="sz-label">Exit delay (minutes)</label>
                <p className="sz-hint">You cannot stop the session before this time passes.</p>
                <div className="sz-duration-slider">
                    <input
                        type="range"
                        min="5"
                        max="10"
                        step="1"
                        value={exitDelay}
                        onChange={e => setExitDelay(Number(e.target.value))}
                        className="sz-slider"
                    />
                    <span className="sz-slider-value">{exitDelay} min</span>
                </div>

                <label className="sz-label">Subject <span className="sz-optional">(optional)</span></label>
                <input
                    type="text"
                    className="sz-input"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder="e.g. Mathematics, Physics..."
                />

                <div className="sz-deep-warning">
                    <HiLockClosed size={16} />
                    <span>Deep Study locks the stop button until the exit delay passes. You can still navigate the app.</span>
                </div>

                <motion.button
                    className="btn btn-primary sz-start-btn deep"
                    onClick={handleStart}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                >
                    <HiLightningBolt size={20} /> Enter Deep Study
                </motion.button>
            </motion.div>
        </motion.div>
    );
}

// ─── MAIN STUDY ZONE ────────────────────────────────────────
export default function StudyZone() {
    const [mode, setMode] = useState(null); // null | 'casual' | 'deep' | 'pomodoro'
    const { isActive, startSession } = useStudyTimer();
    const navigate = useNavigate();

    const handleStart = (config) => {
        startSession(config);
        setMode(null);
        navigate('/notes');
    };

    if (isActive || !mode) return <ModeSelect onSelect={setMode} isActive={isActive} />;
    if (mode === 'casual') return <CasualSetup onBack={() => setMode(null)} onStart={handleStart} />;
    if (mode === 'pomodoro') return <PomodoroSetup onBack={() => setMode(null)} onStart={handleStart} />;
    if (mode === 'deep') return <DeepSetup onBack={() => setMode(null)} onStart={handleStart} />;
}

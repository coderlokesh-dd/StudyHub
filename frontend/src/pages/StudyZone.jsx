import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { HiArrowLeft, HiPlay, HiClock, HiLightningBolt, HiLockClosed } from 'react-icons/hi';
import { useStudyTimer } from '../contexts/StudyTimerContext';
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

    return (
        <motion.div
            className="page container studyzone-page"
            variants={containerVariants}
            initial="initial"
            animate="animate"
        >
            <motion.h1 className="sz-main-title" variants={itemVariants}>
                Study Zone
            </motion.h1>
            <motion.p className="sz-subtitle" variants={itemVariants}>
                {isActive ? 'A study session is in progress. Use the timer in the top-right corner.' : 'Choose your study mode'}
            </motion.p>

            {!isActive && (
                <div className="sz-mode-grid">
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
    const [mode, setMode] = useState(null); // null | 'casual' | 'deep'
    const { isActive, startSession } = useStudyTimer();
    const navigate = useNavigate();

    const handleStart = (config) => {
        startSession(config);
        setMode(null);
        navigate('/notes'); // Send them to notes so they can study
    };

    if (isActive || !mode) return <ModeSelect onSelect={setMode} isActive={isActive} />;
    if (mode === 'casual') return <CasualSetup onBack={() => setMode(null)} onStart={handleStart} />;
    if (mode === 'deep') return <DeepSetup onBack={() => setMode(null)} onStart={handleStart} />;
}

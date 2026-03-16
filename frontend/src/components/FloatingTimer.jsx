import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiPlay, HiPause, HiStop, HiClock, HiLightningBolt, HiX, HiCheck, HiExclamation } from 'react-icons/hi';
import { useStudyTimer } from '../contexts/StudyTimerContext';
import { useNavigate } from 'react-router-dom';
import './FloatingTimer.css';

function formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatMinutes(totalSeconds) {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    if (mins === 0) return `${secs}s`;
    if (secs === 0) return `${mins}m`;
    return `${mins}m ${secs}s`;
}

export default function FloatingTimer() {
    const {
        session, status, elapsed, isActive, fullscreenWarning,
        pause, resume, stop, saveAndEnd, discard, dismissFullscreenWarning,
    } = useStudyTimer();
    const [expanded, setExpanded] = useState(false);
    const navigate = useNavigate();

    if (!isActive) return null;

    const isDeep = session?.mode === 'deep';
    const isUnlimited = session?.isUnlimited;
    const totalSeconds = session?.totalSeconds || 0;
    const remaining = totalSeconds - elapsed;
    const progress = !isUnlimited && totalSeconds > 0 ? Math.min(elapsed / totalSeconds, 1) : 0;
    const isDone = status === 'done';

    const displayTime = isDone
        ? formatMinutes(elapsed)
        : isUnlimited
            ? formatTime(elapsed)
            : formatTime(Math.max(remaining, 0));

    const circumference = 2 * Math.PI * 16;

    // For deep study exit protection
    const canExitDeep = isDeep && elapsed >= (session.exitDelay || 0) * 60;

    const handleStop = () => {
        if (isDeep && !canExitDeep) {
            const minsLeft = Math.ceil(((session.exitDelay || 0) * 60 - elapsed) / 60);
            alert(`You can exit Deep Study in ${minsLeft} minute${minsLeft !== 1 ? 's' : ''}.`);
            return;
        }
        stop();
    };

    return (
        <>
            {/* Fullscreen exit warning overlay */}
            <AnimatePresence>
                {fullscreenWarning && (
                    <motion.div
                        className="fs-warning-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="fs-warning-card"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                        >
                            <div className="fs-warning-icon-wrap">
                                <HiExclamation size={28} />
                            </div>
                            <h3>Deep Study Ended</h3>
                            <p>You exited fullscreen, so your Deep Study session was stopped.</p>
                            <div className="fs-warning-stats">
                                <span className="fs-warning-time">{formatMinutes(elapsed)}</span>
                                <span className="fs-warning-label">studied</span>
                            </div>
                            <div className="fs-warning-actions">
                                <button className="btn btn-primary fs-warning-btn" onClick={() => { dismissFullscreenWarning(); saveAndEnd(); }}>
                                    Save Session
                                </button>
                                <button className="btn btn-ghost fs-warning-btn" onClick={() => { dismissFullscreenWarning(); discard(); }}>
                                    Discard
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Done state — show save/discard */}
            {isDone && !fullscreenWarning && (
                <AnimatePresence>
                    <motion.div
                        className="floating-timer done"
                        initial={{ opacity: 0, scale: 0.8, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                    >
                        <div className="ft-done-content">
                            <span className="ft-done-icon">{isDeep ? '🏆' : '🎉'}</span>
                            <div className="ft-done-info">
                                <span className="ft-done-label">Session Complete</span>
                                <span className="ft-done-time">{displayTime}</span>
                            </div>
                            <div className="ft-done-actions">
                                <button className="ft-btn save" title="Save session" onClick={saveAndEnd}>
                                    <HiCheck size={16} />
                                </button>
                                <button className="ft-btn discard" title="Discard session" onClick={discard}>
                                    <HiX size={16} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            )}

            {/* Active timer pill */}
            {!isDone && (
                <AnimatePresence>
                    <motion.div
                        className={`floating-timer ${isDeep ? 'deep' : 'casual'} ${expanded ? 'expanded' : ''}`}
                        initial={{ opacity: 0, scale: 0.8, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        layout
                    >
                        {/* Collapsed: mini pill */}
                        <div className="ft-pill" onClick={() => setExpanded(!expanded)}>
                            <div className="ft-ring-mini">
                                <svg viewBox="0 0 36 36" className="ft-ring-svg">
                                    <circle className="ft-ring-bg" cx="18" cy="18" r="16" />
                                    {!isUnlimited && (
                                        <circle
                                            className={`ft-ring-progress ${isDeep ? 'deep' : ''}`}
                                            cx="18" cy="18" r="16"
                                            strokeDasharray={circumference}
                                            strokeDashoffset={circumference * (1 - progress)}
                                        />
                                    )}
                                </svg>
                                <div className="ft-ring-icon">
                                    {isDeep ? <HiLightningBolt size={12} /> : <HiClock size={12} />}
                                </div>
                            </div>
                            <span className="ft-time">{displayTime}</span>
                            {session?.subject && <span className="ft-subject">{session.subject}</span>}
                            <span className={`ft-status-dot ${status}`} />
                        </div>

                        {/* Expanded: controls */}
                        <AnimatePresence>
                            {expanded && (
                                <motion.div
                                    className="ft-controls"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                >
                                    <div className="ft-controls-row">
                                        {status === 'running' ? (
                                            <button className="ft-btn pause" title="Pause" onClick={pause}>
                                                <HiPause size={16} />
                                            </button>
                                        ) : (
                                            <button className="ft-btn play" title="Resume" onClick={resume}>
                                                <HiPlay size={16} />
                                            </button>
                                        )}
                                        <button className="ft-btn stop" title="Stop" onClick={handleStop}>
                                            <HiStop size={16} />
                                        </button>
                                        <button className="ft-btn nav" title="Go to Study Zone" onClick={() => { setExpanded(false); navigate('/study-zone'); }}>
                                            {isDeep ? <HiLightningBolt size={14} /> : <HiClock size={14} />}
                                        </button>
                                    </div>
                                    {isDeep && !canExitDeep && (
                                        <div className="ft-lock-msg">
                                            Exit locked for {Math.ceil(((session.exitDelay || 0) * 60 - elapsed) / 60)}m
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </AnimatePresence>
            )}
        </>
    );
}

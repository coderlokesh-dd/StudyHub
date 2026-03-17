import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { generateId } from '../utils/helpers';
import { useApp } from './AppContext';

const StudyTimerContext = createContext();

function enterFullscreen() {
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
}

function exitFullscreen() {
    if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
    }
}

export function StudyTimerProvider({ children }) {
    const { addStudySession, logStudyTime } = useApp();

    // Session config
    const [session, setSession] = useState(null);
    // session shape: { mode, subject, totalSeconds, isUnlimited, exitDelay, startTime }
    // Pomodoro shape adds: { workSeconds, breakSeconds, longBreakSeconds, totalCycles }

    const [status, setStatus] = useState('idle'); // idle | running | paused | done
    const [elapsed, setElapsed] = useState(0);
    const [fullscreenWarning, setFullscreenWarning] = useState(false);
    const intervalRef = useRef(null);
    const intentionalExitRef = useRef(false);

    // Pomodoro state
    const [pomodoroPhase, setPomodoroPhase] = useState('work'); // work | shortBreak | longBreak
    const [pomodoroCount, setPomodoroCount] = useState(0); // completed work cycles
    const [phaseElapsed, setPhaseElapsed] = useState(0); // time elapsed in current phase

    const clearTimer = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    const tick = useCallback(() => {
        setElapsed(prev => prev + 1);
        setPhaseElapsed(prev => prev + 1);
    }, []);

    // Get current phase duration for pomodoro
    const getCurrentPhaseDuration = useCallback(() => {
        if (!session || session.mode !== 'pomodoro') return 0;
        if (pomodoroPhase === 'work') return session.workSeconds || 1500;
        if (pomodoroPhase === 'longBreak') return session.longBreakSeconds || 900;
        return session.breakSeconds || 300;
    }, [session, pomodoroPhase]);

    // Handle pomodoro phase transitions
    useEffect(() => {
        if (!session || session.mode !== 'pomodoro' || status !== 'running') return;

        const phaseDuration = getCurrentPhaseDuration();
        if (phaseElapsed >= phaseDuration) {
            // Phase complete
            if (pomodoroPhase === 'work') {
                const newCount = pomodoroCount + 1;
                setPomodoroCount(newCount);

                if (newCount >= (session.totalCycles || 4)) {
                    // All cycles done
                    clearTimer();
                    setStatus('done');
                    return;
                }

                // Switch to break
                if (newCount % 4 === 0) {
                    setPomodoroPhase('longBreak');
                } else {
                    setPomodoroPhase('shortBreak');
                }
            } else {
                // Break is over, back to work
                setPomodoroPhase('work');
            }
            setPhaseElapsed(0);
        }
    }, [phaseElapsed, session, status, pomodoroPhase, pomodoroCount, getCurrentPhaseDuration]);

    // Auto-complete when fixed timer runs out (non-pomodoro)
    useEffect(() => {
        if (session && session.mode !== 'pomodoro' && !session.isUnlimited && elapsed >= session.totalSeconds && status === 'running') {
            clearTimer();
            intentionalExitRef.current = true;
            exitFullscreen();
            setStatus('done');
        }
    }, [elapsed, session, status]);

    // Cleanup on unmount
    useEffect(() => {
        return () => clearTimer();
    }, []);

    // Listen for fullscreen exit during deep study
    useEffect(() => {
        if (!session || session.mode !== 'deep') return;
        if (status !== 'running' && status !== 'paused') return;

        const handleFullscreenChange = () => {
            if (!document.fullscreenElement && !intentionalExitRef.current) {
                clearTimer();
                setFullscreenWarning(true);
                setStatus('done');
            }
            intentionalExitRef.current = false;
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, [session, status]);

    const startSession = ({ mode, subject, totalSeconds, isUnlimited, exitDelay, workSeconds, breakSeconds, longBreakSeconds, totalCycles }) => {
        clearTimer();
        intentionalExitRef.current = false;
        setFullscreenWarning(false);

        if (mode === 'pomodoro') {
            setSession({
                mode, subject, totalSeconds: 0, isUnlimited: false, exitDelay: 0,
                startTime: new Date().toISOString(),
                workSeconds: workSeconds || 1500,
                breakSeconds: breakSeconds || 300,
                longBreakSeconds: longBreakSeconds || 900,
                totalCycles: totalCycles || 4,
            });
            setPomodoroPhase('work');
            setPomodoroCount(0);
            setPhaseElapsed(0);
        } else {
            setSession({ mode, subject, totalSeconds, isUnlimited, exitDelay: exitDelay || 0, startTime: new Date().toISOString() });
        }

        setElapsed(0);
        setStatus('running');
        intervalRef.current = setInterval(tick, 1000);

        if (mode === 'deep') {
            enterFullscreen();
        }
    };

    const pause = () => {
        clearTimer();
        setStatus('paused');
    };

    const resume = () => {
        setStatus('running');
        intervalRef.current = setInterval(tick, 1000);
    };

    const stop = () => {
        clearTimer();
        if (session?.mode === 'deep') {
            intentionalExitRef.current = true;
            exitFullscreen();
        }
        setStatus('done');
    };

    const saveAndEnd = () => {
        if (session) {
            const mins = Math.floor(elapsed / 60);
            if (mins > 0) logStudyTime(mins);
            addStudySession({
                session_id: generateId(),
                mode: session.mode,
                duration: elapsed,
                start_time: session.startTime,
                end_time: new Date().toISOString(),
                subject: session.subject || null,
                created_at: new Date().toISOString(),
            });
        }
        setFullscreenWarning(false);
        setSession(null);
        setElapsed(0);
        setPhaseElapsed(0);
        setPomodoroPhase('work');
        setPomodoroCount(0);
        setStatus('idle');
    };

    const discard = () => {
        clearTimer();
        if (session?.mode === 'deep') {
            intentionalExitRef.current = true;
            exitFullscreen();
        }
        setFullscreenWarning(false);
        setSession(null);
        setElapsed(0);
        setPhaseElapsed(0);
        setPomodoroPhase('work');
        setPomodoroCount(0);
        setStatus('idle');
    };

    const dismissFullscreenWarning = () => {
        setFullscreenWarning(false);
    };

    const skipPhase = () => {
        if (!session || session.mode !== 'pomodoro') return;
        if (pomodoroPhase === 'work') {
            const newCount = pomodoroCount + 1;
            setPomodoroCount(newCount);
            if (newCount >= (session.totalCycles || 4)) {
                clearTimer();
                setStatus('done');
                return;
            }
            setPomodoroPhase(newCount % 4 === 0 ? 'longBreak' : 'shortBreak');
        } else {
            setPomodoroPhase('work');
        }
        setPhaseElapsed(0);
    };

    const isActive = status === 'running' || status === 'paused' || status === 'done';

    const value = {
        session,
        status,
        elapsed,
        isActive,
        fullscreenWarning,
        pomodoroPhase,
        pomodoroCount,
        phaseElapsed,
        getCurrentPhaseDuration,
        startSession,
        pause,
        resume,
        stop,
        saveAndEnd,
        discard,
        dismissFullscreenWarning,
        skipPhase,
    };

    return <StudyTimerContext.Provider value={value}>{children}</StudyTimerContext.Provider>;
}

export const useStudyTimer = () => useContext(StudyTimerContext);

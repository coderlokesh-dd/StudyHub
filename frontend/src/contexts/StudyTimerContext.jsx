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

    const [status, setStatus] = useState('idle'); // idle | running | paused | done
    const [elapsed, setElapsed] = useState(0);
    const [fullscreenWarning, setFullscreenWarning] = useState(false);
    const intervalRef = useRef(null);
    // Track whether we intentionally exited fullscreen (e.g. session done)
    const intentionalExitRef = useRef(false);

    const clearTimer = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    const tick = useCallback(() => {
        setElapsed(prev => prev + 1);
    }, []);

    // Auto-complete when fixed timer runs out
    useEffect(() => {
        if (session && !session.isUnlimited && elapsed >= session.totalSeconds && status === 'running') {
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
                // User exited fullscreen manually — show warning and stop
                clearTimer();
                setFullscreenWarning(true);
                setStatus('done');
            }
            intentionalExitRef.current = false;
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, [session, status]);

    const startSession = ({ mode, subject, totalSeconds, isUnlimited, exitDelay }) => {
        clearTimer();
        intentionalExitRef.current = false;
        setFullscreenWarning(false);
        setSession({ mode, subject, totalSeconds, isUnlimited, exitDelay: exitDelay || 0, startTime: new Date().toISOString() });
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
        setStatus('idle');
    };

    const dismissFullscreenWarning = () => {
        setFullscreenWarning(false);
    };

    const isActive = status === 'running' || status === 'paused' || status === 'done';

    const value = {
        session,
        status,
        elapsed,
        isActive,
        fullscreenWarning,
        startSession,
        pause,
        resume,
        stop,
        saveAndEnd,
        discard,
        dismissFullscreenWarning,
    };

    return <StudyTimerContext.Provider value={value}>{children}</StudyTimerContext.Provider>;
}

export const useStudyTimer = () => useContext(StudyTimerContext);

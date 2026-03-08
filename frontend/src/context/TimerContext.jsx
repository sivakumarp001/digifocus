import { createContext, useContext, useState, useRef, useCallback } from 'react';
import { focusAPI } from '../api';

const TimerContext = createContext();

export const TimerProvider = ({ children }) => {
    const [isRunning, setIsRunning] = useState(false);
    const [mode, setMode] = useState('work'); // 'work' | 'break'
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [sessionId, setSessionId] = useState(null);
    const [distractions, setDistractions] = useState(0);
    const [completedSessions, setCompletedSessions] = useState(0);
    const [workMins, setWorkMins] = useState(25);
    const [breakMins, setBreakMins] = useState(5);
    const intervalRef = useRef(null);

    const startTimer = useCallback(async (taskId = null) => {
        try {
            const { data } = await focusAPI.startSession({ mode, plannedDuration: workMins, taskId });
            setSessionId(data.session._id);
        } catch { /* session tracking non-critical */ }
        setIsRunning(true);
        intervalRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(intervalRef.current);
                    setIsRunning(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, [mode, workMins]);

    const pauseTimer = () => {
        clearInterval(intervalRef.current);
        setIsRunning(false);
    };

    const resetTimer = () => {
        clearInterval(intervalRef.current);
        setIsRunning(false);
        setTimeLeft(mode === 'work' ? workMins * 60 : breakMins * 60);
    };

    const completeSession = useCallback(async () => {
        if (sessionId) {
            try {
                await focusAPI.endSession(sessionId, { completed: true });
            } catch { /* non-critical */ }
        }
        setCompletedSessions((c) => c + 1);
        // Auto switch mode
        const nextMode = mode === 'work' ? 'break' : 'work';
        setMode(nextMode);
        setTimeLeft(nextMode === 'work' ? workMins * 60 : breakMins * 60);
        setSessionId(null);
        setDistractions(0);
    }, [sessionId, mode, workMins, breakMins]);

    const trackDistraction = useCallback(async () => {
        setDistractions((d) => d + 1);
        if (sessionId) {
            try { await focusAPI.addDistraction(sessionId); } catch { /* non-critical */ }
        }
    }, [sessionId]);

    const switchMode = (newMode) => {
        clearInterval(intervalRef.current);
        setIsRunning(false);
        setMode(newMode);
        setTimeLeft(newMode === 'work' ? workMins * 60 : breakMins * 60);
        setSessionId(null);
    };

    return (
        <TimerContext.Provider value={{
            isRunning, mode, timeLeft, sessionId, distractions,
            completedSessions, workMins, breakMins,
            setWorkMins, setBreakMins,
            startTimer, pauseTimer, resetTimer, completeSession, trackDistraction, switchMode,
        }}>
            {children}
        </TimerContext.Provider>
    );
};

export const useTimer = () => useContext(TimerContext);

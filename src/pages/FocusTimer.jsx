import { useState, useEffect } from 'react';
import { useTimer } from '../context/TimerContext';
import { useAuth } from '../context/AuthContext';
import { tasksAPI, focusAPI, authAPI } from '../api';
import toast from 'react-hot-toast';
import './FocusTimer.css';

export default function FocusTimer() {
    const { user, updateUser } = useAuth();
    const {
        isRunning, mode, timeLeft, distractions, completedSessions,
        workMins, breakMins, setWorkMins, setBreakMins,
        startTimer, pauseTimer, resetTimer, completeSession, trackDistraction, switchMode
    } = useTimer();

    const [activeTasks, setActiveTasks] = useState([]);
    const [selectedTaskId, setSelectedTaskId] = useState('');
    const [history, setHistory] = useState([]);
    const [showSettings, setShowSettings] = useState(false);

    useEffect(() => {
        // Load tasks for linking
        tasksAPI.getAll({ completed: false }).then(res => setActiveTasks(res.data.tasks)).catch(() => { });
        // Load history
        focusAPI.getHistory({ limit: 5 }).then(res => setHistory(res.data.sessions)).catch(() => { });
    }, [completedSessions]);

    const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
    const getRadius = () => 140;
    const getCircumference = () => 2 * Math.PI * getRadius();
    const getDashoffset = () => {
        const total = mode === 'work' ? workMins * 60 : breakMins * 60;
        const progress = timeLeft / total;
        return getCircumference() * (1 - progress);
    };

    const saveSettings = async () => {
        try {
            await authAPI.updateProfile({ preferences: { pomodoroWork: workMins, pomodoroBreak: breakMins } });
            updateUser({ preferences: { ...user.preferences, pomodoroWork: workMins, pomodoroBreak: breakMins } });
            setShowSettings(false);
            resetTimer();
            toast.success('Timer settings saved');
        } catch { setShowSettings(false); resetTimer(); }
    };

    return (
        <div className="focus-page">
            <div className="timer-container card">
                {/* Mode Switcher */}
                <div className="timer-tabs">
                    <button className={`tab ${mode === 'work' ? 'active' : ''}`} onClick={() => switchMode('work')}>🧠 Focus</button>
                    <button className={`tab ${mode === 'break' ? 'active' : ''}`} onClick={() => switchMode('break')}>☕ Break</button>
                </div>

                {/* Circular Timer Display */}
                <div className={`timer-circle ${mode}`}>
                    <svg width="320" height="320" viewBox="0 0 320 320">
                        <circle cx="160" cy="160" r={getRadius()} className="timer-bg" />
                        <circle cx="160" cy="160" r={getRadius()} className="timer-progress"
                            strokeDasharray={getCircumference()} strokeDashoffset={getDashoffset()} />
                    </svg>
                    <div className="timer-content">
                        <h1 className="timer-text">{formatTime(timeLeft)}</h1>
                        <p className="timer-label">{mode === 'work' ? 'Deep Work' : 'Relax'}</p>
                    </div>
                </div>

                {/* Controls */}
                <div className="timer-controls">
                    <button className="btn btn-secondary btn-icon" onClick={resetTimer} title="Reset">🔄</button>
                    <button className={`btn btn-lg ${isRunning ? 'btn-secondary' : 'btn-primary'}`} style={{ width: 140, justifyContent: 'center' }}
                        onClick={() => isRunning ? pauseTimer() : startTimer(selectedTaskId || null)}>
                        {isRunning ? '⏸ Pause' : '▶ Start'}
                    </button>
                    <button className="btn btn-secondary btn-icon" onClick={completeSession} title="Skip/Complete">⏭</button>
                </div>

                {/* Active Session Info */}
                <div className="timer-meta">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', maxWidth: 300, margin: '0 auto 16px' }}>
                        <span style={{ fontSize: 24 }}>🎯</span>
                        <select className="input" value={selectedTaskId} onChange={(e) => setSelectedTaskId(e.target.value)} disabled={isRunning}>
                            <option value="">No task selected</option>
                            {activeTasks.map(t => <option key={t._id} value={t._id}>{t.title}</option>)}
                        </select>
                    </div>
                    <div style={{ display: 'flex', gap: 24, justifyContent: 'center' }}>
                        <div className="meta-stat">
                            <span className="meta-val">{completedSessions}</span>
                            <span className="meta-lbl">Sessions Today</span>
                        </div>
                        {mode === 'work' && isRunning && (
                            <div className="meta-stat danger" style={{ cursor: 'pointer' }} onClick={trackDistraction} title="Click to log a distraction">
                                <span className="meta-val">{distractions}</span>
                                <span className="meta-lbl">Distractions 🚨</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="focus-sidebar">
                {/* Settings Card */}
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                        <h3>⚙️ Settings</h3>
                        <button className="btn btn-secondary btn-sm" onClick={() => setShowSettings(!showSettings)}>Adjust</button>
                    </div>
                    {showSettings ? (
                        <div className="form-group" style={{ gap: 12 }}>
                            <div>
                                <label>Focus Duration (min)</label>
                                <input type="number" className="input" value={workMins} onChange={e => setWorkMins(Number(e.target.value))} min={1} max={120} />
                            </div>
                            <div>
                                <label>Break Duration (min)</label>
                                <input type="number" className="input" value={breakMins} onChange={e => setBreakMins(Number(e.target.value))} min={1} max={30} />
                            </div>
                            <button className="btn btn-primary btn-sm" onClick={saveSettings}>Save</button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', gap: 16 }}>
                            <div className="meta-stat"><span className="meta-val">{workMins}m</span><span className="meta-lbl">Focus</span></div>
                            <div className="meta-stat"><span className="meta-val">{breakMins}m</span><span className="meta-lbl">Break</span></div>
                        </div>
                    )}
                </div>

                {/* History Card */}
                <div className="card">
                    <h3 style={{ marginBottom: 16 }}>📜 Recent Sessions</h3>
                    {history.length === 0 ? <p className="empty-state" style={{ padding: '20px 0' }}>No sessions yet.</p> : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {history.map(s => (
                                <div key={s._id} className="history-item">
                                    <div className="hist-icon">{s.mode === 'work' ? '🧠' : '☕'}</div>
                                    <div className="hist-info">
                                        <p className="hist-time">{s.duration} min {s.mode}</p>
                                        <p className="hist-task">{s.taskId?.title || 'No task selected'}</p>
                                    </div>
                                    <div className="hist-dist">{s.distractions > 0 ? `🚨 ${s.distractions}` : ''}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyticsAPI, tasksAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { useTimer } from '../context/TimerContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import toast from 'react-hot-toast';
import personalIcon from '../assets/personal-icon.svg';
import './Dashboard.css';

export default function Dashboard() {
    const { user } = useAuth();
    const { isRunning, mode, timeLeft, startTimer, pauseTimer } = useTimer();
    const navigate = useNavigate();
    const [summary, setSummary] = useState(null);
    const [weeklyData, setWeeklyData] = useState([]);
    const [todayTasks, setTodayTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [sumRes, weekRes, taskRes] = await Promise.all([
                    analyticsAPI.getSummary(),
                    analyticsAPI.getWeekly(),
                    tasksAPI.getToday(),
                ]);
                setSummary(sumRes.data.summary);
                const { labels = [], focusHours = [], tasksCompleted = [] } = weekRes.data;
                setWeeklyData(labels.map((label, index) => ({
                    day: label,
                    focus: Number(focusHours[index] || 0),
                    tasks: Number(tasksCompleted[index] || 0),
                })));
                setTodayTasks(taskRes.data.tasks.slice(0, 5));
            } catch {
                toast.error('Failed to load dashboard data');
            } finally { setLoading(false); }
        };
        fetchAll();
    }, []);

    const toggleTimer = () => isRunning ? pauseTimer() : startTimer();

    const scoreColor = (s) => s >= 70 ? 'var(--success)' : s >= 40 ? 'var(--warning)' : 'var(--danger)';
    const hasWeeklyFocusData = weeklyData.some((item) => item.focus > 0);
    const todayAssigned = todayTasks.length;
    const todayDone = todayTasks.filter((t) => t.completed).length;
    const todayPoints = todayTasks.reduce((sum, t) => sum + (Number(t.points) || 0), 0);

    if (loading) return <div className="loading-wrapper"><div className="spinner" /></div>;

    return (
        <div className="dashboard">
            {/* Greeting */}
            <div className="dash-greeting">
                <div>
                    <h1>Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {user?.name?.split(' ')[0]}! 👋</h1>
                    <p>You're on a <strong>{summary?.streak || 0}-day streak</strong>. Keep it going!</p>
                </div>
                <div className="productivity-badge" style={{ '--score-color': scoreColor(summary?.productivityScore || 0) }}>
                    <div className="score-ring">
                        <span className="score-value">{summary?.productivityScore || 0}</span>
                        <span className="score-label">Score</span>
                    </div>
                </div>
            </div>

            {/* Featured Personal Section */}
            <div className="featured-section">
                <img src={personalIcon} alt="Personal Growth" className="featured-icon" />
                <div className="featured-content">
                    <h2>Optimize Your Personal Growth</h2>
                    <p>Track your progress, focus on what matters, and achieve your goals with data-driven insights.</p>
                    <button className="btn btn-primary" onClick={() => navigate('/analytics')}>View Analytics →</button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid-4">
                {[
                    { icon: '📌', label: 'Tasks Assigned Today', value: todayAssigned, sub: 'due today', color: '#6c63ff' },
                    { icon: '✅', label: 'Tasks Done Today', value: todayDone, sub: `${todayAssigned} assigned`, color: '#22c55e' },
                    { icon: '🏅', label: 'Points Earned Today', value: todayPoints, sub: 'from tasks', color: '#f59e0b' },
                ].map((s) => (
                    <div key={s.label} className="stat-card">
                        <div className="stat-icon" style={{ background: `${s.color}20` }}>{s.icon}</div>
                        <div className="stat-value">{s.value}</div>
                        <div className="stat-label">{s.label}</div>
                        <div className="stat-change positive">{s.sub}</div>
                    </div>
                ))}
            </div>

            <div className="dashboard-grid">
                {/* Pomodoro Quick Access */}
                <div className="card pomodoro-card">
                    <h3>⏱️ Quick Focus</h3>
                    <div className={`dash-timer ${isRunning ? 'running' : ''} ${mode}`}>
                        <div className="dash-timer-mode">{mode === 'work' ? '🧠 Focus Session' : '☕ Break Time'}</div>
                        <div className="dash-timer-display">{formatTime(timeLeft)}</div>
                        <button className={`btn ${isRunning ? 'btn-secondary' : 'btn-primary'}`} onClick={toggleTimer}>
                            {isRunning ? '⏸ Pause' : '▶ Start Focus'}
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/focus')}>Full Timer →</button>
                    </div>
                </div>

                {/* Today's Tasks */}
                <div className="card today-tasks-card">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                        <h3>📋 Today's Tasks</h3>
                        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/tasks')}>View All</button>
                    </div>
                    {todayTasks.length === 0 ? (
                        <div className="empty-state" style={{ padding: '20px 0' }}>
                            <div className="empty-icon">🎉</div>
                            <p>No tasks due today!</p>
                        </div>
                    ) : (
                        todayTasks.map(task => (
                            <div key={task._id} className={`dash-task-item ${task.completed ? 'done' : ''}`}>
                                <span className={`dash-task-dot priority-${task.priority}`} />
                                <div style={{ flex: 1 }}>
                                    <span className="dash-task-title">{task.title}</span>
                                    {task.quizRequired && task.requiredLanguage && !task.quizCompleted && (
                                        <div style={{ fontSize: '12px', color: 'var(--warning)', marginTop: '4px' }}>
                                            📚 Requires {task.requiredLanguage.charAt(0).toUpperCase() + task.requiredLanguage.slice(1)} quiz
                                        </div>
                                    )}
                                </div>
                                <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                            </div>
                        ))
                    )}
                </div>

                {/* Weekly Chart */}
                <div className="card weekly-chart-card">
                    <h3>📈 Weekly Focus Hours</h3>
                    {hasWeeklyFocusData ? (
                        <ResponsiveContainer width="100%" height={180}>
                            <BarChart data={weeklyData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }} />
                                <Bar dataKey="focus" fill="#5a52f0" radius={[8, 8, 0, 0]} name="Focus hrs" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="weekly-chart-empty">
                            <div className="weekly-chart-empty-title">No focus hours recorded this week yet</div>
                            <p>Complete a focus session and your weekly graph will appear here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}


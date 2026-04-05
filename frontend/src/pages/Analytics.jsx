import { useState, useEffect } from 'react';
import { analyticsAPI } from '../api';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, ComposedChart, Line } from 'recharts';
import toast from 'react-hot-toast';
import './Analytics.css';

export default function Analytics() {
    const [weekly, setWeekly] = useState(null);
    const [monthly, setMonthly] = useState(null);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [sumRes, weekRes, monthRes] = await Promise.all([
                    analyticsAPI.getSummary(),
                    analyticsAPI.getWeekly(),
                    analyticsAPI.getMonthly()
                ]);
                setSummary(sumRes.data.summary);

                const { labels, focusHours, tasksCompleted, quizzesCompleted, quizzesPassed } = weekRes.data;
                setWeekly(labels.map((l, i) => ({ 
                    day: l, 
                    focus: focusHours[i], 
                    tasks: tasksCompleted[i],
                    quizzes: quizzesCompleted[i] || 0,
                    quizzesPassed: quizzesPassed[i] || 0
                })));
                setMonthly(monthRes.data.weekData);
            } catch { toast.error('Failed to load analytics'); }
            finally { setLoading(false); }
        };
        fetchData();
    }, []);

    if (loading) return <div className="loading-wrapper"><div className="spinner" /></div>;

    const getPieData = () => [
        { name: 'Completed', value: summary?.completedTasks || 0 },
        { name: 'Pending', value: Math.max(0, (summary?.totalTasks || 0) - (summary?.completedTasks || 0)) }
    ];
    const PIE_COLORS = ['var(--success)', 'var(--bg-input)'];

    return (
        <div className="analytics-page">
            <div className="grid-3">
                {/* Productivity Score Card */}
                <div className="card score-card">
                    <h3>🏆 Productivity Score</h3>
                    <div className="score-display">
                        <span className="score-big">{summary?.productivityScore || 0}</span>
                        <span className="score-max">/ 100</span>
                    </div>
                    <p className="score-desc">Based on task completion, focus consistency, and app usage.</p>
                </div>

                {/* Global Stats */}
                <div className="card stat-group-card">
                    <div className="stat-group-item">
                        <div className="sg-icon">⚡</div>
                        <div className="sg-data">
                            <span className="sg-val">{Math.round((summary?.totalFocusMinutes || 0) / 60)}h</span>
                            <span className="sg-lbl">Total Focus Time</span>
                        </div>
                    </div>
                    <div className="stat-group-item">
                        <div className="sg-icon">🔥</div>
                        <div className="sg-data">
                            <span className="sg-val">{summary?.streak || 0}</span>
                            <span className="sg-lbl">Current Streak</span>
                        </div>
                    </div>
                    <div className="stat-group-item">
                        <div className="sg-icon">📚</div>
                        <div className="sg-data">
                            <span className="sg-val">{summary?.todayQuizzes || 0}</span>
                            <span className="sg-lbl">Today's Quizzes</span>
                        </div>
                    </div>
                </div>

                {/* Task Completion Pie */}
                <div className="card pie-card">
                    <h3>📝 Task Completion</h3>
                    <div className="pie-wrapper">
                        <ResponsiveContainer width="100%" height={120}>
                            <PieChart>
                                <Pie data={getPieData()} cx="50%" cy="50%" innerRadius={35} outerRadius={50} paddingAngle={5} dataKey="value" stroke="none">
                                    {getPieData().map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index]} />)}
                                </Pie>
                                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="pie-legend">
                            <span style={{ color: 'var(--success)', fontWeight: 700 }}>{summary?.completionRate || 0}% Done</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid-2" style={{ marginTop: 24 }}>
                {/* Weekly Multi-Metric Chart */}
                <div className="card">
                    <h3 style={{ marginBottom: 20 }}>📊 Weekly Activity</h3>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={weekly} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                            <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }} />
                            <Bar dataKey="focus" fill="var(--accent)" radius={[6, 6, 0, 0]} name="Focus hrs" maxBarSize={50} />
                            <Bar dataKey="tasks" fill="var(--success)" radius={[6, 6, 0, 0]} name="Tasks" maxBarSize={50} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Monthly Productivity Overview */}
                <div className="card">
                    <h3 style={{ marginBottom: 20 }}>📆 Monthly Overview</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <ComposedChart data={monthly} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                            <XAxis dataKey="week" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis yAxisId="left" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis yAxisId="right" orientation="right" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <Tooltip cursor={{ fill: 'var(--bg-card-hover)' }} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }} />
                            <Bar yAxisId="left" dataKey="tasksCompleted" fill="var(--success)" radius={[6, 6, 0, 0]} name="Tasks Completed" maxBarSize={50} />
                            <Bar yAxisId="left" dataKey="quizzesPassed" fill="var(--accent)" radius={[6, 6, 0, 0]} name="Quizzes Passed" maxBarSize={50} />
                            <Line yAxisId="right" type="monotone" dataKey="avgScore" stroke="var(--info)" strokeWidth={3} dot={{ r: 4 }} name="Avg Score" />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

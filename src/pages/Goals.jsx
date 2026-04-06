import { useState, useEffect } from 'react';
import { goalsAPI } from '../api';
import toast from 'react-hot-toast';
import './Goals.css';

export default function Goals() {
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ title: '', targetValue: '', unit: 'tasks', category: 'tasks', deadline: '' });

    const fetchGoals = async () => {
        try {
            const { data } = await goalsAPI.getAll();
            setGoals(data.goals);
        } catch { toast.error('Failed to load goals'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchGoals(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (!form.title || !form.targetValue) return toast.error('Please fill required fields');
            await goalsAPI.create({ ...form, targetValue: Number(form.targetValue) });
            toast.success('Goal created');
            setShowModal(false);
            fetchGoals();
        } catch { toast.error('Error creating goal'); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this goal?')) return;
        try {
            await goalsAPI.delete(id);
            setGoals(goals.filter(g => g._id !== id));
            toast.success('Goal deleted');
        } catch { toast.error('Error deleting goal'); }
    };

    const handleProgress = async (goal, increment) => {
        try {
            const newVal = goal.currentValue + increment;
            await goalsAPI.update(goal._id, { currentValue: newVal });
            setGoals(goals.map(g => g._id === goal._id ? { ...g, currentValue: newVal, achieved: newVal >= g.targetValue } : g));
            if (newVal >= goal.targetValue && !goal.achieved) {
                toast.success(`🎉 Goal Achieved: ${goal.title}`);
            }
        } catch { toast.error('Error updating progress'); }
    };

    return (
        <div className="goals-page">
            <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, padding: '24px 32px' }}>
                <div>
                    <h3>Your Goals</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Track long-term targets and build productive habits.</p>
                </div>
                <button className="btn btn-primary" onClick={() => {
                    setForm({ title: '', targetValue: '', unit: 'tasks', category: 'tasks', deadline: '' });
                    setShowModal(true);
                }}>+ New Goal</button>
            </div>

            {loading ? <div className="loading-wrapper"><div className="spinner" /></div> : (
                <div className="goal-grid">
                    {goals.length === 0 ? (
                        <div className="empty-state card" style={{ gridColumn: '1 / -1' }}>
                            <div className="empty-icon">🎯</div>
                            <h3>No goals set</h3>
                            <p>Set a target to keep yourself motivated!</p>
                        </div>
                    ) : goals.map(goal => (
                        <div key={goal._id} className={`goal-card card ${goal.achieved ? 'achieved' : ''}`}>
                            <div className="goal-header">
                                <div>
                                    <h4 className="goal-title">{goal.title}</h4>
                                    <span className={`badge badge-${goal.category}`}>{goal.category}</span>
                                </div>
                                <button className="btn-icon" onClick={() => handleDelete(goal._id)}>🗑️</button>
                            </div>

                            <div className="goal-progress-section">
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Progress</span>
                                    <span style={{ fontWeight: 600 }}>{goal.currentValue} / {goal.targetValue} {goal.unit}</span>
                                </div>
                                <div className="progress-bar" style={{ height: 12 }}>
                                    <div className={`progress-fill ${goal.achieved ? 'success' : ''}`}
                                        style={{ width: `${Math.min((goal.currentValue / goal.targetValue) * 100, 100)}%` }} />
                                </div>
                            </div>

                            <div className="goal-footer">
                                {!goal.achieved ? (
                                    <div className="goal-actions">
                                        <button className="btn btn-secondary btn-sm" onClick={() => handleProgress(goal, 1)}>+1 {goal.unit}</button>
                                    </div>
                                ) : (
                                    <span className="goal-achieved-badge">🏆 Goal Reached!</span>
                                )}
                                {goal.deadline && <span className="goal-date">Deadline: {new Date(goal.deadline).toLocaleDateString()}</span>}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Goal Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Create New Goal</h2>
                            <button className="btn-icon" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div className="form-group">
                                <label>Goal Title</label>
                                <input required className="input" placeholder="e.g., Complete 50 tasks" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <div className="form-group">
                                    <label>Target Value</label>
                                    <input required type="number" min="1" className="input" placeholder="e.g., 50" value={form.targetValue} onChange={e => setForm({ ...form, targetValue: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Unit</label>
                                    <input className="input" placeholder="e.g., tasks, hours" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Category</label>
                                <select className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                                    <option value="tasks">Tasks</option>
                                    <option value="focus">Focus</option>
                                    <option value="streak">Streak</option>
                                    <option value="custom">Custom</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Deadline (Optional)</label>
                                <input type="date" className="input" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Create Goal</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

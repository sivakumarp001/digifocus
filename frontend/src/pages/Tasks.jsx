import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { tasksAPI, quizAPI } from '../api';
import toast from 'react-hot-toast';
import './Tasks.css';

const SUBJECT_OPTIONS = [
    { value: 'java', label: 'Java' },
    { value: 'python', label: 'Python' },
    { value: 'c', label: 'C' },
    { value: 'c++', label: 'C++' },
    { value: 'react', label: 'React' },
    { value: 'dbms', label: 'DBMS' },
    { value: 'dsa', label: 'DSA' },
    { value: 'web', label: 'Web Development' },
];

const LEVELS = [
    { value: '1', label: 'Level 1 — Beginner' },
    { value: '2', label: 'Level 2 — Intermediate' },
    { value: '3', label: 'Level 3 — Advanced' },
    { value: '4', label: 'Level 4 — Expert' },
];

// Time‑based points: faster completion earns more.
const calculatePoints = (task, completedAt = new Date()) => {
    const createdAt = task.createdAt ? new Date(task.createdAt) : null;
    const levelBonus = (Number(task.level) || 1) * 10;
    if (!createdAt) return 50 + levelBonus; // fallback

    const minutesTaken = Math.max(0, (completedAt.getTime() - createdAt.getTime()) / 60000);
    // target time defaults to 60 mins; can be tuned or sourced from task.expectedMinutes
    const target = task.expectedMinutes || 60;
    const ratio = minutesTaken / target;

    let timeBonus;
    if (ratio <= 0.5) timeBonus = 30;
    else if (ratio <= 0.8) timeBonus = 20;
    else if (ratio <= 1) timeBonus = 10;
    else if (ratio <= 1.5) timeBonus = 5;
    else timeBonus = 0;

    return Math.max(10, 50 - minutesTaken * 0.5 + timeBonus + levelBonus);
};

export default function Tasks() {
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ category: '', priority: '', search: '' });
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({ 
        title: '', 
        description: '', 
        priority: 'medium', 
        category: 'study', 
        dueDate: '',
        subject: SUBJECT_OPTIONS[0].value,
        level: '1'
    });

    // Level unlock is driven by student's completion per subject
    const getUnlockedLevel = (subject) => {
        const completedLevels = tasks
            .filter(t => t.subject === subject && t.completed)
            .map(t => Number(t.level) || 1);
        const maxCompleted = completedLevels.length ? Math.max(...completedLevels) : 0;
        return Math.min(4, maxCompleted + 1);
    };

    const fetchTasks = useCallback(async () => {
        try {
            const { data } = await tasksAPI.getAll(filter);
            setTasks(data.tasks);
        } catch { toast.error('Failed to load tasks'); }
        finally { setLoading(false); }
    }, [filter]);

    useEffect(() => { fetchTasks(); }, [fetchTasks]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Map subject to requiredLanguage for backend
            const taskData = { ...form, requiredLanguage: form.subject };
            if (editingId) {
                await tasksAPI.update(editingId, taskData);
                toast.success('Task updated');
            } else {
                await tasksAPI.create(taskData);
                toast.success('Task created');
            }
            setShowModal(false);
            fetchTasks();
        } catch { toast.error('Error saving task'); }
    };

    const handleToggle = async (id, completed) => {
        try {
            const now = new Date();
            if (!completed) {
                // mark complete & award points
                const task = tasks.find(t => t._id === id) || {};
                const points = calculatePoints(task, now);
                const completionTimeSec = task.createdAt ? Math.round((now.getTime() - new Date(task.createdAt).getTime()) / 1000) : null;
                await tasksAPI.update(id, { completed: true, points, completionTimeSec });
                setTasks(tasks.map(t => t._id === id ? { ...t, completed: true, points, completionTimeSec } : t));
                toast.success(`Task completed! +${Math.round(points)} pts`);
            } else {
                await tasksAPI.update(id, { completed: false, points: null, completionTimeSec: null });
                setTasks(tasks.map(t => t._id === id ? { ...t, completed: false, points: null, completionTimeSec: null } : t));
                toast.success('Task marked as incomplete');
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Error updating task';
            toast.error(errorMsg);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this task?')) return;
        try {
            await tasksAPI.delete(id);
            setTasks(tasks.filter(t => t._id !== id));
            toast.success('Task deleted');
        } catch { toast.error('Error deleting task'); }
    };

    const handleStartStudy = async (task) => {
        if (!task.quizRequired || !task.linkedQuizId) {
            toast.error('No staff-assigned test is available for this task');
            return;
        }

        try {
            const response = await quizAPI.getTaskQuizStatus(task._id);
            const latestQuizId = response.data.data.linkedQuizId || task.linkedQuizId;
            navigate(`/task-quiz/${task._id}/${latestQuizId}`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Unable to start the test');
        }
    };

    const openModal = (task = null) => {
        if (task) {
            setEditingId(task._id);
            setForm({
                title: task.title, 
                description: task.description,
                priority: task.priority, 
                category: task.category,
                dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
                subject: task.requiredLanguage || task.subject || SUBJECT_OPTIONS[0].value,
                level: String(task.level || '1')
            });
        } else {
            setEditingId(null);
            const defaultSubject = SUBJECT_OPTIONS[0].value;
            const unlocked = getUnlockedLevel(defaultSubject);
            setForm({ 
                title: '', 
                description: '', 
                priority: 'medium', 
                category: 'study', 
                dueDate: '',
                requiredLanguage: 'java',
                subject: defaultSubject,
                level: String(unlocked)
            });
        }
        setShowModal(true);
    };

    const isTaskOverdue = (task) => {
        if (task.completed || !task.dueDate) return false;
        const dueDate = new Date(task.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return dueDate < today;
    };

    return (
        <div className="tasks-page">
            {/* Controls */}
            <div className="tasks-controls card">
                <div className="filters">
                    <input className="input" placeholder="Search tasks..." value={filter.search}
                        onChange={e => setFilter({ ...filter, search: e.target.value })} />
                    <select className="input" value={filter.category} onChange={e => setFilter({ ...filter, category: e.target.value })}>
                        <option value="">All Categories</option>
                        <option value="study">Study</option>
                        <option value="project">Project</option>
                        <option value="personal">Personal</option>
                        <option value="other">Other</option>
                    </select>
                    <select className="input" value={filter.priority} onChange={e => setFilter({ ...filter, priority: e.target.value })}>
                        <option value="">All Priorities</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>
                </div>
                <button className="btn btn-primary" onClick={() => openModal()}>+ Enroll Subjects</button>
            </div>

            {/* Task List */}
            {loading ? <div className="loading-wrapper"><div className="spinner" /></div> : (
                <div className="task-grid">
                    {tasks.length === 0 ? (
                        <div className="empty-state card" style={{ gridColumn: '1 / -1' }}>
                            <div className="empty-icon">📝</div>
                            <h3>No tasks found</h3>
                            <p>Add a new task to get started or adjust your filters.</p>
                            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => openModal()}>Create Task</button>
                        </div>
                    ) : tasks.map(task => (
                        <div key={task._id} className={`task-card card ${task.completed ? 'completed' : ''}`}>
                            <div className="task-header">
                                {!task.quizRequired || task.quizCompleted ? (
                                    <input type="checkbox" className="task-checkbox" checked={task.completed} onChange={() => handleToggle(task._id, task.completed)} />
                                ) : (
                                    <div className="task-checkbox" style={{ opacity: 0.5, cursor: 'not-allowed' }} title="Complete the quiz first" />
                                )}
                                <h4 className="task-title">{task.title}</h4>
                                <div className="task-actions">
                                    <button className="btn-icon" onClick={() => openModal(task)}>✏️</button>
                                    <button className="btn-icon" onClick={() => handleDelete(task._id)}>🗑️</button>
                                </div>
                            </div>
                            {task.description && <p className="task-desc">{task.description}</p>}
                            <div className="task-footer">
                                <div className="task-badges">
                                    <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                                    <span className={`badge badge-${task.category}`}>{task.category}</span>
                                    <span className="badge badge-info">{(task.subject || '').toUpperCase()}</span>
                                    <span className="badge badge-level">Lvl {task.level || 1}</span>
                                    {task.points != null && (
                                        <span className="badge badge-success">+{Math.round(task.points)} pts</span>
                                    )}
                                    {isTaskOverdue(task) && (
                                        <span className="badge badge-overdue">⏰ Overdue</span>
                                    )}
                                    {task.requiredLanguage && (
                                        <span className={`badge ${task.quizCompleted ? 'badge-success' : 'badge-warning'}`}>
                                            {task.quizCompleted ? '✅ ' : '📚 '}{task.requiredLanguage}
                                        </span>
                                    )}
                                </div>
                                {task.dueDate && <span className="task-date">📅 {new Date(task.dueDate).toLocaleDateString()}</span>}
                            </div>
                            
                            {task.quizRequired && !task.quizCompleted && (
                                <button 
                                    className="btn btn-quiz" 
                                    onClick={() => handleStartStudy(task)}
                                    style={{
                                        marginTop: '12px',
                                        width: '100%',
                                        backgroundColor: '#8b5cf6',
                                        color: 'white',
                                        padding: '8px 12px',
                                        borderRadius: '6px',
                                        border: 'none',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s'
                                    }}
                                >
                                    Start Test
                                </button>
                            )}

                            {task.quizCompleted && !task.completed && (
                                <div style={{
                                    marginTop: '12px',
                                    padding: '8px 12px',
                                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                                    border: '1px solid #22c55e',
                                    borderRadius: '6px',
                                    color: '#22c55e',
                                    textAlign: 'center',
                                    fontSize: '14px',
                                    fontWeight: '500'
                                }}>
                                    ✅ Quiz Completed! Check it off to finish the task.
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingId ? 'Edit Task' : 'Enroll Subjects'}</h2>
                            <button className="btn-icon" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div className="form-group">
                                <label>Subject</label>
                                <select
                                    className="input"
                                    value={form.subject}
                                    onChange={e => {
                                        const nextSubject = e.target.value;
                                        const unlocked = getUnlockedLevel(nextSubject);
                                        setForm({ 
                                            ...form, 
                                            subject: nextSubject,
                                            level: String(unlocked)
                                        });
                                    }}
                                    required
                                >
                                    {SUBJECT_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Level (unlocks sequentially)</label>
                                <select
                                    className="input"
                                    value={form.level}
                                    onChange={e => setForm({ ...form, level: e.target.value })}
                                    required
                                >
                                    {LEVELS.map(opt => {
                                        const unlocked = getUnlockedLevel(form.subject);
                                        const disabled = Number(opt.value) > unlocked;
                                        return (
                                            <option key={opt.value} value={opt.value} disabled={disabled}>
                                                {opt.label} {disabled ? '(locked)' : ''}
                                            </option>
                                        );
                                    })}
                                </select>
                                <p style={{ fontSize: '12px', color: '#666', marginTop: 4 }}>
                                    Highest unlocked for {form.subject.toUpperCase()}: Level {getUnlockedLevel(form.subject)}. Questions are unique per subject and get harder each level.
                                </p>
                            </div>
                            <div className="form-group">
                                <label>Title</label>
                                <input required className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea className="input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Due Date</label>
                                <input type="date" className="input" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">{editingId ? 'Save Changes' : 'Create Task'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

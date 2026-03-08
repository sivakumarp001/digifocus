import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tasksAPI, quizAPI } from '../api';
import toast from 'react-hot-toast';
import './Tasks.css';

export default function Tasks() {
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ category: '', priority: '', search: '' });
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({ title: '', description: '', priority: 'medium', category: 'study', dueDate: '' });

    const fetchTasks = async () => {
        try {
            const { data } = await tasksAPI.getAll(filter);
            setTasks(data.tasks);
        } catch { toast.error('Failed to load tasks'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchTasks(); }, [filter]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await tasksAPI.update(editingId, form);
                toast.success('Task updated');
            } else {
                await tasksAPI.create(form);
                toast.success('Task created');
            }
            setShowModal(false);
            fetchTasks();
        } catch { toast.error('Error saving task'); }
    };

    const handleToggle = async (id, completed) => {
        try {
            await tasksAPI.update(id, { completed: !completed });
            setTasks(tasks.map(t => t._id === id ? { ...t, completed: !completed } : t));
            toast.success(!completed ? 'Task completed!' : 'Task marked as incomplete');
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

    const handleStartStudy = (task) => {
        if (!task.requiredLanguage) {
            toast.error('This task does not have a quiz topic selected');
            return;
        }

        // Navigate to study timer page
        navigate(`/study/${task._id}`);
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
                requiredLanguage: task.requiredLanguage || ''
            });
        } else {
            setEditingId(null);
            setForm({ 
                title: '', 
                description: '', 
                priority: 'medium', 
                category: 'study', 
                dueDate: '',
                requiredLanguage: ''
            });
        }
        setShowModal(true);
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
                <button className="btn btn-primary" onClick={() => openModal()}>+ New Task</button>
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
                                {!task.requiredLanguage || task.quizCompleted ? (
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
                                    {task.requiredLanguage && (
                                        <span className={`badge ${task.quizCompleted ? 'badge-success' : 'badge-warning'}`}>
                                            {task.quizCompleted ? '✅ ' : '📚 '}{task.requiredLanguage}
                                        </span>
                                    )}
                                </div>
                                {task.dueDate && <span className="task-date">📅 {new Date(task.dueDate).toLocaleDateString()}</span>}
                            </div>
                            
                            {/* Study Action Button */}
                            {task.requiredLanguage && !task.quizCompleted && (
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
                                    📚 Start Study & {task.requiredLanguage.charAt(0).toUpperCase() + task.requiredLanguage.slice(1)} Quiz
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
                            <h2>{editingId ? 'Edit Task' : 'New Task'}</h2>
                            <button className="btn-icon" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div className="form-group">
                                <label>Title</label>
                                <input required className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea className="input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Category & Priority</label>
                                <div style={{ display: 'flex', gap: 12 }}>
                                    <select className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                                        <option value="study">Study</option>
                                        <option value="project">Project</option>
                                        <option value="personal">Personal</option>
                                        <option value="other">Other</option>
                                    </select>
                                    <select className="input" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                                        <option value="high">High</option>
                                        <option value="medium">Medium</option>
                                        <option value="low">Low</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Due Date</label>
                                <input type="date" className="input" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Required Language/Topic Quiz (Optional)</label>
                                <p style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                                    Select a topic to have a quiz generated when you start this task. Pass the quiz to automatically mark the task as completed.
                                </p>
                                <select className="input" value={form.requiredLanguage} onChange={e => setForm({ ...form, requiredLanguage: e.target.value })}>
                                    <option value="">None</option>
                                    <option value="java">Java</option>
                                    <option value="python">Python</option>
                                    <option value="c">C</option>
                                    <option value="html">HTML</option>
                                    <option value="css">CSS</option>
                                    <option value="mathematics">Mathematics</option>
                                    <option value="science">Science</option>
                                    <option value="history">History</option>
                                    <option value="english">English</option>
                                    <option value="aptitude">Aptitude</option>
                                </select>
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

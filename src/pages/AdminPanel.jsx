import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../api';
import toast from 'react-hot-toast';
import ReTestRequests from './ReTestRequests';
import './AdminPanel.css';

export default function AdminPanel() {
    const [users, setUsers] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [studentTasks, setStudentTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('users');
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const fetchData = useCallback(async () => {
        try {
            if (activeTab === 'users') {
                const { data } = await adminAPI.getUsers();
                setUsers(data.users);
            } else if (activeTab === 'leaderboard') {
                const { data } = await adminAPI.getLeaderboard('all', 20);
                const list = data?.leaderboard ?? data?.data ?? data;
                const normalized = Array.isArray(list) ? list : Array.isArray(list?.results) ? list.results : [];
                setLeaderboard(normalized);
            }
        } catch {
            toast.error(`Failed to load ${activeTab}`);
        } finally {
            setLoading(false);
        }
    }, [activeTab]);

    useEffect(() => {
        setLoading(true);
        fetchData();
    }, [activeTab, fetchData]);

    const handleSelectStudent = async (studentId) => {
        try {
            setLoading(true);
            const response = await adminAPI.getStudentTasks(studentId);
            const tasksData = response?.data?.tasks || response?.tasks || [];

            setStudentTasks(Array.isArray(tasksData) ? tasksData : []);
            setSelectedStudent(studentId);
            setActiveTab('tasks');
        } catch (error) {
            toast.error(`Failed to load tasks: ${error.response?.data?.message || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete ${name} and all their data? This action cannot be undone.`)) {
            return;
        }

        try {
            await adminAPI.deleteUser(id);
            setUsers(users.filter((currentUser) => currentUser._id !== id));
            toast.success('User deleted successfully');
        } catch {
            toast.error('Error deleting user');
        }
    };

    const handleOpenAssignModal = (task) => {
        setSelectedTask(task);
        setShowAssignModal(true);
    };

    const handleAssignQuiz = async () => {
        try {
            await adminAPI.assignQuizToTask(selectedTask._id, {
                subject: selectedTask.requiredLanguage || 'general',
                generateNew: true,
            });

            const updatedTasks = studentTasks.map((task) =>
                task._id === selectedTask._id ? { ...task, linkedQuizId: 'new-quiz', quizRequired: true } : task
            );

            setStudentTasks(updatedTasks);
            setShowAssignModal(false);
            setSelectedTask(null);
            toast.success('New test created and assigned successfully');
        } catch {
            toast.error('Failed to create and assign test');
        }
    };

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully');
        navigate('/login');
    };

    return (
        <div className="admin-page">
            <div className="card admin-header">
                <div>
                    <h3>Administrator Dashboard</h3>
                    <p>Manage students, their tasks, and tests. View productivity metrics.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user?.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{user?.email}</div>
                    </div>
                    <div className="admin-tabs" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => { setSelectedStudent(null); setActiveTab('users'); }}>
                            Students
                        </button>
                        <button className={`btn ${activeTab === 'leaderboard' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('leaderboard')}>
                            🏆 Leaderboard
                        </button>
                        <button className={`btn ${activeTab === 'retest' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('retest')}>
                            🔄 Retest Requests
                        </button>
                        {selectedStudent && (
                            <button className="btn btn-info" style={{ pointerEvents: 'none' }}>
                                Tasks ({studentTasks.length})
                            </button>
                        )}
                        <button className="btn btn-danger" onClick={handleLogout}>
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="loading-wrapper"><div className="spinner" /></div>
            ) : (
                <div className="admin-content card">
                    {activeTab === 'users' && (
                        <div className="table-responsive">
                            <h3 style={{ marginBottom: '16px' }}>Student Management</h3>
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Name / Email</th>
                                        <th>Streak</th>
                                        <th>Focus Hours</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.length === 0 ? (
                                        <tr><td colSpan="4" className="text-center">No students found</td></tr>
                                    ) : (
                                        users.map((student) => (
                                            <tr key={student._id}>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                        <div className="avatar-sm" style={{ background: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', width: 36, height: 36 }}>
                                                            {student.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{student.name}</div>
                                                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{student.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td><span style={{ fontSize: '16px' }}>{student.streak}</span></td>
                                                <td>{Math.round((student.totalFocusMinutes || 0) / 60)}h</td>
                                                <td style={{ display: 'flex', gap: '8px' }}>
                                                    <button className="btn btn-primary btn-sm" onClick={() => handleSelectStudent(student._id)}>View Tasks</button>
                                                    <button className="btn btn-danger btn-sm" onClick={() => handleDeleteUser(student._id, student.name)}>Delete</button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'leaderboard' && (
                        <div className="table-responsive">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                <div>
                                    <h3 style={{ margin: 0 }}>On-Time Completion Leaderboard</h3>
                                    <p style={{ margin: 0, color: 'var(--text-muted)' }}>Points reflect task completion on or before due date.</p>
                                </div>
                                <button className="btn btn-secondary btn-sm" onClick={() => fetchData()}>
                                    Refresh
                                </button>
                            </div>
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Student</th>
                                        <th>Email</th>
                                        <th>Points (on-time)</th>
                                        <th>Tasks Completed</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(!Array.isArray(leaderboard) || leaderboard.length === 0) ? (
                                        <tr><td colSpan="5" className="text-center">No leaderboard data yet</td></tr>
                                    ) : (
                                        leaderboard.map((entry, idx) => (
                                            <tr key={entry.userId || idx}>
                                                <td style={{ width: 48 }}>{idx + 1}</td>
                                                <td>{entry.name || 'Unknown'}</td>
                                                <td>{entry.email || '—'}</td>
                                                <td><strong>{entry.points ?? entry.score ?? 0}</strong></td>
                                                <td>{entry.completedTasks ?? entry.tasksCompleted ?? '—'}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'tasks' && selectedStudent && (
                        <div>
                            <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <h3>Student Tasks and Test Assignment</h3>
                                <button className="btn btn-secondary" onClick={() => { setSelectedStudent(null); setActiveTab('users'); }}>
                                    Back to Students
                                </button>
                            </div>

                            {/* Quick stats for the selected student */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                                gap: '12px',
                                marginBottom: '16px',
                            }}>
                                <div className="card" style={{ padding: '12px 14px' }}>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Tasks Assigned</div>
                                    <div style={{ fontSize: 22, fontWeight: 700 }}>{studentTasks.length}</div>
                                </div>
                                <div className="card" style={{ padding: '12px 14px' }}>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Tasks Done</div>
                                    <div style={{ fontSize: 22, fontWeight: 700 }}>{studentTasks.filter((t) => t?.completed).length}</div>
                                </div>
                                <div className="card" style={{ padding: '12px 14px' }}>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Points</div>
                                    <div style={{ fontSize: 22, fontWeight: 700 }}>
                                        {studentTasks.reduce((sum, t) => sum + (Number(t?.points) || 0), 0)}
                                    </div>
                                </div>
                            </div>

                            <div className="table-responsive">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Task</th>
                                            <th>Subject</th>
                                            <th>Priority</th>
                                            <th>Status</th>
                                            <th>Test Assigned</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {!studentTasks || studentTasks.length === 0 ? (
                                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '32px' }}>No tasks created yet</td></tr>
                                        ) : (
                                            studentTasks.map((task) => {
                                                if (!task || !task._id) {
                                                    return null;
                                                }

                                                return (
                                                    <tr key={task._id}>
                                                        <td>
                                                            <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{task.title || 'Untitled'}</div>
                                                            {task.description && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{task.description.substring(0, 40)}...</div>}
                                                        </td>
                                                        <td>
                                                            <span style={{ background: '#eff6ff', color: '#3b82f6', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>
                                                                {task.requiredLanguage || 'General'}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span style={{
                                                                background: task.priority === 'high' ? '#fee2e2' : task.priority === 'medium' ? '#fef3c7' : '#d1fae5',
                                                                color: task.priority === 'high' ? '#dc2626' : task.priority === 'medium' ? '#d97706' : '#059669',
                                                                padding: '4px 8px',
                                                                borderRadius: '4px',
                                                                fontSize: '12px',
                                                                fontWeight: 600,
                                                                textTransform: 'capitalize',
                                                            }}>
                                                                {task.priority || 'medium'}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span style={{
                                                                background: task.completed ? '#d1fae5' : '#fef3c7',
                                                                color: task.completed ? '#059669' : '#d97706',
                                                                padding: '4px 8px',
                                                                borderRadius: '4px',
                                                                fontSize: '12px',
                                                                fontWeight: 600,
                                                            }}>
                                                                {task.completed ? 'Completed' : 'In Progress'}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            {task.linkedQuizId ? (
                                                                <span style={{ color: '#10b981', fontWeight: 600, fontSize: '14px' }}>Assigned</span>
                                                            ) : (
                                                                <span style={{ color: '#ef4444', fontWeight: 600, fontSize: '14px' }}>Pending</span>
                                                            )}
                                                        </td>
                                                        <td>
                                                            {!task.linkedQuizId && (
                                                                <button className="btn btn-primary btn-sm" onClick={() => handleOpenAssignModal(task)}>
                                                                    Assign Test
                                                                </button>
                                                            )}
                                                            {task.linkedQuizId && (
                                                                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>ID: {String(task.linkedQuizId).substring(0, 8)}...</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {showAssignModal && selectedTask && (
                        <div
                            className="modal-overlay"
                            onClick={() => { setShowAssignModal(false); setSelectedTask(null); }}
                            style={{
                                position: 'fixed',
                                inset: 0,
                                background: 'rgba(0,0,0,0.4)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 2000,
                                padding: '16px',
                            }}
                        >
                            <div
                                className="modal-card"
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                    background: 'var(--bg-primary)',
                                    borderRadius: '16px',
                                    padding: '32px',
                                    maxWidth: '550px',
                                    width: '90%',
                                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                                    maxHeight: '90vh',
                                    overflowY: 'auto',
                                }}
                            >
                                <h3 style={{ marginBottom: '12px', fontSize: '20px' }}>Assign Test to Task</h3>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '14px' }}>
                                    <strong>Task:</strong> {selectedTask.title}<br />
                                    <strong>Subject:</strong> {selectedTask.requiredLanguage || 'General'}
                                </p>

                                <div style={{ marginBottom: '24px', padding: '16px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                                    <p style={{ margin: '0', fontSize: '14px', color: 'var(--text-muted)' }}>
                                        A new test will be <strong>automatically generated</strong> based on the subject <strong>({selectedTask.requiredLanguage || 'General'})</strong> and assigned to this task.
                                    </p>
                                </div>

                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => { setShowAssignModal(false); setSelectedTask(null); }}
                                        style={{ flex: 1, padding: '12px' }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleAssignQuiz}
                                        style={{ flex: 1, padding: '12px' }}
                                    >
                                        Create and Assign
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

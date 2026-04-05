import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../api';
import toast from 'react-hot-toast';
import './AdminPanel.css';

export default function AdminPanel() {
    const [users, setUsers] = useState([]);
    const [reports, setReports] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [studentTasks, setStudentTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('users'); // users, reports, tasks
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [selectedQuiz, setSelectedQuiz] = useState('');
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const fetchData = useCallback(async () => {
        try {
            if (activeTab === 'users') {
                const { data } = await adminAPI.getUsers();
                setUsers(data.users);
            } else if (activeTab === 'reports') {
                const { data } = await adminAPI.getReports();
                setReports(data.reports);
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
            const { data } = await adminAPI.getStudentTasks(studentId);
            setStudentTasks(data.tasks);
            setSelectedStudent(studentId);
            setActiveTab('tasks');
        } catch {
            toast.error('Failed to load student tasks');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete ${name} and all their data? This action cannot be undone.`)) return;
        try {
            await adminAPI.deleteUser(id);
            setUsers(users.filter(u => u._id !== id));
            toast.success('User deleted successfully');
        } catch { toast.error('Error deleting user'); }
    };

    const handleOpenAssignModal = (task) => {
        setSelectedTask(task);
        setSelectedQuiz('');
        setShowAssignModal(true);
    };

    const handleAssignQuiz = async () => {
        if (!selectedQuiz) {
            toast.error('Please select a quiz');
            return;
        }
        try {
            await adminAPI.assignQuizToTask(selectedTask._id, { quizId: selectedQuiz });
            const updatedTasks = studentTasks.map(t => 
                t._id === selectedTask._id ? { ...t, linkedQuizId: selectedQuiz, quizRequired: true } : t
            );
            setStudentTasks(updatedTasks);
            setShowAssignModal(false);
            setSelectedTask(null);
            toast.success('Quiz assigned to task successfully');
        } catch {
            toast.error('Failed to assign quiz');
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
                    <h3>👑 Administrator Dashboard</h3>
                    <p>Manage student accounts, tasks, and view platform-wide productivity metrics.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user?.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{user?.email}</div>
                    </div>
                    <div className="admin-tabs">
                        <button className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('users')}>👥 Students</button>
                        <button className={`btn ${activeTab === 'reports' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('reports')}>📈 Reports</button>
                        {selectedStudent && <button className={`btn ${activeTab === 'tasks' ? 'btn-primary' : 'btn-secondary'}`} disabled>📋 Tasks</button>}
                        <button className="btn btn-danger" onClick={handleLogout}>🚪 Logout</button>
                    </div>
                </div>
            </div>

            {loading ? <div className="loading-wrapper"><div className="spinner" /></div> : (
                <div className="admin-content card">
                    {/* USERS TAB */}
                    {activeTab === 'users' && (
                        <div className="table-responsive">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Name / Email</th>
                                        <th>Streak</th>
                                        <th>Total Focus</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.length === 0 ? <tr><td colSpan="4" className="text-center">No students found</td></tr> : users.map(u => (
                                        <tr key={u._id}>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                    <div className="avatar-sm">{u.name.charAt(0).toUpperCase()}</div>
                                                    <div>
                                                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.name}</div>
                                                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{u.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>🔥 {u.streak}</td>
                                            <td>{Math.round((u.totalFocusMinutes || 0) / 60)}h</td>
                                            <td style={{ display: 'flex', gap: '8px' }}>
                                                <button className="btn btn-primary btn-sm" onClick={() => handleSelectStudent(u._id)}>View Tasks</button>
                                                <button className="btn btn-danger btn-sm" onClick={() => handleDeleteUser(u._id, u.name)}>Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* REPORTS TAB */}
                    {activeTab === 'reports' && (
                        <div className="table-responsive">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Student Name</th>
                                        <th>Productivity Score</th>
                                        <th>Task Completion</th>
                                        <th>Focus Sessions</th>
                                        <th>Total Focus Hrs</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reports.length === 0 ? <tr><td colSpan="5" className="text-center">No reports available</td></tr> : reports.map((report, idx) => (
                                        <tr key={report._id || idx}>
                                            <td>{report.name}</td>
                                            <td>
                                                <span style={{ fontWeight: 700, color: report.productivityScore >= 70 ? '#10b981' : report.productivityScore >= 40 ? '#f59e0b' : '#ef4444' }}>
                                                    {report.productivityScore}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: 120 }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                                                        <span>{report.completedTasks}/{report.totalTasks}</span>
                                                        <span>{report.completionRate}%</span>
                                                    </div>
                                                    <div className="progress-bar" style={{ height: 4, background: '#e5e7eb', borderRadius: 2 }}>
                                                        <div className="progress-fill" style={{ width: `${report.completionRate}%`, background: '#3b82f6', height: '100%', borderRadius: 2 }} />
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{report.focusSessions}</td>
                                            <td>{Math.round(report.totalFocusMinutes / 60)}h</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* TASKS TAB */}
                    {activeTab === 'tasks' && selectedStudent && (
                        <div>
                            <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                📋 Student Tasks
                                <button className="btn btn-secondary btn-sm" onClick={() => { setSelectedStudent(null); setActiveTab('users'); }} style={{ marginLeft: 'auto' }}>
                                    ← Back
                                </button>
                            </h3>
                            <div className="table-responsive">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Task Title</th>
                                            <th>Subject</th>
                                            <th>Priority</th>
                                            <th>Status</th>
                                            <th>Quiz Assigned</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {studentTasks.length === 0 ? (
                                            <tr><td colSpan="6" className="text-center">No tasks found</td></tr>
                                        ) : (
                                            studentTasks.map(task => (
                                                <tr key={task._id}>
                                                    <td>
                                                        <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{task.title}</div>
                                                        {task.description && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{task.description.substring(0, 50)}...</div>}
                                                    </td>
                                                    <td>
                                                        <span style={{ background: '#eff6ff', color: '#3b82f6', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 500 }}>
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
                                                            fontWeight: 500
                                                        }}>
                                                            {task.priority}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span style={{ 
                                                            background: task.completed ? '#d1fae5' : '#fef3c7',
                                                            color: task.completed ? '#059669' : '#d97706',
                                                            padding: '4px 8px',
                                                            borderRadius: '4px',
                                                            fontSize: '12px',
                                                            fontWeight: 500 
                                                        }}>
                                                            {task.completed ? 'Completed' : 'In Progress'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {task.linkedQuizId ? (
                                                            <span style={{ color: '#10b981', fontWeight: 500 }}>✓ Assigned</span>
                                                        ) : (
                                                            <span style={{ color: '#ef4444', fontWeight: 500 }}>✗ Not Assigned</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        {!task.linkedQuizId && (
                                                            <button className="btn btn-primary btn-sm" onClick={() => handleOpenAssignModal(task)}>
                                                                Assign Test
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ASSIGN QUIZ MODAL */}
            {showAssignModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: 'var(--bg-primary)',
                        borderRadius: '12px',
                        padding: '32px',
                        maxWidth: '500px',
                        width: '90%',
                        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
                    }}>
                        <h3 style={{ marginBottom: '16px' }}>📝 Assign Test to Task</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '14px' }}>
                            Task: <strong>{selectedTask?.title}</strong> ({selectedTask?.requiredLanguage})
                        </p>
                        
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                                Select a Quiz/Test:
                            </label>
                            <input 
                                type="text"
                                placeholder="Quiz ID or name"
                                value={selectedQuiz}
                                onChange={(e) => setSelectedQuiz(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: '1px solid var(--border)',
                                    borderRadius: '8px',
                                    background: 'var(--bg-secondary)',
                                    color: 'var(--text-primary)',
                                    fontSize: '14px',
                                    fontFamily: 'inherit'
                                }}
                            />
                            <small style={{ display: 'block', marginTop: '8px', color: 'var(--text-muted)' }}>
                                Enter the Quiz ID to assign to this task
                            </small>
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button 
                                className="btn btn-secondary"
                                onClick={() => setShowAssignModal(false)}
                                style={{ flex: 1 }}
                            >
                                Cancel
                            </button>
                            <button 
                                className="btn btn-primary"
                                onClick={handleAssignQuiz}
                                style={{ flex: 1 }}
                                disabled={!selectedQuiz}
                            >
                                Assign Quiz
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

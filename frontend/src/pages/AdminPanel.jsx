import { useState, useEffect } from 'react';
import { adminAPI } from '../api';
import toast from 'react-hot-toast';
import './AdminPanel.css';

export default function AdminPanel() {
    const [users, setUsers] = useState([]);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('users'); // users, reports

    const fetchData = async () => {
        try {
            if (activeTab === 'users') {
                const { data } = await adminAPI.getUsers();
                setUsers(data.users);
            } else {
                const { data } = await adminAPI.getReports();
                setReports(data.reports);
            }
        } catch { toast.error(`Failed to load ${activeTab}`); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        setLoading(true);
        fetchData();
    }, [activeTab]);

    const handleDeleteUser = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete ${name} and all their data? This action cannot be undone.`)) return;
        try {
            await adminAPI.deleteUser(id);
            setUsers(users.filter(u => u._id !== id));
            toast.success('User deleted successfully');
        } catch { toast.error('Error deleting user'); }
    };

    return (
        <div className="admin-page">
            <div className="card admin-header">
                <div>
                    <h3>👑 Administrator Dashboard</h3>
                    <p>Manage student accounts and view platform-wide productivity metrics.</p>
                </div>
                <div className="admin-tabs">
                    <button className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('users')}>👥 Student Users</button>
                    <button className={`btn ${activeTab === 'reports' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('reports')}>📈 Productivity Reports</button>
                </div>
            </div>

            {loading ? <div className="loading-wrapper"><div className="spinner" /></div> : (
                <div className="admin-content card">
                    {activeTab === 'users' && (
                        <div className="table-responsive">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Name / Email</th>
                                        <th>Role</th>
                                        <th>Joined</th>
                                        <th>Streak</th>
                                        <th>Total Focus</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.length === 0 ? <tr><td colSpan="6" className="text-center">No students found</td></tr> : undefined}
                                    {users.map(user => (
                                        <tr key={user._id}>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                    <div className="avatar-sm">{user.name.charAt(0).toUpperCase()}</div>
                                                    <div>
                                                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user.name}</div>
                                                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td><span className="badge badge-primary">{user.role}</span></td>
                                            <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                            <td>🔥 {user.streak}</td>
                                            <td>{Math.round((user.totalFocusMinutes || 0) / 60)}h</td>
                                            <td>
                                                <button className="btn btn-danger btn-sm" onClick={() => handleDeleteUser(user._id, user.name)}>Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

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
                                    {reports.length === 0 ? <tr><td colSpan="5" className="text-center">No reports available</td></tr> : undefined}
                                    {reports.map((report, idx) => (
                                        <tr key={report._id || idx}>
                                            <td>{report.name}</td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <span style={{ fontWeight: 700, color: report.productivityScore >= 70 ? 'var(--success)' : report.productivityScore >= 40 ? 'var(--warning)' : 'var(--danger)' }}>
                                                        {report.productivityScore}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: 120 }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                                                        <span>{report.completedTasks}/{report.totalTasks}</span>
                                                        <span>{report.completionRate}%</span>
                                                    </div>
                                                    <div className="progress-bar" style={{ height: 4 }}>
                                                        <div className="progress-fill" style={{ width: `${report.completionRate}%` }} />
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
                </div>
            )}
        </div>
    );
}

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import personalLogo from '../assets/personal-icon.svg';
import './Auth.css';

export default function Login() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [selectedRole, setSelectedRole] = useState('student');
    const { login, loading } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await login({ ...form, role: selectedRole });
        if (result.success) {
            toast.success(`Welcome back ${selectedRole === 'admin' ? 'Admin' : 'Student'}! 🎉`);
            navigate(selectedRole === 'admin' ? '/admin/dashboard' : '/dashboard');
        } else {
            toast.error(result.message);
        }
    };

    return (
        <div className="auth-bg">
            <div className="auth-card">
                <div className="auth-logo">
                    <img src={personalLogo} alt="digital focus" />
                </div>
                <p className="auth-subtitle">Sign in to your productivity hub</p>

                {/* Role Selection */}
                <div className="role-selector" style={{ marginBottom: '24px', display: 'flex', gap: '12px' }}>
                    <button
                        type="button"
                        onClick={() => setSelectedRole('student')}
                        className={`role-btn ${selectedRole === 'student' ? 'active' : ''}`}
                        style={{
                            flex: 1,
                            padding: '12px',
                            border: selectedRole === 'student' ? '2px solid #3b82f6' : '2px solid #e5e7eb',
                            borderRadius: '8px',
                            background: selectedRole === 'student' ? '#eff6ff' : 'white',
                            cursor: 'pointer',
                            fontWeight: selectedRole === 'student' ? '600' : '500',
                            color: selectedRole === 'student' ? '#3b82f6' : '#6b7280',
                            transition: 'all 0.2s'
                        }}
                    >
                        👨‍🎓 Student
                    </button>
                    <button
                        type="button"
                        onClick={() => setSelectedRole('admin')}
                        className={`role-btn ${selectedRole === 'admin' ? 'active' : ''}`}
                        style={{
                            flex: 1,
                            padding: '12px',
                            border: selectedRole === 'admin' ? '2px solid #ef4444' : '2px solid #e5e7eb',
                            borderRadius: '8px',
                            background: selectedRole === 'admin' ? '#fef2f2' : 'white',
                            cursor: 'pointer',
                            fontWeight: selectedRole === 'admin' ? '600' : '500',
                            color: selectedRole === 'admin' ? '#ef4444' : '#6b7280',
                            transition: 'all 0.2s'
                        }}
                    >
                        🛡️ Admin
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label>Email Address</label>
                        <input className="input" type="email" placeholder="you@example.com" required
                            value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input className="input" type="password" placeholder="••••••••" required
                            value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                    </div>
                    <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Signing in...' : `Sign In as ${selectedRole === 'admin' ? 'Admin' : 'Student'}`}
                    </button>
                </form>

                <p className="auth-link">Don't have an account? <Link to="/register">Create one</Link></p>
            </div>
        </div>
    );
}

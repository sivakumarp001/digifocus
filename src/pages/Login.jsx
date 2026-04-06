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
                            border: selectedRole === 'student' ? '2px solid rgba(255,255,255,0.8)' : '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '12px',
                            background: selectedRole === 'student' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                            cursor: 'pointer',
                            fontWeight: selectedRole === 'student' ? '700' : '500',
                            color: 'white',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            transform: selectedRole === 'student' ? 'scale(1.02)' : 'scale(1)',
                            boxShadow: selectedRole === 'student' ? '0 10px 20px rgba(0,0,0,0.2)' : 'none'
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
                            border: selectedRole === 'admin' ? '2px solid rgb(101 220 107 / 97%)' : '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '12px',
                            background: selectedRole === 'admin' ? 'rgba(101, 220, 107, 0.15)' : 'rgba(0,0,0,0.1)',
                            cursor: 'pointer',
                            fontWeight: selectedRole === 'admin' ? '700' : '500',
                            color: selectedRole === 'admin' ? 'white' : 'white',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            transform: selectedRole === 'admin' ? 'scale(1.02)' : 'scale(1)',
                            boxShadow: selectedRole === 'admin' ? '0 10px 20px rgba(101,220,107,0.2)' : 'none'
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
                    <button type="submit" className="btn btn-vibrant btn-lg" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Signing in...' : `Sign In as ${selectedRole === 'admin' ? 'Admin' : 'Student'}`}
                    </button>
                </form>

                <p className="auth-link">Don't have an account? <Link to="/register">Create one</Link></p>
            </div>
        </div>
    );
}

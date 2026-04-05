import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import personalLogo from '../assets/personal-icon.svg';
import './Auth.css';

export default function Register() {
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
    const { register, loading } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
        const result = await register(form);
        if (result.success) {
            toast.success('Account created! Let\'s get productive 🚀');
            navigate('/dashboard');
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
                <p className="auth-subtitle">Create your account</p>

                {/* Role Selection */}
                <div className="role-selector" style={{ marginBottom: '24px', display: 'flex', gap: '12px' }}>
                    <button
                        type="button"
                        onClick={() => setForm({ ...form, role: 'student' })}
                        className={`role-btn ${form.role === 'student' ? 'active' : ''}`}
                        style={{
                            flex: 1,
                            padding: '12px',
                            border: form.role === 'student' ? '2px solid #3b82f6' : '2px solid #e5e7eb',
                            borderRadius: '8px',
                            background: form.role === 'student' ? '#eff6ff' : 'white',
                            cursor: 'pointer',
                            fontWeight: form.role === 'student' ? '600' : '500',
                            color: form.role === 'student' ? '#3b82f6' : '#6b7280',
                            transition: 'all 0.2s'
                        }}
                    >
                        👨‍🎓 Student
                    </button>
                    <button
                        type="button"
                        onClick={() => setForm({ ...form, role: 'admin' })}
                        className={`role-btn ${form.role === 'admin' ? 'active' : ''}`}
                        style={{
                            flex: 1,
                            padding: '12px',
                            border: form.role === 'admin' ? '2px solid #ef4444' : '2px solid #e5e7eb',
                            borderRadius: '8px',
                            background: form.role === 'admin' ? '#fef2f2' : 'white',
                            cursor: 'pointer',
                            fontWeight: form.role === 'admin' ? '600' : '500',
                            color: form.role === 'admin' ? '#ef4444' : '#6b7280',
                            transition: 'all 0.2s'
                        }}
                    >
                        🛡️ Admin
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label>Full Name</label>
                        <input className="input" type="text" placeholder="Your name" required
                            value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input className="input" type="email" placeholder="you@example.com" required
                            value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input className="input" type="password" placeholder="Min. 6 characters" required
                            value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                    </div>
                    <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Creating...' : 'Create Account'}
                    </button>
                </form>

                <p className="auth-link">Already have an account? <Link to="/login">Sign in</Link></p>
            </div>
        </div>
    );
}

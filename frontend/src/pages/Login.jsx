import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import personalLogo from '../assets/personal-icon.svg';
import './Auth.css';

export default function Login() {
    const [form, setForm] = useState({ email: '', password: '' });
    const { login, loading } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await login(form);
        if (result.success) {
            toast.success('Welcome back! 🎉');
            navigate('/dashboard');
        } else {
            toast.error(result.message);
        }
    };

    return (
        <div className="auth-bg">
            <div className="auth-card">
                <div className="auth-logo">
                    <img src={personalLogo} alt="FocusFlow" />
                </div>
                <p className="auth-subtitle">Sign in to your productivity hub</p>

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
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <p className="auth-link">Don't have an account? <Link to="/register">Create one</Link></p>
            </div>
        </div>
    );
}

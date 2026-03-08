import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTimer } from '../context/TimerContext';
import './Sidebar.css';

const NAV_ITEMS = [
    { to: '/dashboard', icon: '🏠', label: 'Dashboard' },
    { to: '/tasks', icon: '✅', label: 'Tasks' },
    { to: '/focus', icon: '⏱️', label: 'Focus Timer' },
    { to: '/analytics', icon: '📊', label: 'Analytics' },
    { to: '/goals', icon: '🎯', label: 'Goals' },
    { to: '/quiz', icon: '📋', label: 'Quiz' },
];

export default function Sidebar() {
    const { user, logout } = useAuth();
    const { isRunning, mode, timeLeft, completedSessions } = useTimer();
    const navigate = useNavigate();

    const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

    const handleLogout = () => { logout(); navigate('/login'); };

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <span className="logo-icon">⚡</span>
                <span className="logo-text">FocusFlow</span>
            </div>

            {isRunning && (
                <div className={`sidebar-timer-pill ${mode}`} onClick={() => navigate('/focus')}>
                    <span className="timer-dot animate-pulse" />
                    <span>{mode === 'work' ? '🧠 Focus' : '☕ Break'}</span>
                    <span className="timer-time">{formatTime(timeLeft)}</span>
                </div>
            )}

            <nav className="sidebar-nav">
                {NAV_ITEMS.map(({ to, icon, label }) => (
                    <NavLink key={to} to={to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <span className="nav-icon">{icon}</span>
                        <span>{label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-bottom">
                <div className="sidebar-streak">
                    <span>🔥</span>
                    <div>
                        <p className="streak-count">{user?.streak || 0} day streak</p>
                        <p className="streak-sessions">{completedSessions} sessions today</p>
                    </div>
                </div>
                <div className="sidebar-user">
                    <div className="user-avatar">{user?.name?.[0]?.toUpperCase()}</div>
                    <div className="user-info">
                        <p className="user-name">{user?.name}</p>
                        <p className="user-role">{user?.role}</p>
                    </div>
                    <button className="btn-icon logout-btn" onClick={handleLogout} title="Logout">⬅️</button>
                </div>
            </div>
        </aside>
    );
}

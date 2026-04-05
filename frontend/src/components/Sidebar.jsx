import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTimer } from '../context/TimerContext';
import { useSidebar } from '../context/SidebarContext';
import './Sidebar.css';

const NAV_ITEMS = [
    { to: '/dashboard', icon: 'D', label: 'Dashboard' },
    { to: '/tasks', icon: 'L', label: 'Learn Courses' },
    { to: '/todays-tasks', icon: 'T', label: "Today's Tasks" },
    { to: '/focus', icon: 'F', label: 'Focus Timer' },
    { to: '/analytics', icon: 'A', label: 'Analytics' },
    { to: '/quiz', icon: 'Q', label: 'Quiz' },
];

export default function Sidebar() {
    const { user, logout } = useAuth();
    const { isRunning, mode, timeLeft, completedSessions } = useTimer();
    const { isOpen, closeSidebar } = useSidebar();
    const navigate = useNavigate();

    const formatTime = (seconds) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-logo">
                <div className="logo-mark">
                    <img src="/personal-logo.svg" alt="Digital Focus" className="logo-image" />
                </div>
                <div className="logo-copy">
                    <span className="logo-text">Digital Focus</span>
                    <span className="logo-subtitle">Student Workspace</span>
                </div>
            </div>

            {isRunning && (
                <div
                    className={`sidebar-timer-pill ${mode}`}
                    onClick={() => {
                        navigate('/focus');
                        closeSidebar();
                    }}
                >
                    <span className="timer-dot animate-pulse" />
                    <span>{mode === 'work' ? 'Focus Session' : 'Break Timer'}</span>
                    <span className="timer-time">{formatTime(timeLeft)}</span>
                </div>
            )}

            <nav className="sidebar-nav">
                <div className="sidebar-section-label">Workspace</div>
                {NAV_ITEMS.map(({ to, icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        onClick={closeSidebar}
                    >
                        <span className="nav-icon">{icon}</span>
                        <span className="nav-label">{label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-bottom">
                <div className="sidebar-streak" onClick={closeSidebar}>
                    <span className="streak-icon">S</span>
                    <div className="streak-copy">
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
                    <button className="btn-icon logout-btn" onClick={handleLogout} title="Logout">
                        L
                    </button>
                </div>
            </div>
        </aside>
    );
}


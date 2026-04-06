import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useSidebar } from '../context/SidebarContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Navbar.css';

const PAGE_TITLES = {
    '/dashboard': { title: 'Dashboard', subtitle: 'Your productivity overview' },
    '/tasks': { title: 'Learn Courses', subtitle: 'Browse and manage your learning paths' },
    '/focus': { title: 'Focus Timer', subtitle: 'Pomodoro technique for deep work' },
    '/analytics': { title: 'Analytics', subtitle: 'Performance insights and trends' },
    '/quiz': { title: 'Quiz Generator', subtitle: 'Test your knowledge with MCQs' },
};

export default function Navbar() {
    const { theme, toggleTheme } = useTheme();
    const { toggleSidebar } = useSidebar();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const info = PAGE_TITLES[location.pathname] || { title: 'digital focus', subtitle: '' };

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully');
        navigate('/login');
    };

    return (
        <header className="navbar">
            <div className="navbar-left">
                <button className="btn-icon sidebar-toggle" onClick={toggleSidebar} title="Toggle Sidebar" aria-label="Toggle sidebar">
                    ☰
                </button>
                <div className="navbar-text">
                    <h2 className="navbar-title">{info.title}</h2>
                    {info.subtitle && <p className="navbar-subtitle">{info.subtitle}</p>}
                </div>
            </div>
            <div className="navbar-right">
                <span className="navbar-date">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </span>
                <button className="btn-icon theme-toggle" onClick={toggleTheme} title="Toggle theme">
                    {theme === 'dark' ? 'L' : 'D'}
                </button>
                <div className="user-menu">
                    <span className="user-badge">{user?.name?.charAt(0).toUpperCase()}</span>
                    <button className="btn-icon logout-btn" onClick={handleLogout} title="Logout" aria-label="Logout">
                        ↩
                    </button>
                </div>
            </div>
        </header>
    );
}

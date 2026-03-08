import { useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import './Navbar.css';

const PAGE_TITLES = {
    '/dashboard': { title: 'Dashboard', subtitle: 'Your productivity overview' },
    '/tasks': { title: 'Task Manager', subtitle: 'Organize and track your tasks' },
    '/focus': { title: 'Focus Timer', subtitle: 'Pomodoro technique for deep work' },
    '/analytics': { title: 'Analytics', subtitle: 'Performance insights and trends' },
    '/goals': { title: 'Goals & Streaks', subtitle: 'Set goals, build habits' },
    '/quiz': { title: 'Quiz Generator', subtitle: 'Test your knowledge with MCQs' },
};

export default function Navbar() {
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();
    const info = PAGE_TITLES[location.pathname] || { title: 'FocusFlow', subtitle: '' };

    return (
        <header className="navbar">
            <div className="navbar-left">
                <h2 className="navbar-title">{info.title}</h2>
                {info.subtitle && <p className="navbar-subtitle">{info.subtitle}</p>}
            </div>
            <div className="navbar-right">
                <span className="navbar-date">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </span>
                <button className="btn-icon theme-toggle" onClick={toggleTheme} title="Toggle theme">
                    {theme === 'dark' ? '☀️' : '🌙'}
                </button>
            </div>
        </header>
    );
}

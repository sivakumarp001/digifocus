import React, { useState, useEffect, useCallback } from 'react';
import { dailyTasksAPI } from '../api';
import toast from 'react-hot-toast';
import './TodaysTasks.css';

const TodaysTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'medium',
        category: 'personal',
        dueTime: '',
        estimatedMinutes: 0,
        relatedSubject: null
    });
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all'); // all, pending, completed

    const fetchDailyTasks = useCallback(async () => {
        setLoading(true);
        try {
            const response = await dailyTasksAPI.getAll(selectedDate, filterStatus === 'all' ? undefined : filterStatus);

            const filteredTasks = filterStatus === 'all' 
                ? response.data.data.tasks 
                : response.data.data.tasks.filter(t => 
                    filterStatus === 'pending' ? !t.completed : t.completed
                );

            setTasks(filteredTasks);
            setStats(response.data.data.stats);
        } catch (error) {
            console.error('Error fetching tasks:', error);
            toast.error('Failed to load tasks');
        } finally {
            setLoading(false);
        }
    }, [selectedDate, filterStatus]);

    useEffect(() => {
        fetchDailyTasks();
    }, [fetchDailyTasks]);

    const handleAddTask = async (e) => {
        e.preventDefault();
        if (!formData.title.trim()) {
            toast.error('Task title is required');
            return;
        }

        try {
            const taskData = {
                ...formData,
                taskDate: selectedDate,
                estimatedMinutes: parseInt(formData.estimatedMinutes) || 0
            };

            if (editingTaskId) {
                await dailyTasksAPI.update(editingTaskId, taskData);
                toast.success('Task updated successfully');
                setEditingTaskId(null);
            } else {
                await dailyTasksAPI.create(taskData);
                toast.success('Task added successfully');
            }

            setFormData({
                title: '',
                description: '',
                priority: 'medium',
                category: 'personal',
                dueTime: '',
                estimatedMinutes: 0,
                relatedSubject: null
            });
            setShowAddForm(false);
            fetchDailyTasks();
        } catch (error) {
            console.error('Error saving task:', error);
            toast.error('Failed to save task');
        }
    };

    const handleEditTask = (task) => {
        setFormData({
            title: task.title,
            description: task.description,
            priority: task.priority,
            category: task.category,
            dueTime: task.dueTime || '',
            estimatedMinutes: task.estimatedMinutes || 0,
            relatedSubject: task.relatedSubject
        });
        setEditingTaskId(task._id);
        setShowAddForm(true);
    };

    const handleDeleteTask = async (taskId) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            try {
                await dailyTasksAPI.delete(taskId);
                toast.success('Task deleted successfully');
                fetchDailyTasks();
            } catch (error) {
                console.error('Error deleting task:', error);
                toast.error('Failed to delete task');
            }
        }
    };

    const handleToggleCompletion = async (taskId, currentStatus) => {
        try {
            await dailyTasksAPI.toggle(taskId);
            toast.success(currentStatus ? 'Task marked as incomplete' : 'Task marked as completed');
            fetchDailyTasks();
        } catch (error) {
            console.error('Error toggling task:', error);
            toast.error('Failed to update task');
        }
    };

    const handleDateChange = (e) => {
        setSelectedDate(e.target.value);
    };

    const getPriorityColor = (priority) => {
        const colors = {
            low: '#4caf50',
            medium: '#ff9800',
            high: '#f44336'
        };
        return colors[priority] || '#999';
    };

    const getCategoryIcon = (category) => {
        const icons = {
            study: '📚',
            project: '💻',
            personal: '📝',
            exercise: '💪',
            health: '🏥',
            other: '✓'
        };
        return icons[category] || '✓';
    };

    const goToToday = () => {
        setSelectedDate(new Date().toISOString().split('T')[0]);
    };

    const goToNextDay = () => {
        const date = new Date(selectedDate);
        date.setDate(date.getDate() + 1);
        setSelectedDate(date.toISOString().split('T')[0]);
    };

    const goToPreviousDay = () => {
        const date = new Date(selectedDate);
        date.setDate(date.getDate() - 1);
        setSelectedDate(date.toISOString().split('T')[0]);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };

    const isToday = selectedDate === new Date().toISOString().split('T')[0];

    return (
        <div className="todays-tasks-container">
            <div className="tasks-header">
                <h1>Today's Tasks</h1>
                <p>Manage your daily tasks and track your productivity</p>
            </div>

            <div className="tasks-controls">
                <div className="date-selector">
                    <button onClick={goToPreviousDay} className="nav-btn">←</button>
                    <div className="date-display">
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={handleDateChange}
                            className="date-input"
                        />
                        <span className="formatted-date">{formatDate(selectedDate)}</span>
                        {!isToday && (
                            <button onClick={goToToday} className="today-btn">
                                Today
                            </button>
                        )}
                    </div>
                    <button onClick={goToNextDay} className="nav-btn">→</button>
                </div>

                <button 
                    className="add-btn"
                    onClick={() => {
                        setShowAddForm(!showAddForm);
                        setEditingTaskId(null);
                        if (showAddForm) {
                            setFormData({
                                title: '',
                                description: '',
                                priority: 'medium',
                                category: 'personal',
                                dueTime: '',
                                estimatedMinutes: 0,
                                relatedSubject: null
                            });
                        }
                    }}
                >
                    {showAddForm ? '✕ Cancel' : '+ Add Task'}
                </button>
            </div>

            {stats && (
                <div className="productivity-score-container">
                    <div className="productivity-score-card">
                        <div className="circular-progress-wrapper">
                            <svg className="circular-progress" width="200" height="200">
                                <circle 
                                    cx="100" 
                                    cy="100" 
                                    r="90" 
                                    fill="none"
                                    stroke="rgba(255,255,255,0.35)"
                                    strokeWidth="10"
                                />
                                <circle 
                                    cx="100" 
                                    cy="100" 
                                    r="90" 
                                    fill="none"
                                    stroke="url(#progressGradient)"
                                    strokeWidth="10"
                                    strokeDasharray={`${2 * Math.PI * 90}`}
                                    strokeDashoffset={`${2 * Math.PI * 90 * (1 - stats.completionPercentage / 100)}`}
                                    strokeLinecap="round"
                                    style={{ transform: 'rotate(-90deg)', transformOrigin: '100px 100px', transition: 'stroke-dashoffset 0.6s ease' }}
                                />
                                <defs>
                                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#7CFF6B" />
                                        <stop offset="100%" stopColor="#24D2FE" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="progress-display">
                                <div className="progress-score">{stats.completionPercentage}</div>
                                <div className="progress-label">Score</div>
                            </div>
                        </div>
                        <div className="score-info">
                            <h3>Productivity Score</h3>
                            <p className="score-subtitle">Based on task completion for today</p>
                            <div className="score-details">
                                <div className="score-detail-row">
                                    <span>Tasks Completed:</span>
                                    <strong>{stats.completedTasks}/{stats.totalTasks}</strong>
                                </div>
                                <div className="score-detail-row">
                                    <span>Completion Rate:</span>
                                    <strong>{stats.completionPercentage}%</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {stats && (
                <div className="tasks-stats">
                    <div className="stat-card">
                        <div className="stat-icon">📊</div>
                        <div className="stat-info">
                            <p className="stat-label">Total Tasks</p>
                            <p className="stat-value">{stats.totalTasks}</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">✅</div>
                        <div className="stat-info">
                            <p className="stat-label">Completed</p>
                            <p className="stat-value">{stats.completedTasks}</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">⏳</div>
                        <div className="stat-info">
                            <p className="stat-label">Pending</p>
                            <p className="stat-value">{stats.pendingTasks}</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">🎯</div>
                        <div className="stat-info">
                            <p className="stat-label">Completion</p>
                            <p className="stat-value">{stats.completionPercentage}%</p>
                        </div>
                    </div>
                </div>
            )}

            {stats && (
                <div className="progress-bar-container">
                    <div className="progress-bar">
                        <div 
                            className="progress-fill"
                            style={{ width: `${stats.completionPercentage}%` }}
                        ></div>
                    </div>
                </div>
            )}

            {showAddForm && (
                <div className="add-task-form-container">
                    <div className="form-card">
                        <h3>{editingTaskId ? 'Edit Task' : 'Add New Task'}</h3>
                        <form onSubmit={handleAddTask}>
                            <div className="form-group">
                                <label>Task Title *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Enter task title"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Enter task description"
                                    rows="3"
                                ></textarea>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Priority</label>
                                    <select
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option value="personal">Personal</option>
                                        <option value="study">Study</option>
                                        <option value="project">Project</option>
                                        <option value="exercise">Exercise</option>
                                        <option value="health">Health</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Due Time</label>
                                    <input
                                        type="time"
                                        value={formData.dueTime}
                                        onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Estimated Minutes</label>
                                    <input
                                        type="number"
                                        value={formData.estimatedMinutes}
                                        onChange={(e) => setFormData({ ...formData, estimatedMinutes: e.target.value })}
                                        placeholder="0"
                                        min="0"
                                    />
                                </div>
                            </div>

                            <div className="form-actions">
                                <button type="submit" className="btn-save">
                                    {editingTaskId ? 'Update Task' : 'Add Task'}
                                </button>
                                <button 
                                    type="button" 
                                    className="btn-cancel"
                                    onClick={() => {
                                        setShowAddForm(false);
                                        setEditingTaskId(null);
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="filter-buttons">
                <button 
                    className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                    onClick={() => setFilterStatus('all')}
                >
                    All ({stats?.totalTasks || 0})
                </button>
                <button 
                    className={`filter-btn ${filterStatus === 'pending' ? 'active' : ''}`}
                    onClick={() => setFilterStatus('pending')}
                >
                    Pending ({stats?.pendingTasks || 0})
                </button>
                <button 
                    className={`filter-btn ${filterStatus === 'completed' ? 'active' : ''}`}
                    onClick={() => setFilterStatus('completed')}
                >
                    Completed ({stats?.completedTasks || 0})
                </button>
            </div>

            {loading ? (
                <div className="loading">Loading tasks...</div>
            ) : tasks.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📭</div>
                    <h3>No tasks {filterStatus !="all" ? `(${filterStatus})` : ''}</h3>
                    <p>
                        {filterStatus === 'all' 
                            ? "Add a task to get started!" 
                            : `No ${filterStatus} tasks yet!`}
                    </p>
                </div>
            ) : (
                <div className="tasks-list">
                    {tasks.map((task) => (
                        <div key={task._id} className={`task-card ${task.completed ? 'completed' : ''}`}>
                            <div className="task-checkbox">
                                <input
                                    type="checkbox"
                                    checked={task.completed}
                                    onChange={() => handleToggleCompletion(task._id, task.completed)}
                                    className="checkbox"
                                />
                            </div>

                            <div className="task-content">
                                <div className="task-header">
                                    <h4 className="task-title">{task.title}</h4>
                                    <div className="task-meta">
                                        <span className="category-badge">
                                            {getCategoryIcon(task.category)} {task.category}
                                        </span>
                                        <span 
                                            className="priority-badge"
                                            style={{ borderLeft: `3px solid ${getPriorityColor(task.priority)}` }}
                                        >
                                            {task.priority.toUpperCase()}
                                        </span>
                                    </div>
                                </div>

                                {task.description && (
                                    <p className="task-description">{task.description}</p>
                                )}

                                <div className="task-details">
                                    {task.dueTime && (
                                        <span className="detail-item">🕐 {task.dueTime}</span>
                                    )}
                                    {task.estimatedMinutes > 0 && (
                                        <span className="detail-item">⏱️ {task.estimatedMinutes}min</span>
                                    )}
                                </div>
                            </div>

                            <div className="task-actions">
                                <button
                                    className="btn-edit"
                                    onClick={() => handleEditTask(task)}
                                    title="Edit task"
                                >
                                    ✎
                                </button>
                                <button
                                    className="btn-delete"
                                    onClick={() => handleDeleteTask(task._id)}
                                    title="Delete task"
                                >
                                    🗑
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TodaysTasks;

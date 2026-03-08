import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me'),
    updateProfile: (data) => api.put('/auth/profile', data),
};

// Tasks
export const tasksAPI = {
    getAll: (params) => api.get('/tasks', { params }),
    getToday: () => api.get('/tasks/today'),
    create: (data) => api.post('/tasks', data),
    update: (id, data) => api.put(`/tasks/${id}`, data),
    delete: (id) => api.delete(`/tasks/${id}`),
};

// Focus
export const focusAPI = {
    startSession: (data) => api.post('/focus/start', data),
    endSession: (id, data) => api.put(`/focus/${id}/end`, data),
    addDistraction: (id) => api.post(`/focus/${id}/distraction`),
    getHistory: (params) => api.get('/focus/history', { params }),
};

// Analytics
export const analyticsAPI = {
    getSummary: () => api.get('/analytics/summary'),
    getWeekly: () => api.get('/analytics/weekly'),
    getMonthly: () => api.get('/analytics/monthly'),
};

// Goals
export const goalsAPI = {
    getAll: () => api.get('/goals'),
    create: (data) => api.post('/goals', data),
    update: (id, data) => api.put(`/goals/${id}`, data),
    delete: (id) => api.delete(`/goals/${id}`),
};

// Admin
export const adminAPI = {
    getUsers: () => api.get('/admin/users'),
    getUserDetail: (id) => api.get(`/admin/users/${id}`),
    deleteUser: (id) => api.delete(`/admin/users/${id}`),
    getReports: () => api.get('/admin/reports'),
};

// Quiz
export const quizAPI = {
    generateQuiz: (data) => api.post('/quiz/generate', data),
    getHistory: () => api.get('/quiz/history'),
    getQuiz: (id) => api.get(`/quiz/${id}`),
    submitQuiz: (id, data) => api.put(`/quiz/${id}/submit`, data),
    deleteQuiz: (id) => api.delete(`/quiz/${id}`),
    // Task-linked quiz endpoints
    generateTaskQuiz: (taskId, data) => api.post(`/quiz/task/${taskId}/generate`, data),
    getTaskQuiz: (taskId) => api.get(`/quiz/task/${taskId}`),
    submitTaskQuiz: (quizId, data) => api.put(`/quiz/${quizId}/task-submit`, data),
    getTaskQuizStatus: (taskId) => api.get(`/quiz/task/${taskId}/status`),
};

export default api;

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
    getStudentTasks: (id) => api.get(`/admin/users/${id}/tasks`),
    assignQuizToTask: (taskId, data) => api.post(`/admin/tasks/${taskId}/assign-quiz`, data),
    deleteUser: (id) => api.delete(`/admin/users/${id}`),
    getReports: () => api.get('/admin/reports'),
    getLeaderboard: (period = 'all', limit = 10) => api.get('/admin/leaderboard', { params: { period, limit } }),
    getRetestRequests: (status = 'pending', limit = 50) => api.get('/admin/retest-requests', { params: { status, limit } }),
    approveRetest: (id, reason = '') => api.post(`/admin/retest-requests/${id}/approve`, { approvalReason: reason }),
    rejectRetest: (id, reason = 'Request denied by staff') => api.post(`/admin/retest-requests/${id}/reject`, { approvalReason: reason }),
};

// Quiz
export const quizAPI = {
    generateQuiz: (data) => api.post('/quiz/generate', data),
    getHistory: () => api.get('/quiz/history'),
    getQuiz: (id) => api.get(`/quiz/${id}`),
    submitQuiz: (id, data) => api.put(`/quiz/${id}/submit`, data),
    requestRetest: (id) => api.post(`/quiz/${id}/request-retest`),
    deleteQuiz: (id) => api.delete(`/quiz/${id}`),
    // Task-linked quiz endpoints
    generateTaskQuiz: (taskId, data) => api.post(`/quiz/task/${taskId}/generate`, data),
    getTaskQuiz: (taskId) => api.get(`/quiz/task/${taskId}`),
    submitTaskQuiz: (quizId, data) => api.put(`/quiz/${quizId}/task-submit`, data),
    getTaskQuizStatus: (taskId) => api.get(`/quiz/task/${taskId}/status`),
};

// Levels (Multi-Level Assessment System)
export const levelsAPI = {
    // Admin functions
    initializeSubjects: () => api.post('/levels/initialize'),
    addQuestionsToLevel: (subjectId, levelNumber, questions) => 
        api.post(`/levels/${subjectId}/${levelNumber}/questions`, { questions }),
    
    // Student functions
    getAllSubjects: () => api.get('/levels/subjects'),
    getLevelsBySubject: (subjectId) => api.get(`/levels/subject/${subjectId}`),
    getUserLevelProgress: () => api.get('/levels/progress'),
    startLevelTest: (levelId) => api.post(`/levels/test/start/${levelId}`),
    submitLevelTest: (testId, answers) => api.put(`/levels/test/${testId}/submit`, { answers }),
    getLevelTestHistory: (subjectId) => api.get(`/levels/test-history/${subjectId}`),
};

// Leaderboard
export const leaderboardAPI = {
    getGlobalLeaderboard: (page = 1, limit = 20) => 
        api.get('/leaderboard/global', { params: { page, limit } }),
    getSubjectLeaderboard: (subjectId, page = 1, limit = 20) => 
        api.get(`/leaderboard/subject/${subjectId}`, { params: { page, limit } }),
    getUserRank: () => api.get('/leaderboard/user-rank'),
    getUserSubjectRank: (subjectId) => api.get(`/leaderboard/user-subject-rank/${subjectId}`),
    getTopPerformers: (limit = 10) => api.get('/leaderboard/top-performers', { params: { limit } }),
    getLevelStats: (subjectId) => api.get(`/leaderboard/level-stats/${subjectId}`),
};

// Daily Tasks
export const dailyTasksAPI = {
    create: (data) => api.post('/daily-tasks', data),
    getAll: (date, status) => api.get('/daily-tasks', { params: { date, status } }),
    getInRange: (startDate, endDate) => api.get('/daily-tasks/range', { params: { startDate, endDate } }),
    getStats: (startDate, endDate, aggregateBy) => 
        api.get('/daily-tasks/stats', { params: { startDate, endDate, aggregateBy } }),
    getOne: (taskId) => api.get(`/daily-tasks/${taskId}`),
    update: (taskId, data) => api.put(`/daily-tasks/${taskId}`, data),
    toggle: (taskId) => api.patch(`/daily-tasks/${taskId}/toggle`),
    complete: (taskId, actualMinutes) => api.patch(`/daily-tasks/${taskId}/complete`, { actualMinutes }),
    delete: (taskId) => api.delete(`/daily-tasks/${taskId}`),
};

export default api;

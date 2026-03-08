const User = require('../models/User');
const Task = require('../models/Task');
const FocusSession = require('../models/FocusSession');

// @desc Get all users (admin)
// @route GET /api/admin/users
const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find({ role: 'student' }).select('-password').sort({ createdAt: -1 });
        res.json({ success: true, count: users.length, users });
    } catch (error) {
        next(error);
    }
};

// @desc Get user detail with stats (admin)
// @route GET /api/admin/users/:id
const getUserDetail = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) { res.status(404); throw new Error('User not found'); }

        const [totalTasks, completedTasks, focusSessions] = await Promise.all([
            Task.countDocuments({ user: user._id }),
            Task.countDocuments({ user: user._id, completed: true }),
            FocusSession.countDocuments({ user: user._id, mode: 'work', completed: true }),
        ]);

        res.json({
            success: true,
            user,
            stats: {
                totalTasks, completedTasks,
                completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
                focusSessions, totalFocusMinutes: user.totalFocusMinutes,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc Delete user (admin)
// @route DELETE /api/admin/users/:id
const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) { res.status(404); throw new Error('User not found'); }
        await Task.deleteMany({ user: user._id });
        await FocusSession.deleteMany({ user: user._id });
        await user.deleteOne();
        res.json({ success: true, message: 'User and associated data removed' });
    } catch (error) {
        next(error);
    }
};

// @desc Get productivity reports for all students (admin)
// @route GET /api/admin/reports
const getReports = async (req, res, next) => {
    try {
        const users = await User.find({ role: 'student' }).select('-password');
        const reports = await Promise.all(users.map(async (user) => {
            const [total, completed, sessions] = await Promise.all([
                Task.countDocuments({ user: user._id }),
                Task.countDocuments({ user: user._id, completed: true }),
                FocusSession.countDocuments({ user: user._id, mode: 'work', completed: true }),
            ]);
            return {
                _id: user._id, name: user.name, email: user.email,
                streak: user.streak, productivityScore: user.productivityScore,
                totalTasks: total, completedTasks: completed,
                completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
                focusSessions: sessions, totalFocusMinutes: user.totalFocusMinutes,
                joinedAt: user.createdAt,
            };
        }));
        res.json({ success: true, reports });
    } catch (error) {
        next(error);
    }
};

module.exports = { getAllUsers, getUserDetail, deleteUser, getReports };

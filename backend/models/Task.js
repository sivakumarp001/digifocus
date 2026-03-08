const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    category: { type: String, enum: ['study', 'project', 'personal', 'other'], default: 'study' },
    dueDate: { type: Date },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
    tags: [{ type: String }],
    requiredLanguage: { 
        type: String, 
        enum: ['java', 'python', 'c', 'html', 'css', 'mathematics', 'science', 'history', 'english', 'aptitude', null],
        default: null,
        lowercase: true
    },
    quizCompleted: { type: Boolean, default: false },
    quizPassedAt: { type: Date, default: null },
    linkedQuizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', default: null },
    quizRequired: { type: Boolean, default: false }, // True if quiz must be completed before task can be marked complete
    taskQuizStarted: { type: Boolean, default: false },
    taskQuizStartedAt: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);

const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    question: { type: String, required: true },
    options: { type: [String], required: true, minlength: 4, maxlength: 4 },
    correctAnswer: { type: Number, required: true, min: 0, max: 3 },
    explanation: { type: String, default: '' },
});

const quizSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, required: true, trim: true },
    title: { type: String, required: true },
    questions: [questionSchema],
    totalQuestions: { type: Number, default: 0 },
    timeLimit: { type: Number, default: 30 }, // in minutes
    isPassed: { type: Boolean, default: false },
    answers: [{
        questionIndex: Number,
        selectedAnswer: Number,
        isCorrect: Boolean,
    }],
    score: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    status: { type: String, enum: ['in-progress', 'completed'], default: 'in-progress' },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);

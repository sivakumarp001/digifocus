const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['student', 'admin'], default: 'student' },
    avatar: { type: String, default: '' },
    streak: { type: Number, default: 0 },
    lastActiveDate: { type: Date, default: null },
    totalFocusMinutes: { type: Number, default: 0 },
    productivityScore: { type: Number, default: 0 },
    preferences: {
        theme: { type: String, enum: ['light', 'dark'], default: 'light' },
        pomodoroWork: { type: Number, default: 25 },
        pomodoroBreak: { type: Number, default: 5 },
        notifications: { type: Boolean, default: true },
    },
}, { timestamps: true });

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

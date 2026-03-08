const Task = require('../models/Task');
const Quiz = require('../models/Quiz');

// @desc Get all tasks for user
// @route GET /api/tasks
const getTasks = async (req, res, next) => {
    try {
        const { category, priority, completed, search } = req.query;
        const filter = { user: req.user._id };
        if (category) filter.category = category;
        if (priority) filter.priority = priority;
        if (completed !== undefined) filter.completed = completed === 'true';
        if (search) filter.title = { $regex: search, $options: 'i' };

        const tasks = await Task.find(filter).sort({ createdAt: -1 });
        res.json({ success: true, count: tasks.length, tasks });
    } catch (error) {
        next(error);
    }
};

// @desc Create task
// @route POST /api/tasks
const createTask = async (req, res, next) => {
    try {
        const { title, description, priority, category, dueDate, tags, requiredLanguage } = req.body;
        
        // Validate requiredLanguage if provided
        const validLanguages = ['java', 'python', 'c', 'html', 'css', 'mathematics', 'science', 'history', 'english', 'aptitude'];
        if (requiredLanguage && !validLanguages.includes(requiredLanguage.toLowerCase())) {
            return res.status(400).json({ success: false, message: 'Invalid language specified' });
        }

        const task = await Task.create({
            user: req.user._id, 
            title, 
            description, 
            priority, 
            category, 
            dueDate, 
            tags,
            requiredLanguage: requiredLanguage ? requiredLanguage.toLowerCase() : null,
        });
        res.status(201).json({ success: true, task });
    } catch (error) {
        next(error);
    }
};

// @desc Update task
// @route PUT /api/tasks/:id
const updateTask = async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task || task.user.toString() !== req.user._id.toString()) {
            res.status(404);
            throw new Error('Task not found');
        }

        // Check if trying to mark as completed
        if (req.body.completed === true && !task.completed) {
            // If task requires a language quiz, check if user passed it
            if (task.requiredLanguage) {
                const passedQuiz = await Quiz.findOne({
                    userId: req.user._id,
                    subject: { $regex: new RegExp(task.requiredLanguage, 'i') },
                    isPassed: true,
                });

                if (!passedQuiz) {
                    res.status(400);
                    throw new Error(`You must pass the ${task.requiredLanguage} quiz before completing this task`);
                }

                req.body.quizCompleted = true;
                req.body.quizPassedAt = new Date();
            }

            req.body.completedAt = new Date();
        }

        const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, task: updatedTask });
    } catch (error) {
        next(error);
    }
};

// @desc Delete task
// @route DELETE /api/tasks/:id
const deleteTask = async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task || task.user.toString() !== req.user._id.toString()) {
            res.status(404);
            throw new Error('Task not found');
        }
        await task.deleteOne();
        res.json({ success: true, message: 'Task removed' });
    } catch (error) {
        next(error);
    }
};

// @desc Get today's tasks
// @route GET /api/tasks/today
const getTodayTasks = async (req, res, next) => {
    try {
        const today = new Date();
        const start = new Date(today.setHours(0, 0, 0, 0));
        const end = new Date(today.setHours(23, 59, 59, 999));
        const tasks = await Task.find({
            user: req.user._id,
            $or: [
                { dueDate: { $gte: start, $lte: end } },
                { dueDate: null, completed: false },
            ],
        }).sort({ priority: -1 });
        res.json({ success: true, tasks });
    } catch (error) {
        next(error);
    }
};

module.exports = { getTasks, createTask, updateTask, deleteTask, getTodayTasks };

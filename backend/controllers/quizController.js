const Quiz = require('../models/Quiz');
const User = require('../models/User');
const Task = require('../models/Task');
const asyncHandler = require('express-async-handler');

// Sample questions database by subject
const questionsDatabase = {
    mathematics: [
        { question: 'What is 15 + 27?', options: ['42', '40', '41', '43'], correctAnswer: 0 },
        { question: 'What is the square root of 144?', options: ['12', '10', '14', '13'], correctAnswer: 0 },
        { question: 'What is 25 × 4?', options: ['100', '99', '101', '102'], correctAnswer: 0 },
        { question: 'What is 100 ÷ 5?', options: ['20', '19', '21', '25'], correctAnswer: 0 },
        { question: 'What is 7³?', options: ['343', '340', '344', '342'], correctAnswer: 0 },
        { question: 'What is the value of π (approximately)?', options: ['3.14', '3.15', '3.12', '3.16'], correctAnswer: 0 },
        { question: 'What is 12² - 5²?', options: ['119', '120', '118', '117'], correctAnswer: 0 },
        { question: 'What is the sum of angles in a triangle?', options: ['180°', '360°', '90°', '270°'], correctAnswer: 0 },
        { question: 'What is 50% of 200?', options: ['100', '99', '101', '102'], correctAnswer: 0 },
        { question: 'What is the LCM of 12 and 18?', options: ['36', '35', '37', '38'], correctAnswer: 0 },
    ],
    science: [
        { question: 'What is the chemical symbol for Gold?', options: ['Au', 'Go', 'Gd', 'Gn'], correctAnswer: 0 },
        { question: 'What is the speed of light?', options: ['299,792 km/s', '300,000 km/s', '298,000 km/s', '301,000 km/s'], correctAnswer: 0 },
        { question: 'How many planets are in our solar system?', options: ['8', '9', '7', '10'], correctAnswer: 0 },
        { question: 'What is the powerhouse of the cell?', options: ['Mitochondria', 'Nucleus', 'Ribosome', 'Lysosome'], correctAnswer: 0 },
        { question: 'What is the chemical formula of water?', options: ['H₂O', 'H₂O₂', 'HO', 'H₃O'], correctAnswer: 0 },
        { question: 'What is the hardest natural substance?', options: ['Diamond', 'Quartz', 'Ruby', 'Sapphire'], correctAnswer: 0 },
        { question: 'What is the process by which plants make their own food?', options: ['Photosynthesis', 'Respiration', 'Fermentation', 'Digestion'], correctAnswer: 0 },
        { question: 'How many bones are in the adult human body?', options: ['206', '207', '205', '208'], correctAnswer: 0 },
        { question: 'What is the most abundant gas in our atmosphere?', options: ['Nitrogen', 'Oxygen', 'Argon', 'Carbon Dioxide'], correctAnswer: 0 },
        { question: 'What is the average body temperature of humans?', options: ['37°C', '36°C', '38°C', '39°C'], correctAnswer: 0 },
    ],
    history: [
        { question: 'In which year did World War II end?', options: ['1945', '1944', '1946', '1947'], correctAnswer: 0 },
        { question: 'Who was the first President of the United States?', options: ['George Washington', 'Thomas Jefferson', 'Benjamin Franklin', 'John Adams'], correctAnswer: 0 },
        { question: 'In which year did the Titanic sink?', options: ['1912', '1911', '1913', '1914'], correctAnswer: 0 },
        { question: 'Who wrote the Declaration of Independence?', options: ['Thomas Jefferson', 'Benjamin Franklin', 'John Adams', 'George Washington'], correctAnswer: 0 },
        { question: 'In which year did the Indian independence happen?', options: ['1947', '1948', '1946', '1945'], correctAnswer: 0 },
        { question: 'Who was the first President of India?', options: ['Dr. Rajendra Prasad', 'Jawaharlal Nehru', 'Sardar Vallabhbhai Patel', 'Mahatma Gandhi'], correctAnswer: 0 },
        { question: 'In which city was the Statue of Liberty built?', options: ['New York', 'Boston', 'Philadelphia', 'Washington DC'], correctAnswer: 0 },
        { question: 'Who was the first man to walk on the moon?', options: ['Neil Armstrong', 'Buzz Aldrin', 'John Glenn', 'Alan Shepard'], correctAnswer: 0 },
        { question: 'In which year did the Magna Carta sign?', options: ['1215', '1216', '1214', '1217'], correctAnswer: 0 },
        { question: 'Who was the longest reigning British monarch?', options: ['Queen Victoria', 'King George III', 'Elizabeth II', 'George V'], correctAnswer: 0 },
    ],
    english: [
        { question: 'What is the plural of "child"?', options: ['children', 'childs', 'childes', 'childss'], correctAnswer: 0 },
        { question: 'Who wrote "Romeo and Juliet"?', options: ['William Shakespeare', 'Jane Austen', 'Charles Dickens', 'Mark Twain'], correctAnswer: 0 },
        { question: 'What does "ephemeral" mean?', options: ['Lasting a short time', 'Very large', 'Dark and gloomy', 'Bitter or harsh'], correctAnswer: 0 },
        { question: 'Which is a noun?', options: ['happiness', 'run', 'beautiful', 'quickly'], correctAnswer: 0 },
        { question: 'What is the opposite of "antonym"?', options: ['Synonym', 'Homonym', 'Metonym', 'Acronym'], correctAnswer: 0 },
        { question: 'How many vowels are in the English alphabet?', options: ['5', '4', '6', '7'], correctAnswer: 0 },
        { question: 'Who wrote "1984"?', options: ['George Orwell', 'Aldous Huxley', 'Ray Bradbury', 'Isaac Asimov'], correctAnswer: 0 },
        { question: 'What is the correct spelling?', options: ['necessary', 'neccessary', 'necesary', 'neccesssary'], correctAnswer: 0 },
        { question: 'What does "serendipity" mean?', options: ['Finding good things by chance', 'Bad luck', 'Planning carefully', 'Being lost'], correctAnswer: 0 },
        { question: 'Which sentence is grammatically correct?', options: ['She goes to the market', 'She go to the market', 'She going to the market', 'She goes to market'], correctAnswer: 0 },
    ],
    aptitude: [
        { question: 'If A can complete a work in 10 days and B in 15 days, how many days will they take together?', options: ['6 days', '5 days', '7 days', '8 days'], correctAnswer: 0 },
        { question: 'What is 20% of 150?', options: ['30', '25', '35', '40'], correctAnswer: 0 },
        { question: 'If a train travels 60 km/h, how far will it travel in 2.5 hours?', options: ['150 km', '140 km', '160 km', '170 km'], correctAnswer: 0 },
        { question: 'What is the next number in the series: 2, 4, 8, 16, ?', options: ['32', '30', '24', '28'], correctAnswer: 0 },
        { question: 'If the cost of 5 apples is Rs. 50, what is the cost of 8 apples?', options: ['Rs. 80', 'Rs. 75', 'Rs. 85', 'Rs. 90'], correctAnswer: 0 },
        { question: 'What is the average of 10, 20, 30, 40, 50?', options: ['30', '25', '35', '40'], correctAnswer: 0 },
        { question: 'If a number is increased by 25%, what will be the new number if original is 100?', options: ['125', '120', '130', '140'], correctAnswer: 0 },
        { question: 'A clock shows 3:15. What is the angle between hour and minute hand?', options: ['7.5°', '10°', '5°', '12.5°'], correctAnswer: 0 },
        { question: 'What is the LCM of 8 and 12?', options: ['24', '20', '28', '30'], correctAnswer: 0 },
        { question: 'If x + 5 = 12, what is the value of x?', options: ['7', '6', '8', '9'], correctAnswer: 0 },
    ],
    java: [
        { question: 'Which keyword is used to create a class in Java?', options: ['class', 'Class', 'CLASS', 'java'], correctAnswer: 0 },
        { question: 'What is the default value of an int variable in Java?', options: ['0', '1', 'null', 'undefined'], correctAnswer: 0 },
        { question: 'Which of the following is not a primitive data type in Java?', options: ['String', 'int', 'boolean', 'char'], correctAnswer: 0 },
        { question: 'What does JVM stand for?', options: ['Java Virtual Machine', 'Java Value Method', 'Java Variable Member', 'Java Vector Machine'], correctAnswer: 0 },
        { question: 'Which method is used to start a thread in Java?', options: ['start()', 'run()', 'execute()', 'begin()'], correctAnswer: 0 },
        { question: 'What is the size of an int variable in Java?', options: ['4 bytes', '2 bytes', '8 bytes', '1 byte'], correctAnswer: 0 },
        { question: 'Which exception is thrown when array index is out of bounds?', options: ['ArrayIndexOutOfBoundsException', 'NullPointerException', 'IndexException', 'ArrayException'], correctAnswer: 0 },
        { question: 'What is the keyword to prevent method overriding in Java?', options: ['final', 'static', 'private', 'protected'], correctAnswer: 0 },
        { question: 'Which package is imported by default in Java?', options: ['java.lang', 'java.util', 'java.io', 'java.awt'], correctAnswer: 0 },
        { question: 'What does API stand for?', options: ['Application Programming Interface', 'Advanced Programming Interface', 'Application Programming Instruction', 'Advanced Program Interface'], correctAnswer: 0 },
    ],
    python: [
        { question: 'What is the extension of a Python file?', options: ['.py', '.python', '.p', '.pyt'], correctAnswer: 0 },
        { question: 'Which keyword is used to create a function in Python?', options: ['def', 'function', 'func', 'define'], correctAnswer: 0 },
        { question: 'What is the output of print(2 ** 3)?', options: ['8', '6', '5', '9'], correctAnswer: 0 },
        { question: 'Which data type is immutable in Python?', options: ['tuple', 'list', 'set', 'dictionary'], correctAnswer: 0 },
        { question: 'What is the correct way to create a list in Python?', options: ['[1, 2, 3]', '{1, 2, 3}', '(1, 2, 3)', 'list(1, 2, 3)'], correctAnswer: 0 },
        { question: 'Which library is used for numerical computing in Python?', options: ['NumPy', 'Pandas', 'Matplotlib', 'Scikit-learn'], correctAnswer: 0 },
        { question: 'What does len() function do in Python?', options: ['Returns the length of an object', 'Returns the first element', 'Returns the last element', 'Converts to lowercase'], correctAnswer: 0 },
        { question: 'What is the output of "hello"[1]?', options: ['e', 'h', 'l', 'o'], correctAnswer: 0 },
        { question: 'Which loop is used in Python when the number of iterations is not known?', options: ['while', 'for', 'do-while', 'foreach'], correctAnswer: 0 },
        { question: 'What does IDE stand for in programming?', options: ['Integrated Development Environment', 'Internal Development Engine', 'Integrated Design Environment', 'Internal Design Engine'], correctAnswer: 0 },
    ],
    c: [
        { question: 'Who invented the C programming language?', options: ['Dennis Ritchie', 'Bjarne Stroustrup', 'Guido van Rossum', 'James Gosling'], correctAnswer: 0 },
        { question: 'What is the file extension of a C program?', options: ['.c', '.cpp', '.cc', '.h'], correctAnswer: 0 },
        { question: 'Which header file is used for input/output in C?', options: ['stdio.h', 'stdlib.h', 'string.h', 'math.h'], correctAnswer: 0 },
        { question: 'What is the output of sizeof(int) in most systems?', options: ['4 bytes', '2 bytes', '8 bytes', '1 byte'], correctAnswer: 0 },
        { question: 'What does NULL represent in C?', options: ['Zero/absence of value', 'Empty string', 'Zero integer', 'Whitespace'], correctAnswer: 0 },
        { question: 'Which function is used to allocate memory in C?', options: ['malloc()', 'alloc()', 'new()', 'create()'], correctAnswer: 0 },
        { question: 'What is a pointer in C?', options: ['Variable that stores memory address', 'A variable that stores value', 'A function name', 'A data type'], correctAnswer: 0 },
        { question: 'Which operator is used to access value at the address?', options: ['*', '&', '->', '.'], correctAnswer: 0 },
        { question: 'What is the output of printf("%d", 10 / 3)?', options: ['3', '3.33', '4', '3.0'], correctAnswer: 0 },
        { question: 'How many bytes does a char take in C?', options: ['1 byte', '2 bytes', '4 bytes', '8 bytes'], correctAnswer: 0 },
    ],
    html: [
        { question: 'What does HTML stand for?', options: ['HyperText Markup Language', 'Home Tool Markup Language', 'Hyperlinks and Text Markup Language', 'Hyper Tool Markup Language'], correctAnswer: 0 },
        { question: 'Which tag is used to define a paragraph?', options: ['<p>', '<paragraph>', '<para>', '<pgh>'], correctAnswer: 0 },
        { question: 'What is the correct way to comment in HTML?', options: ['<!-- comment -->', '// comment', '/* comment */', '# comment'], correctAnswer: 0 },
        { question: 'Which tag is used for the largest heading?', options: ['<h1>', '<h6>', '<heading>', '<title>'], correctAnswer: 0 },
        { question: 'What is the correct tag for a line break?', options: ['<br>', '<br/>', '<break>', '</br>'], correctAnswer: 0 },
        { question: 'Which attribute is used to define inline styles?', options: ['style', 'class', 'id', 'css'], correctAnswer: 0 },
        { question: 'What does the <meta> tag define?', options: ['Metadata about HTML document', 'A metadata container', 'Meta information', 'Metadata tag'], correctAnswer: 0 },
        { question: 'How do you insert an image in HTML?', options: ['<img src="image.jpg">', '<image src="image.jpg">', '<img href="image.jpg">', '<picture src="image.jpg">'], correctAnswer: 0 },
        { question: 'Which tag is used to define a list item?', options: ['<li>', '<item>', '<list>', '<listitem>'], correctAnswer: 0 },
        { question: 'What does <br> tag do?', options: ['Inserts a line break', 'Breaks the page', 'Closes a tag', 'Bold text'], correctAnswer: 0 },
    ],
    css: [
        { question: 'What does CSS stand for?', options: ['Cascading Style Sheets', 'Computer Style Sheets', 'Colorful Style Sheets', 'Creative Style Sheets'], correctAnswer: 0 },
        { question: 'Which symbol is used to select an element with a specific id in CSS?', options: ['#', '.', '*', '$'], correctAnswer: 0 },
        { question: 'How do you select an element with a specific class in CSS?', options: ['.classname', '#classname', '*classname', ':classname'], correctAnswer: 0 },
        { question: 'What property is used to change the text color?', options: ['color', 'text-color', 'font-color', 'text'], correctAnswer: 0 },
        { question: 'Which property controls the spacing between elements?', options: ['margin', 'padding', 'spacing', 'gap'], correctAnswer: 0 },
        { question: 'What is the default value of the position property?', options: ['static', 'relative', 'absolute', 'fixed'], correctAnswer: 0 },
        { question: 'Which property is used to make text bold?', options: ['font-weight', 'bold', 'text-weight', 'font-style'], correctAnswer: 0 },
        { question: 'What does the z-index property control?', options: ['Stacking order of elements', 'Zoom level', 'Size of elements', 'Position on page'], correctAnswer: 0 },
        { question: 'Which property creates space inside an element?', options: ['padding', 'margin', 'border', 'spacing'], correctAnswer: 0 },
        { question: 'What is the syntax for an id selector in CSS?', options: ['#idname', '.idname', '*idname', '@idname'], correctAnswer: 0 },
    ],
};

// Function to get questions for a subject
const getQuestionsForSubject = (subjectInput) => {
    const subjectLower = subjectInput.toLowerCase();
    
    // Check for exact match
    if (questionsDatabase[subjectLower]) {
        return questionsDatabase[subjectLower];
    }
    
    // Check for partial match (e.g., "Java" matches "java")
    const matchedKey = Object.keys(questionsDatabase).find(key => 
        key.includes(subjectLower) || subjectLower.includes(key)
    );
    
    if (matchedKey) {
        return questionsDatabase[matchedKey];
    }
    
    // If no match found, return general questions as fallback
    return questionsDatabase.general || [];
};

// @desc    Generate quiz questions from a subject
// @route   POST /api/quiz/generate
// @access  Private
exports.generateQuiz = asyncHandler(async (req, res) => {
    const { subject, numberOfQuestions = 10 } = req.body;
    const userId = req.user._id;

    if (!subject || !subject.trim()) {
        return res.status(400).json({ message: 'Subject is required' });
    }

    const availableQuestions = getQuestionsForSubject(subject);

    if (availableQuestions.length === 0) {
        return res.status(400).json({ message: `No questions available for subject: ${subject}` });
    }

    // Shuffle and select random questions
    const shuffled = [...availableQuestions].sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffled.slice(0, Math.min(numberOfQuestions, availableQuestions.length));

    // Create quiz document
    const quiz = await Quiz.create({
        userId,
        subject,
        title: `${subject} Quiz - ${new Date().toLocaleDateString()}`,
        questions: selectedQuestions,
        totalQuestions: selectedQuestions.length,
    });

    res.status(201).json({
        success: true,
        data: quiz,
    });
});

// @desc    Submit quiz answers
// @route   PUT /api/quiz/:id/submit
// @access  Private
exports.submitQuiz = asyncHandler(async (req, res) => {
    const { answers } = req.body;
    const { id } = req.params;

    const quiz = await Quiz.findById(id);

    if (!quiz) {
        return res.status(404).json({ message: 'Quiz not found' });
    }

    if (quiz.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to submit this quiz' });
    }

    let correctCount = 0;
    const processedAnswers = answers.map((answer, index) => {
        const isCorrect = answer.selectedAnswer === quiz.questions[index].correctAnswer;
        if (isCorrect) correctCount++;
        return {
            questionIndex: index,
            selectedAnswer: answer.selectedAnswer,
            isCorrect,
        };
    });

    const percentage = Math.round((correctCount / quiz.totalQuestions) * 100);
    const isPassed = percentage >= 60;

    quiz.answers = processedAnswers;
    quiz.score = correctCount;
    quiz.percentage = percentage;
    quiz.isPassed = isPassed;
    quiz.status = 'completed';
    quiz.completedAt = new Date();

    await quiz.save();

    // If quiz is passed, auto-complete related pending tasks
    if (isPassed) {
        const subjectLower = quiz.subject.toLowerCase();
        await Task.updateMany(
            {
                user: quiz.userId,
                requiredLanguage: subjectLower,
                completed: false,
            },
            {
                $set: {
                    completed: true,
                    completedAt: new Date(),
                    quizCompleted: true,
                    quizPassedAt: new Date(),
                }
            }
        );
    }

    res.json({
        success: true,
        data: quiz,
        message: `Quiz completed! Score: ${quiz.score}/${quiz.totalQuestions} (${percentage}%)`,
    });
});

// @desc    Get user's quiz history
// @route   GET /api/quiz/history
// @access  Private
exports.getQuizHistory = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const quizzes = await Quiz.find({ userId }).sort({ createdAt: -1 });

    res.json({
        success: true,
        data: quizzes,
    });
});

// @desc    Get single quiz
// @route   GET /api/quiz/:id
// @access  Private
exports.getQuiz = asyncHandler(async (req, res) => {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
        return res.status(404).json({ message: 'Quiz not found' });
    }

    res.json({
        success: true,
        data: quiz,
    });
});

// @desc    Delete quiz
// @route   DELETE /api/quiz/:id
// @access  Private
exports.deleteQuiz = asyncHandler(async (req, res) => {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
        return res.status(404).json({ message: 'Quiz not found' });
    }

    if (quiz.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
    }

    await Quiz.deleteOne({ _id: req.params.id });

    res.json({
        success: true,
        message: 'Quiz deleted',
    });
});

// ==================== TASK-LINKED QUIZ ENDPOINTS ====================

// @desc    Generate quiz linked to a specific task
// @route   POST /api/quiz/task/:taskId/generate
// @access  Private
exports.generateTaskQuiz = asyncHandler(async (req, res) => {
    const { taskId } = req.params;
    const { numberOfQuestions = 10 } = req.body;
    const userId = req.user._id;

    // Verify task exists and belongs to user
    const task = await Task.findById(taskId);
    if (!task) {
        return res.status(404).json({ message: 'Task not found' });
    }

    if (task.user.toString() !== userId.toString()) {
        return res.status(403).json({ message: 'Not authorized to access this task' });
    }

    if (!task.requiredLanguage) {
        return res.status(400).json({ message: 'Task does not have a required language/topic' });
    }

    const availableQuestions = getQuestionsForSubject(task.requiredLanguage);

    if (availableQuestions.length === 0) {
        return res.status(400).json({ message: `No questions available for topic: ${task.requiredLanguage}` });
    }

    // Shuffle and select random questions
    const shuffled = [...availableQuestions].sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffled.slice(0, Math.min(numberOfQuestions, availableQuestions.length));

    // Create quiz document linked to task
    const quiz = await Quiz.create({
        userId,
        subject: task.requiredLanguage,
        title: `${task.title} - ${task.requiredLanguage.charAt(0).toUpperCase() + task.requiredLanguage.slice(1)} Quiz`,
        questions: selectedQuestions,
        totalQuestions: selectedQuestions.length,
    });

    // Link quiz to task and mark it as started
    task.linkedQuizId = quiz._id;
    task.taskQuizStarted = true;
    task.taskQuizStartedAt = new Date();
    task.quizRequired = true;
    await task.save();

    res.status(201).json({
        success: true,
        data: quiz,
        task: task,
        message: 'Quiz generated for task. Complete the quiz to mark the task as completed.',
    });
});

// @desc    Submit task-linked quiz and auto-complete task if passed
// @route   PUT /api/quiz/:id/task-submit
// @access  Private
exports.submitTaskQuiz = asyncHandler(async (req, res) => {
    const { answers, taskId } = req.body;
    const { id } = req.params;

    const quiz = await Quiz.findById(id);

    if (!quiz) {
        return res.status(404).json({ message: 'Quiz not found' });
    }

    if (quiz.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to submit this quiz' });
    }

    // Verify task if taskId provided
    if (taskId) {
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        if (task.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to access this task' });
        }

        // Verify this quiz is linked to this task
        if (task.linkedQuizId.toString() !== id) {
            return res.status(400).json({ message: 'Quiz is not linked to this task' });
        }
    }

    let correctCount = 0;
    const processedAnswers = answers.map((answer, index) => {
        const isCorrect = answer.selectedAnswer === quiz.questions[index].correctAnswer;
        if (isCorrect) correctCount++;
        return {
            questionIndex: index,
            selectedAnswer: answer.selectedAnswer,
            isCorrect,
        };
    });

    const percentage = Math.round((correctCount / quiz.totalQuestions) * 100);
    const isPassed = percentage >= 60;

    quiz.answers = processedAnswers;
    quiz.score = correctCount;
    quiz.percentage = percentage;
    quiz.isPassed = isPassed;
    quiz.status = 'completed';
    quiz.completedAt = new Date();

    await quiz.save();

    let updatedTask = null;

    // If quiz is passed and linked to a task, auto-complete the task
    if (isPassed && taskId) {
        updatedTask = await Task.findByIdAndUpdate(
            taskId,
            {
                $set: {
                    completed: true,
                    completedAt: new Date(),
                    quizCompleted: true,
                    quizPassedAt: new Date(),
                }
            },
            { new: true }
        );
    }

    res.json({
        success: true,
        data: quiz,
        task: updatedTask,
        message: isPassed 
            ? `Quiz completed! Score: ${quiz.score}/${quiz.totalQuestions} (${percentage}%). Task marked as completed! 🎉`
            : `Quiz completed! Score: ${quiz.score}/${quiz.totalQuestions} (${percentage}%). You need 60% to pass. Try again!`,
    });
});

// @desc    Get task quiz (gets the linked quiz for a task)
// @route   GET /api/quiz/task/:taskId
// @access  Private
exports.getTaskQuiz = asyncHandler(async (req, res) => {
    const { taskId } = req.params;
    const userId = req.user._id;

    // Verify task exists and belongs to user
    const task = await Task.findById(taskId);
    if (!task) {
        return res.status(404).json({ message: 'Task not found' });
    }

    if (task.user.toString() !== userId.toString()) {
        return res.status(403).json({ message: 'Not authorized to access this task' });
    }

    if (!task.linkedQuizId) {
        return res.status(404).json({ message: 'No quiz linked to this task' });
    }

    const quiz = await Quiz.findById(task.linkedQuizId);
    if (!quiz) {
        return res.status(404).json({ message: 'Quiz not found' });
    }

    res.json({
        success: true,
        data: quiz,
    });
});

// @desc    Get task info with quiz status
// @route   GET /api/quiz/task/:taskId/status
// @access  Private
exports.getTaskQuizStatus = asyncHandler(async (req, res) => {
    const { taskId } = req.params;
    const userId = req.user._id;

    // Verify task exists and belongs to user
    const task = await Task.findById(taskId);
    if (!task) {
        return res.status(404).json({ message: 'Task not found' });
    }

    if (task.user.toString() !== userId.toString()) {
        return res.status(403).json({ message: 'Not authorized to access this task' });
    }

    const quizStatus = {
        taskId: task._id,
        taskTitle: task.title,
        requiredLanguage: task.requiredLanguage,
        taskCompleted: task.completed,
        quizRequired: task.quizRequired || false,
        quizStarted: task.taskQuizStarted || false,
        quizCompleted: task.quizCompleted || false,
        linkedQuizId: task.linkedQuizId || null,
    };

    res.json({
        success: true,
        data: quizStatus,
    });
});

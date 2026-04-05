# Backend Structure - Node.js/Express Architecture

**Framework:** Express.js  
**Database:** MongoDB (Mongoose ODM)  
**Authentication:** JWT (3.14159 package)  
**Password Hashing:** bcryptjs  
**Security:** CORS, Helmet, Rate Limiting  
**Logging:** Morgan, Winston  

---

## 📁 Directory Structure

```
backend/
├── config/
│   ├── db.js                           # MongoDB connection
│   ├── environment.js                  # Environment variables
│   └── constants.js                    # Application constants
│
├── controllers/
│   ├── authController.js               # Authentication logic
│   ├── userController.js               # User profile management
│   ├── taskController.js               # Task CRUD operations
│   ├── quizController.js               # Quiz generation & evaluation
│   ├── questionController.js           # Question management (admin)
│   ├── analyticsController.js          # Analytics & reporting
│   ├── adminController.js              # Admin panel operations
│   ├── leaderboardController.js        # Leaderboard functions
│   ├── focusController.js              # Focus session tracking
│   └── notificationController.js       # Notification management
│
├── models/
│   ├── User.js                         # User schema & methods
│   ├── Task.js                         # Task schema
│   ├── Quiz.js                         # Quiz schema
│   ├── Question.js                     # Question schema
│   ├── Score.js                        # Score history schema
│   ├── FocusSession.js                 # Focus session schema
│   ├── Notification.js                 # Notification schema
│   ├── Leaderboard.js                  # Leaderboard cache schema
│   └── Goal.js                         # Goal schema
│
├── routes/
│   ├── authRoutes.js                   # Auth endpoints
│   ├── userRoutes.js                   # User profile endpoints
│   ├── taskRoutes.js                   # Task endpoints
│   ├── quizRoutes.js                   # Quiz endpoints
│   ├── questionRoutes.js               # Question endpoints (admin)
│   ├── analyticsRoutes.js              # Analytics endpoints
│   ├── adminRoutes.js                  # Admin endpoints
│   ├── leaderboardRoutes.js            # Leaderboard endpoints
│   ├── focusRoutes.js                  # Focus session endpoints
│   ├── notificationRoutes.js           # Notification endpoints
│   └── index.js                        # Combine all routes
│
├── middleware/
│   ├── authMiddleware.js               # JWT verification
│   ├── authorizationMiddleware.js      # Role-based access control
│   ├── errorMiddleware.js              # Error handling
│   ├── validationMiddleware.js         # Request validation
│   ├── rateLimitMiddleware.js          # Rate limiting
│   └── loggingMiddleware.js            # Request/response logging
│
├── utils/
│   ├── helpers.js                      # Utility functions
│   ├── validators.js                   # Input validation schemas
│   ├── questionDatabase.js             # Question database (400+ questions)
│   ├── errorHandler.js                 # Custom error classes
│   ├── sendEmail.js                    # Email sending utility
│   └── notifications.js                # Notification helpers
│
├── services/
│   ├── authService.js                  # Auth business logic
│   ├── quizService.js                  # Quiz generation logic
│   ├── analyticsService.js             # Analytics calculations
│   ├── leaderboardService.js           # Leaderboard updates
│   └── notificationService.js          # Notification logic
│
├── data/
│   └── questionSeed.js                 # Initial question seed data
│
├── .env                                # Environment variables (not in repo)
├── .env.example                        # Example env file
├── .gitignore
├── server.js                           # Main application entry
├── package.json
└── README.md
```

---

## 🚀 Server Entry Point (server.js)

```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
const routes = require('./routes');
const errorMiddleware = require('./middleware/errorMiddleware');

const app = express();

// Connect Database
connectDB();

// Middleware
app.use(helmet());                          // Security headers
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('combined'));                // Logging
app.use(express.json({ limit: '10kb' }));  // JSON parsing
app.use(express.urlencoded({ limit: '10kb' })); // URL parsing

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Backend server is running' });
});

// API Routes
app.use('/api', routes);

// 404 handling
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error Middleware (must be last)
app.use(errorMiddleware);

// Start Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});
```

---

## 🔐 Authentication Controller

**File:** `controllers/authController.js`

**Key Methods:**

### 1. Register User
```javascript
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    
    // Validation
    if (!name || !email || !password) {
      return next(new ErrorResponse('All fields required', 400));
    }
    
    // Check user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return next(new ErrorResponse('Email already registered', 409));
    }
    
    // Validate password strength
    if (!isValidPassword(password)) {
      return next(new ErrorResponse('Password must have uppercase, lowercase, number, special char', 400));
    }
    
    // Create user
    const user = await User.create({
      name,
      email,
      password,  // Will be hashed by pre-save hook
      role: 'student'
    });
    
    // Generate token
    const token = generateToken(user._id, user.role);
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};
```

### 2. Login User
```javascript
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Validation
    if (!email || !password) {
      return next(new ErrorResponse('Email and password required', 400));
    }
    
    // Find user and select password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }
    
    // Check password
    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }
    
    // Update last login
    user.lastLoginAt = new Date();
    await user.save();
    
    // Generate token
    const token = generateToken(user._id, user.role);
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        points: user.points,
        avatar: user.avatar,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};
```

### 3. Get Current User
```javascript
exports.getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};
```

---

## 📝 Task Controller

**File:** `controllers/taskController.js`

**Key Methods:**

### 1. Create Task
```javascript
exports.createTask = async (req, res, next) => {
  try {
    const { title, description, priority, category, requiredLanguage, plannedDuration, quizRequired, dueDate, tags } = req.body;
    
    // Validation
    if (!title) {
      return next(new ErrorResponse('Task title required', 400));
    }
    
    const task = await Task.create({
      user: req.user.id,
      title,
      description,
      priority,
      category,
      requiredLanguage,
      plannedDuration,
      quizRequired,
      dueDate,
      tags,
      status: 'pending'
    });
    
    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task
    });
  } catch (error) {
    next(error);
  }
};
```

### 2. Start Study Session
```javascript
exports.startStudySession = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { duration } = req.body;
    
    const task = await Task.findById(taskId);
    if (!task) {
      return next(new ErrorResponse('Task not found', 404));
    }
    
    if (task.user.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized', 403));
    }
    
    // Update task
    task.status = 'in-study';
    task.studyStartedAt = new Date();
    task.plannedDuration = duration;
    await task.save();
    
    res.json({
      success: true,
      message: 'Study session started',
      data: task
    });
  } catch (error) {
    next(error);
  }
};
```

### 3. Complete Study Session
```javascript
exports.completeStudySession = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { actualDuration } = req.body;
    
    const task = await Task.findById(taskId);
    if (!task) {
      return next(new ErrorResponse('Task not found', 404));
    }
    
    if (task.user.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized', 403));
    }
    
    // Update task
    task.status = 'quiz-available';
    task.studyCompletedAt = new Date();
    task.actualStudyDuration = actualDuration;
    task.taskQuizStarted = false;  // Reset for new quiz generation
    await task.save();
    
    // Create notification
    await Notification.create({
      userId: req.user.id,
      title: 'Quiz Available',
      message: `Your quiz for "${task.title}" is now available!`,
      type: 'quiz-available',
      relatedEntityType: 'Task',
      relatedEntityId: task._id,
      actionUrl: `/tasks/${task._id}/quiz-test`
    });
    
    res.json({
      success: true,
      message: 'Study session completed. Quiz now available!',
      data: task
    });
  } catch (error) {
    next(error);
  }
};
```

---

## 🧩 Quiz Controller

**File:** `controllers/quizController.js`

**Key Methods:**

### 1. Generate Task Quiz
```javascript
exports.generateTaskQuiz = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { difficulty = 'medium' } = req.body;
    
    const task = await Task.findById(taskId);
    if (!task) {
      return next(new ErrorResponse('Task not found', 404));
    }
    
    if (task.user.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized', 403));
    }
    
    // Validate study completion
    if (task.status !== 'quiz-available') {
      return next(new ErrorResponse('Study must be completed first', 400));
    }
    
    // Get topic from task.requiredLanguage
    const topic = task.requiredLanguage;
    
    // Select 10 random questions from topic database
    const questions = await Question.find({
      topic: new RegExp(`^${topic}$`, 'i'),
      isActive: true,
      isApproved: true,
      difficulty: difficulty
    });
    
    if (questions.length < 10) {
      return next(new ErrorResponse('Not enough questions for quiz', 500));
    }
    
    // Shuffle and select 10
    const selectedQuestions = questions.sort(() => 0.5 - Math.random()).slice(0, 10);
    
    // Create quiz
    const quiz = await Quiz.create({
      userId: req.user.id,
      taskId: task._id,
      subject: topic,
      title: `${topic} Quiz - ${new Date().toLocaleDateString()}`,
      questions: selectedQuestions.map((q, idx) => ({
        questionIndex: idx,
        question: q.question,
        options: q.options,
        explanation: q.explanation
      })),
      totalQuestions: 10,
      timeLimit: 30,
      status: 'in-progress',
      startedAt: new Date()
    });
    
    // Link quiz to task
    task.linkedQuizId = quiz._id;
    task.taskQuizStarted = true;
    task.taskQuizStartedAt = new Date();
    await task.save();
    
    // Remove correct answers from response
    const quizResponse = quiz.toObject();
    quizResponse.questions.forEach(q => delete q.correctAnswer);
    
    res.status(201).json({
      success: true,
      message: 'Quiz generated successfully',
      data: quizResponse
    });
  } catch (error) {
    next(error);
  }
};
```

### 2. Submit Quiz
```javascript
exports.submitTaskQuiz = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const { answers, timeTaken } = req.body;
    
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return next(new ErrorResponse('Quiz not found', 404));
    }
    
    if (quiz.userId.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized', 403));
    }
    
    // Calculate score
    let correctCount = 0;
    quiz.answers = answers.map((answer, idx) => {
      const isCorrect = answer.selectedAnswer === quiz.questions[answer.questionIndex].correctAnswer;
      if (isCorrect) correctCount++;
      
      return {
        questionIndex: answer.questionIndex,
        selectedAnswer: answer.selectedAnswer,
        isCorrect
      };
    });
    
    const score = correctCount;                    // e.g., 8/10
    const percentage = (score / 10) * 100;        // e.g., 80%
    const isPassed = percentage >= 60;
    
    // Update quiz
    quiz.status = 'completed';
    quiz.completedAt = new Date();
    quiz.score = score;
    quiz.percentage = percentage;
    quiz.isPassed = isPassed;
    quiz.correctAnswers = correctCount;
    quiz.wrongAnswers = 10 - correctCount;
    quiz.duration = timeTaken;
    await quiz.save();
    
    // Calculate points
    let pointsAwarded = 0;
    if (isPassed) {
      pointsAwarded = 10;
      if (percentage === 100) pointsAwarded = 15;  // Perfect score bonus
      if (timeTaken < 900) pointsAwarded += 5;      // Speed bonus (<15 min)
    } else {
      pointsAwarded = -5;
    }
    
    // Update task
    const task = await Task.findById(quiz.taskId);
    if (task) {
      task.quizCompleted = true;
      task.quizPassed = isPassed;
      task.quizScore = percentage;
      task.quizPassedAt = new Date();
      
      if (isPassed) {
        task.status = 'completed';
        task.completed = true;
        task.completedAt = new Date();
        task.pointsEarned = pointsAwarded;
      } else {
        task.status = 'pending';
        task.pointsEarned = pointsAwarded;
      }
      
      await task.save();
    }
    
    // Update user stats
    const user = await User.findById(req.user.id);
    user.totalQuizzes += 1;
    if (isPassed) {
      user.passedQuizzes += 1;
    } else {
      user.failedQuizzes += 1;
    }
    
    // Update average score
    const allScores = await Score.find({ userId: req.user.id });
    const scores = allScores.map(s => s.percentage);
    user.averageScore = scores.length > 0 
      ? scores.reduce((a, b) => a + b) / scores.length 
      : percentage;
    
    user.points += pointsAwarded;
    user.lastActiveDate = new Date();
    await user.save();
    
    // Store score history
    await Score.create({
      userId: req.user.id,
      quizId: quiz._id,
      taskId: quiz.taskId,
      subject: quiz.subject,
      score: score,
      percentage: percentage,
      passed: isPassed,
      attemptNumber: 1,
      timeSpent: timeTaken,
      correctAnswers: correctCount,
      wrongAnswers: 10 - correctCount,
      accuracy: percentage,
      pointsAwarded: pointsAwarded
    });
    
    // Prepare answer details with explanations
    const answerDetails = quiz.questions.map((q, idx) => {
      const userAnswer = answers[idx];
      return {
        questionIndex: idx,
        question: q.question,
        selectedAnswer: userAnswer.selectedAnswer,
        selectedOption: q.options[userAnswer.selectedAnswer],
        correctAnswer: q.correctAnswer,
        correctOption: q.options[q.correctAnswer],
        isCorrect: userAnswer.selectedAnswer === q.correctAnswer,
        explanation: q.explanation
      };
    });
    
    res.json({
      success: true,
      message: isPassed ? 'Quiz passed! Task completed.' : 'Quiz submitted. You did not pass.',
      data: {
        quizId: quiz._id,
        score: score,
        percentage: percentage,
        isPassed: isPassed,
        pointsAwarded: pointsAwarded,
        answers: answerDetails,
        taskUpdated: {
          taskId: task._id,
          status: task.status,
          completed: task.completed,
          quizScore: task.quizScore
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
```

---

## 📧 Middleware

### Authentication Middleware
**File:** `middleware/authMiddleware.js`

```javascript
const jwt = require('jsonwebtoken');

exports.protect = async (req, res, next) => {
  let token;
  
  // Check for token in header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  if (!token) {
    return res.status(401).json({ message: 'Not authorized to access this route' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token is not valid' });
  }
};
```

### Authorization Middleware
**File:** `middleware/authorizationMiddleware.js`

```javascript
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized for this action' });
    }
    next();
  };
};
```

### Error Middleware
**File:** `middleware/errorMiddleware.js`

```javascript
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';
  
  // Mongoose duplicate key error
  if (err.code === 11000) {
    const message = `Duplicate field value entered`;
    err = new ErrorResponse(message, 400);
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid JWT token';
    err = new ErrorResponse(message, 400);
  }
  
  if (err.name === 'TokenExpiredError') {
    const message = 'JWT token expired';
    err = new ErrorResponse(message, 400);
  }
  
  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
};
```

---

## 🗄️ Models

### User Model (models/User.js)
```javascript
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 8, select: false },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  avatar: { type: String, default: '' },
  points: { type: Number, default: 0 },
  totalQuizzes: { type: Number, default: 0 },
  passedQuizzes: { type: Number, default: 0 },
  failedQuizzes: { type: Number, default: 0 },
  averageScore: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  totalFocusMinutes: { type: Number, default: 0 },
  productivityScore: { type: Number, default: 0 },
  preferences: {
    theme: { type: String, enum: ['light', 'dark'], default: 'light' },
    pomodoroWork: { type: Number, default: 25 },
    pomodoroBreak: { type: Number, default: 5 },
    notifications: { type: Boolean, default: true }
  },
  lastActiveDate: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,
  lastLoginAt: Date
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Method to check password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
```

---

## 🚦 Routes

### Routes Index (routes/index.js)
```javascript
const express = require('express');
const router = express.Router();

// Import routes
const authRoutes = require('./authRoutes');
const taskRoutes = require('./taskRoutes');
const quizRoutes = require('./quizRoutes');
const analyticsRoutes = require('./analyticsRoutes');
const adminRoutes = require('./adminRoutes');
const leaderboardRoutes = require('./leaderboardRoutes');
const questionRoutes = require('./questionRoutes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/tasks', taskRoutes);
router.use('/quiz', quizRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/admin', adminRoutes);
router.use('/leaderboard', leaderboardRoutes);
router.use('/questions', questionRoutes);

module.exports = router;
```

---

## 📊 Services

### Quiz Service (services/quizService.js)
```javascript
// Handles core quiz business logic

exports.generateQuestions = (topic, difficulty, count = 10) => {
  // Fetch and shuffle questions
};

exports.calculateScore = (answers, correctAnswers) => {
  // Calculate score and percentage
};

exports.determinePass = (percentage) => {
  return percentage >= 60;
};

exports.calculatePoints = (isPassed, percentage, timeTaken) => {
  let points = 0;
  if (isPassed) {
    points = 10;
    if (percentage === 100) points = 15;
    if (timeTaken < 900) points += 5;
  } else {
    points = -5;
  }
  return points;
};
```

---

## 🔄 Database Connection (config/db.js)

```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
```

---

## 📋 Environment Variables (.env)

```bash
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname

# Authentication
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_EXPIRE=7d

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

---

## 📦 NPM Scripts (package.json)

```json
{
  "scripts": {
    "dev": "nodemon server.js",
    "start": "node server.js",
    "seed": "node scripts/seedQuestions.js",
    "test": "jest --coverage"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.5.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.1.0",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "morgan": "^1.10.0",
    "dotenv": "^16.3.1",
    "express-validator": "^7.0.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

---

## 🚀 Deployment Considerations

**Production Checklist:**
- [ ] Set NODE_ENV=production
- [ ] Use strong JWT_SECRET
- [ ] Enable MongoDB TLS
- [ ] Set up CORS for frontend domain only
- [ ] Configure rate limiting
- [ ] Set up logging & monitoring
- [ ] Enable HTTPS
- [ ] Implement request validation
- [ ] Set up error tracking (Sentry)
- [ ] Configure automated backups

---

**End of Backend Structure Documentation**

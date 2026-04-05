# Database Schema - Complete MERN System

**MongoDB Collections & Detailed Field Specifications**

---

## 📊 Collections Overview

| Collection | Purpose | Records | Indexed Fields |
|-----------|---------|---------|----------------|
| Users | Student & Admin accounts | 1000+ | email, role, createdAt |
| Tasks | Study tasks assigned | 10000+ | userId, createdAt, status |
| Quizzes | Quiz instances & results | 50000+ | userId, taskId, createdAt |
| Scores | Historical quiz attempts | 100000+ | userId, quizId, date |
| Questions | Quiz questions database | 1000+ | topic, difficulty |
| FocusSessions | Study timer history | 50000+ | userId, taskId, date |
| Leaderboard | Cached ranking data | 1 | updatedAt |
| Notifications | User notifications | 10000+ | userId, read |

---

## 👥 Users Collection

**Purpose:** Store user account information and profile data

**Schema:**
```javascript
{
  _id: ObjectId,
  
  // AUTHENTICATION
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false              // Don't return by default
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student'
  },
  
  // PROFILE
  avatar: {
    type: String,
    default: 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'
  },
  bio: {
    type: String,
    maxlength: 500,
    default: ''
  },
  
  // PERFORMANCE METRICS
  points: {
    type: Number,
    default: 0,
    min: 0
  },
  totalQuizzes: {
    type: Number,
    default: 0
  },
  passedQuizzes: {
    type: Number,
    default: 0
  },
  failedQuizzes: {
    type: Number,
    default: 0
  },
  averageScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  // STREAK & ENGAGEMENT
  streak: {
    type: Number,
    default: 0,
    min: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  lastActiveDate: Date,
  
  // FOCUS TRACKING
  totalFocusMinutes: {
    type: Number,
    default: 0,
    min: 0
  },
  productivityScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  // PREFERENCES
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    },
    pomodoroWork: {
      type: Number,
      default: 25,
      min: 1,
      max: 120
    },
    pomodoroBreak: {
      type: Number,
      default: 5,
      min: 1,
      max: 30
    },
    notifications: {
      type: Boolean,
      default: true
    },
    emailNotifications: {
      type: Boolean,
      default: false
    },
    language: {
      type: String,
      enum: ['en', 'hi', 'es', 'fr'],
      default: 'en'
    }
  },
  
  // ACCOUNT STATUS
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  verificationTokenExpires: Date,
  
  // TIMESTAMPS
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date,
  lastLoginAt: Date
}
```

**Indexes:**
```javascript
// Create indexes for performance
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ role: 1 })
db.users.createIndex({ points: -1 })           // For leaderboard
db.users.createIndex({ createdAt: -1 })
db.users.createIndex({ lastActiveDate: -1 })
```

**Example Document:**
```json
{
  "_id": ObjectId("60d5ec49c1a4b5e6f7g8h9i0"),
  "name": "Raj Kumar",
  "email": "raj@example.com",
  "password": "$2a$12$...hashed...",
  "role": "student",
  "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=raj",
  "points": 450,
  "totalQuizzes": 15,
  "passedQuizzes": 12,
  "failedQuizzes": 3,
  "averageScore": 78.5,
  "streak": 7,
  "longestStreak": 14,
  "totalFocusMinutes": 1250,
  "productivityScore": 82,
  "preferences": {
    "theme": "dark",
    "pomodoroWork": 25,
    "pomodoroBreak": 5,
    "notifications": true
  },
  "isActive": true,
  "isVerified": true,
  "createdAt": "2026-01-15T10:30:00Z",
  "lastLoginAt": "2026-03-24T14:55:00Z"
}
```

---

## 📝 Tasks Collection

**Purpose:** Store student tasks with study duration and quiz linkage

**Schema:**
```javascript
{
  _id: ObjectId,
  
  // TASK BASIC INFO
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    default: '',
    maxlength: 1000
  },
  
  // CLASSIFICATION
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['study', 'project', 'personal', 'coding', 'other'],
    default: 'study'
  },
  tags: [{
    type: String,
    lowercase: true
  }],
  
  // TOPIC FOR QUIZ LINKAGE
  requiredLanguage: {
    type: String,
    enum: ['java', 'python', 'c', 'html', 'css', 'javascript',
           'mathematics', 'science', 'history', 'english', 'aptitude', null],
    default: null,
    lowercase: true
  },
  
  // DURATION & TIMING
  plannedDuration: {
    type: Number,
    default: 60,                // minutes
    min: 1,
    max: 480
  },
  dueDate: Date,
  startDate: Date,
  
  // STUDY SESSION TRACKING
  studyStartedAt: Date,
  studyCompletedAt: Date,
  actualStudyDuration: {
    type: Number,
    default: 0,                 // actual minutes studied
    min: 0
  },
  
  // TASK STATUS
  status: {
    type: String,
    enum: ['pending', 'in-study', 'quiz-available', 'in-progress', 'completed', 'failed', 'archived'],
    default: 'pending'
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: Date,
  
  // QUIZ CONFIGURATION
  quizRequired: {
    type: Boolean,
    default: false              // Must pass quiz to mark complete
  },
  linkedQuizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    default: null
  },
  quizCompleted: {
    type: Boolean,
    default: false
  },
  quizPassed: {
    type: Boolean,
    default: false
  },
  quizPassedAt: Date,
  quizScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  // QUIZ ATTEMPT TRACKING
  taskQuizStarted: {
    type: Boolean,
    default: false
  },
  taskQuizStartedAt: Date,
  quizAttempts: {
    type: Number,
    default: 0
  },
  
  // PERFORMANCE DATA
  pointsEarned: {
    type: Number,
    default: 0
  },
  streakContribution: {
    type: Boolean,
    default: false              // Did this contribute to daily streak?
  },
  
  // TIMESTAMPS
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date,
  deletedAt: Date               // Soft delete
}
```

**Indexes:**
```javascript
db.tasks.createIndex({ user: 1, createdAt: -1 })
db.tasks.createIndex({ status: 1 })
db.tasks.createIndex({ requiredLanguage: 1 })        // For quiz filtering
db.tasks.createIndex({ completed: 1 })
db.tasks.createIndex({ dueDate: 1 })
db.tasks.createIndex({ "user": 1, "linkedQuizId": 1 }) // For finding quiz by user+task
```

**Example Document:**
```json
{
  "_id": ObjectId("60d5ec49c1a4b5e6f7g8h9i0"),
  "user": ObjectId("60d5ec49c1a4b5e6f7g8h9i1"),
  "title": "Master Java OOP",
  "description": "Learn Object-Oriented Programming concepts in Java",
  "priority": "high",
  "category": "study",
  "tags": ["oop", "java", "fundamentals"],
  "requiredLanguage": "java",
  "plannedDuration": 90,
  "studyStartedAt": "2026-03-24T09:00:00Z",
  "studyCompletedAt": "2026-03-24T10:30:00Z",
  "actualStudyDuration": 90,
  "status": "completed",
  "completed": true,
  "completedAt": "2026-03-24T11:15:00Z",
  "quizRequired": true,
  "linkedQuizId": ObjectId("60d5ec49c1a4b5e6f7g8h9i2"),
  "quizCompleted": true,
  "quizPassed": true,
  "quizPassedAt": "2026-03-24T11:15:00Z",
  "quizScore": 85,
  "pointsEarned": 10,
  "createdAt": "2026-03-24T08:00:00Z"
}
```

---

## 🧩 Quizzes Collection

**Purpose:** Store quiz instances, questions, and user responses

**Schema:**
```javascript
{
  _id: ObjectId,
  
  // QUIZ IDENTIFICATION
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    default: null
  },
  
  // QUIZ METADATA
  subject: {
    type: String,
    required: true,
    enum: ['Java', 'Python', 'C', 'HTML', 'CSS', 'JavaScript',
           'Mathematics', 'Science', 'History', 'English', 'Aptitude']
  },
  title: {
    type: String,
    required: true,
    default: function() {
      return `${this.subject} Quiz - ${new Date().toLocaleDateString()}`;
    }
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  
  // QUESTIONS ARRAY
  questions: [{
    questionIndex: Number,
    question: String,
    options: {
      type: [String],
      minlength: 4,
      maxlength: 4
    },
    correctAnswer: {
      type: Number,
      min: 0,
      max: 3
    },
    explanation: String,
    category: String                // Sub-topic of main topic
  }],
  
  totalQuestions: {
    type: Number,
    default: 10,
    min: 5,
    max: 50
  },
  timeLimit: {
    type: Number,
    default: 30,                    // minutes
    min: 5,
    max: 120
  },
  
  // USER RESPONSES
  answers: [{
    questionIndex: Number,
    selectedAnswer: Number,
    isCorrect: Boolean,
    markedTime: Number              // seconds elapsed when click submit
  }],
  
  // SCORING
  score: {
    type: Number,
    default: 0,
    min: 0,
    max: 10
  },
  percentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  isPassed: {
    type: Boolean,
    default: false
  },
  correctAnswers: {
    type: Number,
    default: 0
  },
  wrongAnswers: {
    type: Number,
    default: 0
  },
  unattempted: {
    type: Number,
    default: 0
  },
  
  // TIMING
  status: {
    type: String,
    enum: ['in-progress', 'submitted', 'completed', 'expired'],
    default: 'in-progress'
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  duration: Number,                 // seconds taken
  
  // REVIEW
  reviewAnalysis: {
    averageResponseTime: Number,    // seconds
    fastestQuestion: { questionIndex: Number, time: Number },
    slowestQuestion: { questionIndex: Number, time: Number },
    accuracy: {
      byCategory: {}                // {category: percentage}
    }
  },
  
  // METADATA
  retakeAllowed: {
    type: Boolean,
    default: true
  },
  retakeCount: {
    type: Number,
    default: 0
  },
  previousAttempts: [{
    quizId: mongoose.Schema.Types.ObjectId,
    score: Number,
    completedAt: Date
  }],
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date
}
```

**Indexes:**
```javascript
db.quizzes.createIndex({ userId: 1, createdAt: -1 })
db.quizzes.createIndex({ taskId: 1 })
db.quizzes.createIndex({ subject: 1 })
db.quizzes.createIndex({ status: 1 })
db.quizzes.createIndex({ "userId": 1, "subject": 1 })  // For user's performance in subject
```

**Example Document:**
```json
{
  "_id": ObjectId("60d5ec49c2b5c6e7f8g9h0i1"),
  "userId": ObjectId("60d5ec49c1a4b5e6f7g8h9i1"),
  "taskId": ObjectId("60d5ec49c1a4b5e6f7g8h9i0"),
  "subject": "Java",
  "title": "Java Quiz - 24 Mar 2026",
  "difficulty": "medium",
  "questions": [
    {
      "questionIndex": 0,
      "question": "What is the main method signature?",
      "options": [
        "public static void main(String[] args)",
        "public void main(String args)",
        "static void main",
        "void main(String[] args)"
      ],
      "correctAnswer": 0,
      "explanation": "The correct signature is..."
    }
    // ... 9 more questions
  ],
  "totalQuestions": 10,
  "timeLimit": 30,
  "answers": [
    { "questionIndex": 0, "selectedAnswer": 0, "isCorrect": true, "markedTime": 45 },
    { "questionIndex": 1, "selectedAnswer": 2, "isCorrect": false, "markedTime": 120 }
    // ... 8 more answers
  ],
  "score": 8,
  "percentage": 80,
  "isPassed": true,
  "correctAnswers": 8,
  "wrongAnswers": 2,
  "status": "completed",
  "startedAt": "2026-03-24T10:30:00Z",
  "completedAt": "2026-03-24T10:45:00Z",
  "duration": 900
}
```

---

## 📊 Scores Collection

**Purpose:** Historical record of all quiz attempts for analytics

**Schema:**
```javascript
{
  _id: ObjectId,
  
  // REFERENCES
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    default: null
  },
  
  // SCORE DETAILS
  subject: String,                  // Topic name for quick filtering
  score: Number,                    // Raw score (e.g., 8/10)
  percentage: Number,               // Percentage (80)
  marksObtained: Number,             // Same as score
  totalMarks: {
    type: Number,
    default: 10
  },
  passed: Boolean,                  // percentage >= 60
  
  // ATTEMPT TRACKING
  attemptNumber: {
    type: Number,
    default: 1
  },
  timeSpent: Number,                // seconds
  
  // ACCURACY & PERFORMANCE
  correctAnswers: Number,
  wrongAnswers: Number,
  accuracy: Number,                 // percentage (correctAnswers/totalMarks * 100)
  
  // POINTS
  pointsAwarded: {
    type: Number,
    default: 0
  },
  
  // TIMESTAMP (for analytics)
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  date: {
    type: String,
    default: function() {
      return new Date().toISOString().split('T')[0];  // YYYY-MM-DD
    }
  },
  month: {
    type: String,
    default: function() {
      return new Date().toISOString().substring(0, 7); // YYYY-MM
    }
  },
  week: {
    type: String,
    default: function() {
      const date = new Date();
      const weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
      return weekStart.toISOString().split('T')[0];
    }
  },
  
  // METADATA
  device: String,                   // Browser, Mobile, etc.
  ipAddress: String,                // For fraud detection
  
  createdAt: {
    type: Date,
    default: Date.now
  }
}
```

**Indexes:**
```javascript
db.scores.createIndex({ userId: 1, timestamp: -1 })
db.scores.createIndex({ userId: 1, subject: 1, timestamp: -1 })
db.scores.createIndex({ userId: 1, date: 1 })
db.scores.createIndex({ userId: 1, month: 1 })
db.scores.createIndex({ subject: 1, timestamp: -1 })
db.scores.createIndex({ timestamp: -1 })
db.scores.createIndex({ passed: 1 })
```

**Example Document:**
```json
{
  "_id": ObjectId("60d5ec49c3c6d7e8f9g0h1i2"),
  "userId": ObjectId("60d5ec49c1a4b5e6f7g8h9i1"),
  "quizId": ObjectId("60d5ec49c2b5c6e7f8g9h0i1"),
  "taskId": ObjectId("60d5ec49c1a4b5e6f7g8h9i0"),
  "subject": "Java",
  "score": 8,
  "percentage": 80,
  "passed": true,
  "attemptNumber": 1,
  "timeSpent": 900,
  "correctAnswers": 8,
  "wrongAnswers": 2,
  "accuracy": 80,
  "pointsAwarded": 10,
  "timestamp": "2026-03-24T10:45:00Z",
  "date": "2026-03-24",
  "month": "2026-03",
  "device": "Chrome"
}
```

---

## ❓ Questions Collection

**Purpose:** Master database of quiz questions organized by topic

**Schema:**
```javascript
{
  _id: ObjectId,
  
  // QUESTION CONTENT
  question: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 500
  },
  topic: {
    type: String,
    required: true,
    enum: ['Java', 'Python', 'C', 'HTML', 'CSS', 'JavaScript',
           'Mathematics', 'Science', 'History', 'English', 'Aptitude']
  },
  subtopic: String,                 // More specific categorization
  
  // OPTIONS & ANSWER
  options: {
    a: { type: String, required: true },
    b: { type: String, required: true },
    c: { type: String, required: true },
    d: { type: String, required: true }
  },
  correctAnswer: {
    type: String,
    enum: ['a', 'b', 'c', 'd'],
    required: true
  },
  
  // EXPLANATION & REFERENCE
  explanation: {
    type: String,
    maxlength: 1000
  },
  referenceLink: String,
  
  // DIFFICULTY & CLASSIFICATION
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  tags: [String],
  
  // USAGE STATISTICS
  timesUsed: {
    type: Number,
    default: 0
  },
  correctPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  averageTimeToAnswer: Number,      // seconds
  feedbackScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  
  // STATUS & MANAGEMENT
  isActive: {
    type: Boolean,
    default: true
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // TIMESTAMPS
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date,
  approvedAt: Date
}
```

**Indexes:**
```javascript
db.questions.createIndex({ topic: 1, difficulty: 1 })
db.questions.createIndex({ topic: 1, isActive: 1 })
db.questions.createIndex({ subtopic: 1 })
db.questions.createIndex({ createdAt: -1 })
```

**Example Document:**
```json
{
  "_id": ObjectId("60d5ec49c4d7e8f9g0h1i2j3"),
  "question": "What is the time complexity of binary search?",
  "topic": "Java",
  "subtopic": "Data Structures",
  "options": {
    "a": "O(n)",
    "b": "O(log n)",
    "c": "O(n^2)",
    "d": "O(1)"
  },
  "correctAnswer": "b",
  "explanation": "Binary search divides the array in half at each step...",
  "difficulty": "medium",
  "tags": ["arrays", "searching", "algorithms"],
  "timesUsed": 125,
  "correctPercentage": 78,
  "isActive": true,
  "isApproved": true,
  "createdAt": "2026-01-01T00:00:00Z"
}
```

---

## ⏱️ Focus Sessions Collection

**Purpose:** Track user study/focus sessions for analytics

**Schema:**
```javascript
{
  _id: ObjectId,
  
  // REFERENCES
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    default: null
  },
  
  // DURATION
  plannedDuration: {
    type: Number,
    required: true,            // minutes
    min: 1,
    max: 120
  },
  actualDuration: Number,               // actual time spent (minutes)
  
  // TIMING
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  pausedAt: [Date],                     // Array of pause timestamps
  resumedAt: [Date],                    // Array of resume timestamps
  
  // STATUS
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'paused', 'interrupted', 'abandoned'],
    default: 'in-progress'
  },
  
  // PAUSE/RESUME TRACKING
  pauseCount: {
    type: Number,
    default: 0
  },
  totalPauseDuration: Number,           // total seconds paused
  
  // FOCUS MODE
  focusModeEnabled: {
    type: Boolean,
    default: false
  },
  fullScreenMode: {
    type: Boolean,
    default: false
  },
  
  // POST-SESSION
  pointsEarned: {
    type: Number,
    default: 0
  },
  streakContribution: Boolean,
  userNotes: String,                    // Notes added after session
  
  // ANALYTICS
  distractionCount: {
    type: Number,
    default: 0                // Tab switches or alerts during session
  },
  focusScore: {
    type: Number,
    min: 0,
    max: 100
  },
  
  // METADATA
  deviceType: String,                   // Desktop, Mobile, Tablet
  browser: String,
  
  createdAt: {
    type: Date,
    default: Date.now
  }
}
```

**Indexes:**
```javascript
db.focusessions.createIndex({ userId: 1, completedAt: -1 })
db.focusessions.createIndex({ userId: 1, createdAt: -1 })
db.focusessions.createIndex({ status: 1 })
db.focusessions.createIndex({ taskId: 1 })
```

---

## 🏆 Leaderboard Collection

**Purpose:** Cached leaderboard data for fast retrieval

**Schema:**
```javascript
{
  _id: ObjectId,
  
  // RANKING DATA
  ranking: [{
    rank: Number,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    userName: String,
    userEmail: String,
    points: Number,
    totalQuizzes: Number,
    passedQuizzes: Number,
    averageScore: Number,
    streak: Number,
    lastUpdated: Date
  }],
  
  // PERIOD
  period: {
    type: String,
    enum: ['all-time', 'monthly', 'weekly', 'daily'],
    default: 'all-time'
  },
  month: String,                        // YYYY-MM (for monthly)
  week: String,                         // YYYY-WXX (for weekly)
  date: String,                         // YYYY-MM-DD (for daily)
  
  // METADATA
  totalStudents: Number,
  topScore: Number,
  bottomScore: Number,
  averageScore: Number,
  
  // CACHE MANAGEMENT
  updatedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: Date                       // TTL index for auto-cleanup
}
```

**Indexes:**
```javascript
db.leaderboards.createIndex({ period: 1, updatedAt: -1 })
db.leaderboards.createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0 })
```

---

## 🔔 Notifications Collection

**Purpose:** Store user notifications and alerts

**Schema:**
```javascript
{
  _id: ObjectId,
  
  // RECIPIENT
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // NOTIFICATION CONTENT
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['quiz-available', 'study-session', 'score-update', 'achievement', 
           'leaderboard', 'system', 'announcement', 'reminder'],
    default: 'system'
  },
  
  // RELATED ENTITY
  relatedEntityType: String,            // Task, Quiz, User, etc.
  relatedEntityId: mongoose.Schema.Types.ObjectId,
  
  // ACTION
  actionUrl: String,                    // URL to navigate to
  actionData: mongoose.Schema.Types.Mixed,
  
  // STATUS
  read: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  
  // PRIORITY
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  
  // EXPIRATION (Notifications auto-delete after 30 days)
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  },
  
  // TIMESTAMPS
  createdAt: {
    type: Date,
    default: Date.now
  }
}
```

**Indexes:**
```javascript
db.notifications.createIndex({ userId: 1, createdAt: -1 })
db.notifications.createIndex({ userId: 1, read: 1 })
db.notifications.createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0 })
```

---

## 🔗 Relationships Summary

```
Relationships:
├── Users (1) ──→ (Many) Tasks
│   Auth, Profile, Preferences
│
├── Users (1) ──→ (Many) Quizzes
│   Quiz attempts
│
├── Users (1) ──→ (Many) Scores
│   Historical score records
│
├── Users (1) ──→ (Many) FocusSessions
│   Study session history
│
├── Tasks (1) ──→ (Many) Quizzes
│   Task-linked quizzes
│
├── Tasks (1) ──→ (1) linkedQuizId
│   Current quiz for task (denormalized)
│
├── Quizzes (1) ──→ (Many) Scores
│   Historical attempts
│
└── Questions (1) ──→ (Used in Many) Quizzes
    Questions selected for quiz instances
```

---

## 📈 Query Examples

**Find user's quiz performance:**
```javascript
db.scores.find({ userId: ObjectId("..."), subject: "Java" })
  .sort({ timestamp: -1 })
```

**Get top 10 students:**
```javascript
db.users.find({ role: "student" })
  .sort({ points: -1 })
  .limit(10)
```

**Get user's task with linked quiz:**
```javascript
db.tasks.findOne({ _id: taskId })
  .populate(['user', 'linkedQuizId'])
```

**Get all passed quizzes (analytics):**
```javascript
db.scores.find({ userId: ObjectId("..."), passed: true })
  .group({ _id: "$subject", count: { $sum: 1 }, avgScore: { $avg: "$percentage" } })
```

---

**End of Database Schema Documentation**

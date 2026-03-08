# System Architecture: Topic-Based Quiz Feature

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                            │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │  Tasks Page      │  │  Quiz Test Page  │  │  Results Page│  │
│  │  - New Task      │  │  - 10 Questions  │  │  - Score     │  │
│  │  - Start Quiz    │  │  - Timer (30m)   │  │  - Answers   │  │
│  │  - Quiz Badge    │  │  - Navigate      │  │  - Complete  │  │
│  └──────────────────┘  └──────────────────┘  └──────────────┘  │
└────────┬─────────────────┬───────────────────────┬──────────────┘
         │                 │                       │
         ↓                 ↓                       ↓
┌─────────────────────────────────────────────────────────────────┐
│                    API CLIENT LAYER                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  quizAPI Methods                                         │  │
│  │  - generateTaskQuiz(taskId, data)                       │  │
│  │  - submitTaskQuiz(quizId, data)                         │  │
│  │  - getTaskQuiz(taskId)                                  │  │
│  │  - getTaskQuizStatus(taskId)                            │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────┬──────────────────────────────────────────────────────────┘
         │
         │ HTTP Requests
         ↓
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND API ROUTES                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  POST   /api/quiz/task/:taskId/generate                 │  │
│  │  PUT    /api/quiz/:id/task-submit                       │  │
│  │  GET    /api/quiz/task/:taskId                          │  │
│  │  GET    /api/quiz/task/:taskId/status                   │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────┬──────────────────────────────────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────────────────────────────────┐
│                    CONTROLLER LAYER                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  quizController.js                                       │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │ generateTaskQuiz()                                  │ │  │
│  │  │ - Verify task ownership                            │ │  │
│  │  │ - Get topic from task.requiredLanguage            │ │  │
│  │  │ - Generate 10 random questions                     │ │  │
│  │  │ - Create quiz document                             │ │  │
│  │  │ - Link quiz to task                                │ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │ submitTaskQuiz()                                    │ │  │
│  │  │ - Validate answers against correct answers         │ │  │
│  │  │ - Calculate score and percentage                   │ │  │
│  │  │ - Check if 60% passed                              │ │  │
│  │  │ - AUTO-UPDATE TASK if passed                       │ │  │
│  │  │ - Return results                                    │ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │ getTaskQuiz(), getTaskQuizStatus()                  │ │  │
│  │  │ - Retrieve quiz for task                           │ │  │
│  │  │ - Return status information                         │ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────┬──────────────────────────────────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                  │
│  ┌────────────────────┐  ┌────────────────────────────────────┐ │
│  │  Task Model        │  │  Quiz Model (Extended Questions)   │ │
│  │  ┌────────────────┐│  │  ┌──────────────────────────────┐ │ │
│  │  │ New Fields:    ││  │  │  Question Database:          │ │ │
│  │  │ - linkedQuizId ││  │  │  - Java (10 questions)       │ │ │
│  │  │ - quizRequired ││  │  │  - Python (10 questions)     │ │ │
│  │  │ - taskQuizStr..││  │  │  - C (10 questions)          │ │ │
│  │  │ - taskQuizStr..││  │  │  - HTML (10 questions)       │ │ │
│  │  │                ││  │  │  - CSS (10 questions)        │ │ │
│  │  │ Existing:      ││  │  │  - Mathematics               │ │ │
│  │  │ - requiredLang ││  │  │  - Science                   │ │ │
│  │  │ - quizComplete ││  │  │  - History                   │ │ │
│  │  │ - quizPassedAt ││  │  │  - English                   │ │ │
│  │  │                ││  │  │  - Aptitude                  │ │ │
│  │  └────────────────┘│  │  └──────────────────────────────┘ │ │
│  └────────────────────┘  └────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow: Create Task → Pass Quiz → Complete Task

```
STEP 1: CREATE TASK
┌──────────────────────────────────────┐
│ User Creates Task                    │
│ - Title: "Learn Java"                │
│ - requiredLanguage: "java" ✨        │
└──────┬───────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────┐
│ Task Saved to Database               │
│ - quizRequired: false (default)       │
│ - quizCompleted: false               │
│ - linkedQuizId: null                 │
└──────────────────────────────────────┘

STEP 2: START QUIZ
┌──────────────────────────────────────┐
│ User Clicks "Start Java Quiz"        │
└──────┬───────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────┐
│ POST /api/quiz/task/taskId/generate  │
│ Server:                              │
│ 1. Validate task ownership           │
│ 2. Extract requiredLanguage: "java"  │
│ 3. Get 10 random Java questions      │
│ 4. Create Quiz document              │
│ 5. Link to task (linkedQuizId)       │
│ 6. Update task flags                 │
└──────┬───────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────┐
│ Quiz Interface Loads                 │
│ - Question 1/10 displayed            │
│ - Timer starts (30 min)              │
│ - Navigation enabled                 │
└──────────────────────────────────────┘

STEP 3: ANSWER QUESTIONS
┌──────────────────────────────────────┐
│ User:                                │
│ - Answers all 10 questions           │
│ - Navigates between questions        │
│ - Timer counts down                  │
└──────┬───────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────┐
│ User Clicks "Submit Quiz"            │
│ OR Timer reaches 0:00 (auto)         │
└──────────────────────────────────────┘

STEP 4: GRADE QUIZ
┌──────────────────────────────────────┐
│ PUT /api/quiz/:id/task-submit        │
│ Server:                              │
│ 1. Validate quiz ownership           │
│ 2. Compare answers to correct answers│
│ 3. Calculate score & percentage      │
│ 4. Check if score >= 60%             │
└──────┬───────────────────────────────┘
       │
       ├──── PASS (70%) ─────┐
       │                      │
       ↓                      ↓
   YES: SCORE >= 60%    NO: SCORE < 60%
       │                      │
       ↓                      ↓
   ✅ UPDATE TASK         ❌ KEEP INCOMPLETE
       │                      │
┌──────────────────────────────────────┐
│ Automatic Updates:                   │
│ - completed: true              │ - completed: false
│ - completedAt: now            │ - completedAt: null
│ - quizCompleted: true          │ - quizCompleted: false
│ - quizPassedAt: now            │ - quizPassedAt: null
└─────────────────────────────────────┘

STEP 5: SHOW RESULTS
┌──────────────────────────────────────┐
│ Results Page Displayed               │
│ ✅ PASSED / ❌ FAILED                │
│ - Score: 70% (7/10)                 │
│ - All answers reviewed              │
│ - Task completion shown             │
└──────────────────────────────────────┘

STEP 6: DASHBOARD UPDATE
┌──────────────────────────────────────┐
│ Return to Tasks/Dashboard            │
│ - Task marked with ✅               │
│ - Checkbox checked                  │
│ - Quiz badge: ✅ java              │
│ - Analytics updated                 │
└──────────────────────────────────────┘
```

---

## 📊 Database Schema

### Task Collection (Updated)

```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  title: String,
  description: String,
  priority: String,          // low, medium, high
  category: String,          // study, project, personal, other
  dueDate: Date,
  completed: Boolean,
  completedAt: Date,
  tags: [String],
  
  // EXISTING FIELDS
  requiredLanguage: String,  // java, python, c, html, css, etc.
  quizCompleted: Boolean,
  quizPassedAt: Date,
  
  // NEW FIELDS ✨
  linkedQuizId: ObjectId,    // Reference to Quiz document
  quizRequired: Boolean,      // Is quiz mandatory
  taskQuizStarted: Boolean,   // Has quiz been initiated
  taskQuizStartedAt: Date,    // When quiz started
  
  createdAt: Date,
  updatedAt: Date
}
```

### Quiz Collection (Existing - Reused)

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  subject: String,           // Topic: java, python, etc.
  title: String,             // Generated title
  questions: [{
    question: String,
    options: [String, String, String, String],
    correctAnswer: Number,   // 0-3
    explanation: String
  }],
  totalQuestions: Number,
  timeLimit: Number,         // minutes (30)
  isPassed: Boolean,         // >= 60%
  answers: [{
    questionIndex: Number,
    selectedAnswer: Number,
    isCorrect: Boolean
  }],
  score: Number,             // Correct count
  percentage: Number,        // Score percentage
  status: String,            // in-progress, completed
  startedAt: Date,
  completedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🎯 Component Hierarchy

```
App.jsx (Routes)
  ├── /tasks → Tasks.jsx (Enhanced)
  │   ├── TaskForm (Modal)
  │   ├── TaskCard (with Quiz Button) ✨
  │   └── TaskList
  ├── /task-quiz/:taskId/:quizId → TaskQuizTest.jsx ✨ (New)
  │   ├── QuizHeader
  │   ├── ProgressBar
  │   ├── QuestionDisplay
  │   ├── OptionsDisplay
  │   ├── NavigationBar
  │   └── TimerDisplay
  └── /task-quiz-results/:taskId/:quizId → TaskQuizResults.jsx ✨ (New)
      ├── ResultsHeader
      ├── ScoreCard
      ├── TaskCompletionBadge
      ├── AnalysisCards
      ├── AnswerReview
      └── ActionButtons
```

---

## 🔐 Security Flow

```
Request comes in
  ↓
┌─────────────────────────────────────┐
│ Authentication Check                │
│ - Token valid?                      │
│ - User logged in?                   │
└──────────┬──────────────────────────┘
           │
           ↓
┌─────────────────────────────────────┐
│ Authorization Check                 │
│ - Does user own the task?           │
│ - Does task have linkedQuizId?      │
│ - Does quiz belong to user?         │
└──────────┬──────────────────────────┘
           │
           ↓
┌─────────────────────────────────────┐
│ Input Validation                    │
│ - Valid task ID format?             │
│ - Valid quiz ID format?             │
│ - Answers array length correct?     │
└──────────┬──────────────────────────┘
           │
           ↓
┌─────────────────────────────────────┐
│ Server-Side Scoring                 │
│ - Compare user answers to DB        │
│ - Calculate score server-side       │
│ - Prevent manipulation              │
└──────────┬──────────────────────────┘
           │
           ↓
┌─────────────────────────────────────┐
│ Data Update                         │
│ - Update quiz record                │
│ - Auto-update task if passed        │
│ - Return sanitized response         │
└─────────────────────────────────────┘
```

---

## ⚡ Performance Considerations

### Database Queries
- **Task Creation**: 1 insert
- **Quiz Generation**: 1 read (questions) + 1 insert (quiz) + 1 update (task)
- **Quiz Submission**: 1 read (quiz) + 1 update (quiz) + 1 update (task if passed)
- **Results Retrieval**: 1 read (quiz)

### Network Requests
1. **Generate**: 1 POST request
2. **Test**: 0 requests during test (client-side answer tracking)
3. **Submit**: 1 PUT request
4. **Results**: 1-2 GET requests

### Client-Side State Management
- Quiz state cached in React
- Answers tracked in local state (no backend calls until submit)
- Task data cached for display

### Optimization Techniques
- Lazy load quiz components
- Pre-fetch question database on app load
- Cache quiz data during test
- Minimal re-renders with proper hooks

---

## 💡 Feature Interactions

### Task Management
```
Create Task → Edit Task → Start Quiz → Complete Task
          ↓                     ↓
    Set Topic           Generate Quiz
    Select Language      Show Questions
    Save to DB          Track Answers
```

### Quiz Flow
```
Generate → Test → Answer → Submit → Grade → Results
   ↓        ↓        ↓        ↓       ↓        ↓
 Create   Display   Track   Send   Check    Show
 10 Qs   Questions  Answers Answers 60%+   Scores
 in DB   & Timer    Local   Server  Test    Update
```

### Dashboard Integration
```
Tasks Page: Shows completed/pending
    ↓
Quiz Pass: Updates task status
    ↓
Dashboard: Reflects completion
    ↓
Analytics: Tracks completed tasks
```

---

**Architecture Version**: 1.0  
**Last Updated**: March 8, 2026  
**Status**: Production Ready ✅

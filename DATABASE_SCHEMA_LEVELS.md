# Multi-Level Assessment System & Leaderboard - Database Schema

## Overview
This document describes the enhanced database schema for the multi-level assessment system, time-based scoring, leaderboard ranking, and daily task management.

## New Database Models

### 1. Subject Model
Defines subjects/courses with multiple difficulty levels.

```javascript
{
  _id: ObjectId,
  name: String (Required, Unique, Enum),
  // Supported: 'Java', 'Python', 'DBMS', 'Web Development', 'Data Structures', 
  // 'Algorithms', 'Operating Systems', 'Computer Networks', 'Machine Learning', 'Cybersecurity'
  description: String,
  iconColor: String (Default: '#3498db'),
  isActive: Boolean (Default: true),
  totalLevels: Number (Default: 4),
  levelNames: {
    1: String (Default: 'Beginner'),
    2: String (Default: 'Intermediate'),
    3: String (Default: 'Advanced'),
    4: String (Default: 'Expert')
  },
  createdAt: Date,
  updatedAt: Date
}
```

### 2. Level Model
Stores level-specific tests with questions for each subject.

```javascript
{
  _id: ObjectId,
  subject: ObjectId (Ref: Subject, Required),
  levelNumber: Number (1-4, Required),
  title: String (Required), // e.g., "Level 1 - Beginner"
  description: String,
  questions: [{
    question: String (Required),
    options: [String] (4 options, Required),
    correctAnswer: Number (0-3, Required),
    explanation: String,
    difficulty: String (Enum: 'easy', 'medium', 'hard')
  }],
  totalQuestions: Number,
  timeLimit: Number (In minutes, Default: 60),
  passingPercentage: Number (Default: 60),
  maxAttempts: Number (Default: 3),
  isActive: Boolean (Default: true),
  createdAt: Date,
  updatedAt: Date
}

Unique Index: { subject: 1, levelNumber: 1 }
```

### 3. LevelTest Model
Records each student's attempt at a level test with time-based scoring.

```javascript
{
  _id: ObjectId,
  userId: ObjectId (Ref: User, Required),
  subject: ObjectId (Ref: Subject, Required),
  level: ObjectId (Ref: Level, Required),
  levelNumber: Number (1-4, Required - denormalized),
  questions: [{
    question: String,
    options: [String],
    correctAnswer: Number,
    explanation: String
  }],
  totalQuestions: Number,
  answers: [{
    questionIndex: Number,
    selectedAnswer: Number,
    isCorrect: Boolean
  }],
  score: Number (0-100 percentage),
  percentage: Number,
  correctCount: Number,
  isPassed: Boolean,
  timeTakenSeconds: Number (Time spent on test),
  timeBonus: Number (Bonus points for speed),
  totalPoints: Number (score + timeBonus),
  status: String (Enum: 'in-progress', 'completed'),
  startedAt: Date,
  completedAt: Date,
  attemptNumber: Number,
  antiCheatWarnings: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### 4. LevelProgress Model
Tracks user's progress across all levels in a subject.

```javascript
{
  _id: ObjectId,
  user: ObjectId (Ref: User, Required),
  subject: ObjectId (Ref: Subject, Required),
  subjectName: String (Denormalized),
  currentLevel: Number (1-4, Default: 1),
  unlockedLevels: [Number] (Array of unlocked level numbers, Default: [1]),
  levelScores: {
    level1: {
      attempts: Number,
      bestScore: Number,
      completed: Boolean,
      completedAt: Date
    },
    level2: { ... },
    level3: { ... },
    level4: { ... }
  },
  totalPointsEarned: Number,
  completionPercentage: Number (0-100),
  isCompleted: Boolean,
  completedAt: Date,
  startedAt: Date,
  lastAttemptAt: Date,
  createdAt: Date,
  updatedAt: Date
}

Unique Index: { user: 1, subject: 1 }
```

### 5. DailyTask Model
Manages day-to-day tasks with tracking and categorization.

```javascript
{
  _id: ObjectId,
  user: ObjectId (Ref: User, Required),
  title: String (Required, Max 255),
  description: String,
  priority: String (Enum: 'low', 'medium', 'high', Default: 'medium'),
  category: String (Enum: 'study', 'project', 'personal', 'exercise', 
                   'health', 'other', Default: 'personal'),
  taskDate: Date (Normalized to start of day, Required),
  completed: Boolean (Default: false),
  completedAt: Date,
  dueTime: String (HH:MM format),
  estimatedMinutes: Number,
  actualMinutes: Number,
  tags: [String],
  notes: String,
  relatedSubject: String (Enum of supported subjects, can be null),
  relatedLevel: Number (1-4, can be null),
  reminderSet: Boolean,
  reminderTime: String (HH:MM format),
  isRecurring: Boolean,
  recurringPattern: String (Enum: 'daily', 'weekly', 'monthly'),
  createdAt: Date,
  updatedAt: Date
}

Indexes:
- { user: 1, taskDate: 1 }
- { user: 1, completed: 1 }
- { taskDate: 1 }
```

## Updated Models

### User Model Enhancements

New fields added to track level progression and ranking:

```javascript
{
  // Existing fields...
  totalRankingPoints: Number (Default: 0), // For leaderboard ranking
  levelHistory: [{
    subject: String,
    level: Number,
    testId: ObjectId (Ref: LevelTest),
    score: Number,
    timeTakenSeconds: Number,
    timeBonus: Number,
    totalPoints: Number,
    passed: Boolean,
    attemptNumber: Number,
    completedAt: Date
  }]
}
```

### Quiz Model Enhancements

New fields for level-based test tracking:

```javascript
{
  // Existing fields...
  linkedLevelTestId: ObjectId (Ref: LevelTest),
  level: Number, // For level-based tests: 1-4
  timeTakenSeconds: Number, // For time-based scoring
  timeBonus: Number, // Bonus points for quick completion
  totalPoints: Number // score + timeBonus
}
```

## Time-Based Scoring System

### Scoring Formula

```
Base Score = (Correct Answers / Total Questions) × 100

Time Bonus Calculation:
  If time taken ≤ 60% of time limit:  +30 points (full bonus)
  If 60% < time taken ≤ 100%:        +30 × (1 - (time% - 60) / 40) points
  If time taken > 100% of time limit: 0 points (no bonus)

Total Points = Base Score + Time Bonus
```

### Example:
- Time limit: 60 minutes
- Student completes in 30 minutes (50% of time limit) → Full bonus (+30)
- Student scored 85% on exam
- Total Points = 85 + 30 = 115 points

## Leaderboard Ranking System

### Global Ranking
Students are ranked by `totalRankingPoints` which accumulates from:
- All level tests passed
- Time bonuses earned
- Level completion multipliers

### Subject-Specific Ranking
Students are ranked within each subject by:
- Total points earned in that subject
- Current level progression
- Completion percentage

### Ranking Query
```javascript
db.users.find({})
  .sort({ totalRankingPoints: -1 })
  .projection({ name, email, avatar, totalRankingPoints, ... })
```

## Level Unlocking System

### Progression Rules:
1. **Level 1**: Automatically unlocked for all students
2. **Level 2**: Unlocked after passing Level 1 (score ≥ 60%)
3. **Level 3**: Unlocked after passing Level 2
4. **Level 4**: Unlocked after passing Level 3

### Attempt Limits:
- Each level allows up to 3 attempts (configurable per level)
- After exhausting attempts, user must wait or request retest

### Progress Persistence:
- Best score from all attempts is recorded
- Once level is passed, user can retake it but score doesn't improve ranking
- Current level always reflects the highest unlocked level + 1

## Indexes for Performance

```javascript
// Level tests
db.leveltests.createIndex({ userId: 1, subject: 1 });
db.leveltests.createIndex({ status: 1, completedAt: -1 });

// Level progress
db.levelprogressions.createIndex({ user: 1, subject: 1 }, { unique: true });
db.levelprogressions.createIndex({ totalPointsEarned: -1 });

// Daily tasks
db.dailytasks.createIndex({ user: 1, taskDate: 1 });
db.dailytasks.createIndex({ user: 1, completed: 1 });
db.dailytasks.createIndex({ taskDate: 1 });
```

## Data Consistency Rules

1. **No Question Duplication**: Each question appears exactly once per level
2. **Answer Validation**: Selected answer must be 0-3 (valid option index)
3. **Date Normalization**: Task dates are normalized to UTC start of day
4. **Progress Cascading**: Passing a level automatically updates user progress
5. **Points Accumulation**: Points are added to user's total but never decremented

## Migration Path

For existing databases:
1. Create new Subject documents for each existing quiz topic
2. Create Level documents with existing quiz questions
3. Populate User model with new fields (default to 0)
4. Migrate existing quiz history to levelHistory
5. Create LevelProgress records from quiz attempt history

---

**Last Updated**: April 4, 2026  
**Version**: 1.0  
**Status**: ✅ Production Ready

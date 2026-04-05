# Multi-Level Assessment System - Complete API Reference

## Base URL
```
http://localhost:5000/api
```

## Authentication
All endpoints (except login/register) require Bearer token in Authorization header:
```
Authorization: Bearer <token>
```

---

## 📚 LEVELS API

### Initialize Subjects & Levels (Admin Only)
```
POST /levels/initialize
Content-Type: application/json
Authorization: Bearer <token>
```
**Purpose**: Create all 10 subjects with 4 levels each (run once during setup)

**Response (201)**:
```json
{
  "success": true,
  "message": "All subjects and levels initialized successfully"
}
```

---

### Add Questions to a Level (Admin Only)
```
POST /levels/:subjectId/:levelNumber/questions
Content-Type: application/json
Authorization: Bearer <token>
```

**Path Parameters**:
- `subjectId`: MongoDB ID of subject
- `levelNumber`: 1, 2, 3, or 4

**Request Body**:
```json
{
  "questions": [
    {
      "question": "What is the output of this code?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 1,
      "explanation": "Explanation of why B is correct",
      "difficulty": "medium"
    }
  ]
}
```

**Response (200)**:
```json
{
  "success": true,
  "message": "Questions added successfully",
  "level": { /* level object */ }
}
```

---

### Get All Subjects
```
GET /levels/subjects
Authorization: Bearer <token>
```

**Purpose**: Fetch all available subjects with user's progress

**Response (200)**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Java",
      "description": "Learn Java programming",
      "iconColor": "#ff7043",
      "totalLevels": 4,
      "userProgress": {
        "currentLevel": 2,
        "unlockedLevels": [1, 2],
        "levelScores": {},
        "totalPointsEarned": 165,
        "completionPercentage": 50,
        "isCompleted": false
      }
    }
  ]
}
```

---

### Get Levels for Subject
```
GET /levels/subject/:subjectId
Authorization: Bearer <token>
```

**Response (200)**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "607f1f77bcf86cd799439012",
      "subject": "607f1f77bcf86cd799439011",
      "levelNumber": 1,
      "title": "Level 1 - Beginner",
      "description": "Beginner level test for Java",
      "totalQuestions": 10,
      "timeLimit": 60,
      "passingPercentage": 60,
      "isUnlocked": true,
      "score": {
        "attempts": 1,
        "bestScore": 85,
        "completed": true,
        "completedAt": "2026-04-04T10:30:00Z"
      }
    }
  ]
}
```

---

### Get User's Level Progress
```
GET /levels/progress
Authorization: Bearer <token>
```

**Response (200)**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "user": "507f1f77bcf86cd799439001",
      "subject": { /* subject object */ },
      "subjectName": "Java",
      "currentLevel": 2,
      "unlockedLevels": [1, 2],
      "levelScores": {
        "level1": {
          "attempts": 2,
          "bestScore": 95,
          "completed": true,
          "completedAt": "2026-04-01T10:30:00Z"
        },
        "level2": {
          "attempts": 1,
          "bestScore": 75,
          "completed": false,
          "completedAt": null
        }
      },
      "totalPointsEarned": 240,
      "completionPercentage": 50,
      "isCompleted": false,
      "startedAt": "2026-03-15T08:00:00Z"
    }
  ]
}
```

---

### Start a Level Test
```
POST /levels/test/start/:levelId
Authorization: Bearer <token>
```

**Path Parameters**:
- `levelId`: MongoDB ID of level

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "testId": "607f1f77bcf86cd799439014",
    "totalQuestions": 10,
    "timeLimit": 60,
    "questions": [
      {
        "question": "What is polymorphism?",
        "options": ["Option A", "Option B", "Option C", "Option D"]
      }
    ]
  }
}
```

**Error Cases**:
- 403: Level not unlocked
- 403: Maximum attempts reached
- 404: Level not found

---

### Submit Level Test
```
PUT /levels/test/:testId/submit
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "answers": [1, 2, 0, 3, 1, 2, 1, 0, 2, 3]  // Array of selected answers (0-3)
}
```

**Response (200)**:
```json
{
  "success": true,
  "isPassed": true,
  "data": {
    "testId": "607f1f77bcf86cd799439014",
    "levelNumber": 1,
    "score": 85,
    "percentage": 85,
    "correctCount": 8,
    "totalQuestions": 10,
    "timeTakenSeconds": 1200,
    "timeBonus": 25,
    "totalPoints": 110,
    "passingPercentage": 60,
    "answers": [
      {
        "questionIndex": 0,
        "question": "What is polymorphism?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "userAnswer": 1,
        "correctAnswer": 1,
        "isCorrect": true,
        "explanation": "Polymorphism allows objects to take multiple forms..."
      }
    ],
    "unlockedLevelNumber": 2,
    "progressUpdate": {
      "currentLevel": 2,
      "completionPercentage": 50,
      "totalPointsEarned": 240,
      "isCompleted": false
    }
  }
}
```

---

### Get Level Test History
```
GET /levels/test-history/:subjectId
Authorization: Bearer <token>
```

**Query Parameters**:
- `page`: Page number (optional)
- `limit`: Results per page (optional)

**Response (200)**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "607f1f77bcf86cd799439014",
      "levelNumber": 1,
      "score": 85,
      "percentage": 85,
      "correctCount": 8,
      "totalQuestions": 10,
      "timeTakenSeconds": 1200,
      "timeBonus": 25,
      "totalPoints": 110,
      "isPassed": true,
      "completedAt": "2026-04-01T10:30:00Z",
      "attemptNumber": 1
    }
  ]
}
```

---

## 🏅 LEADERBOARD API

### Get Global Leaderboard
```
GET /leaderboard/global
Authorization: Bearer <token>
```

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 20)

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "leaderboard": [
      {
        "_id": "507f1f77bcf86cd799439001",
        "rank": 1,
        "name": "Alice Johnson",
        "email": "alice@example.com",
        "avatar": "A",
        "totalRankingPoints": 450,
        "cumulativePoints": 1200,
        "productivityScore": 92,
        "streak": 15
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalStudents": 100,
      "limit": 20
    }
  }
}
```

---

### Get Subject Leaderboard
```
GET /leaderboard/subject/:subjectId
Authorization: Bearer <token>
```

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 20)

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "subject": "Java",
    "leaderboard": [
      {
        "rank": 1,
        "user": {
          "_id": "507f1f77bcf86cd799439001",
          "name": "Bob Smith",
          "email": "bob@example.com"
        },
        "currentLevel": 4,
        "unlockedLevels": 4,
        "totalPointsEarned": 560,
        "completionPercentage": 100,
        "isCompleted": true,
        "completedAt": "2026-04-01T15:20:00Z",
        "levelScores": {
          "level1": { "attempts": 1, "bestScore": 95, "completed": true },
          "level2": { "attempts": 2, "bestScore": 85, "completed": true },
          "level3": { "attempts": 1, "bestScore": 88, "completed": true },
          "level4": { "attempts": 1, "bestScore": 92, "completed": true }
        }
      }
    ],
    "pagination": { /* ... */ }
  }
}
```

---

### Get User's Global Rank
```
GET /leaderboard/user-rank
Authorization: Bearer <token>
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "userRank": 5,
    "userStats": {
      "_id": "507f1f77bcf86cd799439002",
      "name": "Charlie Brown",
      "email": "charlie@example.com",
      "totalRankingPoints": 380,
      "cumulativePoints": 950,
      "productivityScore": 85
    },
    "nearby": [
      {
        "rank": 3,
        "name": "David Lee",
        "email": "david@example.com",
        "totalRankingPoints": 420
      },
      {
        "rank": 4,
        "name": "Emma Davis",
        "email": "emma@example.com",
        "totalRankingPoints": 395
      },
      {
        "rank": 5,
        "name": "Charlie Brown",
        "email": "charlie@example.com",
        "totalRankingPoints": 380,
        "isCurrentUser": true
      }
    ]
  }
}
```

---

### Get User's Subject Rank
```
GET /leaderboard/user-subject-rank/:subjectId
Authorization: Bearer <token>
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "userSubjectRank": 8,
    "subject": "Java",
    "userStats": {
      "currentLevel": 2,
      "unlockedLevels": 2,
      "totalPointsEarned": 165,
      "completionPercentage": 50,
      "isCompleted": false
    },
    "nearby": [ /* nearby students */ ]
  }
}
```

---

### Get Top Performers
```
GET /leaderboard/top-performers
Authorization: Bearer <token>
```

**Query Parameters**:
- `limit`: Number of top performers to return (default: 10)

**Response (200)**:
```json
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "_id": "507f1f77bcf86cd799439001",
      "name": "Alice Johnson",
      "totalRankingPoints": 680,
      "productivityScore": 98,
      "totalFocusMinutes": 2400
    }
  ]
}
```

---

### Get Level Statistics
```
GET /leaderboard/level-stats/:subjectId
Authorization: Bearer <token>
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "totalStudents": 45,
    "level1Completed": 45,
    "level2Completed": 38,
    "level3Completed": 22,
    "level4Completed": 8,
    "avgPointsLevel1": 87.5,
    "avgPointsLevel2": 82.3,
    "avgPointsLevel3": 78.9,
    "avgPointsLevel4": 85.2
  }
}
```

---

## 📋 DAILY TASKS API

### Create Daily Task
```
POST /daily-tasks
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "title": "Complete Java Assignment",
  "description": "Finish the polymorphism section",
  "priority": "high",
  "category": "study",
  "taskDate": "2026-04-05",
  "dueTime": "14:30",
  "estimatedMinutes": 90,
  "tags": ["assignment", "java", "urgent"],
  "relatedSubject": "Java",
  "relatedLevel": 2
}
```

**Response (201)**:
```json
{
  "success": true,
  "data": {
    "_id": "607f1f77bcf86cd799439015",
    "user": "507f1f77bcf86cd799439002",
    "title": "Complete Java Assignment",
    "description": "Finish the polymorphism section",
    "priority": "high",
    "category": "study",
    "taskDate": "2026-04-05",
    "dueTime": "14:30",
    "estimatedMinutes": 90,
    "tags": ["assignment", "java", "urgent"],
    "completed": false,
    "createdAt": "2026-04-04T11:22:00Z"
  }
}
```

---

### Get Daily Tasks
```
GET /daily-tasks
Authorization: Bearer <token>
```

**Query Parameters**:
- `date`: Task date (YYYY-MM-DD format, default: today)
- `status`: Filter by status ('all', 'pending', 'completed')

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "_id": "607f1f77bcf86cd799439015",
        "title": "Complete Java Assignment",
        "priority": "high",
        "category": "study",
        "dueTime": "14:30",
        "completed": false,
        "estimatedMinutes": 90,
        "tags": ["assignment", "java"]
      }
    ],
    "date": "2026-04-05",
    "stats": {
      "totalTasks": 5,
      "completedTasks": 2,
      "pendingTasks": 3,
      "completionPercentage": 40
    }
  }
}
```

---

### Get Tasks in Date Range
```
GET /daily-tasks/range
Authorization: Bearer <token>
```

**Query Parameters**:
- `startDate`: Start date (YYYY-MM-DD, required)
- `endDate`: End date (YYYY-MM-DD, required)

**Response (200)**:
```json
{
  "success": true,
  "data": [
    {
      "date": "2026-04-04",
      "tasks": [ /* tasks for this date */ ],
      "completed": 2,
      "total": 5
    },
    {
      "date": "2026-04-05",
      "tasks": [ /* tasks for this date */ ],
      "completed": 1,
      "total": 3
    }
  ]
}
```

---

### Get Task Statistics
```
GET /daily-tasks/stats
Authorization: Bearer <token>
```

**Query Parameters**:
- `startDate`: Start date (default: 7 days ago)
- `endDate`: End date (default: today)
- `aggregateBy`: 'day', 'week', or 'month' (optional)

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "byDate": [
      {
        "date": "2026-04-01",
        "totalTasks": 5,
        "completedTasks": 5,
        "pendingTasks": 0,
        "completionPercentage": 100,
        "totalEstimatedMinutes": 240,
        "avgActualMinutes": 235
      }
    ],
    "overall": {
      "dateRange": {
        "start": "2026-03-28",
        "end": "2026-04-04"
      },
      "totalTasksCreated": 32,
      "totalTasksCompleted": 28,
      "overallCompletionPercentage": 87
    }
  }
}
```

---

### Update Daily Task
```
PUT /daily-tasks/:taskId
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body**: Same as create (partial updates allowed)

**Response (200)**:
```json
{
  "success": true,
  "data": { /* updated task object */ }
}
```

---

### Toggle Task Completion
```
PATCH /daily-tasks/:taskId/toggle
Authorization: Bearer <token>
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "_id": "607f1f77bcf86cd799439015",
    "title": "Complete Java Assignment",
    "completed": true,
    "completedAt": "2026-04-04T14:35:00Z"
  },
  "message": "Task marked as completed"
}
```

---

### Mark Task as Completed
```
PATCH /daily-tasks/:taskId/complete
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body** (optional):
```json
{
  "actualMinutes": 85
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": { /* task object */ },
  "message": "Task completed successfully"
}
```

---

### Delete Daily Task
```
DELETE /daily-tasks/:taskId
Authorization: Bearer <token>
```

**Response (200)**:
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

---

## Error Responses

### Common Error Codes

**400 Bad Request**:
```json
{
  "success": false,
  "error": "Description of what went wrong"
}
```

**401 Unauthorized**:
```json
{
  "success": false,
  "error": "Authentication required"
}
```

**403 Forbidden**:
```json
{
  "success": false,
  "error": "Insufficient permissions or level not unlocked"
}
```

**404 Not Found**:
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**:
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## Rate Limiting
- No strict rate limiting implemented
- Recommended: 100 requests per minute per IP for production

## CORS
- Configured for `http://localhost:5173`
- Update in production

---

**Last Updated**: April 4, 2026  
**API Version**: 1.0  
**Status**: ✅ Production Ready

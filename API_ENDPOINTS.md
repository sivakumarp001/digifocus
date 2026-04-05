# API Endpoints - Complete Reference

**Base URL:** `http://localhost:5000/api`  
**Authentication:** JWT Token (Bearer token in Authorization header)

---

## 📋 Table of Contents

1. [Authentication Endpoints](#authentication-endpoints)
2. [User Endpoints](#user-endpoints)
3. [Task Endpoints](#task-endpoints)
4. [Quiz Endpoints](#quiz-endpoints)
5. [Question Endpoints (Admin)](#question-endpoints-admin)
6. [Analytics Endpoints](#analytics-endpoints)
7. [Admin Dashboard Endpoints](#admin-dashboard-endpoints)
8. [Leaderboard Endpoints](#leaderboard-endpoints)
9. [Notification Endpoints](#notification-endpoints)
10. [Focus Session Endpoints](#focus-session-endpoints)

---

## 🔐 Authentication Endpoints

### 1. Register User
**Endpoint:** `POST /auth/register`  
**Auth Required:** No  
**Role:** N/A

**Request Body:**
```json
{
  "name": "Raj Kumar",
  "email": "raj@example.com",
  "password": "SecurePass123!"
}
```

**Request Parameters:**
| Field | Type | Required | Validation |
|-------|------|----------|-----------|
| name | String | Yes | 2-50 chars, letters & spaces |
| email | String | Yes | Valid email, unique |
| password | String | Yes | Min 8 chars, uppercase, lowercase, number, special char |

**Response (200):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "userId": "60d5ec49c1a4b5e6f7g8h9i0",
    "name": "Raj Kumar",
    "email": "raj@example.com",
    "role": "student",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
```json
// 400 - Validation Error
{
  "success": false,
  "message": "Email already exists"
}

// 400 - Password weak
{
  "success": false,
  "message": "Password must contain uppercase, lowercase, number and special character"
}
```

---

### 2. Login User
**Endpoint:** `POST /auth/login`  
**Auth Required:** No  
**Role:** N/A

**Request Body:**
```json
{
  "email": "raj@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "userId": "60d5ec49c1a4b5e6f7g8h9i0",
    "name": "Raj Kumar",
    "email": "raj@example.com",
    "role": "student",
    "points": 450,
    "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=raj",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
```json
// 401 - Invalid credentials
{
  "success": false,
  "message": "Invalid email or password"
}

// 404 - User not found
{
  "success": false,
  "message": "User not found"
}
```

---

### 3. Refresh Token
**Endpoint:** `POST /auth/refresh-token`  
**Auth Required:** Yes (Refresh Token)  
**Role:** student, admin

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 4. Logout User
**Endpoint:** `POST /auth/logout`  
**Auth Required:** Yes  
**Role:** student, admin

**Request Body:** (Empty)

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### 5. Get Current User
**Endpoint:** `GET /auth/me`  
**Auth Required:** Yes  
**Role:** student, admin

**Response (200):**
```json
{
  "success": true,
  "data": {
    "userId": "60d5ec49c1a4b5e6f7g8h9i0",
    "name": "Raj Kumar",
    "email": "raj@example.com",
    "role": "student",
    "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=raj",
    "points": 450,
    "streak": 7,
    "totalFocusMinutes": 1250,
    "preferences": {
      "theme": "dark",
      "notifications": true
    }
  }
}
```

---

## 👤 User Endpoints

### 1. Update Profile
**Endpoint:** `PUT /users/profile`  
**Auth Required:** Yes  
**Role:** student, admin

**Request Body:**
```json
{
  "name": "Raj Kumar Singh",
  "avatar": "https://...",
  "bio": "Full-stack developer learning MERN",
  "preferences": {
    "theme": "light",
    "pomodoroWork": 30,
    "pomodoroBreak": 5,
    "notifications": true
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": { /* updated user object */ }
}
```

---

### 2. Change Password
**Endpoint:** `PUT /users/change-password`  
**Auth Required:** Yes  
**Role:** student, admin

**Request Body:**
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass456!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Error:**
```json
{
  "success": false,
  "message": "Current password is incorrect"
}
```

---

### 3. Get User Stats
**Endpoint:** `GET /users/stats`  
**Auth Required:** Yes  
**Role:** student, admin

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalQuizzes": 15,
    "passedQuizzes": 12,
    "failedQuizzes": 3,
    "averageScore": 78.5,
    "points": 450,
    "streak": 7,
    "longestStreak": 14,
    "totalFocusMinutes": 1250,
    "productivityScore": 82
  }
}
```

---

### 4. Get User Leaderboard Position
**Endpoint:** `GET /users/leaderboard-position`  
**Auth Required:** Yes  
**Role:** student

**Response (200):**
```json
{
  "success": true,
  "data": {
    "rank": 23,
    "totalStudents": 450,
    "points": 450,
    "percentile": 94.9
  }
}
```

---

## 📝 Task Endpoints

### 1. Create Task
**Endpoint:** `POST /tasks`  
**Auth Required:** Yes  
**Role:** student

**Request Body:**
```json
{
  "title": "Learn Java OOP",
  "description": "Master Object-Oriented Programming concepts",
  "priority": "high",
  "category": "study",
  "tags": ["oop", "java"],
  "requiredLanguage": "java",
  "plannedDuration": 90,
  "dueDate": "2026-03-25T23:59:59Z",
  "quizRequired": true
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "taskId": "60d5ec49c1a4b5e6f7g8h9i0",
    "title": "Learn Java OOP",
    "status": "pending",
    "plannedDuration": 90,
    "quizRequired": true,
    "requiredLanguage": "java",
    "createdAt": "2026-03-24T08:00:00Z"
  }
}
```

---

### 2. Get All Tasks
**Endpoint:** `GET /tasks`  
**Auth Required:** Yes  
**Role:** student

**Query Parameters:**
```
?status=pending&priority=high&category=study&page=1&limit=10&sort=-createdAt
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "taskId": "60d5ec49c1a4b5e6f7g8h9i0",
        "title": "Learn Java OOP",
        "status": "pending",
        "priority": "high",
        "plannedDuration": 90,
        "requiredLanguage": "java",
        "quizCompleted": false,
        "createdAt": "2026-03-24T08:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 15,
      "pages": 2
    }
  }
}
```

---

### 3. Get Single Task
**Endpoint:** `GET /tasks/:taskId`  
**Auth Required:** Yes  
**Role:** student

**Response (200):**
```json
{
  "success": true,
  "data": {
    "taskId": "60d5ec49c1a4b5e6f7g8h9i0",
    "title": "Learn Java OOP",
    "description": "Master OOP concepts",
    "status": "pending",
    "priority": "high",
    "category": "study",
    "requiredLanguage": "java",
    "plannedDuration": 90,
    "studyStartedAt": null,
    "studyCompletedAt": null,
    "quizRequired": true,
    "linkedQuizId": null,
    "quizCompleted": false,
    "quizScore": 0,
    "createdAt": "2026-03-24T08:00:00Z"
  }
}
```

---

### 4. Update Task
**Endpoint:** `PUT /tasks/:taskId`  
**Auth Required:** Yes  
**Role:** student (own task)

**Request Body:**
```json
{
  "title": "Advanced Java OOP",
  "priority": "medium",
  "status": "in-study"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": { /* updated task */ }
}
```

---

### 5. Start Study Session
**Endpoint:** `PUT /tasks/:taskId/start-study`  
**Auth Required:** Yes  
**Role:** student

**Request Body:**
```json
{
  "duration": 60
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Study session started",
  "data": {
    "taskId": "60d5ec49c1a4b5e6f7g8h9i0",
    "status": "in-study",
    "plannedDuration": 60,
    "studyStartedAt": "2026-03-24T09:00:00Z",
    "studyEndsAt": "2026-03-24T10:00:00Z"
  }
}
```

---

### 6. Complete Study Session
**Endpoint:** `PUT /tasks/:taskId/complete-study`  
**Auth Required:** Yes  
**Role:** student

**Request Body:**
```json
{
  "actualDuration": 58
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Study session completed. Quiz now available!",
  "data": {
    "taskId": "60d5ec49c1a4b5e6f7g8h9i0",
    "status": "quiz-available",
    "studyCompletedAt": "2026-03-24T09:58:00Z",
    "actualStudyDuration": 58,
    "quizAvailable": true
  }
}
```

---

### 7. Delete Task
**Endpoint:** `DELETE /tasks/:taskId`  
**Auth Required:** Yes  
**Role:** student (own task)

**Response (200):**
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

---

## 🧩 Quiz Endpoints

### 1. Generate Task-Linked Quiz
**Endpoint:** `POST /quiz/task/:taskId/generate`  
**Auth Required:** Yes  
**Role:** student

**Request Body:**
```json
{
  "difficulty": "medium"
}
```

**Validation:**
- Task must be owned by user
- Task study must be completed
- Task status must be "quiz-available" or "pending-retry"

**Response (201):**
```json
{
  "success": true,
  "message": "Quiz generated successfully",
  "data": {
    "quizId": "60d5ec49c2b5c6e7f8g9h0i1",
    "subject": "Java",
    "totalQuestions": 10,
    "timeLimit": 30,
    "questions": [
      {
        "questionIndex": 0,
        "question": "What is the main method signature?",
        "options": [
          "public static void main(String[] args)",
          "public void main(String args)",
          "static void main",
          "void main(String[] args)"
        ]
      },
      { /* 9 more questions */ }
    ],
    "startedAt": "2026-03-24T10:30:00Z",
    "expiresAt": "2026-03-24T11:00:00Z"
  }
}
```

**Error Responses:**
```json
// 403 - Task not ready
{
  "success": false,
  "message": "Study session not yet completed. Quiz will be available after your study time."
}

// 404 - Task not found
{
  "success": false,
  "message": "Task not found"
}
```

---

### 2. Get Quiz Questions (for retake)
**Endpoint:** `GET /quiz/task/:taskId`  
**Auth Required:** Yes  
**Role:** student

**Response (200):**
```json
{
  "success": true,
  "data": { /* same as generate response */ }
}
```

---

### 3. Submit Quiz Answers
**Endpoint:** `PUT /quiz/:quizId/task-submit`  
**Auth Required:** Yes  
**Role:** student

**Request Body:**
```json
{
  "answers": [
    { "questionIndex": 0, "selectedAnswer": 0 },
    { "questionIndex": 1, "selectedAnswer": 2 },
    { "questionIndex": 2, "selectedAnswer": 1 },
    // ... 10 total answers
  ],
  "timeTaken": 900
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Quiz submitted successfully",
  "data": {
    "quizId": "60d5ec49c2b5c6e7f8g9h0i1",
    "score": 8,
    "percentage": 80,
    "isPassed": true,
    "pointsAwarded": 10,
    "answers": [
      {
        "questionIndex": 0,
        "question": "What is the main method signature?",
        "selectedAnswer": 0,
        "selectedOption": "public static void main(String[] args)",
        "correctAnswer": 0,
        "isCorrect": true,
        "explanation": "..."
      }
      // ... more answers with explanations
    ],
    "taskUpdated": {
      "taskId": "60d5ec49c1a4b5e6f7g8h9i0",
      "status": "completed",
      "quizCompleted": true,
      "quizPassed": true,
      "quizScore": 80,
      "pointsEarned": 10
    }
  }
}
```

**On Failure (< 60%):**
```json
{
  "success": true,
  "message": "Quiz submitted. You did not pass this time.",
  "data": {
    "isPassed": false,
    "percentage": 45,
    "score": 4,
    "pointsAwarded": -5,
    "message": "You need 60% to pass. You got 45%. Try again!",
    "taskUpdated": {
      "status": "pending",
      "quizCompleted": true,
      "quizPassed": false,
      "quizScore": 45
    }
  }
}
```

---

### 4. Get Quiz Status
**Endpoint:** `GET /quiz/task/:taskId/status`  
**Auth Required:** Yes  
**Role:** student

**Response (200):**
```json
{
  "success": true,
  "data": {
    "taskId": "60d5ec49c1a4b5e6f7g8h9i0",
    "quizStatus": "completed",
    "isPassed": true,
    "score": 80,
    "attempts": 1,
    "lastAttemptAt": "2026-03-24T10:45:00Z",
    "canRetake": false
  }
}
```

---

### 5. Get All User Quizzes
**Endpoint:** `GET /quiz`  
**Auth Required:** Yes  
**Role:** student

**Query Parameters:**
```
?subject=Java&passed=true&page=1&limit=10&sort=-createdAt
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "quizzes": [
      {
        "quizId": "60d5ec49c2b5c6e7f8g9h0i1",
        "subject": "Java",
        "score": 80,
        "percentage": 80,
        "isPassed": true,
        "completedAt": "2026-03-24T10:45:00Z"
      }
    ],
    "pagination": { /* ... */ }
  }
}
```

---

## ❓ Question Endpoints (Admin)

### 1. Add New Question
**Endpoint:** `POST /questions`  
**Auth Required:** Yes  
**Role:** admin

**Request Body:**
```json
{
  "question": "What is encapsulation in OOP?",
  "topic": "Java",
  "subtopic": "OOP Concepts",
  "options": {
    "a": "Hiding internal details",
    "b": "Creating classes",
    "c": "Using inheritance",
    "d": "Writing comments"
  },
  "correctAnswer": "a",
  "explanation": "Encapsulation is the bundling of data and methods...",
  "difficulty": "medium",
  "tags": ["oop", "encapsulation", "fundamentals"]
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Question added successfully",
  "data": {
    "questionId": "60d5ec49c4d7e8f9g0h1i2j3",
    "topic": "Java",
    "difficulty": "medium"
  }
}
```

**Validation:**
- Admin role required
- All fields mandatory
- Options: 4 required
- Correct answer: 0-3 valid
- Difficulty: easy/medium/hard

---

### 2. Get All Questions (with filters)
**Endpoint:** `GET /questions`  
**Auth Required:** Yes  
**Role:** admin, student (limited)

**Query Parameters:**
```
?topic=Java&difficulty=medium&page=1&limit=20&approved=true
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "questions": [
      {
        "questionId": "60d5ec49c4d7e8f9g0h1i2j3",
        "question": "What is encapsulation?",
        "topic": "Java",
        "difficulty": "medium",
        "timesUsed": 125,
        "correctPercentage": 78,
        "isApproved": true
      }
    ],
    "pagination": { /* ... */ }
  }
}
```

---

### 3. Update Question
**Endpoint:** `PUT /questions/:questionId`  
**Auth Required:** Yes  
**Role:** admin

**Request Body:**
```json
{
  "question": "Updated question text",
  "correctAnswer": "b"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Question updated successfully",
  "data": { /* updated question */ }
}
```

---

### 4. Delete Question
**Endpoint:** `DELETE /questions/:questionId`  
**Auth Required:** Yes  
**Role:** admin

**Response (200):**
```json
{
  "success": true,
  "message": "Question deleted successfully"
}
```

---

### 5. Bulk Upload Questions
**Endpoint:** `POST /questions/bulk-upload`  
**Auth Required:** Yes  
**Role:** admin

**Request:** Form-data with CSV file

**CSV Format:**
```
Question,Topic,Option A,Option B,Option C,Option D,Correct Answer,Difficulty,Explanation
"What is...","Java","Option1","Option2","Option3","Option4","a","medium","Explanation text"
```

**Response (201):**
```json
{
  "success": true,
  "message": "Questions uploaded successfully",
  "data": {
    "totalUploaded": 50,
    "successful": 50,
    "failed": 0,
    "errors": []
  }
}
```

---

### 6. Approve Question
**Endpoint:** `PUT /questions/:questionId/approve`  
**Auth Required:** Yes  
**Role:** admin

**Response (200):**
```json
{
  "success": true,
  "message": "Question approved successfully"
}
```

---

## 📊 Analytics Endpoints

### 1. Get Personal Analytics
**Endpoint:** `GET /analytics/me`  
**Auth Required:** Yes  
**Role:** student

**Response (200):**
```json
{
  "success": true,
  "data": {
    "overallStats": {
      "totalQuizzes": 15,
      "passedQuizzes": 12,
      "failedQuizzes": 3,
      "averageScore": 78.5,
      "accuracy": 78.5
    },
    "subjectPerformance": {
      "java": {
        "attempted": 5,
        "passed": 4,
        "average": 82,
        "trend": "up"
      },
      "python": {
        "attempted": 4,
        "passed": 3,
        "average": 75,
        "trend": "stable"
      }
    },
    "weeklyProgress": [
      {
        "week": "2026-03-17",
        "quizzes": 3,
        "passed": 2,
        "averageScore": 75,
        "points": 15
      },
      {
        "week": "2026-03-24",
        "quizzes": 4,
        "passed": 3,
        "averageScore": 80,
        "points": 25
      }
    ],
    "monthlyProgress": [
      {
        "month": "2026-02",
        "quizzes": 8,
        "passed": 6,
        "averageScore": 72,
        "points": 50
      },
      {
        "month": "2026-03",
        "quizzes": 7,
        "passed": 6,
        "averageScore": 78,
        "points": 55
      }
    ],
    "recentScores": [
      {
        "subject": "Java",
        "score": 85,
        "date": "2026-03-24T10:45:00Z"
      }
    ],
    "focusStats": {
      "totalFocusHours": 20.8,
      "averageSessionLength": 90,
      "sessionsThisMonth": 14,
      "totalSessions": 42
    }
  }
}
```

---

### 2. Get Weekly Performance Graph Data
**Endpoint:** `GET /analytics/performance/weekly`  
**Auth Required:** Yes  
**Role:** student

**Query Parameters:**
```
?weeks=4
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "type": "line",
    "labels": ["Week 1", "Week 2", "Week 3", "Week 4"],
    "datasets": [
      {
        "label": "Average Score",
        "data": [70, 75, 78, 80],
        "borderColor": "#3b82f6",
        "tension": 0.4
      },
      {
        "label": "Quiz Count",
        "data": [2, 3, 4, 5],
        "yAxisID": "y1"
      },
      {
        "label": "Pass Rate %",
        "data": [50, 67, 75, 80]
      }
    ]
  }
}
```

---

### 3. Get Monthly Performance Graph Data
**Endpoint:** `GET /analytics/performance/monthly`  
**Auth Required:** Yes  
**Role:** student

**Response (200):**
```json
{
  "success": true,
  "data": {
    "type": "bar",
    "labels": ["January", "February", "March"],
    "datasets": [
      {
        "label": "Quizzes Passed",
        "data": [12, 16, 18],
        "backgroundColor": "#10b981"
      },
      {
        "label": "Quizzes Failed",
        "data": [3, 2, 1],
        "backgroundColor": "#ef4444"
      }
    ]
  }
}
```

---

### 4. Get Subject-wise Performance
**Endpoint:** `GET /analytics/subject-performance`  
**Auth Required:** Yes  
**Role:** student, admin

**Response (200):**
```json
{
  "success": true,
  "data": {
    "type": "radar",
    "labels": ["Java", "Python", "C", "HTML", "CSS"],
    "datasets": [
      {
        "label": "Average Score",
        "data": [82, 75, 68, 88, 92],
        "borderColor": "#3b82f6",
        "backgroundColor": "rgba(59, 130, 246, 0.1)"
      }
    ]
  }
}
```

---

## 🏆 Admin Dashboard Endpoints

### 1. Get All Students
**Endpoint:** `GET /admin/students`  
**Auth Required:** Yes  
**Role:** admin

**Query Parameters:**
```
?search=raj&page=1&limit=20&sort=-points
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "students": [
      {
        "userId": "60d5ec49c1a4b5e6f7g8h9i1",
        "name": "Raj Kumar",
        "email": "raj@example.com",
        "points": 450,
        "totalQuizzes": 15,
        "passedQuizzes": 12,
        "failedQuizzes": 3,
        "averageScore": 78.5,
        "streak": 7,
        "joinedAt": "2026-01-15T10:30:00Z"
      }
    ],
    "pagination": { /* ... */ }
  }
}
```

---

### 2. Get Student Detail (Admin View)
**Endpoint:** `GET /admin/students/:studentId`  
**Auth Required:** Yes  
**Role:** admin

**Response (200):**
```json
{
  "success": true,
  "data": {
    "student": {
      "userId": "60d5ec49c1a4b5e6f7g8h9i1",
      "name": "Raj Kumar",
      "email": "raj@example.com",
      "points": 450,
      "totalFocusMinutes": 1250,
      "stats": { /* detailed stats */ },
      "scores": [
        {
          "subject": "Java",
          "attemptCount": 5,
          "scores": [60, 70, 80, 85, 82],
          "average": 75.4,
          "highest": 85,
          "lowest": 60,
          "passRate": 80
        }
      ],
      "recentActivity": [
        {
          "action": "completed_quiz",
          "subject": "Java",
          "score": 85,
          "date": "2026-03-24T10:45:00Z"
        }
      ]
    }
  }
}
```

---

### 3. Get All Scores
**Endpoint:** `GET /admin/scores`  
**Auth Required:** Yes  
**Role:** admin

**Query Parameters:**
```
?studentId=xxx&subject=Java&page=1&limit=50&sort=-date&passed=all
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "scores": [
      {
        "scoreId": "60d5ec49c3c6d7e8f9g0h1i2",
        "studentName": "Raj Kumar",
        "subject": "Java",
        "score": 8,
        "percentage": 80,
        "passed": true,
        "pointsAwarded": 10,
        "attemptNumber": 1,
        "date": "2026-03-24T10:45:00Z"
      }
    ],
    "stats": {
      "totalScores": 1250,
      "averageScore": 75.5,
      "passRate": 82,
      "failRate": 18
    },
    "pagination": { /* ... */ }
  }
}
```

---

### 4. Get Top 10 Students
**Endpoint:** `GET /admin/leaderboard/top-10`  
**Auth Required:** Yes  
**Role:** admin, student

**Response (200):**
```json
{
  "success": true,
  "data": {
    "leaderboard": [
      {
        "rank": 1,
        "studentName": "Priya Singh",
        "points": 2350,
        "totalQuizzes": 45,
        "passedQuizzes": 42,
        "averageScore": 89.5,
        "streak": 28
      },
      {
        "rank": 2,
        "studentName": "Raj Kumar",
        "points": 1850,
        "totalQuizzes": 35,
        "passedQuizzes": 30,
        "averageScore": 85.2,
        "streak": 14
      }
      // ... 8 more
    ]
  }
}
```

---

### 5. Get Pass/Fail Statistics
**Endpoint:** `GET /admin/statistics/pass-fail`  
**Auth Required:** Yes  
**Role:** admin

**Query Parameters:**
```
?subject=all&startDate=2026-03-01&endDate=2026-03-31
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "overallStats": {
      "totalAttempts": 500,
      "passed": 410,
      "failed": 90,
      "passRate": 82,
      "failRate": 18
    },
    "bySubject": {
      "java": { "passed": 85, "failed": 15, "rate": 85 },
      "python": { "passed": 78, "failed": 22, "rate": 78 },
      "c": { "passed": 72, "failed": 28, "rate": 72 }
    },
    "byDateRange": [
      { "date": "2026-03-24", "passed": 45, "failed": 5, "passRate": 90 }
    ],
    "graphData": {
      "type": "pie",
      "labels": ["Passed", "Failed"],
      "datasets": [
        {
          "data": [410, 90],
          "backgroundColor": ["#10b981", "#ef4444"]
        }
      ]
    }
  }
}
```

---

## 🥇 Leaderboard Endpoints

### 1. Get Global Leaderboard
**Endpoint:** `GET /leaderboard`  
**Auth Required:** Yes  
**Role:** student, admin

**Query Parameters:**
```
?limit=50&period=all-time&offset=0
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "leaderboard": [
      {
        "rank": 1,
        "studentId": "60d5ec49c1a4b5e6f7g8h9i1",
        "studentName": "Priya Singh",
        "email": "priya@example.com",
        "points": 2350,
        "totalQuizzes": 45,
        "passedQuizzes": 42,
        "averageScore": 89.5,
        "streak": 28,
        "avatar": "https://..."
      }
      // ... 49 more
    ],
    "metadata": {
      "totalStudents": 450,
      "lastUpdated": "2026-03-24T15:00:00Z"
    }
  }
}
```

---

### 2. Get Weekly Leaderboard
**Endpoint:** `GET /leaderboard/weekly`  
**Auth Required:** Yes  
**Role:** student, admin

**Response (200):**
```json
{
  "success": true,
  "data": {
    "period": "Weekly (2026-03-17 to 2026-03-24)",
    "leaderboard": [
      {
        "rank": 1,
        "studentName": "Raj Kumar",
        "points": 85,
        "quizzesThisWeek": 5,
        "passedThisWeek": 4
      }
    ]
  }
}
```

---

### 3. Get User's Leaderboard Position
**Endpoint:** `GET /leaderboard/position/:userId`  
**Auth Required:** Yes  
**Role:** student, admin

**Response (200):**
```json
{
  "success": true,
  "data": {
    "currentRank": 23,
    "totalStudents": 450,
    "points": 450,
    "percentile": 94.9,
    "pointsToNextRank": 50,
    "pointsSincePreviousRank": 100
  }
}
```

---

## 🔔 Notification Endpoints

### 1. Get User Notifications
**Endpoint:** `GET /notifications`  
**Auth Required:** Yes  
**Role:** student, admin

**Query Parameters:**
```
?read=false&page=1&limit=20
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "notificationId": "60d5ec49c6e7f8g9h0i1j2k3",
        "title": "Quiz Available",
        "message": "Your quiz for Java task is now available!",
        "type": "quiz-available",
        "read": false,
        "actionUrl": "/tasks/60d5ec49c1a4b5e6f7g8h9i0/quiz",
        "createdAt": "2026-03-24T10:30:00Z"
      }
    ],
    "unreadCount": 3,
    "pagination": { /* ... */ }
  }
}
```

---

### 2. Mark Notification as Read
**Endpoint:** `PUT /notifications/:notificationId/read`  
**Auth Required:** Yes  
**Role:** student, admin

**Response (200):**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

### 3. Delete Notification
**Endpoint:** `DELETE /notifications/:notificationId`  
**Auth Required:** Yes  
**Role:** student, admin

**Response (200):**
```json
{
  "success": true,
  "message": "Notification deleted"
}
```

---

## ⏱️ Focus Session Endpoints

### 1. Start Focus Session
**Endpoint:** `POST /focus-sessions`  
**Auth Required:** Yes  
**Role:** student

**Request Body:**
```json
{
  "taskId": "60d5ec49c1a4b5e6f7g8h9i0",
  "plannedDuration": 60,
  "focusModeEnabled": true,
  "fullScreenMode": false
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Focus session started",
  "data": {
    "sessionId": "60d5ec49c7f8g9h0i1j2k3l4",
    "startedAt": "2026-03-24T09:00:00Z",
    "expiresAt": "2026-03-24T10:00:00Z",
    "plannedDuration": 60
  }
}
```

---

### 2. Update Focus Session
**Endpoint:** `PUT /focus-sessions/:sessionId`  
**Auth Required:** Yes  
**Role:** student

**Request Body:**
```json
{
  "action": "pause"  // or "resume"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Focus session paused",
  "data": { /* session details */ }
}
```

---

### 3. End Focus Session
**Endpoint:** `PUT /focus-sessions/:sessionId/end`  
**Auth Required:** Yes  
**Role:** student

**Request Body:**
```json
{
  "actualDuration": 58,
  "userNotes": "Great session, feeling focused"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Focus session completed",
  "data": {
    "sessionId": "60d5ec49c7f8g9h0i1j2k3l4",
    "plannedDuration": 60,
    "actualDuration": 58,
    "pointsEarned": 1,
    "focusScore": 97,
    "completedAt": "2026-03-24T09:58:00Z"
  }
}
```

---

### 4. Get Focus Session History
**Endpoint:** `GET /focus-sessions`  
**Auth Required:** Yes  
**Role:** student

**Query Parameters:**
```
?status=completed&page=1&limit=20&sort=-completedAt
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "sessionId": "60d5ec49c7f8g9h0i1j2k3l4",
        "plannedDuration": 60,
        "actualDuration": 58,
        "status": "completed",
        "focusScore": 97,
        "pointsEarned": 1,
        "completedAt": "2026-03-24T09:58:00Z"
      }
    ],
    "stats": {
      "totalSessions": 42,
      "averageDuration": 58,
      "totalFocusHours": 40.5
    }
  }
}
```

---

## 📋 Error Response Format

**All endpoints follow this error response format:**

```json
{
  "success": false,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Description of what went wrong",
    "details": "Additional context if available"
  }
}
```

**Common Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Unprocessable Entity
- `500` - Server Error

---

**End of API Endpoints Documentation**

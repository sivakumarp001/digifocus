# Multi-Level Assessment System - Implementation Guide

## Quick Start for Developers

### 🚀 Setup Instructions

#### 1. Initialize Subjects and Levels (One-time setup)
```bash
# POST /api/levels/initialize
curl -X POST http://localhost:5000/api/levels/initialize \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json"
```

This creates 10 subjects (Java, Python, DBMS, etc.) with 4 levels each.

#### 2. Add Questions to Levels
```bash
# POST /api/levels/:subjectId/:levelNumber/questions
curl -X POST http://localhost:5000/api/levels/[SUBJECT_ID]/1/questions \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "questions": [
      {
        "question": "What is Java?",
        "options": ["Language", "Island", "Coffee", "All of above"],
        "correctAnswer": 3,
        "explanation": "Java is both a programming language and an island",
        "difficulty": "easy"
      }
    ]
  }'
```

---

## 📚 Multi-Level Assessment System Flow

### Student's Journey

```
1. Student Selects Subject
   ↓
2. Views Available Levels (Only Level 1 unlocked initially)
   ↓
3. Clicks "Start Level 1 Test"
   ↓
4. Takes the test (Timer starts)
   ↓
5. Submits answers
   ↓
6. System Calculates:
   - Score (Percentage of correct answers)
   - Time Bonus (Based on completion time)
   - Total Points (Score + Bonus)
   ↓
7. If Score ≥ 60%:
   - Level marked as PASSED ✅
   - Level 2 automatically UNLOCKED
   - Points added to ranking
   ↓
8. If Score < 60%:
   - Level marked as FAILED ❌
   - Remaining attempts shown
   - Can retake after waiting period
```

### Code Example: Starting a Level Test (Frontend)

```javascript
// TodaysTasks.jsx or LevelHub.jsx
import { levelsAPI } from '../api';

async function startLevelTest(levelId) {
  try {
    const response = await levelsAPI.startLevelTest(levelId);
    const { testId, questions, timeLimit, totalQuestions } = response.data.data;
    
    // Navigate to test page
    navigate(`/level-test/${testId}`, { 
      state: { questions, timeLimit, totalQuestions }
    });
  } catch (error) {
    toast.error('Cannot start test: ' + error.response.data.error);
    // Level not unlocked, max attempts reached, etc.
  }
}

// Submit answers
async function submitLevelTest(testId, answers, timeTakenSeconds) {
  try {
    const response = await levelsAPI.submitLevelTest(testId, answers);
    const { isPassed, data } = response.data;
    
    if (isPassed) {
      toast.success(`Congratulations! Level ${data.levelNumber} passed! 🎉`);
      console.log(`Earned ${data.totalPoints} points!`);
      console.log(`Next Level Unlocked: Level ${data.unlockedLevelNumber}`);
    } else {
      toast.error(`Failed. Score: ${data.percentage}%. Try again!`);
    }
    
    // Navigate to results page
    navigate(`/level-results/${testId}`, { state: data });
  } catch (error) {
    console.error('Error:', error);
  }
}
```

---

## 🏆 Time-Based Scoring System

### How It Works

**Formula**:
```
Base Score = (Correct Answers / Total Questions) × 100
Time Percentage = (Time Taken / Time Limit) × 100

Time Bonus:
  If Time% ≤ 60%:  Bonus = 30 (full bonus)
  If 60% < Time% ≤ 100%:  Bonus = 30 × (1 - (Time% - 60) / 40)
  If Time% > 100%:  Bonus = 0

Total Points = Base Score + Time Bonus
```

### Example Scenarios

**Scenario 1: Fast & Accurate**
```
- Time Limit: 60 minutes
- Time Taken: 25 minutes (41.7% of limit)
- Correct Answers: 9 out of 10
- Base Score: 90
- Time Bonus: 30 (full bonus, since 41.7% < 60%)
- Total Points: 120 ✅ (Excellent!)
```

**Scenario 2: Accurate but Slower**
```
- Time Limit: 60 minutes
- Time Taken: 45 minutes (75% of limit)
- Correct Answers: 9 out of 10
- Base Score: 90
- Time Bonus: 30 × (1 - (75-60)/40) = 30 × 0.625 = 18.75 ≈ 19
- Total Points: 109 ✅ (Good!)
```

**Scenario 3: Barely Passed**
```
- Time Limit: 60 minutes
- Time Taken: 65 minutes (108.3% of limit)
- Correct Answers: 6 out of 10
- Base Score: 60 (minimum passing)
- Time Bonus: 0 (exceeded time limit)
- Total Points: 60 ✅ (Passed but no time bonus)
```

---

## 🎯 Leaderboard System

### How Ranking Works

Students are ranked by `totalRankingPoints` which accumulates from:
1. Each level test passed
2. Time bonuses earned from each test
3. Bonus multipliers based on difficulty

### Leaderboard Types

#### 1. Global Leaderboard
```javascript
// Get top 20 students overall
const response = await leaderboardAPI.getGlobalLeaderboard(1, 20);

// Shows:
// - Rank #1, #2, #3 with medals 🥇🥈🥉
// - Total ranking points
// - Streak count
// - Focus hours
// - Productivity score
```

#### 2. Subject-Specific Leaderboard
```javascript
// Get top students in Java
const response = await leaderboardAPI.getSubjectLeaderboard(javaSubjectId, 1, 20);

// Shows:
// - Current level in this subject
// - Points earned in this subject only
// - Completion percentage
// - Level stats (e.g., 8 completed Level 1, 5 completed Level 2)
```

#### 3. User's Own Rank
```javascript
// Get my rank and nearby competitors
const response = await leaderboardAPI.getUserRank();

// Shows:
// - Your current rank
// - 5 students ranked above you
// - 5 students ranked below you
// - Easy comparison of points
```

### Frontend Integration Example

```javascript
import { leaderboardAPI } from '../api';

export function Leaderboard() {
  const [globalRank, setGlobalRank] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    // Load global leaderboard
    leaderboardAPI.getGlobalLeaderboard(1, 20)
      .then(res => setLeaderboard(res.data.data.leaderboard));

    // Load user's rank
    leaderboardAPI.getUserRank()
      .then(res => setGlobalRank(res.data.data));
  }, []);

  return (
    <div>
      <h1>Global Leaderboard</h1>
      
      {/* Show user's current rank */}
      {globalRank && (
        <div className="user-rank-card">
          <h3>Your Rank: #{globalRank.userRank}</h3>
          <p>{globalRank.userStats.totalRankingPoints} points</p>
        </div>
      )}

      {/* Show top students */}
      <table>
        <tbody>
          {leaderboard.map((entry) => (
            <tr key={entry._id}>
              <td>{entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : entry.rank}</td>
              <td>{entry.name}</td>
              <td>{entry.totalRankingPoints} points</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## 📋 Daily Tasks Management

### Features

1. **Create Tasks**
   - Add tasks for any date
   - Set priority (low, medium, high)
   - Categorize (study, project, personal, exercise, health)
   - Estimate time required
   - Add tags for organization
   - Link to subjects/levels (optional)

2. **View Tasks**
   - View today's tasks by default
   - Switch to specific dates
   - Filter by status (pending/completed)

3. **Track Progress**
   - See completion percentage for the day
   - Track estimated vs actual time
   - View statistics across date ranges

### Backend Code Example

```javascript
// controllers/dailyTaskController.js

// Create a task
exports.createDailyTask = async (req, res) => {
  const { title, priority, category, taskDate, estimatedMinutes, tags } = req.body;
  
  const task = await DailyTask.create({
    user: req.user._id,
    title,
    priority,
    category,
    taskDate: new Date(taskDate), // Normalized to start of day
    estimatedMinutes,
    tags,
    completed: false
  });

  res.status(201).json({ success: true, data: task });
};

// Get today's tasks
exports.getDailyTasks = async (req, res) => {
  const { date, status } = req.query;
  
  const targetDate = new Date(date || Date.now());
  targetDate.setHours(0, 0, 0, 0);

  let query = {
    user: req.user._id,
    taskDate: targetDate
  };

  if (status === 'pending') query.completed = false;
  if (status === 'completed') query.completed = true;

  const tasks = await DailyTask.find(query);
  
  // Calculate stats
  const stats = {
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.completed).length,
    completionPercentage: tasks.length > 0 
      ? (tasks.filter(t => t.completed).length / tasks.length) * 100 
      : 0
  };

  res.json({ success: true, data: { tasks, stats } });
};

// Toggle completion
exports.toggleTaskCompletion = async (req, res) => {
  const task = await DailyTask.findByIdAndUpdate(
    req.params.taskId,
    { 
      completed: !req.task.completed,
      completedAt: !req.task.completed ? new Date() : null
    },
    { new: true }
  );

  res.json({ success: true, data: task });
};
```

### Frontend Example

```javascript
// TodaysTasks.jsx

import { dailyTasksAPI } from '../api';

export function TodaysTasks() {
  const [tasks, setTasks] = useState([]);
  const [date, setDate] = useState(getNowDate());

  async function loadTasks() {
    const response = await dailyTasksAPI.getAll(date, 'all');
    setTasks(response.data.data.tasks);
  }

  async function addTask(formData) {
    const response = await dailyTasksAPI.create({
      ...formData,
      taskDate: date
    });
    
    // Reload tasks
    loadTasks();
  }

  async function toggleTask(taskId) {
    await dailyTasksAPI.toggle(taskId);
    loadTasks();
  }

  return (
    <div>
      <h1>Today's Tasks</h1>
      
      <input 
        type="date" 
        value={date} 
        onChange={(e) => setDate(e.target.value)} 
      />
      
      <button onClick={() => addTask(newTaskData)}>+ Add Task</button>

      {tasks.map(task => (
        <div key={task._id} className={task.completed ? 'completed' : ''}>
          <input 
            type="checkbox" 
            checked={task.completed}
            onChange={() => toggleTask(task._id)}
          />
          <h4>{task.title}</h4>
          <span className="priority">{task.priority}</span>
          <span className="category">{task.category}</span>
          {task.dueTime && <span>{task.dueTime}</span>}
        </div>
      ))}
    </div>
  );
}

function getNowDate() {
  return new Date().toISOString().split('T')[0];
}
```

---

## 🔐 Permission System

### Level Tests
- ✅ Students can only access unlocked levels
- ✅ Each level allows max 3 attempts
- ❌ Cannot access Level 2 until Level 1 is passed
- ❌ Cannot view another student's progress

### Daily Tasks
- ✅ Students can only manage their own tasks
- ✅ Can view tasks by date or range
- ❌ Cannot edit/delete others' tasks

### Leaderboard
- ✅ All students can view global leaderboard
- ✅ All can see detailed subject rankings
- ✅ Each student can see their own rank
- ❌ Cannot see private user information

---

## 📊 Database Indexes for Performance

```javascript
// Important indexes to create for optimal performance
db.leveltests.createIndex({ userId: 1, subject: 1 });
db.leveltests.createIndex({ status: 1, completedAt: -1 });

db.levelprogressions.createIndex({ user: 1, subject: 1 }, { unique: true });
db.levelprogressions.createIndex({ totalPointsEarned: -1 });

db.dailytasks.createIndex({ user: 1, taskDate: 1 });
db.dailytasks.createIndex({ user: 1, completed: 1 });

db.users.createIndex({ totalRankingPoints: -1 });
```

---

## 🐛 Common Issues & Solutions

### Issue: "Level not unlocked"
**Cause**: Student trying to access level they haven't passed prerequisites for
**Solution**: Complete and pass the previous level first

### Issue: "Maximum attempts reached"
**Cause**: Student has used all 3 attempts for a level
**Solution**: Wait or request retest from admin

### Issue: "No time bonus earned"
**Cause**: Student took longer than time limit to complete test
**Solution**: Practice to improve speed, or ensure you manage time better

### Issue: Task completion percentage not updating
**Cause**: Cache not refreshed
**Solution**: Call `fetchDailyTasks()` after toggling a task

---

## 📈 Metrics & Analytics

### Track These Key Metrics

1. **Level Completion Rate**
   ```javascript
   // % of students who completed each level
   completionRate = (studentsCompletedLevel / totalStudents) * 100
   ```

2. **Average Time per Level**
   ```javascript
   // Average time taken across all attempts
   avgTime = totalTimeTaken / totalAttempts
   ```

3. **Leaderboard Movement**
   ```javascript
   // Track how often top ranks change
   // Indicates active participation
   ```

4. **Task Completion Trend**
   ```javascript
   // Daily task completion percentage over time
   // Shows productivity trends
   ```

---

## 🚀 Production Deployment Checklist

- [ ] Initialize subjects and levels
- [ ] Add comprehensive question banks for each level
- [ ] Configure time limits per level
- [ ] Set up email notifications for achievements
- [ ] Configure leaderboard refresh frequency
- [ ] Set up database backups
- [ ] Enable monitoring and logging
- [ ] Test edge cases (attempt limits, unlocking, etc.)
- [ ] Load test the APIs
- [ ] Configure CORS for production domain
- [ ] Update environment variables
- [ ] Review security settings

---

**Last Updated**: April 4, 2026  
**Version**: 1.0  
**Status**: ✅ Production Ready

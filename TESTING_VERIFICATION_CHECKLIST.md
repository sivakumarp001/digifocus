# Testing & Verification Checklist - Multi-Level Assessment System

## ✅ Pre-Deployment Testing

### Setup Verification

- [ ] Database connection working (mongo shell connects)
- [ ] Backend server running without errors (`npm start` in backend/)
- [ ] Frontend build successful (`npm run dev` in frontend/)
- [ ] No console errors in browser DevTools
- [ ] Network tab shows API calls going to http://localhost:5000/api

### Basic Connectivity Tests

```bash
# Test backend is running
curl http://localhost:5000/api/health

# Test database connection
curl http://localhost:5000/api/levels/subjects \
  -H "Authorization: Bearer TEST_TOKEN"

# Expected: Returns subjects array or auth error (not connection error)
```

---

## 🧪 Feature Testing

### 1. Multi-Level Assessment System

#### Test 1.1: Initialize Subjects

**Steps**:
1. Get admin token
2. POST to `/api/levels/initialize`
3. Verify response

**Pass Criteria**:
```
✓ Status 200/201
✓ Response shows all 10 subjects created
✓ Each subject has levelNames for 4 levels
✓ Subjects: Java, Python, DBMS, Web Development, Data Structures, 
   Algorithms, Operating Systems, Computer Networks, Machine Learning, 
   Cybersecurity
```

**Test Command**:
```bash
curl -X POST http://localhost:5000/api/levels/initialize \
  -H "Authorization: Bearer $(cat token.txt)" \
  -H "Content-Type: application/json"

# Save subject IDs for next tests
```

#### Test 1.2: Get All Subjects with Progress

**Steps**:
1. Student user logged in
2. GET `/api/levels/subjects`
3. Check response

**Pass Criteria**:
```
✓ Returns all 10 subjects
✓ Each subject shows user's current progress
✓ For first-time user: currentLevel = 1, unlockedLevels = [1]
✓ Includes subject details (name, icon, description)
```

**Test Code**:
```javascript
// JavaScript
const response = await fetch('http://localhost:5000/api/levels/subjects', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const data = await response.json();
console.assert(data.data.length === 10, 'Should have 10 subjects');
console.assert(data.data[0].progress.currentLevel === 1, 'First-timer should be at level 1');
console.assert(data.data[0].progress.unlockedLevels[0] === 1, 'Level 1 should be unlocked');
```

#### Test 1.3: Populate Questions for a Level

**Steps**:
1. Get Java subject ID from Test 1.1
2. POST questions to Level 1

**Pass Criteria**:
```
✓ Status 200/201
✓ Questions stored in Level document
✓ Questions include question text, options, correctAnswer, 
   explanation, difficulty
```

**Test Command**:
```bash
curl -X POST http://localhost:5000/api/levels/[JAVA_ID]/1/questions \
  -H "Authorization: Bearer $(cat token.txt)" \
  -H "Content-Type: application/json" \
  -d '{
    "questions": [
      {
        "question": "What does JVM stand for?",
        "options": ["Java Visual Machine", "Java Virtual Machine", "Java Version Manager", "Java Validation Method"],
        "correctAnswer": 1,
        "explanation": "JVM is the Java Virtual Machine that interprets bytecode",
        "difficulty": "easy"
      },
      {
        "question": "Which keyword is used to access static members of a class?",
        "options": ["this", "super", "static", "new"],
        "correctAnswer": 2,
        "explanation": "The static keyword is used to declare static members",
        "difficulty": "medium"
      }
    ]
  }'
```

#### Test 1.4: Start Level Test (Level Not Yet Passed)

**Steps**:
1. Get Level 1 ID for Java
2. Student tries to start test
3. Verify questions returned WITHOUT answers

**Pass Criteria**:
```
✓ Status 200
✓ Returns testId
✓ Returns all questions
✓ Questions DO NOT have correctAnswer in response
✓ Returns timeLimit (e.g., 60 minutes for Level 1)
✓ Returns totalQuestions count
```

**Test Code**:
```javascript
const response = await levelsAPI.startLevelTest(levelId);
const { testId, questions, timeLimit } = response.data.data;

console.assert(testId, 'Should get testId');
console.assert(questions.length > 0, 'Should get questions');
console.assert(questions[0].correctAnswer === undefined, 'correctAnswer should NOT be returned');
console.assert(timeLimit === 60, 'Level 1 should allow 60 minutes');
console.log('✓ Test started successfully');
```

#### Test 1.5: Try to Start Level 2 (Should Fail)

**Steps**:
1. Try to start Level 2 before Level 1 is passed
2. Verify rejection

**Pass Criteria**:
```
✓ Status 403/400
✓ Error message: "Level not unlocked" or similar
✓ Cannot proceed with test
```

**Expected Response**:
```json
{
  "success": false,
  "error": "Level 2 not unlocked. Complete Level 1 first."
}
```

#### Test 1.6: Submit Test with Correct Answers (Score 60% or Higher)

**Steps**:
1. From Test 1.4, have testId
2. Submit answers that get 6 out of 10 correct
3. Track time taken (simulate 45 minutes)

**Pass Criteria**:
```
✓ Status 200
✓ isPassed: true (if score >= 60%)
✓ Base score: 60% (6/10)
✓ Time bonus: calculated correctly
   - Time: 45 min / 60 min limit = 75% of time
   - Bonus: 30 × (1 - (75-60)/40) = 30 × 0.625 = 18.75 ≈ 19 points
✓ Total points: 60 + 19 = 79 points
✓ Response includes detailed answer review
```

**Test Command**:
```javascript
const timeTakenSeconds = 45 * 60; // 45 minutes in seconds

const response = await levelsAPI.submitLevelTest(testId, {
  answers: [1, 2, 1, 3, 2, 1, 0, 2, 1, 0], // 6 correct
  timeTakenSeconds
});

const { isPassed, score, percentage, timeBonus, totalPoints } = response.data.data;
console.assert(isPassed === true, 'Should pass with 60%');
console.assert(percentage === 60, 'Should be 60%');
console.assert(timeBonus >= 18 && timeBonus <= 20, `Time bonus should be ~19, got ${timeBonus}`);
console.assert(totalPoints === 79, `Total should be 79, got ${totalPoints}`);
console.log('✅ Pass test completed successfully');
```

#### Test 1.7: Verify Level 2 Unlocked After Level 1 Pass

**Steps**:
1. After Test 1.6 (Level 1 passed)
2. GET `/api/levels/subjects` again
3. Check Java subject progress

**Pass Criteria**:
```
✓ currentLevel: 2 (advanced to Level 2)
✓ unlockedLevels: [1, 2] (Level 2 now accessible)
✓ levelScores[1]: { bestScore: 79, attempts: 1, passed: true }
```

**Test Code**:
```javascript
const subjects = await levelsAPI.getAllSubjects();
const javaSubject = subjects.data.data.find(s => s.name === 'Java');
const progress = javaSubject.progress;

console.assert(progress.currentLevel === 2, 'Should advance to level 2');
console.assert(progress.unlockedLevels.includes(2), 'Level 2 should be unlocked');
console.assert(progress.levelScores[1].bestScore === 79, 'Best score should be 79');
console.log('✅ Level unlocking works');
```

#### Test 1.8: Submit Test with Low Score (Below 60%)

**Steps**:
1. Get Level 1 test again (can retake)
2. Submit answers that score only 40% (4 out of 10)
3. Verify failure

**Pass Criteria**:
```
✓ isPassed: false
✓ Base score: 40%
✓ Attempt count: 2 (after first attempt)
✓ Can still retake (if attempts < 3)
```

**Test Code**:
```javascript
const response = await levelsAPI.submitLevelTest(testId, {
  answers: [0, 0, 0, 0, 1, 1, 1, 1, 0, 0] // Only 4 correct
});

const { isPassed, percentage, attempts } = response.data.data;
console.assert(isPassed === false, 'Should fail with 40%');
console.assert(percentage === 40, 'Should be 40%');
console.assert(attempts === 2, 'Should be attempt 2');
console.log('✅ Failure handling works');
```

#### Test 1.9: Time Bonus Edge Cases

**Scenario A: Very Fast (30 minutes)**
```javascript
// Time bonus should be full 30 points
const response = await submitTest({
  answers: [...],
  timeTakenSeconds: 30 * 60,
  timeLimit: 60 * 60
});
// Time % = 50% < 60% → Bonus = 30
```

**Scenario B: Exceeded Time (70 minutes)**
```javascript
// Time bonus should be 0
const response = await submitTest({
  answers: [...],
  timeTakenSeconds: 70 * 60,
  timeLimit: 60 * 60
});
// Time % = 116% > 100% → Bonus = 0
```

**Scenario C: Exactly 80% of time**
```javascript
// Time bonus should be 30 × (1 - (80-60)/40) = 15
const response = await submitTest({
  answers: [...],
  timeTakenSeconds: 48 * 60,
  timeLimit: 60 * 60
});
// Time % = 80%, Bonus = 30 × (1 - 20/40) = 15
```

---

### 2. Leaderboard System Tests

#### Test 2.1: Global Leaderboard Ranking

**Steps**:
1. Create 5 test users
2. Each completes Level 1 with different scores
3. GET `/api/leaderboard/global` with page=1, limit=20

**Pass Criteria**:
```
✓ Users sorted by totalRankingPoints descending
✓ Each user shows correct rank position
✓ User with highest points is rank #1
✓ Response includes pagination info
```

**Test Data Setup**:
```javascript
// Simulate 5 users with different points
const testScores = [
  { userId: 'user1', points: 120 }, // Should rank #1
  { userId: 'user2', points: 90 },  // Should rank #3
  { userId: 'user3', points: 105 }, // Should rank #2
  { userId: 'user4', points: 75 },  // Should rank #4
  { userId: 'user5', points: 60 }   // Should rank #5
];

// After all tests submitted, check leaderboard
const leaderboard = await leaderboardAPI.getGlobalLeaderboard(1, 20);
const ranked = leaderboard.data.data.leaderboard;

console.assert(ranked[0].totalRankingPoints === 120, 'Rank 1 should have 120 points');
console.assert(ranked[1].totalRankingPoints === 105, 'Rank 2 should have 105 points');
console.assert(ranked[0].rank === 1, 'Should show rank 1');
```

#### Test 2.2: Subject-Specific Leaderboard

**Steps**:
1. Get leaderboard for Java subject
2. Verify only Java-related scores shown

**Pass Criteria**:
```
✓ Only students who attempted Java levels shown
✓ Sorted by LevelProgress.totalPointsEarned for Java
✓ Shows current level in Java
✓ Shows completion percentage for Java
```

**Test Code**:
```javascript
const javaLeaderboard = await leaderboardAPI.getSubjectLeaderboard(javaSubjectId, 1, 20);
const users = javaLeaderboard.data.data.leaderboard;

users.forEach(entry => {
  console.assert(entry.currentLevel >= 1, 'Should have at least started a level');
  console.assert(entry.completionPercentage <= 100, 'Completion % should be <= 100');
  console.assert(entry.completionPercentage >= 0, 'Completion % should be >= 0');
});
```

#### Test 2.3: Get User's Own Rank

**Steps**:
1. Logged in as a student
2. GET `/api/leaderboard/user-rank`
3. Should see own rank + nearby competitors

**Pass Criteria**:
```
✓ Returns userRank (their position)
✓ Returns nearby users (±5 around them)
✓ Accurate rank calculation
```

**Test Code**:
```javascript
const rankData = await leaderboardAPI.getUserRank();
const { userRank, nearbyUsers } = rankData.data.data;

console.assert(userRank > 0, 'Should have valid rank');
console.assert(Array.isArray(nearbyUsers), 'Should return nearby users');
console.assert(nearbyUsers.length <= 10, 'Should have at most 10 nearby users');
console.log(`✅ User's rank: #${userRank}`);
```

#### Test 2.4: Top Performers Card

**Steps**:
1. GET `/api/leaderboard/top-performers`
2. Check top 10 users

**Pass Criteria**:
```
✓ Returns top 10 users (limit=10 by default)
✓ Sorted descending by points
✓ Each shows rank, name, points, profile
```

**Test Code**:
```javascript
const topPerformers = await leaderboardAPI.getTopPerformers(10);
const performers = topPerformers.data.data;

console.assert(performers.length <= 10, 'Should have max 10 performers');
performers.forEach((p, idx) => {
  console.assert(p.rank === idx + 1, `Performer ${idx} should have rank ${idx + 1}`);
});
console.log('✅ Top performers fetched');
```

#### Test 2.5: Level Completion Statistics

**Steps**:
1. GET `/api/leaderboard/level-stats/:subjectId`
2. Check aggregation data

**Pass Criteria**:
```
✓ Returns totalStudents in class
✓ Shows completedLevel1, completedLevel2, etc. counts
✓ Shows average points per level
```

**Test Code**:
```javascript
const stats = await leaderboardAPI.getLevelStats(javaSubjectId);
const data = stats.data.data;

console.assert(data.totalStudents > 0, 'Should have students');
console.assert(data.completedLevel1 <= data.totalStudents, 'Counts should be valid');
console.assert(data.avgPointsLevel1 >= 0, 'Average points should be non-negative');
console.log(`✅ ${data.completedLevel1} students completed Level 1`);
```

---

### 3. Daily Tasks System Tests

#### Test 3.1: Create Daily Task

**Steps**:
1. POST `/api/daily-tasks` with task data
2. Verify task created

**Pass Criteria**:
```
✓ Status 201
✓ Task stored with all fields
✓ Date normalized to start of day UTC
✓ Returns taskId
```

**Test Command**:
```bash
curl -X POST http://localhost:5000/api/daily-tasks \
  -H "Authorization: Bearer $(cat token.txt)" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Master Java Arrays",
    "description": "Learn about arrays, ArrayLists, and Collections",
    "priority": "high",
    "category": "study",
    "taskDate": "2024-04-04",
    "estimatedMinutes": 45,
    "dueTime": "14:00",
    "tags": ["java", "arrays", "important"],
    "relatedSubject": "Java",
    "relatedLevel": 1
  }'
```

#### Test 3.2: Get Today's Tasks

**Steps**:
1. GET `/api/daily-tasks?date=2024-04-04&status=all`
2. Should return tasks + stats

**Pass Criteria**:
```
✓ Returns all tasks for selected date
✓ Shows stats: totalTasks, completedTasks, pendingTasks, completionPercentage
✓ Tasks sorted by priority (high first)
✓ Tasks sorted by dueTime within priority
```

**Test Code**:
```javascript
const response = await dailyTasksAPI.getAll('2024-04-04', 'all');
const { tasks, stats } = response.data.data;

console.assert(tasks.length > 0, 'Should have tasks');
console.assert(stats.totalTasks === tasks.length, 'Stats should match');
console.assert(stats.completionPercentage <= 100, 'Completion % valid');
console.log(`✅ ${stats.totalTasks} tasks for today, ${stats.completionPercentage}% done`);
```

#### Test 3.3: Toggle Task Completion

**Steps**:
1. Create a task
2. PATCH `/api/daily-tasks/:taskId/toggle`
3. Verify status changed

**Pass Criteria**:
```
✓ Task.completed flipped from false → true
✓ Task.completedAt timestamp set
✓ Subsequent toggle flips back to false
✓ completedAt cleared on flip to false
```

**Test Code**:
```javascript
const taskId = 'task-id-here';

// First toggle - mark complete
let response = await dailyTasksAPI.toggle(taskId);
console.assert(response.data.data.completed === true, 'Should be completed');
console.assert(response.data.data.completedAt, 'Should have timestamp');

// Second toggle - mark incomplete
response = await dailyTasksAPI.toggle(taskId);
console.assert(response.data.data.completed === false, 'Should be incomplete');
console.log('✅ Task toggle works');
```

#### Test 3.4: Filter Tasks by Status

**Subtest A: Pending Tasks**
```javascript
const pending = await dailyTasksAPI.getAll('2024-04-04', 'pending');
pending.data.data.tasks.forEach(t => {
  console.assert(t.completed === false, 'All should be pending');
});
```

**Subtest B: Completed Tasks**
```javascript
const completed = await dailyTasksAPI.getAll('2024-04-04', 'completed');
completed.data.data.tasks.forEach(t => {
  console.assert(t.completed === true, 'All should be completed');
});
```

#### Test 3.5: Edit Task

**Steps**:
1. Create task
2. PUT `/api/daily-tasks/:taskId` with updates
3. Verify changes

**Pass Criteria**:
```
✓ Title can be updated
✓ Priority can be changed
✓ Category can be modified
✓ Cannot change user (ownership)
✓ Cannot change createdAt
```

**Test Code**:
```javascript
const response = await dailyTasksAPI.update(taskId, {
  title: 'Updated Task Title',
  priority: 'low',
  category: 'personal'
});

const updated = response.data.data;
console.assert(updated.title === 'Updated Task Title', 'Title should update');
console.assert(updated.priority === 'low', 'Priority should update');
console.log('✅ Task update works');
```

#### Test 3.6: Delete Task

**Steps**:
1. Create task
2. DELETE `/api/daily-tasks/:taskId`
3. Verify deletion

**Pass Criteria**:
```
✓ Status 200
✓ Task removed from database
✓ Subsequent GET returns empty
✓ Cannot delete someone else's task
```

**Test Code**:
```javascript
await dailyTasksAPI.delete(taskId);

// Verify deleted
try {
  await dailyTasksAPI.getOne(taskId);
  console.error('❌ Task should be deleted');
} catch (err) {
  console.assert(err.response.status === 404, 'Should be not found');
  console.log('✅ Task deletion works');
}
```

#### Test 3.7: Task Stats Aggregation

**Steps**:
1. Create multiple tasks between 2024-04-01 and 2024-04-07
2. GET `/api/daily-tasks/stats?startDate=2024-04-01&endDate=2024-04-07`
3. Check aggregation

**Pass Criteria**:
```
✓ Returns array of daily breakdowns
✓ Each day shows: date, totalTasks, completedTasks
✓ Overall summary shows total for entire range
✓ Percentages calculated correctly
```

**Test Code**:
```javascript
const stats = await dailyTasksAPI.getStats('2024-04-01', '2024-04-07');
const { byDate, overall } = stats.data.data;

console.assert(Array.isArray(byDate), 'Should have daily breakdown');
console.assert(overall.totalTasks > 0, 'Should have totals');
console.log(`✅ Created ${overall.totalTasks} tasks in week`);
```

#### Test 3.8: Date Navigation

**Steps**:
1. Create tasks for multiple dates
2. Use frontend date picker
3. Navigate between dates

**Pass Criteria**:
```
✓ Date input updates selected date
✓ Previous day button works
✓ Next day button works
✓ "Today" button returns to current date
✓ Tasks list updates when date changes
```

**Test Code (Frontend)**:
```javascript
// In TodaysTasks component
const [selectedDate, setSelectedDate] = useState('2024-04-04');

const goPreviousDay = () => {
  const prev = new Date(selectedDate);
  prev.setDate(prev.getDate() - 1);
  setSelectedDate(prev.toISOString().split('T')[0]);
};

const goNextDay = () => {
  const next = new Date(selectedDate);
  next.setDate(next.getDate() + 1);
  setSelectedDate(next.toISOString().split('T')[0]);
};

const goToday = () => {
  setSelectedDate(new Date().toISOString().split('T')[0]);
};
```

---

## 🎨 Frontend UI Tests

### Test 4.1: Leaderboard Page Renders

**Steps**:
1. Navigate to `/leaderboard`
2. Check page loads

**Pass Criteria**:
```
✓ Page title "Leaderboard" visible
✓ Two tabs visible: "Global Rankings" and "By Subject"
✓ First tab active by default
✓ No console errors
```

### Test 4.2: TodaysTasks Page Renders

**Steps**:
1. Navigate to `/todays-tasks`
2. Check page loads

**Pass Criteria**:
```
✓ Page title "Today's Tasks" visible
✓ Date picker displayed
✓ Stats dashboard visible (4 cards)
✓ Filter buttons visible
✓ "Add Task" button visible
```

### Test 4.3: Responsive Design Mobile (768px)

**Steps**:
1. Open DevTools → Device Toolbar
2. Set width to 375px (iPhone SE)
3. Test all pages

**Pass Criteria**:
```
✓ Leaderboard table becomes scrollable
✓ Task cards stack vertically
✓ Buttons remain clickable
✓ Text remains readable
✓ No horizontal scrolling needed
```

### Test 4.4: Navigation Integration

**Steps**:
1. Open Sidebar
2. Click "Leaderboard"
3. Click "Today's Tasks"

**Pass Criteria**:
```
✓ Navigation items visible in sidebar
✓ Clicking navigates to correct page
✓ Current page highlighted in sidebar
```

---

## 🔐 Security Tests

### Test 5.1: Authentication Required

**Steps**:
1. Try accessing `/api/levels/subjects` without token
2. Verify rejection

**Pass Criteria**:
```
✓ Status 401
✓ Error: "No token provided" or "Unauthorized"
```

### Test 5.2: Student Cannot Access Admin Endpoints

**Steps**:
1. Student token tries POST `/api/levels/initialize`
2. Verify rejection

**Pass Criteria**:
```
✓ Status 403
✓ Error: "Unauthorized - admin only" or similar
```

### Test 5.3: Cannot Access Another's Tasks

**Steps**:
1. Student A creates task
2. Student B tries to get/edit/delete it

**Pass Criteria**:
```
✓ Status 403/404
✓ Cannot retrieve other student's task
✓ Cannot modify other student's task
```

---

## 🚀 Performance Tests

### Test 6.1: Leaderboard Load Time

**Steps**:
1. Network tab → clear
2. GET `/api/leaderboard/global`
3. Measure response time

**Pass Criteria**:
```
✓ Response time < 500ms for typical database
✓ Can handle 1000+ students
```

### Test 6.2: Concurrent Submissions

**Steps**:
1. Simulate 10 students submitting tests simultaneously
2. Verify leaderboard updates correctly

**Pass Criteria**:
```
✓ All submissions processed
✓ Rankings correct after all complete
✓ No data corruption
✓ No duplicate points
```

---

## ✨ Integration Tests

### Test 7.1: Complete Level Journey

**Full Scenario**:
```
1. Student starts fresh
2. Selects Java subject
3. Starts Level 1 test
4. Submits answers (passes with 75 points)
5. Checks leaderboard (appears in ranking)
6. Views daily tasks (complete one)
7. Comes back next day (tasks reset)

Expected Results:
✓ Progress saved
✓ Ranking updated
✓ Tasks properly isolated by date
✓ Level 2 unlocked
```

### Test 7.2: Subject Switching

**Test**:
```
1. Complete Level 1 in Java (gets 80 points)
2. Switch to Python
3. Python shows Level 1 locked (no prior progress)
4. Verify each subject maintains separate progress
✓ Scores don't cross-contaminate
✓ Each subject independent
```

---

## 📋 Final Verification Checklist

### All Systems Go? ✅

- [ ] All 5 database models created
- [ ] 3 controllers working (levels, leaderboard, daily tasks)
- [ ] 3 route files registered in server.js
- [ ] 2 frontend components rendering
- [ ] 2 CSS files loaded and styled
- [ ] Navigation integrated
- [ ] API client updated
- [ ] All 20+ endpoints tested
- [ ] Authentication working
- [ ] Time-based scoring correct
- [ ] Level unlocking working
- [ ] Leaderboard ranking accurate
- [ ] Daily tasks CRUD complete
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Database indexes created

### Ready for Production? 🚀

If all above checked ✅, you're ready to:
1. Deploy to production server
2. Run final load tests
3. Enable monitoring
4. Notify students
5. Begin using system

---

**Test Date**: ________________  
**Tester**: ________________  
**Status**: ☐ PASS | ☐ FAIL | ☐ NEEDS FIXES

**Notes**: ____________________________________________________________

---

**Last Updated**: April 4, 2026  
**Version**: 1.0  

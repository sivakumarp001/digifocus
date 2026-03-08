# Analytics Enhancement - Study & Quiz Tracking

## Overview
Enhanced the analytics system to track study timer sessions and quiz completions in the daily progress graphs. Users can now see their study activity and quiz performance alongside focus time and task completion metrics.

## Changes Made

### Backend Updates

#### 1. **analyticsController.js** - Enhanced Analytics Functions

**New Data Tracked:**
- `quizzesCompleted` - Total quizzes attempted per day
- `quizzesPassed` - Quizzes passed (≥60% score) per day
- `todayQuizzes` - Total quizzes taken today
- `todayQuizzesPassed` - Quizzes passed today

**Modified Functions:**

##### `getWeeklyAnalytics()`
- Now queries Quiz model for completed quizzes
- Returns new arrays: `quizzesCompleted[]` and `quizzesPassed[]` 
- Maintains 7-day rolling window format
- Response includes: `labels`, `focusHours`, `tasksCompleted`, `quizzesCompleted`, `quizzesPassed`

**Request:** `GET /api/analytics/weekly`

**Response:**
```json
{
  "success": true,
  "labels": ["Mon", "Tue", "Wed", ...],
  "focusHours": [2.5, 1.8, 3.2, ...],
  "tasksCompleted": [2, 1, 3, ...],
  "quizzesCompleted": [1, 2, 1, ...],
  "quizzesPassed": [1, 1, 0, ...]
}
```

##### `getMonthlyAnalytics()`
- Extended weekly summaries to include quiz data
- Each week now includes: `quizzes` and `quizzesPassed` counts
- Response maintains `weekData[]` array with 4 weeks

**Request:** `GET /api/analytics/monthly`

**Response:**
```json
{
  "success": true,
  "weekData": [
    {
      "week": "Week 1",
      "focusHours": 15.5,
      "tasks": 8,
      "quizzes": 5,
      "quizzesPassed": 4
    },
    ...
  ]
}
```

##### `getSummary()`
- Added today's quiz metrics to daily summary
- Includes: `todayQuizzes`, `todayQuizzesPassed` 
- Updated productivity score calculation to include quiz performance
- Productivity score now factors: 
  - Task completion rate (40%)
  - Focus consistency (30%)
  - **Quiz performance (20%)** ← NEW
  - Streak bonus (10%)

**Request:** `GET /api/analytics/summary`

**Response Addition:**
```json
{
  "summary": {
    "totalTasks": 20,
    "completedTasks": 15,
    "completionRate": 75,
    "todayFocusMinutes": 120,
    "todayFocusHours": 2,
    "todayDistractions": 3,
    "todayQuizzes": 2,           // ← NEW
    "todayQuizzesPassed": 1,     // ← NEW
    "streak": 5,
    "productivityScore": 68,
    "totalFocusMinutes": 1680
  }
}
```

---

### Frontend Updates

#### **Analytics.jsx** - Enhanced Visualization

**Data Integration:**
- Weekly activity data now includes `quizzes` and `quizzesPassed` fields
- Monthly overview data extended with quiz metrics

**New Metrics Displayed:**

1. **Today's Quizzes** (Top Stats Card)
   - Shows count of quizzes attempted today
   - Icon: 📚
   - Updates in real-time from summary data

2. **Weekly Activity Chart** (Bar Chart)
   - X-axis: Days of week (Mon-Sun)
   - Y-axis: Count/Hours
   - Bars show:
     - **Focus hrs** (blue) - Hours of focused work
     - **Tasks** (green) - Tasks completed
     - **Quizzes** (orange/warning color) - Quizzes attempted
   - Grouped side-by-side for easy comparison

3. **Monthly Overview Chart** (Bar Chart)
   - X-axis: Week 1-4
   - Bars show:
     - **Tasks** (green) - Tasks completed
     - **Quizzes** (orange) - Quizzes attempted
     - **Passed** (blue) - Quizzes passed

---

## How It Works

### Tracking Study Sessions

When a user completes a study timer:
1. **Task Quiz is Generated** - `quizController.generateTaskQuiz()` creates a Quiz document
2. **Quiz is Submitted** - `quizController.submitTaskQuiz()` marks quiz as completed and sets `isPassed` status
3. **Analytics Query** - Next fetch finds quizzes with `status: 'completed'` and `completedAt` timestamp
4. **Daily Aggregation** - Quizzes are grouped by date and counted

### Productivity Score Update

New calculation (100-point scale):
```javascript
focusScore = min(dailyFocusMinutes / 360, 30)  // Up to 30 points
taskScore = (completedTasks / totalTasks) * 40  // Up to 40 points
quizScore = min(passedQuizzes * 2, 20)         // Up to 20 points (NEW)
streakScore = min(streak * 2, 10)              // Up to 10 points
totalScore = focusScore + taskScore + quizScore + streakScore
```

---

## Data Flow Diagram

```
User completes Study Timer
         ↓
Quiz is generated & presented
         ↓
Quiz is submitted & graded
         ↓
Quiz model saved with:
  - status: 'completed'
  - completedAt: timestamp
  - isPassed: true/false
         ↓
User views Analytics page
         ↓
Frontend calls:
  - analyticsAPI.getWeekly()
  - analyticsAPI.getMonthly()
  - analyticsAPI.getSummary()
         ↓
Backend queries Quiz collection
         ↓
Quiz data aggregated by date
         ↓
Charts display study activity
```

---

## Features

✅ **Real-time Tracking** - Quiz completions appear in analytics immediately  
✅ **Comprehensive Metrics** - Track both quiz attempts and pass rates  
✅ **Backward Compatible** - Existing focus and task metrics unchanged  
✅ **Visual Clarity** - Multiple bar charts show all metrics together  
✅ **Motivational** - Updated productivity score includes study performance  

---

## Testing Checklist

- [ ] Complete a quiz and verify it appears in today's quiz count
- [ ] Check weekly chart shows quiz bars for days with completed quizzes
- [ ] Verify monthly chart shows quiz attempt vs. pass distinction
- [ ] Confirm productivity score updates after passing a quiz
- [ ] Test that quizzes failed (< 60%) still appear in quizzes but not in passed
- [ ] Check analytics on days with no quizzes (should show 0)

---

## Future Enhancements

- Track average quiz score per day
- Add quiz difficulty levels to analytics
- Study streak tracking (consecutive days with quizzes)
- Topic-wise analytics breakdown
- Time spent in study timer vs. quiz time tracking

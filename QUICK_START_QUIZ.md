# Quick Start Guide: Topic-Based Quiz Feature

## What This Feature Does

When you create a task and assign it a topic (Java, Python, etc.), a quiz is automatically generated and must be completed to mark the task as done. Passing the quiz (60%+) automatically completes the task!

## How to Use

### Step 1: Create a Task with a Topic

```
1. Go to Tasks Page (left sidebar)
2. Click "+ New Task"
3. Fill in:
   - Title: "Learn Java Basics"
   - Description: Optional
   - Category: Study
   - Priority: High
   - Due Date: Optional
   -** Required Language/Topic: Java **  ← This is the key!
4. Click "Create Task"
```

### Step 2: Start the Quiz

```
1. Your task now shows a quiz badge (📚 java)
2. Click "Start Java Quiz" button on the task
3. System generates 10 random questions instantly
4. Click "Next" to navigate questions
5. Click question numbers to jump around
6. 30 minutes timer countdown
```

### Step 3: Submit & Get Results

```
1. On question 10, "Submit Quiz" button appears
2. Click "Submit Quiz" when done
3. Results page shows:
   - Your score
   - Pass/Fail status
   - All questions with correct answers
4. If PASSED (60%+):
   ✅ Task automatically marked COMPLETE
5. If FAILED (<60%):
   ❌ Retake quiz to complete task
```

### Step 4: Task Complete

```
1. Return to Tasks page
2. Task is checked off ✅
3. Quiz badge shows ✅ java (green)
4. Task appears completed in dashboard
```

## Supported Topics

- Java
- Python
- C
- HTML
- CSS
- Mathematics
- Science
- History
- English
- Aptitude

## Key Features

| Feature | Benefit |
|---------|---------|
| Auto Quiz Generation | No manual quiz setup needed |
| Topic-Specific Questions | Questions match your subject |
| 60% Pass Threshold | Fair difficulty level |
| Auto Task Completion | No extra clicks to finish |
| Detailed Results | Learn from your mistakes |
| Retake Allowed | Improve your score |
| Time Limit (30 min) | Focused, timed practice |

## Important Notes

⚠️ **Remember**: 
- Tasks WITH a topic REQUIRE the quiz to be completed
- You can't mark the task as done by checkbox until quiz is passed
- Timer auto-submits at 0:00
- All answers are final once submitted
- Your score is calculated server-side (secure)

## Troubleshooting

### "Start [Topic] Quiz" button not showing?
→ Edit task and select a topic from the dropdown

### Quiz loads but no questions appear?
→ Refresh the page
→ Check browser console (F12) for errors
→ Reload the page

### Clicked Submit but nothing happens?
→ Wait 2-3 seconds
→ Check your internet connection
→ Refresh if needed

### Task didn't mark as complete after passing quiz?
→ Go back to Tasks page
→ Refresh the page
→ Check if your score was 60% or higher

### Too hard / Too many questions?
→ You can't adjust difficulty currently
→ Consider taking it again after studying
→ Retakes allow learning from mistakes

## Example Workflow

```
📝 Create Task
    ↓
Select Topic (Java)
    ↓
See Quiz Button (🎯 Start Java Quiz)
    ↓
Click Quiz Button
    ↓
10 Questions Load
    ↓
Answer & Navigate (30 min limit)
    ↓
Click Submit Quiz
    ↓
Get Results
    ↓
Score 70% ✅ PASSED
    ↓
📋 View Results
    ↓
Return to Tasks
    ↓
✅ Task Auto-Completed!
```

## API Behind the Scenes

(For developers)

```javascript
// Generate quiz for task
POST /api/quiz/task/:taskId/generate

// Submit quiz and complete task
PUT /api/quiz/:id/task-submit
{ answers: [...], taskId: "..." }

// Get quiz for a task
GET /api/quiz/task/:taskId

// Check quiz status
GET /api/quiz/task/:taskId/status
```

## Tips for Success

✅ **DO:**
- Read each question carefully
- Use the timer to manage your pace
- Review your answers before submitting
- Try harder topics after studying first
- Retake if you don't pass (learning tool!)

❌ **DON'T:**
- Rush through answers
- Rely on guessing (60% is hard to guess!)
- Ignore wrong answers (review & learn)
- Create unnecessarily many quiz tasks
- Expect instant perfect scores

## Performance Insights

After taking a quiz, you can:
1. See which topics you're weak in
2. Check your score trend (retakes)
3. Review exact wrong answers
4. Understand correct answers
5. Plan study accordingly

---

**Questions?** Check the detailed documentation: [TOPIC_QUIZ_FEATURE.md](./TOPIC_QUIZ_FEATURE.md)

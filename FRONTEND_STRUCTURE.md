# Frontend Structure - React.js Architecture

**Framework:** React 18 + Vite  
**State Management:** Context API + Local Storage  
**Styling:** CSS3 + CSS Modules  
**HTTP Client:** Axios  
**Routing:** React Router v6

---

## 📁 Directory Structure

```
frontend/
├── src/
│   ├── api/
│   │   └── index.js                    # Axios API client & endpoints
│   │
│   ├── assets/
│   │   ├── images/                     # PNG, JPG images
│   │   ├── icons/                      # SVG icons
│   │   └── fonts/                      # Custom fonts
│   │
│   ├── components/
│   │   ├── Layout.jsx                  # Main layout wrapper
│   │   ├── Navbar.jsx                  # Top navigation bar
│   │   ├── Navbar.css
│   │   ├── Sidebar.jsx                 # Left sidebar navigation
│   │   ├── Sidebar.css
│   │   ├── LoadingSpinner/
│   │   │   ├── LoadingSpinner.jsx
│   │   │   └── LoadingSpinner.css
│   │   ├── Card/
│   │   │   ├── Card.jsx
│   │   │   └── Card.css
│   │   ├── Modal/
│   │   │   ├── Modal.jsx
│   │   │   └── Modal.css
│   │   ├── Button/
│   │   │   ├── Button.jsx
│   │   │   └── Button.css
│   │   └── NotificationBell/
│   │       ├── NotificationBell.jsx
│   │       └── NotificationBell.css
│   │
│   ├── context/
│   │   ├── AuthContext.jsx             # Authentication state
│   │   ├── SidebarContext.jsx          # Sidebar toggle state
│   │   ├── ThemeContext.jsx            # Theme (light/dark) state
│   │   └── TimerContext.jsx            # Pomodoro timer state
│   │
│   ├── pages/
│   │   ├── Auth/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Auth.css
│   │   │
│   │   ├── Dashboard/
│   │   │   ├── Dashboard.jsx           # Main student dashboard
│   │   │   └── Dashboard.css
│   │   │
│   │   ├── Tasks/
│   │   │   ├── Tasks.jsx               # Task list & management
│   │   │   ├── TaskDetailsModal.jsx    # Create/edit task modal
│   │   │   ├── TaskCard.jsx            # Individual task card
│   │   │   ├── TaskQuizTest.jsx        # Task-linked quiz interface
│   │   │   ├── TaskQuizResults.jsx     # Quiz results display
│   │   │   └── Tasks.css
│   │   │
│   │   ├── StudyTimer/
│   │   │   ├── StudyTimer.jsx          # Focus/Pomodoro timer
│   │   │   ├── TimerDisplay.jsx
│   │   │   ├── TimerControls.jsx
│   │   │   ├── StudyTips.jsx
│   │   │   └── StudyTimer.css
│   │   │
│   │   ├── Quiz/
│   │   │   ├── Quiz.jsx                # Quiz list/selection
│   │   │   ├── QuizTest.jsx            # General quiz interface
│   │   │   ├── QuizResults.jsx         # General quiz results
│   │   │   └── Quiz.css
│   │   │
│   │   ├── Analytics/
│   │   │   ├── Analytics.jsx           # Main analytics page
│   │   │   ├── PerformanceGraph.jsx    # Grade/performance charts
│   │   │   ├── ProgressTracking.jsx    # Progress metrics
│   │   │   ├── ScoreHistory.jsx        # Historical scores
│   │   │   ├── SubjectAnalysis.jsx     # Subject-wise breakdown
│   │   │   └── Analytics.css
│   │   │
│   │   ├── FocusTimer/
│   │   │   ├── FocusTimer.jsx          # Focus session manager
│   │   │   ├── TimerSession.jsx
│   │   │   └── FocusTimer.css
│   │   │
│   │   ├── AdminPanel/
│   │   │   ├── AdminPanel.jsx          # Admin dashboard main
│   │   │   ├── AdminDashboard.jsx      # Dashboard overview
│   │   │   ├── ManageQuestions.jsx     # Question management
│   │   │   ├── QuestionForm.jsx        # Add/edit question
│   │   │   ├── StudentManagement.jsx   # View all students
│   │   │   ├── StudentDetail.jsx       # Individual student view
│   │   │   ├── ScoreManagement.jsx     # View all scores
│   │   │   ├── Leaderboard.jsx         # Top students list
│   │   │   ├── Reports.jsx             # Generate reports
│   │   │   ├── Analytics.jsx           # Admin-level analytics
│   │   │   ├── PerformanceCharts.jsx   # Charts & graphs
│   │   │   └── AdminPanel.css
│   │   │
│   │   ├── Goals/
│   │   │   ├── Goals.jsx               # Goal management
│   │   │   └── Goals.css
│   │   │
│   │   ├── Profile/
│   │   │   ├── Profile.jsx             # User profile page
│   │   │   ├── ProfileEdit.jsx         # Edit profile form
│   │   │   ├── Settings.jsx            # User settings
│   │   │   └── Profile.css
│   │   │
│   │   └── NotFound/
│   │       └── NotFound.jsx            # 404 page
│   │
│   ├── hooks/
│   │   ├── useAuth.js                  # Auth hook
│   │   ├── useForm.js                  # Form handling hook
│   │   ├── useFetch.js                 # Data fetching hook
│   │   └── useLocalStorage.js          # LocalStorage hook
│   │
│   ├── utils/
│   │   ├── constants.js                # Constants & config
│   │   ├── helpers.js                  # Utility functions
│   │   ├── formatters.js               # Data formatting
│   │   ├── validators.js               # Form validation
│   │   └── localStorage.js             # LocalStorage utilities
│   │
│   ├── App.jsx                         # Main app component
│   ├── App.css
│   ├── index.css                       # Global styles
│   └── main.jsx                        # Entry point
│
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── assets/                         # Static assets
│
├── package.json
├── vite.config.js
├── eslint.config.js
└── README.md
```

---

## 🧩 Key Components

### 1. Layout.jsx
```jsx
// Main layout wrapper providing header, sidebar, and main content area
function Layout() {
  return (
    <div className="layout">
      <Navbar />
      <div className="layout-body">
        <Sidebar />
        <MainContainer />
      </div>
    </div>
  );
}
```

**Features:**
- Responsive grid layout
- Sidebar toggle on mobile
- Context-based theme switching

---

### 2. Dashboard.jsx
**Purpose:** Main student landing page

**Sections:**
- Welcome header with user name & points
- Quick stats (Total Quizzes, Passed, Average Score)
- Recent activity feed
- Active tasks widget
- Quick action buttons
- Performance summary chart

```jsx
// Key metrics display
<div className="dashboard-stats">
  <StatCard icon="quiz" label="Total Quizzes" value={user.totalQuizzes} trend="+3 this month" />
  <StatCard icon="check" label="Passed" value={user.passedQuizzes} />
  <StatCard icon="star" label="Average" value={user.averageScore + '%'} />
  <StatCard icon="trophy" label="Points" value={user.points} />
</div>
```

---

### 3. Tasks.jsx
**Purpose:** Task management interface

**Features:**
- ✅ List all user tasks
- ✅ Filter by status (Pending, In-study, Quiz-available, Completed)
- ✅ Filter by priority (Low, Medium, High)
- ✅ Create new task modal
- ✅ Edit/Delete task
- ✅ Task status indicators with badges
- ✅ "Start Study" button
- ✅ "Start Quiz" button (when available)
- ✅ Sort by date/priority

**Task Card Display:**
```jsx
<TaskCard 
  task={task}
  onStartStudy={handleStartStudy}
  onStartQuiz={handleStartQuiz}
  onEdit={handleEditTask}
  onDelete={handleDeleteTask}
/>
```

**Indicators:**
- 🟡 Pending: Not started
- 🔵 In-Study: Study session active
- 🟢 Quiz Available: Ready to take quiz
- 🏆 Completed: Quiz passed
- ❌ Failed: Quiz not passed

---

### 4. StudyTimer.jsx
**Purpose:** Pomodoro/Focus timer component

**Features:**
- Duration input (1-120 minutes)
- Real-time countdown display (MM:SS format)
- Pause/Resume/Reset controls
- Study tips rotation every 5 minutes
- Focus mode (full-screen optional)
- Auto-launch quiz on completion
- Sound notification on completion
- Session history

**UI Layout:**
```
┌─────────────────────────────┐
│      Study Timer Setup      │
├─────────────────────────────┤
│ Duration: [60] minutes      │
├─────────────────────────────┤
│                             │
│      TIMER DISPLAY          │
│      [  01:30  ]            │
│                             │
│ [Start] [Pause] [Reset]     │
├─────────────────────────────┤
│  💡 Study Tips              │
│  "Take breaks every 25 min" │
└─────────────────────────────┘
```

**Key Functions:**
```javascript
startTimer()      // Begin countdown
pauseTimer()      // Freeze time
resumeTimer()     // Continue from pause
resetTimer()      // Return to original duration
autoLaunchQuiz()  // On completion, navigate to quiz
```

---

### 5. TaskQuizTest.jsx
**Purpose:** Quiz interface for task-linked quizzes

**Features:**
- Display 10 questions one at a time (or all, configurable)
- MCQ format with 4 options
- Question counter (e.g., "Question 3/10")
- Navigation: Previous, Next, Jump to question
- Timer countdown (30 minutes)
- Optional full-screen mode
- Save progress periodically
- Auto-submit on time expiry

**Question Display:**
```jsx
<div className="question-container">
  <h3>{questionIndex + 1}/10: {question.question}</h3>
  <div className="options">
    {question.options.map((option, idx) => (
      <label key={idx} className="option">
        <input 
          type="radio" 
          name={`question-${questionIndex}`}
          value={idx}
          onChange={() => handleSelectAnswer(idx)}
        />
        <span>{option}</span>
      </label>
    ))}
  </div>
</div>
```

---

### 6. TaskQuizResults.jsx
**Purpose:** Display quiz results with answer review

**Display:**
- Score: X/10 (e.g., 8/10)
- Percentage: XX% (e.g., 80%)
- Status: PASSED ✓ / FAILED ✗
- Points awarded: +10 or -5
- Answer-by-answer review
- Correct/incorrect indicators
- Explanations for each answer
- Task completion status update
- "Retake Quiz" button (if allowed)
- "Back to Tasks" button

**Result Card Example:**
```jsx
<div className={`result-card ${isPassed ? 'passed' : 'failed'}`}>
  <h2>{isPassed ? '✓ Passed!' : '✗ Failed'}</h2>
  <div className="score">{score}/10 ({percentage}%)</div>
  <div className="points-info">
    {isPassed ? '+ 10 Points' : '- 5 Points'}
  </div>
  <div className="answer-review">
    {/* Answer-by-answer breakdown */}
  </div>
</div>
```

---

### 7. Analytics.jsx
**Purpose:** Student performance analytics page

**Sections:**
- Overall statistics (Total, Passed, Failed, Average)
- Weekly performance graph (line chart)
- Monthly performance graph (bar chart)
- Subject-wise performance (radar/pie chart)
- Score history table
- Metrics:
  - Accuracy trends
  - Pass rate
  - Topic strengths/weaknesses
  - Focus session stats

**Chart Components:**
```jsx
import { LineChart, BarChart, RadarChart } from 'recharts';

<WeeklyPerformanceChart data={weeklyData} />
<MonthlyPerformanceChart data={monthlyData} />
<SubjectWiseChart data={subjectData} />
```

---

### 8. AdminPanel.jsx
**Purpose:** Admin control center

**Sub-sections:**

**a) Manage Questions**
- List all questions by topic
- Add new question form
- Edit existing question
- Delete question
- Search & filter
- Bulk upload (CSV)
- Approval workflow

**b) View Students**
- Student list with search
- Filter by performance tier
- View individual student detail
- See all their quiz attempts
- Performance chart per student

**c) Score Management**
- View all quiz scores
- Filter by student, subject, date
- Export scores (PDF/Excel)
- View pass/fail statistics

**d) Leaderboard**
- Top 10 / 50 / 100 students
- Rank, name, points, averages

**e) Reports & Analytics**
- Overall pass/fail rate
- Subject-wise performance
- Student engagement metrics
- Chart generation
- Export functionality

---

## 🎨 Key Context Providers

### AuthContext.jsx
```jsx
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const login = async (email, password) => { /* ... */ };
  const logout = () => { /* ... */ };
  const register = async (name, email, password) => { /* ... */ };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, register, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
```

**Manages:**
- User authentication state
- Login/Logout/Register
- Token management
- User profile data

---

### ThemeContext.jsx
**Manages:**
- Light/Dark mode toggle
- Theme colors persistence
- Applies theme to all components

---

### TimerContext.jsx
**Manages:**
- Pomodoro timer state
- Timer duration
- Play/Pause state
- Auto-launch quiz trigger

---

## 📦 API Client (api/index.js)

```javascript
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true
});

// Auth endpoints
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  logout: () => API.post('/auth/logout'),
  getCurrentUser: () => API.get('/auth/me'),
  refreshToken: (token) => API.post('/auth/refresh-token', { refreshToken: token })
};

// Task endpoints
export const taskAPI = {
  createTask: (data) => API.post('/tasks', data),
  getTasks: (filters) => API.get('/tasks', { params: filters }),
  getTask: (taskId) => API.get(`/tasks/${taskId}`),
  updateTask: (taskId, data) => API.put(`/tasks/${taskId}`, data),
  deleteTask: (taskId) => API.delete(`/tasks/${taskId}`),
  startStudy: (taskId, duration) => API.put(`/tasks/${taskId}/start-study`, { duration }),
  completeStudy: (taskId, actualDuration) => API.put(`/tasks/${taskId}/complete-study`, { actualDuration })
};

// Quiz endpoints
export const quizAPI = {
  generateTaskQuiz: (taskId, data) => API.post(`/quiz/task/${taskId}/generate`, data),
  getTaskQuiz: (taskId) => API.get(`/quiz/task/${taskId}`),
  submitTaskQuiz: (quizId, data) => API.put(`/quiz/${quizId}/task-submit`, data),
  getQuizStatus: (taskId) => API.get(`/quiz/task/${taskId}/status`),
  getQuizzes: (filters) => API.get('/quiz', { params: filters })
};

// Analytics endpoints
export const analyticsAPI = {
  getPersonalAnalytics: () => API.get('/analytics/me'),
  getWeeklyPerformance: (weeks) => API.get('/analytics/performance/weekly', { params: { weeks } }),
  getMonthlyPerformance: () => API.get('/analytics/performance/monthly'),
  getSubjectPerformance: () => API.get('/analytics/subject-performance')
};

// ... more endpoints
```

---

## 🚀 Routing (App.jsx)

```jsx
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Layout><Dashboard /></Layout>} />
              <Route path="/tasks" element={<Layout><Tasks /></Layout>} />
              <Route path="/tasks/:taskId/quiz-test" element={<Layout><TaskQuizTest /></Layout>} />
              <Route path="/tasks/:taskId/quiz-results" element={<Layout><TaskQuizResults /></Layout>} />
              <Route path="/study-timer" element={<Layout><StudyTimer /></Layout>} />
              <Route path="/quiz" element={<Layout><Quiz /></Layout>} />
              <Route path="/analytics" element={<Layout><Analytics /></Layout>} />
              <Route path="/profile" element={<Layout><Profile /></Layout>} />
              
              {/* Admin Routes */}
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<Layout><AdminPanel /></Layout>} />
                <Route path="/admin/questions" element={<Layout><ManageQuestions /></Layout>} />
                <Route path="/admin/students" element={<Layout><StudentManagement /></Layout>} />
                <Route path="/admin/students/:studentId" element={<Layout><StudentDetail /></Layout>} />
                <Route path="/admin/scores" element={<Layout><ScoreManagement /></Layout>} />
                <Route path="/admin/leaderboard" element={<Layout><Leaderboard /></Layout>} />
                <Route path="/admin/reports" element={<Layout><Reports /></Layout>} />
              </Route>
            </Route>
            
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
```

---

## 📋 Package.json Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "axios": "^1.6.0",
    "recharts": "^2.10.0",
    "lucide-react": "^0.294.0",
    "classnames": "^2.3.2"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0",
    "eslint": "^8.54.0",
    "eslint-plugin-react": "^7.33.0"
  }
}
```

---

## 💾 State Management Strategy

**Option 1: Context + LocalStorage (Current Implementation)**
- Store auth token in localStorage
- Store user data in Context
- Store theme preference in localStorage
- Simple, minimal dependencies

**Option 2: Redux (Alternative)**
- For larger app with complex state
- Benefits: DevTools, Time-travel debugging
- Overhead: More boilerplate

**Current Choice:** Context API (simpler, sufficient for needs)

---

**End of Frontend Structure Documentation**

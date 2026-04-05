import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import FocusTimer from './pages/FocusTimer';
import Analytics from './pages/Analytics';
import Quiz from './pages/Quiz';
import QuizTest from './pages/QuizTest';
import QuizResults from './pages/QuizResults';
import TaskQuizTest from './pages/TaskQuizTest';
import TaskQuizResults from './pages/TaskQuizResults';
import StudyTimer from './pages/StudyTimer';
import AdminPanel from './pages/AdminPanel';
import TodaysTasks from './pages/TodaysTasks';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  if (user) return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        
        {/* Admin Routes */}
        <Route path="/admin/*" element={<AdminRoute><AdminPanel /></AdminRoute>} />
        
        {/* Student Routes */}
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="todays-tasks" element={<TodaysTasks />} />
          <Route path="focus" element={<FocusTimer />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="quiz" element={<Quiz />} />
          <Route path="quiz/:quizId/test" element={<QuizTest />} />
          <Route path="quiz/:quizId/results" element={<QuizResults />} />
          {/* Task-linked quiz routes */}
          <Route path="task-quiz/:taskId/:quizId" element={<TaskQuizTest />} />
          <Route path="task-quiz-results/:taskId/:quizId" element={<TaskQuizResults />} />
          {/* Study timer route */}
          <Route path="study/:taskId" element={<StudyTimer />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

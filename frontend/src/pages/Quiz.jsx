import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { quizAPI } from '../api/index';
import './Quiz.css';

export default function Quiz() {
    const [subject, setSubject] = useState('');
    const [numberOfQuestions, setNumberOfQuestions] = useState(10);
    const [loading, setLoading] = useState(false);
    const [quizHistory, setQuizHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();

    const suggestedSubjects = ['Mathematics', 'Science', 'History', 'English', 'Aptitude', 'Java', 'Python', 'C', 'HTML', 'CSS'];

    const handleGenerateQuiz = async (e) => {
        e.preventDefault();
        if (!subject.trim()) {
            toast.error('Please enter a subject');
            return;
        }

        setLoading(true);
        try {
            const response = await quizAPI.generateQuiz({
                subject: subject.trim(),
                numberOfQuestions: parseInt(numberOfQuestions),
            });

            toast.success('Quiz generated! Starting now...');
            navigate(`/quiz/${response.data.data._id}/test`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to generate quiz');
        } finally {
            setLoading(false);
        }
    };

    const handleLoadHistory = async () => {
        try {
            const response = await quizAPI.getHistory();
            setQuizHistory(response.data.data);
            setShowHistory(!showHistory);
        } catch (error) {
            toast.error('Failed to load quiz history');
        }
    };

    const handleViewResult = (quizId) => {
        navigate(`/quiz/${quizId}/results`);
    };

    const handleSuggestedSubject = (suggestedSubj) => {
        setSubject(suggestedSubj);
    };

    return (
        <div className="quiz-container">
            <div className="quiz-header">
                <h1>📋 Quiz Generator</h1>
                <p>Type any subject to generate MCQ tests</p>
            </div>

            <div className="quiz-content">
                <form className="quiz-form" onSubmit={handleGenerateQuiz}>
                    <div className="form-group">
                        <label>Enter Subject</label>
                        <input
                            type="text"
                            placeholder="e.g., Java, Python, Aptitude, C++, CSS, Biology..."
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="input"
                            autoFocus
                        />
                        <div className="suggestions">
                            <p className="suggestions-label">Suggested:</p>
                            <div className="suggestion-tags">
                                {suggestedSubjects.map((subj) => (
                                    <button
                                        key={subj}
                                        type="button"
                                        className="tag"
                                        onClick={() => handleSuggestedSubject(subj)}
                                    >
                                        {subj}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Number of Questions</label>
                        <input
                            type="number"
                            min="5"
                            max="50"
                            value={numberOfQuestions}
                            onChange={(e) => setNumberOfQuestions(e.target.value)}
                            className="input"
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-lg"
                        disabled={loading}
                    >
                        {loading ? '⏳ Generating...' : '🚀 Start Quiz'}
                    </button>
                </form>

                <div className="quiz-stats">
                    <div className="stat-card">
                        <div className="stat-icon">📝</div>
                        <div className="stat-info">
                            <p className="stat-label">Custom Subjects</p>
                            <p className="stat-value">Any Topic</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">✅</div>
                        <div className="stat-info">
                            <p className="stat-label">Questions per Test</p>
                            <p className="stat-value">5-50</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">🎯</div>
                        <div className="stat-info">
                            <p className="stat-label">Pass Score</p>
                            <p className="stat-value">60%</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="quiz-history-section">
                <button
                    className="btn btn-secondary"
                    onClick={handleLoadHistory}
                >
                    {showHistory ? '🔍 Hide' : '📚 View'} Quiz History
                </button>

                {showHistory && (
                    <div className="history-list">
                        {quizHistory.length === 0 ? (
                            <p className="empty-message">No quizzes taken yet. Start a new quiz!</p>
                        ) : (
                            quizHistory.map((quiz) => (
                                <div key={quiz._id} className="history-card">
                                    <div className="history-info">
                                        <h3>{quiz.subject} Quiz</h3>
                                        <p className="quiz-meta">
                                            {quiz.totalQuestions} questions • Status: <span className={quiz.status === 'completed' ? 'completed' : 'in-progress'}>{quiz.status}</span>
                                        </p>
                                        {quiz.status === 'completed' && (
                                            <p className="quiz-score">
                                                Score: {quiz.score}/{quiz.totalQuestions} ({quiz.percentage}%) {quiz.isPassed ? '✅' : '❌'}
                                            </p>
                                        )}
                                    </div>
                                    {quiz.status === 'completed' && (
                                        <button
                                            className="btn btn-small"
                                            onClick={() => handleViewResult(quiz._id)}
                                        >
                                            View Details
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

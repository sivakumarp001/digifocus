import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizAPI, tasksAPI } from '../api/index';
import './Quiz.css';

export default function TaskQuizResults() {
    const { taskId, quizId } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadQuizAndTask();
    }, [quizId, taskId]);

    const loadQuizAndTask = async () => {
        try {
            // Load quiz
            const quizResponse = await quizAPI.getQuiz(quizId);
            setQuiz(quizResponse.data.data);

            // Load task
            const tasksResponse = await tasksAPI.getAll({ search: '' });
            const currentTask = tasksResponse.data.tasks.find(t => t._id === taskId);
            setTask(currentTask);

            setLoading(false);
        } catch (error) {
            console.error('Failed to load quiz or task');
            navigate('/tasks');
        }
    };

    if (loading) {
        return (
            <div className="loading-wrapper">
                <div className="spinner" />
                <p>Loading results...</p>
            </div>
        );
    }

    if (!quiz || !task) {
        return <div>Quiz or task not found</div>;
    }

    return (
        <div className="quiz-results-container">
            <div className="results-header">
                <h1>{quiz.subject} Quiz Results</h1>
                <div className="task-completion-badge" style={{
                    padding: '12px 20px',
                    backgroundColor: quiz.isPassed ? '#22c55e' : '#fbbf24',
                    color: quiz.isPassed ? '#fff' : '#1f2937',
                    borderRadius: '8px',
                    marginTop: '12px',
                    fontWeight: 'bold'
                }}>
                    {quiz.isPassed ? '✅ Task Completed!' : '⚠️ Quiz Not Passed'}
                </div>
                <p className="results-subtitle">Test Completed on {new Date(quiz.completedAt).toLocaleDateString()}</p>
            </div>

            {quiz.isPassed && (
                <div style={{
                    padding: '20px',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    border: '2px solid #22c55e',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    color: '#22c55e'
                }}>
                    <h3>🎉 Congratulations!</h3>
                    <p>Your task "<strong>{task.title}</strong>" has been automatically marked as completed.</p>
                    <p style={{ marginTop: '8px', fontSize: '14px' }}>You can view your completed task in the Tasks section.</p>
                </div>
            )}

            <div className="score-card">
                <div className="score-circle">
                    <div className="score-percentage">{quiz.percentage}%</div>
                    <div className="score-label">Score</div>
                </div>
                <div className="score-details">
                    <h2>{quiz.isPassed ? '✅ PASSED' : '❌ FAILED'}</h2>
                    <p className="score-breakdown">
                        Correct Answers: <span className="correct">{quiz.score}</span> out of {quiz.totalQuestions}
                    </p>
                    <p className="passing-score">
                        Passing Score: <span>60%</span>
                    </p>
                </div>
            </div>

            <div className="results-analysis">
                <div className="analysis-card">
                    <h3>📊 Performance Analysis</h3>
                    <div className="analysis-content">
                        <div className="analysis-item">
                            <span>Correct Answers</span>
                            <span className="value correct">{quiz.score}</span>
                        </div>
                        <div className="analysis-item">
                            <span>Wrong Answers</span>
                            <span className="value wrong">{quiz.totalQuestions - quiz.score}</span>
                        </div>
                        <div className="analysis-item">
                            <span>Accuracy</span>
                            <span className="value">{quiz.percentage}%</span>
                        </div>
                    </div>
                </div>

                <div className="analysis-card">
                    <h3>⏱️ Time Information</h3>
                    <div className="analysis-content">
                        <div className="analysis-item">
                            <span>Started At</span>
                            <span className="value">{new Date(quiz.startedAt).toLocaleTimeString()}</span>
                        </div>
                        <div className="analysis-item">
                            <span>Completed At</span>
                            <span className="value">{new Date(quiz.completedAt).toLocaleTimeString()}</span>
                        </div>
                        <div className="analysis-item">
                            <span>Time Limit</span>
                            <span className="value">{quiz.timeLimit} minutes</span>
                        </div>
                    </div>
                </div>

                <div className="analysis-card">
                    <h3>📋 Task Information</h3>
                    <div className="analysis-content">
                        <div className="analysis-item">
                            <span>Task Title</span>
                            <span className="value">{task.title}</span>
                        </div>
                        <div className="analysis-item">
                            <span>Topic/Subject</span>
                            <span className="value">{task.requiredLanguage?.toUpperCase() || 'N/A'}</span>
                        </div>
                        <div className="analysis-item">
                            <span>Priority</span>
                            <span className="value">{task.priority}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="questions-review">
                <h3>📋 Answer Review</h3>
                <div className="questions-list">
                    {quiz.questions.map((question, index) => {
                        const answer = quiz.answers[index];
                        const isCorrect = answer.isCorrect;
                        const selectedOption = question.options[answer.selectedAnswer];
                        const correctOption = question.options[question.correctAnswer];

                        return (
                            <div key={index} className={`review-item ${isCorrect ? 'correct' : 'incorrect'}`}>
                                <div className="review-header">
                                    <span className="question-num">Q{index + 1}</span>
                                    <span className={`result-badge ${isCorrect ? 'correct' : 'incorrect'}`}>
                                        {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                                    </span>
                                </div>
                                <p className="review-question">{question.question}</p>
                                <div className="review-answers">
                                    <div className="answer-item selected">
                                        <span className="answer-label">Your Answer:</span>
                                        <span className="answer-text">{selectedOption}</span>
                                    </div>
                                    {!isCorrect && (
                                        <div className="answer-item correct">
                                            <span className="answer-label">Correct Answer:</span>
                                            <span className="answer-text">{correctOption}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="results-actions">
                <button className="btn btn-primary" onClick={() => navigate('/tasks')}>
                    📋 Back to Tasks
                </button>
                <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
                    📊 Go to Dashboard
                </button>
            </div>
        </div>
    );
}

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { quizAPI, tasksAPI } from '../api/index';
import './Quiz.css';

export default function TaskQuizResults() {
    const { taskId, quizId } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [requestingRetest, setRequestingRetest] = useState(false);

    const loadQuizAndTask = useCallback(async () => {
        try {
            const quizResponse = await quizAPI.getQuiz(quizId);
            const quizData = quizResponse.data.data;

            if (quizData.status !== 'completed') {
                navigate('/tasks', { replace: true });
                return;
            }

            const tasksResponse = await tasksAPI.getAll({ search: '' });
            const currentTask = tasksResponse.data.tasks.find((item) => item._id === taskId);

            setQuiz(quizData);
            setTask(currentTask);
            setLoading(false);
        } catch {
            toast.error('Failed to load quiz results');
            navigate('/tasks', { replace: true });
        }
    }, [quizId, taskId, navigate]);

    useEffect(() => {
        loadQuizAndTask();
    }, [loadQuizAndTask]);

    const handleRequestRetest = async () => {
        try {
            setRequestingRetest(true);
            await quizAPI.requestRetest(quizId);
            setQuiz((prev) => ({
                ...prev,
                reTestRequested: true,
            }));
            toast.success('Retest request sent to staff.');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to request retest');
        } finally {
            setRequestingRetest(false);
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

    const isTerminated = quiz.fullscreenViolations > 0;
    const canRequestRetest = (isTerminated || !quiz.isPassed) && !quiz.reTestRequested;

    return (
        <div className="quiz-results-container">
            <div className="results-header">
                <h1>{quiz.subject} Quiz Results</h1>
                <div
                    className="task-completion-badge"
                    style={{
                        padding: '12px 20px',
                        backgroundColor: isTerminated ? '#ef4444' : quiz.isPassed ? '#22c55e' : '#fbbf24',
                        color: '#fff',
                        borderRadius: '8px',
                        marginTop: '12px',
                        fontWeight: 'bold',
                    }}
                >
                    {isTerminated ? 'Test Terminated' : quiz.isPassed ? 'Task Completed' : 'Quiz Not Passed'}
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
                    color: '#22c55e',
                }}>
                    <h3>Congratulations</h3>
                    <p>Your task "<strong>{task.title}</strong>" has been automatically marked as completed.</p>
                </div>
            )}

            {isTerminated && (
                <div style={{
                    padding: '20px',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '2px solid #ef4444',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    color: '#dc2626',
                }}>
                    <h3>Fullscreen Exit Detected</h3>
                    <p>This test was terminated because fullscreen mode was exited.</p>
                    <p style={{ marginTop: '8px' }}>Your marks percentage is still shown below, and you can request a retest from staff.</p>
                </div>
            )}

            {(isTerminated || !quiz.isPassed) && quiz.reTestRequested && (
                <div style={{
                    padding: '20px',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    border: '2px solid #f59e0b',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    color: '#d97706',
                }}>
                    <h3>Retest Request Submitted</h3>
                    <p>Your current marks percentage is <strong>{quiz.percentage}%</strong>.</p>
                    <p style={{ marginTop: '8px' }}>Your retest request has been sent to staff for approval.</p>
                </div>
            )}

            <div className="score-card">
                <div className="score-circle">
                    <div className="score-percentage">{quiz.percentage}%</div>
                    <div className="score-label">Marks %</div>
                </div>
                <div className="score-details">
                    <h2>{isTerminated ? 'TERMINATED' : quiz.isPassed ? 'PASSED' : 'FAILED'}</h2>
                    <p className="score-breakdown">
                        Correct Answers: <span className="correct">{quiz.score}</span> out of {quiz.totalQuestions}
                    </p>
                    <p className="passing-score">
                        Passing Score: <span>60%</span>
                    </p>
                    {canRequestRetest && (
                        <button
                            className="btn btn-primary"
                            style={{ marginTop: '16px' }}
                            onClick={handleRequestRetest}
                            disabled={requestingRetest}
                        >
                            {requestingRetest ? 'Requesting...' : 'Request Retest From Staff'}
                        </button>
                    )}
                </div>
            </div>

            <div className="results-analysis">
                <div className="analysis-card">
                    <h3>Performance Analysis</h3>
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
                            <span>Marks Percentage</span>
                            <span className="value">{quiz.percentage}%</span>
                        </div>
                    </div>
                </div>

                <div className="analysis-card">
                    <h3>Time Information</h3>
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
                    <h3>Task Information</h3>
                    <div className="analysis-content">
                        <div className="analysis-item">
                            <span>Task Title</span>
                            <span className="value">{task.title}</span>
                        </div>
                        <div className="analysis-item">
                            <span>Topic</span>
                            <span className="value">{task.requiredLanguage?.toUpperCase() || 'N/A'}</span>
                        </div>
                        <div className="analysis-item">
                            <span>Result</span>
                            <span className="value">{isTerminated ? 'Terminated' : quiz.isPassed ? 'Passed' : 'Failed'}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="questions-review">
                <h3>Answer Review</h3>
                <div className="questions-list">
                    {quiz.questions.map((question, index) => {
                        const answer = quiz.answers[index];
                        const isCorrect = answer?.isCorrect;
                        const selectedOption = answer?.selectedAnswer !== null && answer?.selectedAnswer !== undefined
                            ? question.options[answer.selectedAnswer]
                            : 'Not answered';

                        return (
                            <div key={index} className={`review-item ${isCorrect ? 'correct' : 'incorrect'}`}>
                                <div className="review-header">
                                    <span className="question-num">Q{index + 1}</span>
                                    <span className={`result-badge ${isCorrect ? 'correct' : 'incorrect'}`}>
                                        {isCorrect ? 'Correct' : 'Incorrect'}
                                    </span>
                                </div>
                                <p className="review-question">{question.question}</p>
                                <div className="review-answers">
                                    <div className="answer-item selected">
                                        <span className="answer-label">Your Answer:</span>
                                        <span className="answer-text">{selectedOption}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="results-actions">
                <button className="btn btn-primary" onClick={() => navigate('/dashboard', { replace: true })}>
                    Go to Dashboard
                </button>
                <button className="btn btn-secondary" onClick={() => navigate('/tasks', { replace: true })}>
                    Back to Tasks
                </button>
            </div>
        </div>
    );
}

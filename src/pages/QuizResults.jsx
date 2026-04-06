import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { quizAPI } from '../api/index';
import './Quiz.css';

export default function QuizResults() {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const fetchQuiz = async () => {
            try {
                const response = await quizAPI.getQuiz(quizId);
                const quizData = response.data.data;

                if (quizData.status !== 'completed') {
                    if (isMounted) {
                        toast.error('This quiz has not been completed yet');
                        navigate('/dashboard', { replace: true });
                    }
                    return;
                }

                if (isMounted) {
                    setQuiz(quizData);
                    setLoading(false);
                }
            } catch {
                if (isMounted) {
                    toast.error('Failed to load quiz results');
                    navigate('/quiz', { replace: true });
                }
            }
        };

        fetchQuiz();
        return () => {
            isMounted = false;
        };
    }, [quizId, navigate]);

    if (loading) {
        return <div className="loading-spinner">Loading results...</div>;
    }

    if (!quiz) {
        return <div>Quiz not found</div>;
    }

    const isTerminated = quiz.fullscreenViolations > 0;

    return (
        <div className="quiz-results-container">
            <div className="results-header">
                <h1>{quiz.subject} Quiz Results</h1>
                <p className="results-subtitle">Test Completed on {new Date(quiz.completedAt).toLocaleDateString()}</p>
            </div>

            {isTerminated && (
                <div style={{
                    padding: '20px',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '2px solid #ef4444',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    color: '#dc2626',
                }}>
                    <h3>Test Terminated</h3>
                    <p>This quiz was submitted because fullscreen mode was exited.</p>
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
                <button className="btn btn-secondary" onClick={() => navigate('/quiz', { replace: true })}>
                    Back to Quiz Home
                </button>
            </div>
        </div>
    );
}

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizAPI } from '../api/index';
import './Quiz.css';

export default function QuizResults() {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadQuiz();
    }, [quizId]);

    const loadQuiz = async () => {
        try {
            const response = await quizAPI.getQuiz(quizId);
            setQuiz(response.data.data);
            setLoading(false);
        } catch (error) {
            console.error('Failed to load quiz');
            navigate('/quiz');
        }
    };

    if (loading) {
        return <div className="loading-spinner">Loading results...</div>;
    }

    if (!quiz) {
        return <div>Quiz not found</div>;
    }

    return (
        <div className="quiz-results-container">
            <div className="results-header">
                <h1>{quiz.subject} Quiz Results</h1>
                <p className="results-subtitle">Test Completed on {new Date(quiz.completedAt).toLocaleDateString()}</p>
            </div>

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
                    {quiz.isPassed && (
                        <div style={{ marginTop: '16px', padding: '12px', backgroundColor: 'rgba(34, 197, 94, 0.1)', borderRadius: '8px', color: '#22c55e', fontSize: '14px' }}>
                            🎉 <strong>Congratulations!</strong> Related tasks have been auto-completed.
                        </div>
                    )}
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
                <button className="btn btn-primary" onClick={() => navigate('/quiz')}>
                    🏠 Back to Quiz Home
                </button>
                <button className="btn btn-secondary" onClick={() => window.location.href = '/dashboard'}>
                    📊 Go to Dashboard
                </button>
            </div>
        </div>
    );
}

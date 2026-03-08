import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { quizAPI } from '../api/index';
import './Quiz.css';

export default function QuizTest() {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState(0);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        loadQuiz();
    }, [quizId]);

    useEffect(() => {
        if (!quiz) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    handleAutoSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [quiz]);

    const loadQuiz = async () => {
        try {
            const response = await quizAPI.getQuiz(quizId);
            setQuiz(response.data.data);
            setTimeLeft(response.data.data.timeLimit * 60);
            setAnswers(new Array(response.data.data.questions.length).fill(null));
            setLoading(false);
        } catch (error) {
            toast.error('Failed to load quiz');
            navigate('/quiz');
        }
    };

    const handleAutoSubmit = async () => {
        await submitQuiz();
    };

    const handleAnswerSelect = (optionIndex) => {
        const newAnswers = [...answers];
        newAnswers[currentQuestion] = optionIndex;
        setAnswers(newAnswers);
    };

    const submitQuiz = async () => {
        if (submitted) return;

        setSubmitted(true);
        const answersData = answers.map((ans) => ({
            selectedAnswer: ans,
        }));

        try {
            const response = await quizAPI.submitQuiz(quizId, { answers: answersData });
            toast.success(response.data.message);
            navigate(`/quiz/${quizId}/results`);
        } catch (error) {
            toast.error('Failed to submit quiz');
            setSubmitted(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    if (loading) {
        return <div className="loading-spinner">Loading quiz...</div>;
    }

    if (!quiz) {
        return <div>Quiz not found</div>;
    }

    const current = quiz.questions[currentQuestion];
    const progress = ((currentQuestion + 1) / quiz.totalQuestions) * 100;

    return (
        <div className="quiz-test-container">
            <div className="quiz-test-header">
                <div className="test-title">
                    <h2>{quiz.subject} Quiz</h2>
                    <p>Question {currentQuestion + 1} of {quiz.totalQuestions}</p>
                </div>
                <div className="test-timer" style={{ color: timeLeft < 300 ? '#ff6b6b' : '#2ecc71' }}>
                    ⏱️ {formatTime(timeLeft)}
                </div>
            </div>

            <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>

            <div className="question-container">
                <div className="question-text">
                    <h3>{current.question}</h3>
                </div>

                <div className="options-list">
                    {current.options.map((option, index) => (
                        <button
                            key={index}
                            className={`option-btn ${answers[currentQuestion] === index ? 'selected' : ''}`}
                            onClick={() => handleAnswerSelect(index)}
                        >
                            <span className="option-letter">{String.fromCharCode(65 + index)}.</span>
                            <span className="option-text">{option}</span>
                            {answers[currentQuestion] === index && <span className="check-mark">✓</span>}
                        </button>
                    ))}
                </div>
            </div>

            <div className="quiz-navigation">
                <button
                    className="btn btn-secondary"
                    onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                    disabled={currentQuestion === 0}
                >
                    ← Previous
                </button>

                <div className="question-dots">
                    {quiz.questions.map((_, index) => (
                        <button
                            key={index}
                            className={`dot ${index === currentQuestion ? 'active' : ''} ${answers[index] !== null ? 'answered' : ''}`}
                            onClick={() => setCurrentQuestion(index)}
                        />
                    ))}
                </div>

                {currentQuestion === quiz.totalQuestions - 1 ? (
                    <button
                        className="btn btn-primary"
                        onClick={submitQuiz}
                        disabled={submitted}
                    >
                        {submitted ? 'Submitting...' : 'Submit Quiz'}
                    </button>
                ) : (
                    <button
                        className="btn btn-primary"
                        onClick={() => setCurrentQuestion(Math.min(quiz.totalQuestions - 1, currentQuestion + 1))}
                    >
                        Next →
                    </button>
                )}
            </div>

            <div className="quiz-stats-bar">
                <div className="stat">
                    <span className="stat-icon">📝</span>
                    <span>Total: {quiz.totalQuestions}</span>
                </div>
                <div className="stat">
                    <span className="stat-icon">✅</span>
                    <span>Answered: {answers.filter((a) => a !== null).length}</span>
                </div>
                <div className="stat">
                    <span className="stat-icon">⏭️</span>
                    <span>Unanswered: {answers.filter((a) => a === null).length}</span>
                </div>
            </div>
        </div>
    );
}

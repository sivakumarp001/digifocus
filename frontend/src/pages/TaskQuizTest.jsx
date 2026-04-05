import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { quizAPI, tasksAPI } from '../api/index';
import './Quiz.css';

export default function TaskQuizTest() {
    const { taskId, quizId } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [task, setTask] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState(0);
    const [submitted, setSubmitted] = useState(false);
    const [antiCheatWarnings, setAntiCheatWarnings] = useState(0);
    const [fullscreenActive, setFullscreenActive] = useState(false);
    const [testStarted, setTestStarted] = useState(false);
    const [terminationReason, setTerminationReason] = useState('');
    const fullscreenExitHandledRef = useRef(false);

    const getFullscreenElement = useCallback(() => (
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
    ), []);

    const loadTaskAndQuiz = useCallback(async () => {
        try {
            // Load task first
            const taskResponse = await tasksAPI.getAll({ search: '' });
            const currentTask = taskResponse.data.tasks.find(t => t._id === taskId);
            setTask(currentTask);

            // Load quiz
            const quizResponse = await quizAPI.getQuiz(quizId);
            const quizData = quizResponse.data.data;
            
            // If quiz is already completed, redirect to results page
            if (quizData.status === 'completed') {
                navigate(`/task-quiz-results/${taskId}/${quizId}`, { replace: true });
                return;
            }
            
            setQuiz(quizData);
            setTimeLeft(quizData.timeLimit * 60);
            setAnswers(new Array(quizData.questions.length).fill(null));
            setLoading(false);
        } catch {
            toast.error('Failed to load quiz');
            navigate('/tasks', { replace: true });
        }
    }, [taskId, quizId, navigate]);

    const submitQuiz = useCallback(async (options = {}) => {
        if (submitted) return;

        setSubmitted(true);
        const { forcedFullscreenViolation = false } = options;
        if (forcedFullscreenViolation) {
            setTerminationReason('Fullscreen was exited. Submitting your test now.');
        }
        const answersData = answers.map((ans) => ({
            selectedAnswer: ans,
        }));

        try {
            const response = await quizAPI.submitTaskQuiz(quizId, {
                answers: answersData,
                taskId: taskId,
                antiCheatWarnings: antiCheatWarnings,
                fullscreenViolations: forcedFullscreenViolation || !getFullscreenElement() ? 1 : 0,
            });

            toast.success(response.data.message);

            // Exit fullscreen before navigation
            if (getFullscreenElement()) {
                document.exitFullscreen().catch(err => console.log('Exit fullscreen failed:', err));
            }

            // Navigate to task results page or back to tasks
            setTimeout(() => {
                navigate(`/task-quiz-results/${taskId}/${quizId}`, { replace: true });
            }, 500);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit quiz');
            setSubmitted(false);
        }
    }, [quizId, taskId, answers, antiCheatWarnings, submitted, navigate, getFullscreenElement]);

    useEffect(() => {
        loadTaskAndQuiz();
    }, [loadTaskAndQuiz]);

    const startQuiz = useCallback(async () => {
        try {
            if (document.documentElement.requestFullscreen) {
                await document.documentElement.requestFullscreen();
            } else if (document.documentElement.webkitRequestFullscreen) {
                await document.documentElement.webkitRequestFullscreen();
            } else {
                toast.error('Your browser does not support fullscreen mode for this test.');
                return;
            }

            if (!getFullscreenElement()) {
                setFullscreenActive(false);
                setTerminationReason('Fullscreen was exited. Submitting your test now.');
                setTestStarted(false);
                toast.error('Fullscreen was not enabled. Please try again.');
                return;
            }

            fullscreenExitHandledRef.current = false;
            setFullscreenActive(true);
            setTestStarted(true);
        } catch (err) {
            console.log('Fullscreen request denied:', err);
            toast.error('Please click "Start Test" and allow fullscreen access to begin.');
        }
    }, [getFullscreenElement]);

    useEffect(() => {
        setFullscreenActive(Boolean(getFullscreenElement()));
    }, [getFullscreenElement]);

    // Fullscreen and anti-cheating setup
    useEffect(() => {
        if (!quiz || !testStarted) return;

        const handleVisibilityChange = () => {
            if (document.hidden) {
                setAntiCheatWarnings(prev => {
                    const newWarnings = prev + 1;
                    toast.error(`⚠️ Tab switch detected! Warning ${newWarnings}/3`);
                    if (newWarnings >= 3) {
                        toast.error('❌ Quiz submitted due to multiple violations!');
                        submitQuiz();
                    }
                    return newWarnings;
                });
            }
        };

        const handleFullscreenChange = () => {
            const fullscreenElement = getFullscreenElement();
            setFullscreenActive(Boolean(fullscreenElement));

            if (!fullscreenElement && !fullscreenExitHandledRef.current) {
                fullscreenExitHandledRef.current = true;
                setFullscreenActive(false);
                toast.error('❌ Fullscreen exited! Test terminated and submitted.', {
                    duration: 5000,
                    icon: '🚫'
                });
                // Call submitQuiz directly - it handles its own submitted state
                submitQuiz({ forcedFullscreenViolation: true });
            }
        };

        const handleKeyPress = (e) => {
            // Disable Alt+Tab, Windows key, etc.
            if ((e.altKey && e.key === 'Tab') || (e.key === 'F11')) {
                e.preventDefault();
                setAntiCheatWarnings(prev => {
                    const newWarnings = prev + 1;
                    toast.error('⚠️ Keyboard shortcut detected! Warning ' + newWarnings + '/3');
                    return newWarnings;
                });
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', handleFullscreenChange);
        window.addEventListener('keydown', handleKeyPress);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
            document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, [quiz, testStarted, submitQuiz, submitted, getFullscreenElement]);

    // Timer
    useEffect(() => {
        if (!quiz || !testStarted || submitted) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    submitQuiz();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [quiz, testStarted, submitted, submitQuiz]);

    const handleAnswerSelect = (optionIndex) => {
        const newAnswers = [...answers];
        newAnswers[currentQuestion] = optionIndex;
        setAnswers(newAnswers);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <div className="loading-wrapper">
                <div className="spinner" />
                <p>Loading quiz...</p>
            </div>
        );
    }

    if (!quiz) {
        return <div className="error-container">Quiz not found</div>;
    }

    if (submitted && terminationReason) {
        return (
            <div className="quiz-test-container">
                <div className="question-container" style={{ textAlign: 'center' }}>
                    <div className="question-text">
                        <h3>{task?.title || quiz.subject} Quiz</h3>
                        <p>{terminationReason}</p>
                        <p>Please wait while we complete submission.</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!testStarted || !fullscreenActive) {
        return (
            <div className="quiz-test-container">
                <div className="question-container" style={{ textAlign: 'center' }}>
                    <div className="question-text">
                        <h3>{task?.title || quiz.subject} Quiz</h3>
                        <p>This test must be taken in fullscreen mode.</p>
                        <p>{testStarted ? 'The test is being submitted because fullscreen is required.' : 'Click below to enter fullscreen and begin the test.'}</p>
                    </div>
                    {!testStarted && (
                        <div className="quiz-navigation" style={{ justifyContent: 'center' }}>
                            <button className="btn btn-primary" onClick={startQuiz}>
                                Start Test
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    const current = quiz.questions[currentQuestion];
    const progress = ((currentQuestion + 1) / quiz.totalQuestions) * 100;

    return (
        <div className="quiz-test-container">
            <div className="quiz-test-header">
                <div className="test-title">
                    <h2>{task?.title || quiz.subject} Quiz</h2>
                    <p className="task-context">
                        {task?.title && `Task: ${task.title}`}
                    </p>
                    <p>Question {currentQuestion + 1} of {quiz.totalQuestions}</p>
                    {antiCheatWarnings > 0 && (
                        <p style={{ color: '#ff6b6b', fontSize: '12px', marginTop: '4px' }}>
                            ⚠️ Anti-cheating warnings: {antiCheatWarnings}/3
                        </p>
                    )}
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
                        {submitted ? '⏳ Submitting...' : '✓ Submit Quiz'}
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

            <div className="quiz-info">
                <p className="info-text">
                    💡 Complete this quiz to mark your task as completed!
                </p>
            </div>
        </div>
    );
}

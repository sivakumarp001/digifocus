import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tasksAPI, quizAPI } from '../api/index';
import toast from 'react-hot-toast';
import './Quiz.css';

export default function StudyTimer() {
    const { taskId } = useParams();
    const navigate = useNavigate();
    const [task, setTask] = useState(null);
    const [studyDuration, setStudyDuration] = useState(15);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isStudying, setIsStudying] = useState(false);
    const [studyCompleted, setStudyCompleted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [autoStartQuiz, setAutoStartQuiz] = useState(false);

    const startQuiz = useCallback(async () => {
        if (!task?.requiredLanguage) {
            toast.error('Task does not have a quiz topic');
            return;
        }

        try {
            toast.loading('Generating quiz...');
            const response = await quizAPI.generateTaskQuiz(task._id, { numberOfQuestions: 10 });
            toast.dismiss();
            toast.success('Quiz ready! Starting now...');
            navigate(`/task-quiz/${task._id}/${response.data.data._id}`);
        } catch {
            toast.error('Failed to generate quiz');
        }
    }, [task, navigate]);

    useEffect(() => {
        let isMounted = true;

        const fetchTask = async () => {
            try {
                const response = await tasksAPI.getAll({ search: '' });
                const currentTask = response.data.tasks.find(t => t._id === taskId);
                if (!currentTask) {
                    if (isMounted) {
                        toast.error('Task not found');
                        navigate('/tasks');
                    }
                    return;
                }
                if (isMounted) {
                    setTask(currentTask);
                    setTimeLeft(15 * 60);
                    setLoading(false);
                }
            } catch {
                if (isMounted) {
                    toast.error('Failed to load task');
                    navigate('/tasks');
                }
            }
        };

        fetchTask();
        return () => {
            isMounted = false;
        };
    }, [taskId, navigate]);

    useEffect(() => {
        if (!isStudying || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    handleStudyComplete();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isStudying, timeLeft]);

    // Auto-start quiz if study is completed and auto-start is enabled
    useEffect(() => {
        if (studyCompleted && autoStartQuiz) {
            const timer = setTimeout(() => {
                startQuiz();
            }, 2000); // 2 second delay to show completion message
            return () => clearTimeout(timer);
        }
    }, [studyCompleted, autoStartQuiz, startQuiz]);

    const handleStartStudy = () => {
        if (studyDuration < 1 || studyDuration > 120) {
            toast.error('Study duration must be between 1 and 120 minutes');
            return;
        }
        setTimeLeft(studyDuration * 60);
        setIsStudying(true);
        toast.success(`Study timer started for ${studyDuration} minutes!`);
    };

    const handleStudyComplete = () => {
        setIsStudying(false);
        setStudyCompleted(true);
        toast.success('🎉 Study completed! Ready for the quiz?');
    };

    const handlePauseResume = () => {
        setIsStudying(!isStudying);
        toast.success(isStudying ? 'Study paused' : 'Study resumed');
    };

    const handleReset = () => {
        setIsStudying(false);
        setStudyCompleted(false);
        setTimeLeft(studyDuration * 60);
        toast.success('Timer reset');
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const getProgressPercentage = () => {
        const total = studyDuration * 60;
        return ((total - timeLeft) / total) * 100;
    };

    if (loading) {
        return (
            <div className="loading-wrapper">
                <div className="spinner" />
                <p>Loading task...</p>
            </div>
        );
    }

    if (!task) {
        return <div className="error-container">Task not found</div>;
    }

    return (
        <div className="study-timer-container" style={{ maxWidth: '600px', margin: '40px auto' }}>
            <div className="study-header card">
                <h1>📚 Study Timer</h1>
                <h2>{task.title}</h2>
                <p className="topic-badge">
                    Topic: <strong>{task.requiredLanguage?.toUpperCase()}</strong>
                </p>
            </div>

            {!isStudying && !studyCompleted ? (
                // Setup Phase
                <div className="study-setup card" style={{ padding: '30px', textAlign: 'center' }}>
                    <h3>Prepare for Your {task.requiredLanguage?.toUpperCase()} Quiz</h3>
                    <p style={{ color: '#666', marginBottom: '20px' }}>
                        Take some time to review the topic before starting the quiz.
                    </p>

                    <div className="form-group" style={{ marginBottom: '20px' }}>
                        <label>Study Duration (minutes)</label>
                        <input
                            type="number"
                            min="1"
                            max="120"
                            value={studyDuration}
                            onChange={(e) => setStudyDuration(parseInt(e.target.value) || 15)}
                            className="input"
                            style={{ fontSize: '18px', padding: '12px' }}
                        />
                        <small style={{ color: '#999', display: 'block', marginTop: '8px' }}>
                            Recommended: 15-20 minutes
                        </small>
                    </div>

                    <button
                        className="btn btn-primary"
                        onClick={handleStartStudy}
                        style={{ width: '100%', padding: '12px', fontSize: '16px', marginBottom: '10px' }}
                    >
                        ▶️ Start Study Timer
                    </button>

                    <button
                        className="btn btn-secondary"
                        onClick={startQuiz}
                        style={{ width: '100%', padding: '12px', fontSize: '14px' }}
                    >
                        ⏭️ Skip Study & Start Quiz Now
                    </button>
                </div>
            ) : (
                // Study in Progress Phase
                <>
                    <div className="study-progress card" style={{ padding: '30px', textAlign: 'center' }}>
                        <div style={{ marginBottom: '20px' }}>
                            <div className="progress-bar" style={{ height: '10px', marginBottom: '20px' }}>
                                <div
                                    className="progress-fill"
                                    style={{
                                        width: `${getProgressPercentage()}%`,
                                        height: '100%',
                                        transition: 'width 0.3s linear'
                                    }}
                                ></div>
                            </div>
                            <p style={{ color: '#666', fontSize: '14px' }}>
                                {Math.round(getProgressPercentage())}% Complete
                            </p>
                        </div>

                        <div
                            style={{
                                fontSize: '72px',
                                fontWeight: 'bold',
                                color: timeLeft < 300 ? '#ff6b6b' : '#3b82f6',
                                marginBottom: '20px',
                                fontFamily: 'monospace'
                            }}
                        >
                            {formatTime(timeLeft)}
                        </div>

                        <h3>Keep Studying!</h3>
                        <p style={{ color: '#666', marginBottom: '20px' }}>
                            {isStudying ? 'Study in progress...' : 'Study paused'}
                        </p>

                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                            <button
                                className={isStudying ? 'btn btn-secondary' : 'btn btn-primary'}
                                onClick={handlePauseResume}
                                style={{ flex: 1, padding: '12px' }}
                            >
                                {isStudying ? '⏸️ Pause' : '▶️ Resume'}
                            </button>
                            <button
                                className="btn btn-secondary"
                                onClick={handleReset}
                                style={{ flex: 1, padding: '12px' }}
                            >
                                🔄 Reset
                            </button>
                        </div>
                    </div>

                    {/* Study Tips */}
                    <div className="study-tips card" style={{ padding: '20px' }}>
                        <h4>📝 Study Tips:</h4>
                        <ul style={{ lineHeight: '1.8', color: '#555' }}>
                            <li>Review key concepts for {task.requiredLanguage?.toUpperCase()}</li>
                            <li>Look at examples and use cases</li>
                            <li>Write notes on important points</li>
                            <li>Quiz will have 10 multiple-choice questions</li>
                            <li>You need 60% to pass and complete the task</li>
                        </ul>
                    </div>
                </>
            )}

            {/* Study Completed Phase */}
            {studyCompleted && (
                <div className="study-complete card" style={{ padding: '30px', textAlign: 'center' }}>
                    <div style={{ fontSize: '64px', marginBottom: '20px' }}>🎉</div>
                    <h3 style={{ color: '#22c55e', marginBottom: '10px' }}>Study Complete!</h3>
                    <p style={{ color: '#666', marginBottom: '20px' }}>
                        Great job! You've completed your study session. Ready for the quiz?
                    </p>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={autoStartQuiz}
                                onChange={(e) => setAutoStartQuiz(e.target.checked)}
                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                            />
                            <span>Auto-start quiz in 2 seconds</span>
                        </label>
                    </div>

                    <button
                        className="btn btn-primary"
                        onClick={startQuiz}
                        style={{ width: '100%', padding: '14px', fontSize: '16px' }}
                    >
                        🚀 Start {task.requiredLanguage?.toUpperCase()} Quiz
                    </button>

                    <button
                        className="btn btn-secondary"
                        onClick={() => navigate('/tasks')}
                        style={{ width: '100%', padding: '12px', marginTop: '10px', fontSize: '14px' }}
                    >
                        📋 Back to Tasks
                    </button>
                </div>
            )}

            {/* Statistics */}
            {isStudying || studyCompleted ? (
                <div className="study-stats card" style={{ padding: '20px', marginTop: '20px' }}>
                    <h4>📊 Study Session</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div style={{ padding: '10px', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
                            <p style={{ color: '#666', fontSize: '12px', marginBottom: '4px' }}>Duration</p>
                            <p style={{ fontSize: '18px', fontWeight: 'bold' }}>{studyDuration} min</p>
                        </div>
                        <div style={{ padding: '10px', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
                            <p style={{ color: '#666', fontSize: '12px', marginBottom: '4px' }}>Time Left</p>
                            <p style={{ fontSize: '18px', fontWeight: 'bold' }}>{formatTime(timeLeft)}</p>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}

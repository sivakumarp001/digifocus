import React, { useState, useEffect, useCallback } from 'react';
import { leaderboardAPI, levelsAPI } from '../api';
import './Leaderboard.css';

const Leaderboard = () => {
    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [selectedSubjectName, setSelectedSubjectName] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedLevel, setSelectedLevel] = useState(1);
    const [levelData, setLevelData] = useState(null);

    useEffect(() => {
        fetchSubjects();
    }, [fetchSubjects]);

    useEffect(() => {
        if (selectedSubject && selectedLevel) {
            fetchLevelData(selectedSubject, selectedLevel);
        }
    }, [selectedSubject, selectedLevel, fetchLevelData]);

    const fetchSubjects = useCallback(async () => {
        try {
            const response = await levelsAPI.getAllSubjects();
            setSubjects(response.data.data);
            if (response.data.data.length > 0) {
                const firstSubject = response.data.data[0];
                setSelectedSubject(firstSubject._id);
                setSelectedSubjectName(firstSubject.name);
                setSelectedLevel(1);
            }
        } catch (error) {
            console.error('Error fetching subjects:', error);
        }
    }, []);



    const fetchLevelData = useCallback(async (subjectId, level) => {
        setLoading(true);
        try {
            const response = await leaderboardAPI.getLevelStats(subjectId);
            const levelKey = `level${level}`;
            const levelStats = response.data.data[levelKey] || [];
            // Calculate points based on completion time (faster completion = more points)
            const levelDataWithPoints = levelStats.map((entry, idx) => ({
                ...entry,
                rank: idx + 1,
                points: Math.max(100 - (entry.completionTime || 0) / 60, 10) // Points based on completion time in minutes
            }));
            setLevelData(levelDataWithPoints);
        } catch (error) {
            console.error('Error fetching level data:', error);
        } finally {
            setLoading(false);
        }
    }, []);



    const handleSubjectChange = (subjectId) => {
        const subject = subjects.find(s => s._id === subjectId);
        setSelectedSubject(subjectId);
        setSelectedSubjectName(subject?.name || '');
        setSelectedLevel(1); // Reset to level 1 when changing subject
    };

    const handleLevelSelect = (level) => {
        setSelectedLevel(level);
    };



    const tableStyles = `
        .header-title-group {
            display: flex;
            align-items: center;
            gap: 16px;
            margin-bottom: 16px;
            flex-wrap: wrap;
        }

        .header-title-group label {
            font-size: 1.3rem;
            font-weight: 700;
            color: white;
        }

        .title-dropdown {
            padding: 12px 16px;
            font-size: 1.1rem;
            font-weight: 600;
            border: 2px solid white;
            border-radius: 8px;
            background: rgba(255, 255, 255, 0.1);
            color: white;
            cursor: pointer;
            min-width: 250px;
            transition: all 0.3s ease;
        }

        .title-dropdown:hover {
            background: rgba(255, 255, 255, 0.2);
            border-color: rgba(255, 255, 255, 0.8);
        }

        .title-dropdown option {
            background: #667eea;
            color: white;
            padding: 8px 12px;
        }

        .level-selector-section {
            background: white;
            border-radius: 15px;
            padding: 24px;
            margin-bottom: 24px;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
            animation: slideUp 0.4s ease-out;
        }

        .level-selector-section h2 {
            margin: 0 0 20px 0;
            font-size: 1.5rem;
            color: #333;
            font-weight: 700;
        }

        .level-buttons {
            display: flex;
            gap: 16px;
            flex-wrap: wrap;
        }

        .level-button {
            padding: 12px 28px;
            background: white;
            border: 2px solid #667eea;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 700;
            font-size: 1rem;
            color: #667eea;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            min-width: 100px;
            text-align: center;
        }

        .level-button:hover {
            background: #667eea;
            color: white;
            transform: translateY(-3px);
            box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
        }

        .level-button.active {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-color: transparent;
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
        }

        .leaderboard-section {
            background: white;
            border-radius: 15px;
            padding: 30px;
            margin-bottom: 36px;
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
            animation: slideUp 0.5s ease-out;
        }

        .leaderboard-section h2 {
            font-size: 1.5rem;
            color: #333;
            margin: 0 0 20px 0;
            font-weight: 700;
        }

        .leaderboard-table-wrapper {
            overflow-x: auto;
        }

        .leaderboard-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
        }

        .leaderboard-table thead {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            font-weight: 700;
            position: sticky;
            top: 0;
        }

        .leaderboard-table th,
        .leaderboard-table td {
            padding: 14px;
            text-align: left;
        }

        .leaderboard-table tbody tr {
            border-bottom: 1px solid #eee;
            transition: background 0.2s ease;
        }

        .leaderboard-table tbody tr:hover {
            background: #f8f9ff;
        }

        .rank-cell {
            text-align: center;
            font-weight: 700;
        }

        .rank-badge {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 50%;
            font-weight: 700;
            font-size: 0.9rem;
        }

        .name-cell {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 1rem;
            flex-shrink: 0;
        }

        .student-name {
            margin: 0;
            font-weight: 600;
            color: #333;
        }

        .points-cell {
            text-align: center;
            font-weight: 700;
            color: #667eea;
            font-size: 1rem;
        }

        .time-cell {
            text-align: center;
            font-weight: 600;
            color: #666;
        }

        .score-cell {
            text-align: center;
            font-weight: 600;
            color: #667eea;
        }

        .loading {
            text-align: center;
            padding: 40px;
            font-size: 1.1rem;
            color: #667eea;
            animation: pulse 1.5s infinite;
        }

        .empty-state {
            text-align: center;
            padding: 60px 20px;
            color: #999;
            font-size: 1.1rem;
        }

        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }

        @media (max-width: 768px) {
            .header-title-group {
                flex-direction: column;
                align-items: flex-start;
            }

            .title-dropdown {
                width: 100%;
                min-width: unset;
            }

            .level-buttons {
                gap: 12px;
            }

            .level-button {
                flex: 1;
                min-width: calc(50% - 6px);
                padding: 10px 16px;
                font-size: 0.9rem;
            }

            .leaderboard-section {
                padding: 20px;
                margin-bottom: 28px;
            }

            .leaderboard-table th,
            .leaderboard-table td {
                padding: 10px;
                font-size: 0.85rem;
            }

            .rank-badge {
                width: 35px;
                height: 35px;
                font-size: 0.8rem;
            }

            .avatar {
                width: 35px;
                height: 35px;
                font-size: 0.9rem;
            }
        }
    `;

    return (
        <div className="leaderboard-container">
            <div className="leaderboard-header">
                <div className="header-title-group">
                    <label htmlFor="subject-select">Course:</label>
                    <select
                        id="subject-select"
                        className="title-dropdown"
                        value={selectedSubject || ''}
                        onChange={(e) => handleSubjectChange(e.target.value)}
                    >
                        <option value="">Select Course...</option>
                        {subjects.map((subject) => (
                            <option key={subject._id} value={subject._id}>
                                {subject.name}
                            </option>
                        ))}
                    </select>
                </div>
                <p>Level-based Rankings - Points awarded based on completion time</p>
            </div>

            {selectedSubject && selectedSubjectName && (
                <>
                    <div className="level-selector-section">
                        <h2>{selectedSubjectName} - Select Level</h2>
                        <div className="level-buttons">
                            {[1, 2, 3, 4].map((level) => (
                                <button
                                    key={level}
                                    className={`level-button ${selectedLevel === level ? 'active' : ''}`}
                                    onClick={() => handleLevelSelect(level)}
                                >
                                    Level {level}
                                </button>
                            ))}
                        </div>
                    </div>

                    {selectedLevel && (
                        <div className="leaderboard-section">
                            <h2>Level {selectedLevel} Rankings</h2>
                            {loading ? (
                                <div className="loading">Loading level data...</div>
                            ) : levelData && levelData.length > 0 ? (
                                <table className="leaderboard-table">
                                    <thead>
                                        <tr>
                                            <th>Rank</th>
                                            <th>Student</th>
                                            <th>Points</th>
                                            <th>Completion Time</th>
                                            <th>Score</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {levelData.map((entry) => (
                                            <tr key={entry._id || entry.userId}>
                                                <td className="rank-cell">
                                                    <span className="rank-badge">{entry.rank}</span>
                                                </td>
                                                <td className="name-cell">
                                                    <div className="avatar">{(entry.name || entry.userName)?.[0]}</div>
                                                    <div>
                                                        <p className="student-name">{entry.name || entry.userName}</p>
                                                    </div>
                                                </td>
                                                <td className="points-cell">
                                                    <strong>{Math.round(entry.points || 0)} pts</strong>
                                                </td>
                                                <td className="time-cell">
                                                    {entry.completionTime ? `${Math.round(entry.completionTime)} mins` : 'In Progress'}
                                                </td>
                                                <td className="score-cell">
                                                    {entry.score || entry.testScore || 0}%
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="empty-state">
                                    <p>No data available for this level</p>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            <style>{tableStyles}</style>
        </div>
    );
};

export default Leaderboard;

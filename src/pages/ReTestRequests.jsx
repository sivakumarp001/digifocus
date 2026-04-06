import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { adminAPI } from '../api/index';
import './ReTestRequests.css';

export default function ReTestRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending');
    const [approvingId, setApprovingId] = useState(null);
    const [reason, setReason] = useState({});

    useEffect(() => {
        fetchRequests();
    }, [filter, fetchRequests]);

    const fetchRequests = useCallback(async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getRetestRequests(filter);
            setRequests(response.data.data || []);
        } catch {
            toast.error('Failed to load retest requests');
        } finally {
            setLoading(false);
        }
    }, [filter]);

    const handleApprove = async (id) => {
        try {
            setApprovingId(id);
            const approvalReason = reason[id] || '';
            await adminAPI.approveRetest(id, approvalReason);
            toast.success('Retest approved! Student can now retake the test.');
            setReason(prev => ({ ...prev, [id]: '' }));
            setApprovingId(null);
            fetchRequests();
        } catch {
            toast.error('Failed to approve retest request');
            setApprovingId(null);
        }
    };

    const handleReject = async (id) => {
        try {
            setApprovingId(id);
            const rejectionReason = reason[id] || 'Request denied by staff';
            await adminAPI.rejectRetest(id, rejectionReason);
            toast.success('Retest request rejected');
            setReason(prev => ({ ...prev, [id]: '' }));
            setApprovingId(null);
            fetchRequests();
        } catch {
            toast.error('Failed to reject retest request');
            setApprovingId(null);
        }
    };

    if (loading) {
        return (
            <div className="retest-page">
                <div className="loading-wrapper">
                    <div className="spinner"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="retest-page">
            <div className="retest-header">
                <h2>Retest Requests</h2>
                <div className="filter-buttons">
                    <button
                        className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
                        onClick={() => setFilter('pending')}
                    >
                        Pending
                    </button>
                    <button
                        className={`filter-btn ${filter === 'approved' ? 'active' : ''}`}
                        onClick={() => setFilter('approved')}
                    >
                        Approved
                    </button>
                    <button
                        className={`filter-btn ${filter === 'rejected' ? 'active' : ''}`}
                        onClick={() => setFilter('rejected')}
                    >
                        Rejected
                    </button>
                    <button
                        className={`filter-btn ${filter === '' || !filter ? 'active' : ''}`}
                        onClick={() => setFilter('')}
                    >
                        All
                    </button>
                </div>
            </div>

            {requests.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📋</div>
                    <h3>No retest requests</h3>
                    <p>There are no {filter} retest requests at the moment.</p>
                </div>
            ) : (
                <div className="requests-grid">
                    {requests.map((request) => (
                        <div key={request._id} className="request-card">
                            <div className="request-header">
                                <div className="student-info">
                                    <h4>{request.studentId?.name}</h4>
                                    <p className="email">{request.studentId?.email}</p>
                                </div>
                                <span className={`status-badge status-${request.status}`}>
                                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                </span>
                            </div>

                            <div className="request-details">
                                <div className="detail-row">
                                    <span className="label">Subject:</span>
                                    <span className="value">{request.quizId?.subject}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Score:</span>
                                    <span className="value">{request.score}/{request.quizId?.totalQuestions || 0} ({request.percentage}%)</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Task:</span>
                                    <span className="value">{request.taskId?.title || 'N/A'}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Requested:</span>
                                    <span className="value">{new Date(request.requestedAt).toLocaleDateString()}</span>
                                </div>
                                {request.reason && (
                                    <div className="detail-row">
                                        <span className="label">Reason:</span>
                                        <p className="reason">{request.reason}</p>
                                    </div>
                                )}
                            </div>

                            {request.status === 'pending' ? (
                                <div className="request-actions">
                                    <textarea
                                        className="reason-input"
                                        placeholder="Add approval/rejection reason (optional)"
                                        value={reason[request._id] || ''}
                                        onChange={(e) => setReason(prev => ({ ...prev, [request._id]: e.target.value }))}
                                        rows="3"
                                    />
                                    <div className="action-buttons">
                                        <button
                                            className="btn btn-success"
                                            onClick={() => handleApprove(request._id)}
                                            disabled={approvingId === request._id}
                                        >
                                            ✓ Approve
                                        </button>
                                        <button
                                            className="btn btn-danger"
                                            onClick={() => handleReject(request._id)}
                                            disabled={approvingId === request._id}
                                        >
                                            ✕ Reject
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="approval-info">
                                    <p className="approval-date">
                                        {request.status === 'approved' ? '✓ Approved' : '✕ Rejected'} on {new Date(request.approvalDate).toLocaleDateString()}
                                    </p>
                                    {request.approvalReason && (
                                        <p className="approval-reason">{request.approvalReason}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

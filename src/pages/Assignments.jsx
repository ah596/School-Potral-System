import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { storage } from '../utils/storage';
import { BookOpen, CheckCircle, Clock, AlertCircle, Upload } from 'lucide-react';

export default function Assignments() {
    const { user } = useAuth();
    const [assignments, setAssignments] = useState([]);

    useEffect(() => {
        // Mock assignments data
        const mockAssignments = [
            {
                id: 1,
                subject: 'Mathematics',
                title: 'Algebra Problem Set',
                description: 'Complete exercises 1-20 from Chapter 5',
                dueDate: '2024-12-15',
                status: 'pending',
                marks: 20,
                submittedDate: null
            },
            {
                id: 2,
                subject: 'Science',
                title: 'Physics Lab Report',
                description: 'Write a detailed report on the pendulum experiment',
                dueDate: '2024-12-10',
                status: 'submitted',
                marks: 25,
                submittedDate: '2024-12-08',
                score: 23
            },
            {
                id: 3,
                subject: 'English',
                title: 'Essay Writing',
                description: 'Write an essay on "The Impact of Technology"',
                dueDate: '2024-12-20',
                status: 'pending',
                marks: 30,
                submittedDate: null
            },
            {
                id: 4,
                subject: 'History',
                title: 'World War II Research',
                description: 'Research and present key events of WWII',
                dueDate: '2024-11-30',
                status: 'graded',
                marks: 20,
                submittedDate: '2024-11-28',
                score: 18
            },
        ];
        setAssignments(mockAssignments);
    }, []);

    if (!user) {
        return <Navigate to="/login" />;
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return '#f59e0b';
            case 'submitted': return '#3b82f6';
            case 'graded': return '#10b981';
            case 'overdue': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return <Clock size={18} />;
            case 'submitted': return <Upload size={18} />;
            case 'graded': return <CheckCircle size={18} />;
            case 'overdue': return <AlertCircle size={18} />;
            default: return <BookOpen size={18} />;
        }
    };

    const pendingCount = assignments.filter(a => a.status === 'pending').length;
    const submittedCount = assignments.filter(a => a.status === 'submitted').length;
    const gradedCount = assignments.filter(a => a.status === 'graded').length;

    return (
        <div className="container" style={{ padding: '2rem 0' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '2rem' }}>Assignments</h2>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="card" style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)', color: 'white' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '48px', height: '48px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Clock size={24} />
                        </div>
                        <div>
                            <p style={{ margin: 0, opacity: 0.9, fontSize: '0.85rem' }}>Pending</p>
                            <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '1.75rem', fontWeight: '800' }}>{pendingCount}</h3>
                        </div>
                    </div>
                </div>

                <div className="card" style={{ background: 'linear-gradient(135deg, #3b82f6, #60a5fa)', color: 'white' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '48px', height: '48px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Upload size={24} />
                        </div>
                        <div>
                            <p style={{ margin: 0, opacity: 0.9, fontSize: '0.85rem' }}>Submitted</p>
                            <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '1.75rem', fontWeight: '800' }}>{submittedCount}</h3>
                        </div>
                    </div>
                </div>

                <div className="card" style={{ background: 'linear-gradient(135deg, #10b981, #34d399)', color: 'white' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '48px', height: '48px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <p style={{ margin: 0, opacity: 0.9, fontSize: '0.85rem' }}>Graded</p>
                            <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '1.75rem', fontWeight: '800' }}>{gradedCount}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Assignments List */}
            <div className="card">
                <h3 style={{ marginBottom: '1.5rem' }}>All Assignments</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {assignments.map(assignment => (
                        <div key={assignment.id} style={{
                            padding: '1.5rem',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius)',
                            borderLeft: `4px solid ${getStatusColor(assignment.status)}`
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                        <h4 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700' }}>{assignment.title}</h4>
                                        <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}>
                                            {assignment.subject}
                                        </span>
                                    </div>
                                    <p style={{ margin: '0.5rem 0', color: 'var(--text-main)' }}>{assignment.description}</p>
                                    <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                        <span>Due: <strong>{assignment.dueDate}</strong></span>
                                        <span>Marks: <strong>{assignment.marks}</strong></span>
                                        {assignment.submittedDate && (
                                            <span>Submitted: <strong>{assignment.submittedDate}</strong></span>
                                        )}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                                    <span className="badge" style={{
                                        background: `${getStatusColor(assignment.status)}20`,
                                        color: getStatusColor(assignment.status),
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        {getStatusIcon(assignment.status)}
                                        {assignment.status.toUpperCase()}
                                    </span>
                                    {assignment.status === 'graded' && (
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Score</p>
                                            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: 'var(--success)' }}>
                                                {assignment.score}/{assignment.marks}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {assignment.status === 'pending' && (
                                <button className="btn btn-primary btn-sm">
                                    <Upload size={16} /> Submit Assignment
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

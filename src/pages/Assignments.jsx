import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { storage } from '../utils/storage';
import { api } from '../utils/api';
import { BookOpen, CheckCircle, Clock, AlertCircle, Upload, FileText, Calendar, ArrowLeft } from 'lucide-react';
import LoadingScreen from '../components/LoadingScreen';
import FeatureLocked from '../components/FeatureLocked';

export default function Assignments() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [assignments, setAssignments] = useState([]);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, [user]);

    const loadData = async () => {
        if (!user || (!user.gradeLevel && !user.grade_level)) return;

        try {
            const studentClass = user.gradeLevel || user.grade_level;
            const data = await api.getAssignments({ class_name: studentClass });

            // Transform to match UI expectation or update UI
            // API returns: { title, subject, className, dueDate, message, fileUrl, teacherId, teacherName, createdAt }
            // UI expects: { status: 'pending' (default for now), ... }

            const formatted = data.map(a => ({
                ...a,
                id: a.id,
                description: a.message,
                status: 'pending', // Default status for now as we don't track submissions per student yet
                marks: 100 // Default max marks or add to schema
            }));

            setAssignments(formatted);
            localStorage.setItem(`last_viewed_assignments_${user.id}`, new Date().toISOString());
        } catch (error) {
            console.error("Failed to load assignments", error);
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return <Navigate to="/login" />;
    }

    const studentLocks = JSON.parse(localStorage.getItem('admin_student_locks') || '{}');
    if (studentLocks[`${user.id}_assignments`]) {
        return <FeatureLocked featureName="Assignments" />;
    }

    if (loading) {
        return <LoadingScreen message="Loading Assignments..." />;
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
        <div className="container" style={{ padding: '0 clamp(1rem, 5vw, 2.5rem) clamp(1rem, 3vw, 2.5rem)', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ padding: '1.5rem 0', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '45px',
                            height: '45px',
                            borderRadius: '12px',
                            background: 'var(--surface)',
                            border: '1px solid var(--border)',
                            color: 'var(--primary)',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: 'var(--shadow-sm)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateX(-3px)';
                            e.currentTarget.style.background = 'var(--primary)';
                            e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateX(0)';
                            e.currentTarget.style.background = 'var(--surface)';
                            e.currentTarget.style.color = 'var(--primary)';
                        }}
                        title="Go Back"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h2 style={{ fontSize: 'clamp(1.5rem, 5vw, 2.25rem)', fontWeight: '800', margin: 0, color: 'var(--text)' }}>
                        Assignments
                    </h2>
                </div>
            </div>

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
                                    <p style={{ margin: '0.5rem 0', color: 'var(--text-main)', whiteSpace: 'pre-wrap' }}>{assignment.description}</p>

                                    {assignment.fileUrl && (
                                        <div style={{ marginBottom: '0.5rem' }}>
                                            <a href={assignment.fileUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: '500' }}>
                                                <FileText size={16} /> View Attachment
                                            </a>
                                        </div>
                                    )}
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

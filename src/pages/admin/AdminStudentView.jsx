import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Navigate, useParams } from 'react-router-dom';
import { api } from '../../utils/api';
import { Lock, Unlock, Eye, DollarSign, Clock, FileText, BookOpen, Bell, Calendar, MessageSquare, ArrowLeft, Loader } from 'lucide-react';
import LoadingScreen from '../../components/LoadingScreen';

export default function AdminStudentView() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [lockedSections, setLockedSections] = useState({});

    useEffect(() => {
        loadData();
        const saved = JSON.parse(localStorage.getItem('admin_student_locks') || '{}');
        setLockedSections(saved);
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await api.getStudents();
            setStudents(data);
        } catch (error) {
            console.error("Failed to load students", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleLock = (studentId, section) => {
        const key = `${studentId}_${section}`;
        const newLocks = { ...lockedSections, [key]: !lockedSections[key] };
        setLockedSections(newLocks);
        localStorage.setItem('admin_student_locks', JSON.stringify(newLocks));
    };

    const isLocked = (studentId, section) => {
        return lockedSections[`${studentId}_${section}`] || false;
    };

    if (!user || user.role !== 'admin') {
        return <Navigate to="/login" />;
    }

    if (loading) return <LoadingScreen message="Loading Students..." />;

    const sections = [
        { id: 'fees', label: 'Fees Status', icon: DollarSign, color: '#3b82f6' },
        { id: 'attendance', label: 'Attendance', icon: Clock, color: '#10b981' },
        { id: 'results', label: 'Results', icon: FileText, color: '#f59e0b' },
        { id: 'assignments', label: 'Assignments', icon: BookOpen, color: '#8b5cf6' },
        { id: 'notices', label: 'Notices', icon: Bell, color: '#ef4444' },
        { id: 'timetable', label: 'Timetable', icon: Calendar, color: '#eab308' },
        { id: 'messages', label: 'Messages', icon: MessageSquare, color: '#ec4899' },
    ];

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
                        Student Portal Access Control
                    </h2>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem' }}>
                {/* Student List */}
                <div className="card">
                    <h3 style={{ marginBottom: '1rem' }}>Select Student</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '600px', overflowY: 'auto' }}>
                        {students.map(student => (
                            <div
                                key={student.id}
                                onClick={() => setSelectedStudent(student)}
                                style={{
                                    padding: '1rem',
                                    border: '1px solid var(--border)',
                                    borderRadius: 'var(--radius)',
                                    cursor: 'pointer',
                                    background: selectedStudent?.id === student.id ? 'var(--primary)' : 'transparent',
                                    color: selectedStudent?.id === student.id ? 'white' : 'var(--text-main)',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ fontWeight: '700' }}>{student.name}</div>
                                <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>{student.id} - {student.gradeLevel}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Access Control Panel */}
                <div>
                    {selectedStudent ? (
                        <>
                            <div className="card" style={{ marginBottom: '2rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                    <img
                                        src={selectedStudent.photo || `https://ui-avatars.com/api/?name=${selectedStudent.name}&background=random`}
                                        alt={selectedStudent.name}
                                        style={{ width: '64px', height: '64px', borderRadius: '50%', border: '3px solid var(--primary)' }}
                                    />
                                    <div>
                                        <h3 style={{ margin: 0 }}>{selectedStudent.name}</h3>
                                        <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)' }}>
                                            {selectedStudent.id} - {selectedStudent.gradeLevel}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="card">
                                <h3 style={{ marginBottom: '1.5rem' }}>Portal Sections Access</h3>
                                <div style={{ display: 'grid', gap: '1rem' }}>
                                    {sections.map(section => {
                                        const locked = isLocked(selectedStudent.id, section.id);
                                        return (
                                            <div
                                                key={section.id}
                                                style={{
                                                    padding: '1.5rem',
                                                    border: '1px solid var(--border)',
                                                    borderRadius: 'var(--radius)',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    background: locked ? 'rgba(239, 68, 68, 0.05)' : 'rgba(16, 185, 129, 0.05)'
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <div style={{
                                                        width: '48px',
                                                        height: '48px',
                                                        background: `${section.color}20`,
                                                        borderRadius: '12px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: section.color
                                                    }}>
                                                        <section.icon size={24} />
                                                    </div>
                                                    <div>
                                                        <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{section.label}</h4>
                                                        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                            {locked ? 'Student cannot access this section' : 'Student can access this section'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => toggleLock(selectedStudent.id, section.id)}
                                                    className="btn btn-sm"
                                                    style={{
                                                        background: locked ? '#ef4444' : '#10b981',
                                                        color: 'white',
                                                        border: 'none'
                                                    }}
                                                >
                                                    {locked ? (
                                                        <><Lock size={16} /> Locked</>
                                                    ) : (
                                                        <><Unlock size={16} /> Unlocked</>
                                                    )}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
                            <Eye size={64} color="var(--text-muted)" style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                            <h3 style={{ color: 'var(--text-muted)' }}>Select a student to manage access</h3>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

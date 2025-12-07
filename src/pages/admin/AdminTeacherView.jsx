import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { storage } from '../../utils/storage';
import { Lock, Unlock, Eye, Users, Clock, FileText, BookOpen, DollarSign } from 'lucide-react';

export default function AdminTeacherView() {
    const { user } = useAuth();
    const [teachers, setTeachers] = useState([]);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [lockedSections, setLockedSections] = useState({});

    useEffect(() => {
        setTeachers(storage.getTeachers());
        const saved = JSON.parse(localStorage.getItem('admin_teacher_locks') || '{}');
        setLockedSections(saved);
    }, []);

    const toggleLock = (teacherId, section) => {
        const key = `${teacherId}_${section}`;
        const newLocks = { ...lockedSections, [key]: !lockedSections[key] };
        setLockedSections(newLocks);
        localStorage.setItem('admin_teacher_locks', JSON.stringify(newLocks));
    };

    const isLocked = (teacherId, section) => {
        return lockedSections[`${teacherId}_${section}`] || false;
    };

    if (!user || user.role !== 'admin') {
        return <Navigate to="/login" />;
    }

    const sections = [
        { id: 'students', label: 'View Students', icon: Users, color: '#3b82f6' },
        { id: 'attendance', label: 'Mark Attendance', icon: Clock, color: '#10b981' },
        { id: 'marks', label: 'Upload Marks', icon: FileText, color: '#f59e0b' },
        { id: 'tests', label: 'Test Management', icon: BookOpen, color: '#8b5cf6' },
        { id: 'assignments', label: 'Assignments', icon: BookOpen, color: '#ec4899' },
        { id: 'salary', label: 'View Salary', icon: DollarSign, color: '#10b981' },
    ];

    return (
        <div className="container" style={{ padding: '2rem 0' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '2rem' }}>Teacher Portal Access Control</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem' }}>
                {/* Teacher List */}
                <div className="card">
                    <h3 style={{ marginBottom: '1rem' }}>Select Teacher</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '600px', overflowY: 'auto' }}>
                        {teachers.map(teacher => (
                            <div
                                key={teacher.id}
                                onClick={() => setSelectedTeacher(teacher)}
                                style={{
                                    padding: '1rem',
                                    border: '1px solid var(--border)',
                                    borderRadius: 'var(--radius)',
                                    cursor: 'pointer',
                                    background: selectedTeacher?.id === teacher.id ? 'var(--primary)' : 'transparent',
                                    color: selectedTeacher?.id === teacher.id ? 'white' : 'var(--text-main)',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ fontWeight: '700' }}>{teacher.name}</div>
                                <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>{teacher.id} - {teacher.subject}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Access Control Panel */}
                <div>
                    {selectedTeacher ? (
                        <>
                            <div className="card" style={{ marginBottom: '2rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                    <div style={{
                                        width: '64px',
                                        height: '64px',
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontSize: '1.5rem',
                                        fontWeight: '700'
                                    }}>
                                        {selectedTeacher.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0 }}>{selectedTeacher.name}</h3>
                                        <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)' }}>
                                            {selectedTeacher.id} - {selectedTeacher.subject}
                                        </p>
                                        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                            Classes: {(selectedTeacher.classes || []).join(', ')}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="card">
                                <h3 style={{ marginBottom: '1.5rem' }}>Portal Sections Access</h3>
                                <div style={{ display: 'grid', gap: '1rem' }}>
                                    {sections.map(section => {
                                        const locked = isLocked(selectedTeacher.id, section.id);
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
                                                            {locked ? 'Teacher cannot access this section' : 'Teacher can access this section'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => toggleLock(selectedTeacher.id, section.id)}
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
                            <h3 style={{ color: 'var(--text-muted)' }}>Select a teacher to manage access</h3>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

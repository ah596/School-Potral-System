import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { api } from '../../utils/api';
import { Lock, Unlock, Eye, Users, Clock, FileText, BookOpen, DollarSign, ArrowLeft, Search } from 'lucide-react';
import LoadingScreen from '../../components/LoadingScreen';

export default function AdminTeacherView() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [lockedSections, setLockedSections] = useState({});

    useEffect(() => {
        loadData();
        const saved = JSON.parse(localStorage.getItem('admin_teacher_locks') || '{}');
        setLockedSections(saved);
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await api.getTeachers();
            setTeachers(data);
        } catch (error) {
            console.error("Failed to load teachers", error);
        } finally {
            setLoading(false);
        }
    };

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

    if (loading) return <LoadingScreen message="Loading Teachers..." />;

    const sections = [
        { id: 'students', label: 'View Students', icon: Users, color: '#3b82f6' },
        { id: 'attendance', label: 'Mark Attendance', icon: Clock, color: '#10b981' },
        { id: 'marks', label: 'Upload Marks', icon: FileText, color: '#f59e0b' },
        { id: 'tests', label: 'Test Management', icon: BookOpen, color: '#8b5cf6' },
        { id: 'assignments', label: 'Assignments', icon: BookOpen, color: '#ec4899' },
        { id: 'salary', label: 'View Salary', icon: DollarSign, color: '#10b981' },
    ];

    const filteredTeachers = teachers.filter(t =>
        searchQuery
            ? (t.name?.toLowerCase().includes(searchQuery.toLowerCase()) || t.id?.toLowerCase().includes(searchQuery.toLowerCase()))
            : true
    );

    return (
        <div className={`container viewing-teacher-${!!selectedTeacher}`} style={{ padding: '0 clamp(1rem, 5vw, 2.5rem) clamp(1rem, 3vw, 2.5rem)', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Styles for Responsive Drill-Down Behavior */}
            <style>{`
                /* Default Desktop Styles handled by flex/grid below */
                
                /* Mobile Styles */
                @media (max-width: 900px) {
                    /* If viewing teacher, hide controls and list */
                    .container.viewing-teacher-true .controls-area,
                    .container.viewing-teacher-true .header-area,
                    .container.viewing-teacher-true .list-panel {
                        display: none !important;
                    }
                    
                    /* If NOT viewing teacher, hide details panel */
                    .container.viewing-teacher-false .detail-panel {
                        display: none !important;
                    }

                    /* Adjust grid to block for stacking */
                    .layout-grid {
                        display: block !important;
                        grid-template-columns: 1fr !important;
                    }

                    .mobile-header {
                        display: flex !important;
                    }
                }

                .mobile-header {
                    display: none; /* Hidden on desktop */
                }
            `}</style>

            <div className="header-area" style={{ padding: '1.5rem 0', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
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
                        Teacher Portal Access Control
                    </h2>
                </div>

                {/* Controls Area (Search) */}
                <div className="controls-area" style={{ maxWidth: '600px' }}>
                    {/* Search Field */}
                    <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                        <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Search teacher by Name or ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '1rem 1rem 1rem 3rem', // Large padding for icon
                                border: '1px solid var(--border)',
                                borderRadius: '16px', // Rounded pill style
                                background: 'var(--surface)',
                                fontSize: '1rem',
                                color: 'var(--text-main)',
                                boxShadow: 'var(--shadow-sm)'
                            }}
                        />
                    </div>
                </div>
            </div>

            <div className="layout-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem' }}>
                {/* Teacher List */}
                <div className="card list-panel">
                    <h3 style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        Teachers
                        {(searchQuery) && <span style={{ fontSize: '0.8rem', color: 'var(--primary)', background: 'rgba(99, 102, 241, 0.1)', padding: '2px 8px', borderRadius: '12px' }}>{filteredTeachers.length}</span>}
                    </h3>

                    {filteredTeachers.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                            <p>No teachers found.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '600px', overflowY: 'auto' }}>
                            {filteredTeachers.map(teacher => (
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
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem'
                                    }}
                                >
                                    <div style={{
                                        width: '32px', height: '32px', borderRadius: '50%',
                                        background: selectedTeacher?.id === teacher.id ? 'rgba(255,255,255,0.2)' : 'var(--background)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.8rem', fontWeight: 'bold'
                                    }}>
                                        {teacher.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{teacher.name}</div>
                                        <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>{teacher.id} - {teacher.subject}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Access Control Panel */}
                <div className="detail-panel">
                    {selectedTeacher ? (
                        <>
                            {/* Mobile Header (replicates main header style) */}
                            <div className="mobile-header" style={{ alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem', padding: '1.5rem 0' }}>
                                <button
                                    onClick={() => setSelectedTeacher(null)}
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
                                >
                                    <ArrowLeft size={24} />
                                </button>
                                <h2 style={{ fontSize: 'clamp(1.5rem, 5vw, 2.25rem)', fontWeight: '800', margin: 0, color: 'var(--text)' }}>
                                    Teacher Access
                                </h2>
                            </div>

                            <div className="card" style={{ marginBottom: '2rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                    {selectedTeacher.photo ? (
                                        <img
                                            src={selectedTeacher.photo}
                                            alt={selectedTeacher.name}
                                            style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)' }}
                                        />
                                    ) : (
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
                                            fontWeight: '700',
                                            border: '3px solid var(--primary)'
                                        }}>
                                            {selectedTeacher.name?.charAt(0)}
                                        </div>
                                    )}
                                    <div>
                                        <h3 style={{ margin: 0 }}>{selectedTeacher.name}</h3>
                                        <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)' }}>
                                            {selectedTeacher.id} - {selectedTeacher.subject}
                                        </p>
                                        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                            Classes: {(selectedTeacher.classes || selectedTeacher.assignedClasses || []).join(', ')}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="card">
                                <h3 style={{ marginBottom: '1.5rem' }}>Portal Sections Access</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
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
                                                    background: locked ? 'rgba(239, 68, 68, 0.05)' : 'rgba(16, 185, 129, 0.05)',
                                                    transition: 'all 0.2s'
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
                                                            {locked ? 'Access Restricted' : 'Access Granted'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => toggleLock(selectedTeacher.id, section.id)}
                                                    className="btn btn-sm"
                                                    style={{
                                                        background: locked ? '#ef4444' : '#10b981',
                                                        color: 'white',
                                                        border: 'none',
                                                        minWidth: '100px'
                                                    }}
                                                >
                                                    {locked ? (
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Lock size={16} /> Locked</span>
                                                    ) : (
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Unlock size={16} /> Unlocked</span>
                                                    )}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="card" style={{ textAlign: 'center', padding: '4rem', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <Eye size={64} color="var(--text-muted)" style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                            <h3 style={{ color: 'var(--text-muted)' }}>Select a teacher to manage access</h3>
                            <p style={{ color: 'var(--text-muted)', opacity: 0.7 }}>Click on a teacher from the list on the left</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

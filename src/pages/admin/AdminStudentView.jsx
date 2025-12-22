import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { api } from '../../utils/api';
import { Lock, Unlock, Eye, DollarSign, Clock, FileText, BookOpen, Bell, Calendar, MessageSquare, ArrowLeft, Search } from 'lucide-react';
import LoadingScreen from '../../components/LoadingScreen';

export default function AdminStudentView() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isClassMenuOpen, setIsClassMenuOpen] = useState(false);
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
            const [studentsData, classesData] = await Promise.all([
                api.getStudents(),
                api.getClasses()
            ]);
            setStudents(studentsData);
            setClasses(classesData);
        } catch (error) {
            console.error("Failed to load data", error);
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

    if (loading) return <LoadingScreen message="Loading Portal Data..." />;

    const sections = [
        { id: 'fees', label: 'Fees Status', icon: DollarSign, color: '#3b82f6' },
        { id: 'attendance', label: 'Attendance', icon: Clock, color: '#10b981' },
        { id: 'results', label: 'Results', icon: FileText, color: '#f59e0b' },
        { id: 'assignments', label: 'Assignments', icon: BookOpen, color: '#8b5cf6' },
        { id: 'notices', label: 'Notices', icon: Bell, color: '#ef4444' },
        { id: 'timetable', label: 'Timetable', icon: Calendar, color: '#eab308' },
        { id: 'messages', label: 'Messages', icon: MessageSquare, color: '#ec4899' },
    ];

    // Get unique class names and sort
    const gradeOptions = Array.isArray(classes)
        ? [...new Set(classes.map(cls => cls?.name).filter(Boolean))].sort()
        : [];

    // Filter students by selected class AND search query
    const filteredStudents = students.filter(s => {
        const matchesClass = selectedClass ? (s.gradeLevel === selectedClass || s.grade_level === selectedClass) : true;
        const matchesSearch = searchQuery
            ? (s.name?.toLowerCase().includes(searchQuery.toLowerCase()) || s.id?.toLowerCase().includes(searchQuery.toLowerCase()))
            : true;

        if (!selectedClass && !searchQuery) return false;
        if (selectedClass) return matchesClass && matchesSearch;
        return matchesClass && matchesSearch;
    });

    return (
        <div className={`container viewing-student-${!!selectedStudent}`} style={{ padding: '0 clamp(1rem, 5vw, 2.5rem) clamp(1rem, 3vw, 2.5rem)', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Styles for Responsive Drill-Down Behavior */}
            <style>{`
                /* Default Desktop Styles handled by flex/grid below */
                
                /* Mobile Styles */
                @media (max-width: 900px) {
                    /* If viewing student, hide controls and list */
                    .container.viewing-student-true .controls-area,
                    .container.viewing-student-true .header-area,
                    .container.viewing-student-true .list-panel {
                        display: none !important;
                    }
                    
                    /* If NOT viewing student, hide details panel */
                    .container.viewing-student-false .detail-panel {
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
                        Student Portal Access Control
                    </h2>
                </div>

                {/* Controls Area (Search + Class Dropdown) */}
                <div className="controls-area" style={{ maxWidth: '600px' }}>
                    <style>{`
                        .custom-dropdown-trigger {
                            width: 100%;
                            padding: 1.1rem 1.5rem;
                            background: var(--primary);
                            color: white;
                            border: none;
                            border-radius: 14px;
                            font-weight: 700;
                            text-align: left;
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            box-shadow: var(--shadow-md);
                            cursor: pointer;
                            font-size: 1.1rem;
                            transition: all 0.2s;
                        }
                        .custom-dropdown-trigger:hover {
                            transform: translateY(-2px);
                            box-shadow: var(--shadow-lg);
                        }
                        .custom-dropdown-list {
                            margin-top: 0.75rem;
                            display: flex;
                            flex-direction: column;
                            gap: 0.6rem;
                            position: absolute;
                            z-index: 50;
                            width: 100%;
                            background: var(--surface);
                            border: 1px solid var(--border);
                            border-radius: 14px;
                            padding: 0.5rem;
                            box-shadow: var(--shadow-xl);
                            max-height: 300px;
                            overflow-y: auto;
                        }
                        .custom-dropdown-item {
                            width: 100%;
                            padding: 0.9rem 1.2rem;
                            background: transparent;
                            color: var(--text-main);
                            border: none;
                            border-radius: 10px;
                            text-align: left;
                            font-size: 1rem;
                            font-weight: 500;
                            transition: all 0.2s;
                            cursor: pointer;
                        }
                        .custom-dropdown-item:hover {
                            background: var(--background);
                            color: var(--primary);
                        }
                        .custom-dropdown-item.active {
                            background: var(--primary);
                            color: white;
                        }
                    `}</style>
                    {/* Search Field */}
                    <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                        <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Search student by Name or ID..."
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

                    {/* Custom Dropdown */}
                    <div style={{ position: 'relative' }}>
                        <h4 style={{ margin: '0 0 0.75rem 0', color: 'var(--text-muted)' }}>Select Class:</h4>

                        <button
                            className="custom-dropdown-trigger"
                            onClick={() => setIsClassMenuOpen(!isClassMenuOpen)}
                        >
                            {selectedClass || "Choose Class"}
                            <span style={{
                                transform: isClassMenuOpen ? 'rotate(180deg)' : 'rotate(0)',
                                transition: 'transform 0.3s',
                                fontSize: '0.8rem'
                            }}>▼</span>
                        </button>

                        {isClassMenuOpen && (
                            <div className="custom-dropdown-list">
                                <button
                                    className={`custom-dropdown-item ${selectedClass === '' ? 'active' : ''}`}
                                    onClick={() => {
                                        setSelectedClass('');
                                        setIsClassMenuOpen(false);
                                    }}
                                >
                                    Show All (Search only)
                                </button>
                                {gradeOptions.map(cls => (
                                    <button
                                        key={cls}
                                        className={`custom-dropdown-item ${selectedClass === cls ? 'active' : ''}`}
                                        onClick={() => {
                                            setSelectedClass(cls);
                                            setSelectedStudent(null);
                                            setIsClassMenuOpen(false);
                                        }}
                                    >
                                        {cls}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="layout-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem' }}>
                {/* Student List */}
                <div className="card list-panel">
                    <h3 style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        Students
                        {(selectedClass || searchQuery) && <span style={{ fontSize: '0.8rem', color: 'var(--primary)', background: 'rgba(99, 102, 241, 0.1)', padding: '2px 8px', borderRadius: '12px' }}>{filteredStudents.length}</span>}
                    </h3>

                    {(!selectedClass && !searchQuery) ? (
                        <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                            <ArrowLeft size={24} style={{ marginBottom: '0.5rem', opacity: 0.5, transform: 'rotate(90deg)' }} />
                            <p>Select a class or search to view students.</p>
                        </div>
                    ) : filteredStudents.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                            <p>No students found matching your filters.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '600px', overflowY: 'auto' }}>
                            {filteredStudents.map(student => (
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
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem'
                                    }}
                                >
                                    <div style={{
                                        width: '32px', height: '32px', borderRadius: '50%',
                                        background: selectedStudent?.id === student.id ? 'rgba(255,255,255,0.2)' : 'var(--background)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.8rem', fontWeight: 'bold'
                                    }}>
                                        {student.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{student.name}</div>
                                        <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>{student.id}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Access Control Panel */}
                <div className="detail-panel">
                    {selectedStudent ? (
                        <>
                            {/* Mobile Back Button */}
                            {/* Mobile Header (replicates main header style) */}
                            <div className="mobile-header" style={{ alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem', padding: '1.5rem 0' }}>
                                <button
                                    onClick={() => setSelectedStudent(null)}
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
                                    Student Access
                                </h2>
                            </div>

                            <div className="card" style={{ marginBottom: '2rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                    <img
                                        src={selectedStudent.photo || `https://ui-avatars.com/api/?name=${selectedStudent.name}&background=random`}
                                        alt={selectedStudent.name}
                                        style={{ width: '64px', height: '64px', borderRadius: '50%', border: '3px solid var(--primary)', objectFit: 'cover' }}
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
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
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
                                                    onClick={() => toggleLock(selectedStudent.id, section.id)}
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
                            <h3 style={{ color: 'var(--text-muted)' }}>Select a student to manage access</h3>
                            <p style={{ color: 'var(--text-muted)', opacity: 0.7 }}>Click on a student from the list on the left</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

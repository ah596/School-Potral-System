import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { Navigate, Link } from 'react-router-dom';
import {
    Users,
    ClipboardCheck,
    FileText,
    BookOpen,
    Mail,
    Phone,
    Calendar,
    CheckCircle,
    XCircle,
    Clock,
    ChevronRight
} from 'lucide-react';
import LoadingScreen from '../../components/LoadingScreen';

export default function TeacherDashboard() {
    const { user } = useAuth();
    const [myAttendance, setMyAttendance] = useState([]);
    const [assignedClasses, setAssignedClasses] = useState([]);
    const [loading, setLoading] = useState(false);

    const [assignmentsCount, setAssignmentsCount] = useState(0);
    const [testsCount, setTestsCount] = useState(0);

    useEffect(() => {
        if (!user?.id) return;

        const loadDashboardData = async () => {
            setLoading(true);
            try {
                const [attendanceData, classesData] = await Promise.all([
                    api.getAttendance(user.id),
                    api.getTeacherClasses(user.id)
                ]);
                setMyAttendance(attendanceData);
                setAssignedClasses(classesData);
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();

        // Live Subscriptions
        const unsubAssignments = api.subscribeToAssignments({ teacherId: user.id }, (data) => {
            setAssignmentsCount(data.length);
        });

        const unsubTests = api.subscribeToTests({ teacherId: user.id }, (data) => {
            setTestsCount(data.length);
        });

        return () => {
            if (unsubAssignments) unsubAssignments();
            if (unsubTests) unsubTests();
        };
    }, [user.id]);

    if (!user || user.role !== 'teacher') {
        return <Navigate to="/login" />;
    }

    if (loading) return <LoadingScreen message="Loading Dashboard..." />;

    const menuItems = [
        { to: '/teacher/my-attendance', label: 'My Attendance', icon: Calendar, color: '#6366f1', desc: 'View your attendance record' },
        { to: '/teacher/attendance', label: 'Mark Attendance', icon: ClipboardCheck, color: '#10b981', desc: 'Mark student attendance' },
        { to: '/teacher/marks', label: 'Upload Marks', icon: FileText, color: '#3b82f6', desc: 'Upload student marks' },
        { to: '/teacher/tests', label: 'Test Management', icon: BookOpen, color: '#f59e0b', desc: testsCount > 0 ? `${testsCount} Total Tests` : 'Create and manage tests' },
        { to: '/teacher/assignments', label: 'Assignments', icon: BookOpen, color: '#8b5cf6', desc: assignmentsCount > 0 ? `${assignmentsCount} Total Assignments` : 'Manage assignments' },
        { to: '/teacher/students', label: 'View Students', icon: Users, color: '#f97316', desc: 'View student list' },
        { to: '/teacher/notices', label: 'Class Updates', icon: Mail, color: '#ec4899', desc: 'Post class announcements' },
    ];

    // Calculate attendance stats
    const presentDays = myAttendance.filter(a => a.status === 'present').length;
    const absentDays = myAttendance.filter(a => a.status === 'absent').length;
    const totalDays = myAttendance.length;
    const attendancePercentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 0;

    return (
        <div className="container" style={{ padding: '0 clamp(1rem, 5vw, 2.5rem) clamp(1rem, 3vw, 2.5rem)', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ padding: '1.5rem 0' }}></div>
            {/* Teacher Profile Info Box */}
            <div className="card teacher-profile-card">
                <div className="teacher-profile-container">
                    {/* Avatar & Info Wrapper */}
                    <div className="teacher-main-info">
                        <div className="teacher-avatar-wrapper">
                            <div className="teacher-avatar">
                                {user.photo ? (
                                    <img
                                        src={user.photo}
                                        alt="Profile"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    user.name.charAt(0)
                                )}
                            </div>
                            <div className="teacher-badge show-mobile-only">Teacher</div>
                        </div>

                        <div className="teacher-details">
                            <h2 className="teacher-welcome-text">{user.name}</h2>
                            <p className="teacher-subject-text hide-mobile">{user.subject}</p>

                            <div className="teacher-meta-list">
                                <div className="meta-item mobile-item">
                                    <BookOpen size={16} className="show-mobile-only" />
                                    <span><strong>Subject: </strong>{user.subject}</span>
                                </div>
                                <div className="meta-item">
                                    <FileText size={16} />
                                    <span><strong>ID:</strong> {user.id}</span>
                                </div>
                                <div className="meta-item hide-mobile">
                                    <Mail size={16} />
                                    <span>{user.email || `${user.id.toLowerCase()}@school.com`}</span>
                                </div>
                                <div className="meta-item hide-mobile">
                                    <Users size={16} />
                                    <span><strong>Classes:</strong> {assignedClasses.length > 0 ? assignedClasses.map(c => `${c.name} (${c.section})`).join(', ') : 'None Assigned'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Attendance Stats */}
                    <div className="teacher-stats">
                        <div className="stats-box">
                            <p className="stats-value">{presentDays}</p>
                            <p className="stats-label">Present</p>
                        </div>
                        <div className={`stats-box ${absentDays > 5 ? 'stats-warning' : ''}`}>
                            <p className="stats-value">{absentDays}</p>
                            <p className="stats-label">Absent</p>
                        </div>
                        <div className="stats-box">
                            <p className="stats-value">{attendancePercentage}%</p>
                            <p className="stats-label">Attendance</p>
                        </div>
                    </div>
                </div>
            </div>


            {/* Menu Grid */}
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: '700' }}>Quick Actions</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                {menuItems.map((item, index) => (
                    <Link key={index} to={item.to} style={{ textDecoration: 'none' }}>
                        <div className="card" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            padding: '1.5rem',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            cursor: 'pointer',
                            border: '1px solid var(--border)'
                        }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                            }}>
                            <div style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '12px',
                                background: `${item.color}20`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: item.color,
                                flexShrink: 0
                            }}>
                                <item.icon size={28} />
                            </div>
                            <div>
                                <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)' }}>{item.label}</h4>
                                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{item.desc}</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

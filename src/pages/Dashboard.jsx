import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { api } from '../utils/api';
import {
    CreditCard,
    Clock,
    FileText,
    BookOpen,
    Bell,
    Calendar,
    MessageSquare,
    ChevronRight,
    GraduationCap,
    CheckCircle
} from 'lucide-react';
import LoadingScreen from '../components/LoadingScreen';

export default function Dashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        attendance: '...',
        results: '...',
        assignments: '...',
        notices: '...'
    });
    const [unread, setUnread] = useState({
        results: 0,
        assignments: 0,
        notices: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            if (!user) return;
            try {
                // 1. Fetch Attendance
                let attPercent = 0;
                try {
                    const attendance = await api.getAttendance(user.id);
                    const present = attendance.filter(a => a.status === 'present').length;
                    attPercent = attendance.length > 0 ? ((present / attendance.length) * 100).toFixed(0) : 0;
                } catch (e) { console.error("Attendance load fail", e); }

                // 2. Fetch Assignments
                const studentClass = user.gradeLevel || user.grade_level || user.class || user.grade;
                let assignments = [];
                try {
                    assignments = await api.getAssignments({ class_name: studentClass });
                } catch (e) { console.error("Assignments load fail", e); }

                // 3. Fetch Results/Tests
                let myTests = [];
                try {
                    const tests = await api.getTests();
                    myTests = tests.filter(t => t.marks && t.marks[user.id]);
                } catch (e) { console.error("Tests load fail", e); }

                // 4. Update Stats & Unread (Immediate Assignments/Results)
                const lastViewedAsg = localStorage.getItem(`last_viewed_assignments_${user.id}`);
                const unreadAsg = lastViewedAsg
                    ? assignments.filter(a => a.createdAt > lastViewedAsg).length
                    : assignments.length;

                const lastViewedRes = localStorage.getItem(`last_viewed_results_${user.id}`);
                const unreadRes = lastViewedRes
                    ? myTests.filter(t => t.createdAt > lastViewedRes).length
                    : myTests.length;

                setStats(prev => ({
                    ...prev,
                    attendance: `${attPercent}% Present`,
                    assignments: unreadAsg > 0 ? `${unreadAsg} New Assignments` : `${assignments.length} Total`,
                    results: unreadRes > 0 ? `${unreadRes} New Results` : `${myTests.length} Total`
                }));
                setUnread(prev => ({ ...prev, assignments: unreadAsg, results: unreadRes }));

                // 5. Fetch Class Updates (Real-time listener)
                api.subscribeToNotices({ targetClass: studentClass || null }, (data) => {
                    const lastViewed = localStorage.getItem(`last_viewed_notices_${user.id}`);
                    const unreadCount = lastViewed
                        ? data.filter(n => (n.timestamp || n.createdAt) > lastViewed).length
                        : data.length;

                    setStats(prev => ({
                        ...prev,
                        notices: unreadCount > 0 ? `${unreadCount} New Updates` : (data.length > 0 ? 'Up to date' : 'No Updates')
                    }));
                    setUnread(prev => ({ ...prev, notices: unreadCount }));
                });
            } catch (error) {
                console.error("Dashboard stats error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [user]);

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (loading) return <LoadingScreen message="Personalizing your dashboard..." />;

    const menuItems = [
        { id: 'fees', to: '/fees', label: 'Fees Status', icon: CreditCard, color: 'linear-gradient(135deg, #f97316, #fb923c)', desc: 'Check pending dues' },
        { id: 'attendance', to: '/attendance', label: 'Attendance', icon: Clock, color: 'linear-gradient(135deg, #10b981, #34d399)', desc: stats.attendance },
        { id: 'results', to: '/results', label: 'Exam Results', icon: FileText, color: 'linear-gradient(135deg, #3b82f6, #60a5fa)', desc: stats.results },
        { id: 'assignments', to: '/assignments', label: 'Assignments', icon: BookOpen, color: 'linear-gradient(135deg, #8b5cf6, #a78bfa)', desc: stats.assignments },
        { id: 'notices', to: '/notices', label: 'Class Updates', icon: MessageSquare, color: 'linear-gradient(135deg, #ef4444, #f87171)', desc: stats.notices },
        { id: 'timetable', to: '/timetable', label: 'Class Routine', icon: Calendar, color: 'linear-gradient(135deg, #eab308, #facc15)', desc: 'Weekly schedule' },
        { id: 'messages', to: '/messages', label: 'Messages', icon: MessageSquare, color: 'linear-gradient(135deg, #ec4899, #f472b6)', desc: 'Teacher chat' },
    ];

    return (
        <div className="dashboard-page">
            <div className="container" style={{ padding: '0 clamp(1rem, 5vw, 2.5rem) clamp(1rem, 3vw, 2.5rem)', maxWidth: '1400px', margin: '0 auto' }}>
                <div style={{ padding: '1.5rem 0' }}></div>
                {/* Profile Header */}
                <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                        <div style={{ position: 'relative' }}>
                            <img
                                src={user.photo || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
                                alt={user.name}
                                style={{
                                    width: '100px', height: '100px',
                                    borderRadius: '24px',
                                    objectFit: 'cover',
                                    boxShadow: 'var(--shadow-lg)',
                                    border: '4px solid white'
                                }}
                            />
                            <div style={{
                                position: 'absolute', bottom: -12, left: '50%',
                                transform: 'translateX(-50%)',
                                background: 'var(--primary)', color: 'white',
                                padding: '5px 14px', borderRadius: '20px',
                                fontSize: '0.7rem', fontWeight: '900',
                                border: '2px solid white',
                                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                                whiteSpace: 'nowrap',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>
                                Student
                            </div>
                        </div>

                        <div>
                            <h1 style={{
                                fontSize: '2.5rem', fontWeight: '800',
                                color: 'var(--text-main)',
                                margin: '0 0 0.5rem 0'
                            }}>
                                {user.name}
                            </h1>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                                    <span style={{ fontWeight: '600' }}>ID: {user.id}</span>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '1rem' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <GraduationCap size={18} /> <strong>Class:</strong> {user.gradeLevel || user.grade_level || user.class || user.grade}
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <Calendar size={18} /> <strong>Year:</strong> 2024-25
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Attendance Stats Card */}
                    <div className="card header-stats-card" style={{
                        padding: '1.5rem 2rem',
                        minWidth: '200px',
                        textAlign: 'center',
                        background: 'linear-gradient(135deg, var(--surface), var(--background))',
                        border: '1px solid var(--border)',
                        boxShadow: 'var(--shadow-md)',
                        borderRadius: '20px'
                    }}>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <Clock size={16} /> ATTENDANCE
                        </div>
                        <div style={{
                            fontSize: '2.5rem',
                            fontWeight: '900',
                            color: parseInt(stats.attendance) > 75 ? 'var(--success)' : 'var(--warning)',
                            lineHeight: 1
                        }}>
                            {stats.attendance.split('%')[0]}%
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                            Overall Presence
                        </div>
                    </div>
                </header>

                {/* Quick Stats Row (Optional - can be added later) */}

                {/* Menu Grid */}
                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: '700' }}>Quick Access</h3>
                <div className="dashboard-menu-grid">
                    {menuItems.map((item) => (
                        <Link key={item.to} to={item.to} className="menu-card" style={{ position: 'relative' }}>
                            {unread[item.id] > 0 && (
                                <div style={{
                                    position: 'absolute', top: '-5px', right: '-5px',
                                    background: 'var(--danger)', color: 'white',
                                    borderRadius: '50%', width: '22px', height: '22px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '0.7rem', fontWeight: '800', border: '2px solid var(--surface)',
                                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)', zIndex: 10,
                                    animation: 'pulse 2s infinite'
                                }}>
                                    {unread[item.id]}
                                </div>
                            )}
                            <div className="menu-icon" style={{ background: item.color, boxShadow: '0 8px 16px -4px rgba(0,0,0,0.1)' }}>
                                <item.icon size={28} color="white" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <span className="menu-label" style={{ display: 'block', marginBottom: '0.25rem' }}>{item.label}</span>
                                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{item.desc}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

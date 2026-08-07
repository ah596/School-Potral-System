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
    TrendingUp,
    Award,
    Mail,
    Activity
} from 'lucide-react';
import LoadingScreen from '../components/LoadingScreen';

export default function Dashboard() {
    const { user } = useAuth();
    const [attPercent, setAttPercent] = useState(0);
    const [assignCount, setAssignCount] = useState(0);
    const [resultsCount, setResultsCount] = useState(0);
    const [noticesCount, setNoticesCount] = useState(0);
    const [unread, setUnread] = useState({ results: 0, assignments: 0, notices: 0 });
    const [loading, setLoading] = useState(true);
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchStats = async () => {
            if (!user) return;
            try {
                let pct = 0;
                try {
                    const attendance = await api.getAttendance(user.id);
                    const present = attendance.filter(a => a.status === 'present').length;
                    pct = attendance.length > 0 ? Math.round((present / attendance.length) * 100) : 0;
                } catch (e) { }
                setAttPercent(pct);

                const studentClass = user.gradeLevel || user.grade_level || user.class || user.grade;

                let assignments = [];
                try { assignments = await api.getAssignments({ class_name: studentClass }); } catch (e) { }
                setAssignCount(assignments.length);

                let myTests = [];
                try {
                    const tests = await api.getTests();
                    myTests = tests.filter(t => t.marks && t.marks[user.id]);
                } catch (e) { }
                setResultsCount(myTests.length);

                const lastViewedAsg = localStorage.getItem(`last_viewed_assignments_${user.id}`);
                const unreadAsg = lastViewedAsg ? assignments.filter(a => a.createdAt > lastViewedAsg).length : assignments.length;
                const lastViewedRes = localStorage.getItem(`last_viewed_results_${user.id}`);
                const unreadRes = lastViewedRes ? myTests.filter(t => t.createdAt > lastViewedRes).length : myTests.length;
                setUnread(prev => ({ ...prev, assignments: unreadAsg, results: unreadRes }));

                api.subscribeToNotices({ targetClass: studentClass || null }, (data) => {
                    setNoticesCount(data.length);
                    const lastViewed = localStorage.getItem(`last_viewed_notices_${user.id}`);
                    const unreadCount = lastViewed ? data.filter(n => (n.timestamp || n.createdAt) > lastViewed).length : data.length;
                    setUnread(prev => ({ ...prev, notices: unreadCount }));
                });

            } catch (err) {
                console.error('Dashboard stats error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [user]);

    if (!user) return <Navigate to="/login" />;
    if (loading) return <LoadingScreen message="Personalizing your dashboard..." />;

    const greeting = time.getHours() < 12 ? 'Good Morning' : time.getHours() < 17 ? 'Good Afternoon' : 'Good Evening';
    const studentClass = user.gradeLevel || user.grade_level || user.class || user.grade || '—';

    const statCards = [
        { label: 'Attendance',   value: `${attPercent}%`,    icon: Clock,          bg: 'linear-gradient(135deg, #10b981, #34d399)', change: 'Overall' },
        { label: 'Assignments',  value: assignCount,          icon: BookOpen,       bg: 'linear-gradient(135deg, #8b5cf6, #a78bfa)', change: unread.assignments > 0 ? `${unread.assignments} New` : 'Up to date' },
        { label: 'Exam Results', value: resultsCount,         icon: FileText,       bg: 'linear-gradient(135deg, #3b82f6, #60a5fa)', change: unread.results > 0 ? `${unread.results} New` : 'Checked' },
        { label: 'Notices',      value: noticesCount,         icon: Bell,           bg: 'linear-gradient(135deg, #ec4899, #f472b6)', change: unread.notices > 0 ? `${unread.notices} New` : 'Active' },
    ];

    const menuItems = [
        { id: 'fees',        to: '/fees',        label: 'Fees Status',   icon: CreditCard,    color: 'linear-gradient(135deg, #f97316, #fb923c)', desc: 'Check pending dues' },
        { id: 'attendance',  to: '/attendance',  label: 'Attendance',    icon: Clock,         color: 'linear-gradient(135deg, #10b981, #34d399)', desc: `${attPercent}% Present` },
        { id: 'results',     to: '/results',     label: 'Exam Results',  icon: FileText,      color: 'linear-gradient(135deg, #3b82f6, #60a5fa)', desc: `${resultsCount} Tests`, badge: unread.results },
        { id: 'assignments', to: '/assignments', label: 'Assignments',   icon: BookOpen,      color: 'linear-gradient(135deg, #8b5cf6, #a78bfa)', desc: `${assignCount} Total`, badge: unread.assignments },
        { id: 'notices',     to: '/notices',     label: 'Class Updates', icon: MessageSquare, color: 'linear-gradient(135deg, #ef4444, #f87171)', desc: `${noticesCount} Notices`, badge: unread.notices },
        { id: 'timetable',   to: '/timetable',   label: 'Class Routine', icon: Calendar,      color: 'linear-gradient(135deg, #eab308, #facc15)', desc: 'Weekly schedule' },
        { id: 'messages',    to: '/messages',    label: 'Messages',      icon: MessageSquare, color: 'linear-gradient(135deg, #ec4899, #f472b6)', desc: 'Teacher chat' },
    ];

    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)', paddingBottom: '3rem' }}>
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(24px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .admin-hero { animation: fadeInUp 0.5s ease forwards; }
                .stat-card-item { animation: fadeInUp 0.5s ease forwards; opacity: 0; }
                .stat-card-item:nth-child(1) { animation-delay: 0.1s; }
                .stat-card-item:nth-child(2) { animation-delay: 0.15s; }
                .stat-card-item:nth-child(3) { animation-delay: 0.2s; }
                .stat-card-item:nth-child(4) { animation-delay: 0.25s; }
                .stat-card-item { transition: transform 0.3s cubic-bezier(0.4,0,0.2,1), box-shadow 0.3s; }
                .stat-card-item:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(0,0,0,0.15); }
                .menu-item-card { animation: fadeInUp 0.5s ease forwards; opacity: 0; transition: all 0.3s cubic-bezier(0.4,0,0.2,1); }
                .menu-item-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg) !important; }
                .menu-item-card:hover .menu-arrow { transform: translateX(4px); opacity: 1 !important; }
                .menu-arrow { transition: transform 0.3s; }
                @media (max-width: 768px) {
                    .hero-grid { flex-direction: column !important; }
                    .stats-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 0.5rem !important; }
                    .stat-card-item { padding: 0.75rem !important; border-radius: 14px !important; }
                    .stat-card-item > div:first-child { flex-direction: column-reverse !important; align-items: flex-start !important; gap: 0.5rem !important; }
                    .stat-card-item > div:first-child > div:last-child { width: 36px !important; height: 36px !important; border-radius: 10px !important; }
                    .stat-card-item > div:first-child > div:last-child svg { width: 18px !important; height: 18px !important; }
                    .stat-card-item p:nth-child(1) { font-size: 0.65rem !important; letter-spacing: 0 !important; }
                    .stat-card-item p:nth-child(2) { font-size: 1.25rem !important; margin-top: 0.2rem !important; }
                    .stat-card-item > div:nth-child(2) { flex-wrap: wrap !important; gap: 0.2rem !important; margin-top: 0.5rem !important; }
                    .stat-card-item > div:nth-child(2) span { font-size: 0.65rem !important; }
                    .menu-grid { grid-template-columns: 1fr !important; }
                    .hero-time-block { display: none !important; }
                    .profile-flex { flex-direction: row-reverse !important; text-align: left; justify-content: space-between; width: 100%; }
                    .profile-flex > div:last-child { align-items: flex-start; display: flex; flex-direction: column; }
                    .profile-flex .user-tags { justify-content: flex-start; }
                }
            `}</style>

            {/* Hero Banner */}
            <div className="admin-hero" style={{
                background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4c1d95 100%)',
                padding: '2.5rem 0 3rem',
                position: 'relative',
                overflow: 'hidden',
            }}>
                <div style={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(139,92,246,0.15)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: -80, left: -40, width: 250, height: 250, borderRadius: '50%', background: 'rgba(99,102,241,0.1)', pointerEvents: 'none' }} />

                <div className="container">
                    <div className="hero-grid" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2rem' }}>

                        {/* Profile */}
                        <div className="profile-flex" style={{ display: 'flex', alignItems: 'center', gap: '1.75rem', flex: 1 }}>
                            <div style={{
                                width: 88, height: 88, borderRadius: 22,
                                background: 'rgba(255,255,255,0.15)',
                                border: '3px solid rgba(255,255,255,0.25)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                overflow: 'hidden', flexShrink: 0,
                                boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
                            }}>
                                {user.photo
                                    ? <img src={user.photo} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    : <GraduationCap size={36} color="white" />
                                }
                            </div>

                            <div>
                                <span style={{
                                    background: 'linear-gradient(135deg, #10b981, #34d399)',
                                    color: 'white', fontSize: '0.7rem', fontWeight: 800,
                                    padding: '3px 10px', borderRadius: 20,
                                    textTransform: 'uppercase', letterSpacing: 1,
                                    display: 'inline-block', marginBottom: '0.4rem'
                                }}>
                                    🎓 Student
                                </span>
                                <h1 style={{ color: 'white', fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
                                    {greeting}, {(user.name || 'Student').split(' ')[0]}!
                                </h1>
                                <div className="user-tags" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.6rem' }}>
                                    <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                        <GraduationCap size={14} /> {user.id}
                                    </span>
                                    {user.email && (
                                        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                            <Mail size={14} /> {user.email}
                                        </span>
                                    )}
                                    <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                        <BookOpen size={14} /> Class: {studentClass}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Live Clock */}
                        <div className="hero-time-block" style={{
                            textAlign: 'center',
                            background: 'rgba(255,255,255,0.07)',
                            border: '1px solid rgba(255,255,255,0.12)',
                            borderRadius: 20, padding: '1.25rem 2rem',
                            backdropFilter: 'blur(10px)',
                        }}>
                            <div style={{ color: 'white', fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}>
                                {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginTop: '0.4rem' }}>
                                {time.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '0.5rem' }}>
                                <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981' }} />
                                <span style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: 700 }}>LIVE</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container" style={{ paddingTop: '2rem' }}>

                {/* Stat Cards */}
                <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2.5rem' }}>
                    {statCards.map((s, i) => (
                        <div key={i} className="stat-card-item" style={{
                            background: 'var(--surface)',
                            borderRadius: 20,
                            padding: '1.5rem',
                            border: '1px solid var(--border)',
                            position: 'relative', overflow: 'hidden',
                            boxShadow: 'var(--shadow-sm)',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</p>
                                    <p style={{ margin: '0.4rem 0 0', fontSize: '2.25rem', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1 }}>{s.value}</p>
                                </div>
                                <div style={{
                                    width: 48, height: 48, borderRadius: 14,
                                    background: s.bg,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
                                }}>
                                    <s.icon size={22} color="white" />
                                </div>
                            </div>
                            <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <TrendingUp size={13} color="#10b981" />
                                <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 700 }}>{s.change}</span>
                                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>this month</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Section Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>Quick Access</h2>
                        <p style={{ margin: '0.2rem 0 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>All your academic tools in one place</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '0.5rem 1rem' }}>
                        <Activity size={14} color="var(--text-muted)" />
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{menuItems.length} Modules</span>
                    </div>
                </div>

                {/* Menu Grid */}
                <div className="menu-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                    {menuItems.map((item, index) => (
                        <Link key={item.to} to={item.to} style={{ textDecoration: 'none', position: 'relative' }}>
                            {item.badge > 0 && (
                                <div style={{
                                    position: 'absolute', top: -6, right: -6,
                                    background: 'var(--danger)', color: 'white',
                                    borderRadius: '50%', width: 22, height: 22,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '0.7rem', fontWeight: 800,
                                    border: '2px solid var(--surface)',
                                    boxShadow: '0 4px 12px rgba(239,68,68,0.4)', zIndex: 10,
                                    animation: 'pulse 2s infinite'
                                }}>
                                    {item.badge}
                                </div>
                            )}
                            <div className="menu-item-card" style={{
                                background: 'var(--surface)',
                                borderRadius: 18,
                                padding: '1.25rem 1.5rem',
                                border: '1px solid var(--border)',
                                display: 'flex', alignItems: 'center', gap: '1rem',
                                cursor: 'pointer',
                                animationDelay: `${0.05 * index + 0.3}s`,
                            }}>
                                <div style={{
                                    width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                                    background: item.color,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
                                }}>
                                    <item.icon size={24} color="white" />
                                </div>

                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>{item.label}</h4>
                                    </div>
                                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>{item.desc}</p>
                                </div>

                                <ChevronRight size={18} className="menu-arrow" color="var(--text-muted)" style={{ opacity: 0.4, flexShrink: 0 }} />
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Bottom Bar */}
                <div style={{
                    marginTop: '2.5rem',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 18,
                    padding: '1.25rem 1.75rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #10b981, #34d399)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Award size={18} color="white" />
                        </div>
                        <div>
                            <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>KGS School Management System</p>
                            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>Student Portal — Academic Year 2024-25</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
                        <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>Active Session</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

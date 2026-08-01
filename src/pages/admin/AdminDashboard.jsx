import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { api } from '../../utils/api';
import {
    Users,
    GraduationCap,
    Bell,
    DollarSign,
    BookOpen,
    BarChart3,
    ChevronRight,
    Mail,
    Image as ImageIcon,
    Shield,
    Calendar,
    Clock,
    RefreshCw,
    UserCheck,
    Layers,
    CreditCard,
    TrendingUp,
    Award,
    Activity,
    Lock
} from 'lucide-react';

export default function AdminDashboard() {
    const { user, loading: authLoading } = useAuth();
    const [stats, setStats] = useState({ teachers: 0, students: 0, notices: 0, classes: 0 });
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (!authLoading && user?.role === 'admin') {
            Promise.all([api.getTeachers(), api.getStudents(), api.getNotices(), api.getClasses()])
                .then(([teachers, students, notices, classes]) =>
                    setStats({ teachers: teachers.length, students: students.length, notices: notices.length, classes: classes.length })
                ).catch(console.error);
        }
    }, [authLoading, user]);

    if (authLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a', color: 'white' }}>
                <h2>Initializing Session...</h2>
            </div>
        );
    }

    if (!user || user.role !== 'admin') {
        return <Navigate to="/login" replace />;
    }

    const greeting = time.getHours() < 12 ? 'Good Morning' : time.getHours() < 17 ? 'Good Afternoon' : 'Good Evening';

    const statCards = [
        { label: 'Total Students', value: stats.students, icon: GraduationCap, bg: 'linear-gradient(135deg, #6366f1, #8b5cf6)', change: '+12%' },
        { label: 'Teachers', value: stats.teachers, icon: Users, bg: 'linear-gradient(135deg, #10b981, #34d399)', change: '+3%' },
        { label: 'Active Classes', value: stats.classes, icon: BookOpen, bg: 'linear-gradient(135deg, #f59e0b, #fbbf24)', change: '+1' },
        { label: 'Notices', value: stats.notices, icon: Bell, bg: 'linear-gradient(135deg, #ec4899, #f472b6)', change: 'Active' },
    ];

    const menuItems = [
        { to: '/admin/classes', label: 'Manage Classes', icon: Layers, color: 'linear-gradient(135deg, #06b6d4, #22d3ee)', desc: 'Create and manage classes', badge: stats.classes },
        { to: '/admin/teachers', label: 'Manage Teachers', icon: Users, color: 'linear-gradient(135deg, #3b82f6, #60a5fa)', desc: 'Add, edit, assign classes', badge: stats.teachers },
        { to: '/admin/students', label: 'Manage Students', icon: GraduationCap, color: 'linear-gradient(135deg, #10b981, #34d399)', desc: 'Add, edit student records', badge: stats.students },
        { to: '/admin/teacher-attendance', label: 'Teacher Attendance', icon: UserCheck, color: 'linear-gradient(135deg, #f97316, #fb923c)', desc: 'Mark teacher attendance' },
        { to: '/admin/notices', label: 'Notice Board', icon: Bell, color: 'linear-gradient(135deg, #ef4444, #f87171)', desc: 'Post announcements', badge: stats.notices },
        { to: '/admin/gallery', label: 'School Gallery', icon: ImageIcon, color: 'linear-gradient(135deg, #ec4899, #f472b6)', desc: 'Manage school event photos' },
        { to: '/admin/fees', label: 'Student Fees', icon: CreditCard, color: 'linear-gradient(135deg, #10b981, #34d399)', desc: 'Manage fees & challans' },
        { to: '/admin/payments', label: 'Teacher Salaries', icon: DollarSign, color: 'linear-gradient(135deg, #f59e0b, #fbbf24)', desc: 'Manage salary payments' },
        { to: '/admin/reports', label: 'Reports & Analytics', icon: BarChart3, color: 'linear-gradient(135deg, #06b6d4, #22d3ee)', desc: 'View detailed analytics' },
        { to: '/admin/manage-admins', label: 'Manage Admins', icon: Shield, color: 'linear-gradient(135deg, #6366f1, #8b5cf6)', desc: 'Admin access control' },
        { to: '/admin/student-access', label: 'Student Access', icon: Lock, color: 'linear-gradient(135deg, #f43f5e, #fb7185)', desc: 'Manage student portal access' },
        { to: '/admin/teacher-access', label: 'Teacher Access', icon: Lock, color: 'linear-gradient(135deg, #8b5cf6, #a78bfa)', desc: 'Manage teacher portal access' },
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
                                    : <Shield size={36} color="white" />
                                }
                            </div>

                            <div>
                                <span style={{
                                    background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                                    color: '#1c1917', fontSize: '0.7rem', fontWeight: 800,
                                    padding: '3px 10px', borderRadius: 20,
                                    textTransform: 'uppercase', letterSpacing: 1,
                                    display: 'inline-block', marginBottom: '0.4rem'
                                }}>
                                    ⭐ Administrator
                                </span>
                                <h1 style={{ color: 'white', fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
                                    {greeting}, {user.name.split(' ')[0]}!
                                </h1>
                                <div className="user-tags" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.6rem' }}>
                                    <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                        <Shield size={14} /> {user.id}
                                    </span>
                                    {user.email && (
                                        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                            <Mail size={14} /> {user.email}
                                        </span>
                                    )}
                                    <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                        <Calendar size={14} /> School Management Portal
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
                        <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>Quick Actions</h2>
                        <p style={{ margin: '0.2rem 0 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Manage all school operations from here</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '0.5rem 1rem' }}>
                        <Activity size={14} color="var(--text-muted)" />
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{menuItems.length} Modules</span>
                    </div>
                </div>

                {/* Menu Grid */}
                <div className="menu-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                    {menuItems.map((item, index) => (
                        <Link key={item.to} to={item.to} style={{ textDecoration: 'none' }}>
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
                                        {item.badge !== undefined && (
                                            <span style={{
                                                background: 'var(--background)', color: 'var(--text-muted)',
                                                fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px',
                                                borderRadius: 20, border: '1px solid var(--border)', flexShrink: 0
                                            }}>{item.badge}</span>
                                        )}
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
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Award size={18} color="white" />
                        </div>
                        <div>
                            <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>KGS School Management System</p>
                            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>Admin Panel v2.0 — All systems operational</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
                        <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>System Online</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

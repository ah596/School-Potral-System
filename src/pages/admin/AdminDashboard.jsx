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
    Shield,
    Calendar,
    Clock
} from 'lucide-react';

export default function AdminDashboard() {
    const { user, loading: authLoading } = useAuth();
    const [stats, setStats] = useState({ teachers: 0, students: 0, notices: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [teachers, students, notices] = await Promise.all([
                    api.getTeachers(),
                    api.getStudents(),
                    api.getNotices()
                ]);
                setStats({
                    teachers: teachers.length,
                    students: students.length,
                    notices: notices.length
                });
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            }
        };
        // Only fetch if auth is loaded and user is admin
        if (!authLoading && user?.role === 'admin') {
            fetchStats();
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

    const menuItems = [
        { to: '/admin/classes', label: 'Manage Classes', icon: BookOpen, color: 'linear-gradient(135deg, #06b6d4, #22d3ee)', desc: 'Create and manage classes' },
        { to: '/admin/teachers', label: 'Manage Teachers', icon: Users, color: 'linear-gradient(135deg, #3b82f6, #60a5fa)', desc: 'Add, edit, assign classes' },
        { to: '/admin/students', label: 'Manage Students', icon: GraduationCap, color: 'linear-gradient(135deg, #10b981, #34d399)', desc: 'Add, edit student records' },
        { to: '/admin/teacher-attendance', label: 'Teacher Attendance', icon: Clock, color: 'linear-gradient(135deg, #f97316, #fb923c)', desc: 'Mark teacher attendance' },
        { to: '/admin/student-access', label: 'Student Access Control', icon: Users, color: 'linear-gradient(135deg, #ec4899, #f472b6)', desc: 'Lock/unlock student sections' },
        { to: '/admin/teacher-access', label: 'Teacher Access Control', icon: Users, color: 'linear-gradient(135deg, #8b5cf6, #a78bfa)', desc: 'Lock/unlock teacher sections' },
        { to: '/admin/notices', label: 'Notice Board', icon: Bell, color: 'linear-gradient(135deg, #ef4444, #f87171)', desc: 'Post announcements' },
        { to: '/admin/fees', label: 'Student Fees', icon: DollarSign, color: 'linear-gradient(135deg, #10b981, #34d399)', desc: 'Manage fees & challans' },
        { to: '/admin/payments', label: 'Teacher Payments', icon: DollarSign, color: 'linear-gradient(135deg, #f59e0b, #fbbf24)', desc: 'Manage salaries' },
        { to: '/admin/reports', label: 'Reports', icon: BarChart3, color: 'linear-gradient(135deg, #06b6d4, #22d3ee)', desc: 'View analytics' },
    ];

    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>
            <style>{`
                @media (max-width: 768px) {
                    .admin-extra-info { display: none !important; }
                    .admin-sync-card { display: none !important; }
                    .admin-header-flex { gap: 1rem !important; flex-wrap: wrap !important; }
                    .admin-profile-section { flex: 1; display: flex !important; align-items: center !important; gap: 1rem !important; width: 100% !important; }
                    .admin-avatar { width: 80px !important; height: 80px !important; }
                    .admin-welcome-text { fontSize: 1.25rem !important; line-height: 1.2 !important; margin-bottom: 0.25rem !important; }
                    .admin-id-badge { display: flex !important; font-size: 0.85rem !important; opacity: 0.9 !important; }
                    .admin-stats-flex { width: 100%; justify-content: space-between; margin-top: 0.5rem; }
                    .admin-stat-card { flex: 1; padding: 0.75rem !important; min-width: 80px; }
                    .admin-stat-card p:first-child { font-size: 1.5rem !important; }
                    .admin-stat-card p:last-child { font-size: 0.75rem !important; }
                }
            `}</style>

            {/* Admin Profile Info Box */}
            <div className="card" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', color: 'white' }}>
                <div className="admin-header-flex" style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'center' }}>
                    {/* Profile Section (Avatar + Name/ID) */}
                    <div className="admin-profile-section" style={{ display: 'flex', alignItems: 'center', gap: '2rem', flex: 1 }}>
                        {/* Avatar */}
                        <div className="admin-avatar" style={{
                            width: '100px',
                            height: '100px',
                            borderRadius: '24px',
                            background: 'rgba(255,255,255,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '4px solid rgba(255,255,255,0.3)',
                            overflow: 'hidden',
                            flexShrink: 0
                        }}>
                            {user.photo ? (
                                <img
                                    src={user.photo}
                                    alt="Profile"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            ) : (
                                <Shield size={40} />
                            )}
                        </div>

                        {/* Info */}
                        <div className="admin-profile-info" style={{ flex: 1 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                <h2 className="admin-welcome-text" style={{ margin: 0, fontSize: '1.75rem', fontWeight: '800' }}>Welcome, {user.name}!</h2>
                                <div className="admin-id-badge" style={{ display: 'none', alignItems: 'center', gap: '0.5rem' }}>
                                    <BookOpen size={16} />
                                    <span style={{ fontWeight: '600' }}>ID: {user.id}</span>
                                </div>
                                <span className="admin-extra-info" style={{ background: 'rgba(255,255,255,0.2)', padding: '0.2rem 0.6rem', borderRadius: '10px', fontSize: '0.8rem', width: 'fit-content', marginTop: '0.5rem' }}>
                                    Administrator
                                </span>
                            </div>
                            <p className="admin-extra-info" style={{ margin: '0.5rem 0', opacity: 0.9 }}>School Management Portal</p>
                            <div className="admin-extra-info" style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginTop: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <BookOpen size={18} />
                                    <span>ID: {user.id}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Mail size={18} />
                                    <span>{user.email || `${user.id.toLowerCase()}@school.com`}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Calendar size={18} />
                                    <span>Since 2018</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="admin-stats-flex" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <div className="admin-stat-card" style={{ textAlign: 'center', background: 'rgba(255,255,255,0.15)', padding: '1rem 1.5rem', borderRadius: '12px' }}>
                            <p style={{ margin: 0, fontSize: '2rem', fontWeight: '800' }}>{stats.teachers}</p>
                            <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.9 }}>Teachers</p>
                        </div>
                        <div className="admin-stat-card" style={{ textAlign: 'center', background: 'rgba(255,255,255,0.15)', padding: '1rem 1.5rem', borderRadius: '12px' }}>
                            <p style={{ margin: 0, fontSize: '2rem', fontWeight: '800' }}>{stats.students}</p>
                            <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.9 }}>Students</p>
                        </div>
                        <div className="admin-stat-card" style={{ textAlign: 'center', background: 'rgba(255,255,255,0.15)', padding: '1rem 1.5rem', borderRadius: '12px' }}>
                            <p style={{ margin: 0, fontSize: '2rem', fontWeight: '800' }}>{stats.notices}</p>
                            <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.9 }}>Notices</p>
                        </div>
                    </div>
                </div>

                {/* Sync Button */}
                <div className="admin-sync-card" style={{ marginTop: '1.5rem', width: '100%', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '1.5rem' }}>
                    <button className="btn"
                        style={{ background: 'rgba(255,255,255,0.2)', color: 'white', width: '100%', border: 'none' }}
                        onClick={async () => {
                            const btn = document.activeElement;
                            const originalText = btn.innerText;
                            btn.innerText = "Syncing...";
                            try {
                                const res = await api.syncUsersToAuth();
                                alert(`Sync Complete!\n\nSuccess: ${res.created} new accounts created.\nExisting/Skipped: ${res.errors}`);
                            } catch (e) {
                                alert("Sync Failed: " + e.message);
                            }
                            btn.innerText = originalText;
                        }}
                    >
                        Sync All Logins to Firebase Auth
                    </button>
                </div>
            </div>

            {/* Menu Grid */}
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: '700' }}>Admin Panel</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {menuItems.map((item) => (
                    <Link key={item.to} to={item.to} style={{ textDecoration: 'none' }}>
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
                                background: item.color,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                            }}>
                                <item.icon size={28} color="white" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)' }}>{item.label}</h4>
                                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{item.desc}</p>
                            </div>
                            <ChevronRight size={20} color="var(--text-muted)" />
                        </div>
                    </Link>
                ))}
            </div>
        </div >
    );
}

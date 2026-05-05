import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { api } from '../../utils/api';
import {
    Users,
    GraduationCap,
    Shield,
    ShieldCheck,
    Settings,
    Database,
    BarChart3,
    ChevronRight,
    Search,
    UserPlus,
    Activity
} from 'lucide-react';

export default function SuperAdminDashboard() {
    const { user, loading: authLoading } = useAuth();
    const [stats, setStats] = useState({ teachers: 0, students: 0, admins: 0, logs: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [teachers, students, admins, logs] = await Promise.all([
                    api.getTeachers(),
                    api.getStudents(),
                    api.getAdmins(),
                    api.getLogs()
                ]);
                setStats({
                    teachers: teachers.length,
                    students: students.length,
                    admins: admins.length,
                    logs: logs.length
                });
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            }
        };
        if (!authLoading && user?.role === 'super_admin') {
            fetchStats();
        }
    }, [authLoading, user]);

    if (authLoading) return <div className="container"><h2>Loading...</h2></div>;
    if (!user || user.role !== 'super_admin') return <Navigate to="/login" replace />;

    const menuItems = [
        { to: '/super-admin/manage-admins', label: 'Manage All Admins', icon: ShieldCheck, color: 'linear-gradient(135deg, #6366f1, #8b5cf6)', desc: 'Control permissions, monitor activity, and update admin accounts' },
        { to: '/admin/students', label: 'Manage Students', icon: GraduationCap, color: 'linear-gradient(135deg, #10b981, #34d399)', desc: 'View, activate/deactivate, and oversee all student profiles' },
        { to: '/admin/teachers', label: 'Manage Teachers', icon: Users, color: 'linear-gradient(135deg, #3b82f6, #60a5fa)', desc: 'Assign roles, monitor content, and control faculty access' },
        { to: '/admin/migrate', label: 'Start System Migration', icon: Database, color: 'linear-gradient(135deg, #ef4444, #f87171)', desc: 'Manage upgrades, data transitions, and version control' },
        { to: '/admin/reports', label: 'Global Analytics', icon: BarChart3, color: 'linear-gradient(135deg, #06b6d4, #22d3ee)', desc: 'System-wide statistics, user activity, and performance insights' },
    ];

    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>
            {/* Header & Stats Section */}
            <div className="card" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', color: 'white', borderRadius: '24px', overflow: 'hidden' }}>
                <div style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,0.2)' }}>
                            <Shield size={40} color="#fcd34d" />
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: '800' }}>Super Admin Authority</h2>
                            <p style={{ margin: '0.25rem 0 0 0', opacity: 0.8, fontSize: '1.1rem' }}>Centralized Oversight & System Governance</p>
                        </div>
                        <div style={{ marginLeft: 'auto', background: '#fcd34d', color: '#1e1b4b', padding: '0.5rem 1.25rem', borderRadius: '20px', fontWeight: '900', fontSize: '0.9rem', letterSpacing: '1px' }}>
                            ROOT ACCESS
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem' }}>
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <ShieldCheck size={20} color="#8b5cf6" />
                                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#8b5cf6' }}>ACTIVE</span>
                            </div>
                            <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>{stats.admins}</p>
                            <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.7 }}>Administrators</p>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <GraduationCap size={20} color="#34d399" />
                                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#34d399' }}>ENROLLED</span>
                            </div>
                            <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>{stats.students}</p>
                            <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.7 }}>Total Students</p>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <Users size={20} color="#61a8fb" />
                                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#61a8fb' }}>FACULTY</span>
                            </div>
                            <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>{stats.teachers}</p>
                            <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.7 }}>Teacher Team</p>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <Activity size={20} color="#f87171" />
                                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#f87171' }}>EVENTS</span>
                            </div>
                            <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>{stats.logs}</p>
                            <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.7 }}>Audit Logs</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Management Grid */}
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: '700' }}>Control Cards</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {menuItems.map((item, i) => (
                    <Link key={i} to={item.to} style={{ textDecoration: 'none' }}>
                        <div className="card" style={{
                            padding: '1.75rem',
                            display: 'flex',
                            gap: '1.5rem',
                            alignItems: 'center',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            border: '1px solid var(--border)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-5px)';
                                e.currentTarget.style.boxShadow = '0 15px 30px rgba(0,0,0,0.1)';
                                e.currentTarget.style.borderColor = 'var(--primary)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                                e.currentTarget.style.borderColor = 'var(--border)';
                            }}>
                            <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(0,0,0,0.15)', flexShrink: 0 }}>
                                <item.icon size={32} color="white" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <h4 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-main)', fontWeight: '800' }}>{item.label}</h4>
                                <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{item.desc}</p>
                            </div>
                            <ChevronRight size={20} color="var(--text-muted)" />
                        </div>
                    </Link>
                ))}
            </div>

            {/* Quick System Actions */}
            <div style={{ marginTop: '3rem', padding: '2rem', background: 'var(--surface)', borderRadius: '20px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800' }}>System Emergency Actions</h3>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <span style={{ height: '8px', width: '8px', borderRadius: '50%', background: '#10b981' }}></span>
                        <span style={{ height: '8px', width: '8px', borderRadius: '50%', background: '#f59e0b' }}></span>
                        <span style={{ height: '8px', width: '8px', borderRadius: '50%', background: '#ef4444' }}></span>
                    </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                    <Link to="/super-admin/manage-admins" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center', padding: '1.1rem', borderRadius: '14px', fontWeight: '700' }}>
                        <UserPlus size={20} /> Deploy New Administrator
                    </Link>
                    <Link to="/admin/migrate" className="btn" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center', padding: '1.1rem', border: '1px solid var(--border)', borderRadius: '14px', fontWeight: '700' }}>
                        <Activity size={20} /> System Health Check
                    </Link>
                    <button onClick={() => window.location.reload()} className="btn" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center', padding: '1.1rem', border: '1px solid var(--border)', borderRadius: '14px', fontWeight: '700' }}>
                        <Settings size={20} /> Refresh System Core
                    </button>
                </div>
            </div>
        </div>
    );
}

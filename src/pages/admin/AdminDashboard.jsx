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
    const { user } = useAuth();
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
        fetchStats();
    }, []);

    if (!user || user.role !== 'admin') {
        return <Navigate to="/login" />;
    }

    const menuItems = [
        { to: '/admin/classes', label: 'Manage Classes', icon: BookOpen, color: 'linear-gradient(135deg, #06b6d4, #22d3ee)', desc: 'Create and manage classes' },
        { to: '/admin/teachers', label: 'Manage Teachers', icon: Users, color: 'linear-gradient(135deg, #3b82f6, #60a5fa)', desc: 'Add, edit, assign classes' },
        { to: '/admin/students', label: 'Manage Students', icon: GraduationCap, color: 'linear-gradient(135deg, #10b981, #34d399)', desc: 'Add, edit student records' },
        { to: '/admin/teacher-attendance', label: 'Teacher Attendance', icon: Clock, color: 'linear-gradient(135deg, #f97316, #fb923c)', desc: 'Mark teacher attendance' },
        { to: '/admin/student-access', label: 'Student Access Control', icon: Users, color: 'linear-gradient(135deg, #ec4899, #f472b6)', desc: 'Lock/unlock student sections' },
        { to: '/admin/teacher-access', label: 'Teacher Access Control', icon: Users, color: 'linear-gradient(135deg, #8b5cf6, #a78bfa)', desc: 'Lock/unlock teacher sections' },
        { to: '/admin/notices', label: 'Notice Board', icon: Bell, color: 'linear-gradient(135deg, #ef4444, #f87171)', desc: 'Post announcements' },
        { to: '/admin/payments', label: 'Teacher Payments', icon: DollarSign, color: 'linear-gradient(135deg, #f59e0b, #fbbf24)', desc: 'Manage salaries' },
        { to: '/admin/reports', label: 'Reports', icon: BarChart3, color: 'linear-gradient(135deg, #06b6d4, #22d3ee)', desc: 'View analytics' },
    ];

    return (
        <div className="container" style={{ padding: '2rem 0' }}>
            {/* Admin Profile Info Box */}
            <div className="card" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', color: 'white' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'center' }}>
                    {/* Avatar */}
                    <div style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '24px',
                        background: 'rgba(255,255,255,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '4px solid rgba(255,255,255,0.3)'
                    }}>
                        <Shield size={48} />
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                            <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '800' }}>Welcome, {user.name}!</h2>
                            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem' }}>
                                Administrator
                            </span>
                        </div>
                        <p style={{ margin: '0.5rem 0', opacity: 0.9 }}>School Management Portal</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginTop: '1rem' }}>
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

                    {/* Stats */}
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.15)', padding: '1rem 1.5rem', borderRadius: '12px' }}>
                            <p style={{ margin: 0, fontSize: '2rem', fontWeight: '800' }}>{stats.teachers}</p>
                            <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.9 }}>Teachers</p>
                        </div>
                        <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.15)', padding: '1rem 1.5rem', borderRadius: '12px' }}>
                            <p style={{ margin: 0, fontSize: '2rem', fontWeight: '800' }}>{stats.students}</p>
                            <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.9 }}>Students</p>
                        </div>
                        <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.15)', padding: '1rem 1.5rem', borderRadius: '12px' }}>
                            <p style={{ margin: 0, fontSize: '2rem', fontWeight: '800' }}>{stats.notices}</p>
                            <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.9 }}>Notices</p>
                        </div>
                    </div>
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
        </div>
    );
}

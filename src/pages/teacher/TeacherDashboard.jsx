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
    Clock
} from 'lucide-react';

export default function TeacherDashboard() {
    const { user } = useAuth();
    const [myAttendance, setMyAttendance] = useState([]);

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                const data = await api.getAttendance(user.id);
                setMyAttendance(data);
            } catch (error) {
                console.error('Failed to fetch attendance:', error);
            }
        };

        if (user?.id) {
            fetchAttendance();
        }
    }, [user]);

    if (!user || user.role !== 'teacher') {
        return <Navigate to="/login" />;
    }

    const menuItems = [
        { to: '/teacher/attendance', label: 'Mark Attendance', icon: ClipboardCheck, color: '#10b981', desc: 'Mark student attendance' },
        { to: '/teacher/marks', label: 'Upload Marks', icon: FileText, color: '#3b82f6', desc: 'Upload student marks' },
        { to: '/teacher/tests', label: 'Test Management', icon: BookOpen, color: '#f59e0b', desc: 'Create and manage tests' },
        { to: '/teacher/assignments', label: 'Assignments', icon: BookOpen, color: '#8b5cf6', desc: 'Manage assignments' },
        { to: '/teacher/students', label: 'View Students', icon: Users, color: '#f97316', desc: 'View student list' },
    ];

    // Calculate attendance stats
    const presentDays = myAttendance.filter(a => a.status === 'present').length;
    const absentDays = myAttendance.filter(a => a.status === 'absent').length;
    const totalDays = myAttendance.length;
    const attendancePercentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 0;

    return (
        <div className="container" style={{ padding: '2rem 0' }}>
            {/* Teacher Profile Info Box */}
            <div className="card" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'center' }}>
                    {/* Avatar */}
                    <div style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2.5rem',
                        fontWeight: 'bold',
                        border: '4px solid rgba(255,255,255,0.3)'
                    }}>
                        {user.name.charAt(0)}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '800' }}>Welcome, {user.name}!</h2>
                        <p style={{ margin: '0.5rem 0', opacity: 0.9 }}>{user.subject} Teacher</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginTop: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FileText size={18} />
                                <span>ID: {user.id}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Mail size={18} />
                                <span>{user.email || `${user.id.toLowerCase()}@school.com`}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Users size={18} />
                                <span>Classes: {(user.classes || []).join(', ')}</span>
                            </div>
                        </div>
                    </div>

                    {/* Attendance Stats */}
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.15)', padding: '1rem 1.5rem', borderRadius: '12px' }}>
                            <p style={{ margin: 0, fontSize: '2rem', fontWeight: '800' }}>{presentDays}</p>
                            <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.9 }}>Present</p>
                        </div>
                        <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.15)', padding: '1rem 1.5rem', borderRadius: '12px' }}>
                            <p style={{ margin: 0, fontSize: '2rem', fontWeight: '800' }}>{absentDays}</p>
                            <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.9 }}>Absent</p>
                        </div>
                        <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.15)', padding: '1rem 1.5rem', borderRadius: '12px' }}>
                            <p style={{ margin: 0, fontSize: '2rem', fontWeight: '800' }}>{attendancePercentage}%</p>
                            <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.9 }}>Attendance</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* My Attendance History */}
            {myAttendance.length > 0 && (
                <div className="card" style={{ marginBottom: '2rem' }}>
                    <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Calendar size={24} color="var(--primary)" />
                        My Attendance (Marked by Admin)
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                        {myAttendance.slice(-14).map((record, index) => (
                            <div key={index} style={{
                                padding: '0.75rem 1rem',
                                borderRadius: 'var(--radius)',
                                background: record.status === 'present' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                border: `1px solid ${record.status === 'present' ? '#10b981' : '#ef4444'}`,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                {record.status === 'present' ? (
                                    <CheckCircle size={18} color="#10b981" />
                                ) : (
                                    <XCircle size={18} color="#ef4444" />
                                )}
                                <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{record.date}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

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
                                color: item.color
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

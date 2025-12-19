import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { useNavigate, Navigate } from 'react-router-dom';
import {
    Calendar,
    CheckCircle,
    XCircle,
    ChevronRight,
    Clock,
    AlertCircle,
    BarChart3,
    ArrowLeft
} from 'lucide-react';
import LoadingScreen from '../../components/LoadingScreen';

export default function TeacherMyAttendance() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAttendance = async () => {
            if (user?.id) {
                try {
                    const data = await api.getAttendance(user.id);
                    // Sort by date descending
                    const sortedData = data.sort((a, b) => new Date(b.date) - new Date(a.date));
                    setAttendance(sortedData);
                } catch (error) {
                    console.error('Failed to fetch attendance:', error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchAttendance();
    }, [user]);

    if (!user || user.role !== 'teacher') {
        return <Navigate to="/login" />;
    }

    if (loading) return <LoadingScreen message="Loading attendance record..." />;

    // Group attendance by month
    const groupedAttendance = attendance.reduce((acc, record) => {
        const date = new Date(record.date);
        const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
        if (!acc[monthYear]) {
            acc[monthYear] = [];
        }
        acc[monthYear].push(record);
        return acc;
    }, {});

    const stats = {
        present: attendance.filter(a => a.status === 'present').length,
        absent: attendance.filter(a => a.status === 'absent').length,
        total: attendance.length,
        percentage: attendance.length > 0 ? ((attendance.filter(a => a.status === 'present').length / attendance.length) * 100).toFixed(1) : 0
    };

    return (
        <div className="container" style={{ padding: '0 clamp(1rem, 5vw, 2.5rem) clamp(1rem, 3vw, 2.5rem)', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ padding: '1.5rem 0', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
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
                    <h2 className="page-title" style={{ fontSize: 'clamp(1.5rem, 5vw, 2.25rem)', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
                        My Attendance
                    </h2>
                </div>
            </div>

            {/* Stats Overview */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.5rem',
                marginBottom: '3rem'
            }}>
                <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid #10b981', background: 'rgba(16, 185, 129, 0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '600' }}>Present Days</p>
                            <h2 style={{ margin: '0.5rem 0 0 0', fontSize: '2rem', fontWeight: '800', color: '#10b981' }}>{stats.present}</h2>
                        </div>
                        <CheckCircle size={32} color="#10b981" opacity={0.5} />
                    </div>
                </div>
                <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid #ef4444', background: 'rgba(239, 68, 68, 0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '600' }}>Absent Days</p>
                            <h2 style={{ margin: '0.5rem 0 0 0', fontSize: '2rem', fontWeight: '800', color: '#ef4444' }}>{stats.absent}</h2>
                        </div>
                        <XCircle size={32} color="#ef4444" opacity={0.5} />
                    </div>
                </div>
                <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid #6366f1', background: 'rgba(99, 102, 241, 0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '600' }}>Attendance Rate</p>
                            <h2 style={{ margin: '0.5rem 0 0 0', fontSize: '2rem', fontWeight: '800', color: '#6366f1' }}>{stats.percentage}%</h2>
                        </div>
                        <BarChart3 size={32} color="#6366f1" opacity={0.5} />
                    </div>
                </div>
            </div>

            {/* Attendance Record Month-wise */}
            {Object.keys(groupedAttendance).length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {Object.entries(groupedAttendance).map(([month, records], idx) => (
                        <div key={idx} className="card" style={{ overflow: 'hidden' }}>
                            <div style={{
                                padding: '1.25rem 1.5rem',
                                background: 'rgba(var(--primary-rgb), 0.05)',
                                borderBottom: '1px solid var(--border)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem'
                            }}>
                                <Calendar size={20} color="var(--primary)" />
                                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700' }}>{month}</h3>
                                <span style={{ marginLeft: 'auto', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                                    {records.length} Records
                                </span>
                            </div>
                            <div style={{ padding: '1.5rem' }}>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                                    gap: '1rem'
                                }}>
                                    {records.map((record, rIdx) => (
                                        <div key={rIdx} style={{
                                            padding: '1rem',
                                            borderRadius: '12px',
                                            background: record.status === 'present' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                                            border: `1px solid ${record.status === 'present' ? '#10b98140' : '#ef444440'}`,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '0.5rem',
                                            position: 'relative',
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{
                                                position: 'absolute',
                                                top: '-10px',
                                                right: '-10px',
                                                opacity: 0.1
                                            }}>
                                                {record.status === 'present' ? <CheckCircle size={48} color="#10b981" /> : <XCircle size={48} color="#ef4444" />}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                {record.status === 'present' ? (
                                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
                                                ) : (
                                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }}></div>
                                                )}
                                                <span style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)' }}>{new Date(record.date).getDate()}</span>
                                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{new Date(record.date).toLocaleDateString('default', { weekday: 'short' })}</span>
                                            </div>
                                            <div style={{ fontSize: '0.8rem', fontWeight: '600', color: record.status === 'present' ? '#059669' : '#dc2626', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                {record.status === 'present' ? 'Present' : 'Absent'}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                                <Clock size={12} />
                                                <span>{record.time || '09:00 AM'}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                    <AlertCircle size={48} color="var(--text-muted)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <h3 style={{ color: 'var(--text-muted)' }}>No attendance records found.</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Contact your administrator if you believe this is an error.</p>
                </div>
            )}
        </div>
    );
}

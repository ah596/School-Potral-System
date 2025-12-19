import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { api } from '../../utils/api';
import {
    Users, GraduationCap, Activity, Trash2, UserPlus,
    Calendar, TrendingUp, PieChart, Clock, Filter, FileText, ArrowLeft
} from 'lucide-react';
import LoadingScreen from '../../components/LoadingScreen';

export default function AdminReports() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL'); // ALL, DELETE, MONTH

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [sData, tData, lData] = await Promise.all([
                    api.getStudents(),
                    api.getTeachers(),
                    api.getLogs()
                ]);

                // Sort logs client-side by timestamp descending
                const sortedLogs = lData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

                setStudents(sData);
                setTeachers(tData);
                setLogs(sortedLogs);
            } catch (error) {
                console.error("Failed to load analytics data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleDeleteLog = async (id) => {
        if (!window.confirm('Are you sure you want to remove this record from history?')) return;
        try {
            await api.deleteLog(id);
            setLogs(logs.filter(log => log.id !== id));
        } catch (error) {
            console.error("Failed to delete log:", error);
            alert("Failed to delete log");
        }
    };

    if (!user || user.role !== 'admin') {
        return <Navigate to="/login" />;
    }

    if (loading) return <LoadingScreen message="Analyzing School Data..." />;

    // Analytics Calculations
    const totalUsers = students.length + teachers.length;
    const studentRatio = totalUsers > 0 ? (students.length / totalUsers) * 100 : 0;

    const filteredLogs = logs.filter(log => {
        if (filter === 'ALL') return true;
        if (filter === 'DELETE') return log.action.startsWith('DELETE');
        if (filter === 'MONTH') {
            const logDate = new Date(log.timestamp);
            const now = new Date();
            return logDate.getMonth() === now.getMonth() && logDate.getFullYear() === now.getFullYear();
        }
        return true;
    });

    const stats = [
        { label: 'Total Enrolled Students', value: students.length, icon: GraduationCap, color: '#10b981', trend: '+2% from last month' },
        { label: 'Active Teachers', value: teachers.length, icon: Users, color: '#3b82f6', trend: 'Stable' },
        { label: 'Platform Activities', value: logs.length, icon: Activity, color: '#8b5cf6', trend: 'Audit Log System' },
        { label: 'Platform Ratio', value: `${Math.round(studentRatio)}%`, icon: PieChart, color: '#f59e0b', trend: 'Student/Teacher mix' },
    ];

    const getActionBadge = (action) => {
        if (action.startsWith('ADD')) {
            return { color: '#10b981', icon: <UserPlus size={14} />, text: 'New Record' };
        }
        if (action.startsWith('DELETE')) {
            return { color: '#ef4444', icon: <Trash2 size={14} />, text: 'Record Removed' };
        }
        return { color: '#64748b', icon: <Clock size={14} />, text: 'Update' };
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
                    <div>
                        <h1 style={{ fontSize: 'clamp(1.75rem, 5vw, 2.5rem)', fontWeight: '800', margin: 0, color: 'var(--text)' }}>
                            Reports & Analytics
                        </h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', margin: 0 }}>
                            School enrollment life-cycles & engagement
                        </p>
                    </div>
                </div>
            </div>

            {/* Premium Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                {stats.map((stat, index) => (
                    <div key={index} className="card" style={{
                        border: 'none',
                        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            position: 'absolute', top: '-20px', right: '-20px',
                            width: '100px', height: '100px', background: `${stat.color}10`,
                            borderRadius: '50%', zIndex: 0
                        }}></div>

                        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                            <div style={{
                                width: '60px', height: '60px', background: `${stat.color}20`,
                                borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                <stat.icon size={28} color={stat.color} />
                            </div>
                            <div>
                                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '600' }}>{stat.label}</p>
                                <h3 style={{ margin: '0.25rem 0', fontSize: '2.25rem', fontWeight: '840' }}>{stat.value}</h3>
                                <p style={{ margin: 0, color: stat.color, fontSize: '0.75rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <TrendingUp size={12} /> {stat.trend}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
                {/* Audit Timeline */}
                <div className="card" style={{ border: '2px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Clock size={24} color="var(--primary)" />
                            <h3 style={{ margin: 0, fontWeight: '700' }}>Timeline</h3>
                        </div>

                        <div style={{ display: 'flex', background: 'var(--background)', padding: '0.25rem', borderRadius: '10px' }}>
                            {['ALL', 'DELETE', 'MONTH'].map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => setFilter(opt)}
                                    style={{
                                        padding: '0.5rem 1rem', border: 'none', borderRadius: '8px',
                                        fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer',
                                        background: filter === opt ? 'var(--primary)' : 'transparent',
                                        color: filter === opt ? 'white' : 'var(--text-muted)',
                                        transition: 'all 0.2s'
                                    }}
                                >{opt}</button>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {filteredLogs.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                                <FileText size={48} color="var(--border)" style={{ marginBottom: '1rem' }} />
                                <p style={{ color: 'var(--text-muted)' }}>No records found for the selected filter.</p>
                            </div>
                        ) : (
                            filteredLogs.map((log, idx) => {
                                const badge = getActionBadge(log.action);
                                return (
                                    <div key={log.id} style={{
                                        display: 'flex', gap: '1.25rem', paddingBottom: idx === filteredLogs.length - 1 ? 0 : '1.25rem',
                                        borderBottom: idx === filteredLogs.length - 1 ? 'none' : '1px dashed var(--border)',
                                        position: 'relative'
                                    }}>
                                        <div style={{
                                            width: '40px', height: '40px', background: `${badge.color}15`,
                                            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            flexShrink: 0
                                        }}>
                                            {badge.icon}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                                <span style={{
                                                    fontSize: '0.75rem', fontWeight: '800', color: badge.color,
                                                    textTransform: 'uppercase', letterSpacing: '0.5px'
                                                }}>{badge.text}</span>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                    {new Date(log.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <p style={{ margin: 0, fontWeight: '600', color: 'var(--text)' }}>{log.targetName}</p>
                                                <button
                                                    onClick={() => handleDeleteLog(log.id)}
                                                    style={{
                                                        width: '40px', height: '40px',
                                                        borderRadius: '50%', border: 'none',
                                                        background: 'rgba(239, 68, 68, 0.1)',
                                                        color: '#ef4444', cursor: 'pointer',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        transition: 'all 0.2s',
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.background = '#ef4444';
                                                        e.currentTarget.style.color = 'white';
                                                        e.currentTarget.style.transform = 'scale(1.1)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                                                        e.currentTarget.style.color = '#ef4444';
                                                        e.currentTarget.style.transform = 'scale(1)';
                                                    }}
                                                    title="Delete record from history"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                            <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{log.details}</p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Grade & Distribution Insight */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="card" style={{ border: '2px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <PieChart size={24} color="var(--primary)" />
                            <h3 style={{ margin: 0, fontWeight: '700' }}>Enrolled Students</h3>
                        </div>

                        <div style={{ borderLeft: '3px solid var(--primary)', paddingLeft: '1.5rem' }}>
                            <h4 style={{ fontSize: '2.5rem', fontWeight: '850', margin: 0 }}>{students.length}</h4>
                            <p style={{ color: 'var(--text-muted)', margin: 0 }}>Total students across all class grades</p>
                        </div>

                        <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {['High Performance', 'Regular Attendance', 'Fee Clearance'].map((label, i) => (
                                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '40px', height: '8px', background: ['#10b981', '#3b82f6', '#f59e0b'][i], borderRadius: '4px' }} />
                                    <span style={{ fontSize: '0.9rem', fontWeight: '600', flex: 1 }}>{label}</span>
                                    <span style={{ fontWeight: '700' }}>{70 + (i * 10)}%</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card" style={{ background: 'var(--primary)', color: 'white' }}>
                        <h3 style={{ margin: '0 0 1rem 0' }}>Operational Export</h3>
                        <p style={{ opacity: 0.9, fontSize: '0.9rem', marginBottom: '1.5rem' }}>Generate PDF or Excel reports of all portal activities for government or internal compliance.</p>
                        <button className="btn" style={{ background: 'white', color: 'var(--primary)', width: '100%', fontWeight: '700' }}>
                            Download Full Report
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

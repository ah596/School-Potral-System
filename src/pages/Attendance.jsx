import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { api } from '../utils/api';
import { CheckCircle, XCircle, Clock, Calendar, ArrowLeft, TrendingUp, Award, AlertCircle } from 'lucide-react';
import LoadingScreen from '../components/LoadingScreen';
import FeatureLocked from '../components/FeatureLocked';

export default function Attendance() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewingStatus, setViewingStatus] = useState(null);

    useEffect(() => {
        const fetchAttendance = async () => {
            if (user?.id) {
                try {
                    const data = await api.getAttendance(user.id);
                    setAttendanceRecords(data.sort((a, b) => new Date(b.date) - new Date(a.date)));
                } catch (error) {
                    console.error('Failed to fetch attendance:', error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchAttendance();
    }, [user]);

    if (!user) return <Navigate to="/login" />;

    const studentLocks = JSON.parse(localStorage.getItem('admin_student_locks') || '{}');
    if (studentLocks[`${user.id}_attendance`]) return <FeatureLocked featureName="Attendance" />;
    if (loading) return <LoadingScreen message="Loading attendance records..." />;

    const totalRecords = attendanceRecords.length;
    const presentRecords = attendanceRecords.filter(r => r.status === 'present').length;
    const absentRecords = totalRecords - presentRecords;
    const attendancePercentage = totalRecords > 0 ? ((presentRecords / totalRecords) * 100).toFixed(1) : 0;

    const groupedByMonth = attendanceRecords.reduce((acc, record) => {
        const date = new Date(record.date);
        const key = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
        if (!acc[key]) acc[key] = { month: key, total: 0, present: 0, percentage: 0 };
        acc[key].total += 1;
        if (record.status === 'present') acc[key].present += 1;
        acc[key].percentage = ((acc[key].present / acc[key].total) * 100).toFixed(0);
        return acc;
    }, {});
    const monthlyData = Object.values(groupedByMonth);

    const subjectWise = attendanceRecords.reduce((acc, record) => {
        const subject = record.subject || 'School Days';
        if (!acc[subject]) acc[subject] = { subject, total: 0, present: 0, percentage: 0 };
        acc[subject].total += 1;
        if (record.status === 'present') acc[subject].present += 1;
        acc[subject].percentage = ((acc[subject].present / acc[subject].total) * 100).toFixed(0);
        return acc;
    }, {});
    const subjectData = Object.values(subjectWise);

    const getStatusColor = (pct) => pct >= 90 ? '#10b981' : pct >= 75 ? '#f59e0b' : '#ef4444';
    const getStatusText = (pct) => pct >= 90 ? 'Excellent' : pct >= 75 ? 'Good' : 'Poor';

    return (
        <div className="att-root">
            <style>{`
                @keyframes pop { 0%{transform:scale(0.95);opacity:0} 100%{transform:scale(1);opacity:1} }
                .att-modal { animation: pop 0.3s ease-out; }

                /* ── DESKTOP (default) ── */
                .att-root { padding: 0; }

                /* desktop header */
                .att-desktop-header { display: block; padding: 1.5rem 0; margin-bottom: 1.5rem; }
                .att-mobile-hero   { display: none; }

                /* desktop stat cards */
                .att-desktop-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
                .att-mobile-stats  { display: none; }

                /* mobile progress bar — hidden */
                .att-desktop-progress { display: none; }

                /* tables vs mobile cards */
                .att-desktop-table  { display: block; }
                .att-mobile-cards   { display: none; }

                /* ── MOBILE ── */
                @media (max-width: 768px) {
                    .att-desktop-header  { display: none; }
                    .att-mobile-hero     { display: block; }

                    .att-desktop-stats   { display: none; }
                    .att-mobile-stats    { display: grid; }

                    .att-desktop-progress { display: none; }

                    .att-desktop-table   { display: none; }
                    .att-mobile-cards    { display: flex; }

                    .card { padding: 1rem !important; }
                }
            `}</style>

            {/* ════════════ DESKTOP HEADER ════════════ */}
            <div className="att-desktop-header container" style={{ maxWidth: 1400, margin: '0 auto', padding: '1.5rem clamp(1rem,5vw,2.5rem)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <button
                        onClick={() => navigate(-1)}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 45, height: 45, borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--primary)', cursor: 'pointer', transition: 'all 0.2s', boxShadow: 'var(--shadow-sm)' }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(-3px)'; e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = 'white'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.color = 'var(--primary)'; }}
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h2 style={{ fontSize: 'clamp(1.5rem,5vw,2.25rem)', fontWeight: 800, margin: 0, color: 'var(--text)' }}>
                        Attendance Record
                    </h2>
                </div>
            </div>

            {/* ════════════ MOBILE HERO BANNER ════════════ */}
            <div className="att-mobile-hero" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4c1d95 100%)', padding: '1.25rem 0 1.5rem', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(139,92,246,0.15)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: -50, left: -30, width: 180, height: 180, borderRadius: '50%', background: 'rgba(99,102,241,0.1)', pointerEvents: 'none' }} />
                <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                    {/* Back arrow */}
                    <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: '0 0 0.75rem 0', fontSize: '0.82rem', fontWeight: 600 }}>
                        <ArrowLeft size={16} />
                        <span>Back</span>
                    </button>
                    {/* Title row: text left, icon right */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                        <div>
                            <h1 style={{ color: 'white', fontSize: 'clamp(1.3rem,5vw,1.9rem)', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', lineHeight: 1.2 }}>My Attendance</h1>
                            <p style={{ color: 'rgba(255,255,255,0.55)', margin: '0.3rem 0 0', fontSize: '0.8rem' }}>Track your daily presence</p>
                        </div>
                        <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Clock size={24} color="white" />
                        </div>
                    </div>
                </div>
            </div>

            {/* ════════════ SHARED CONTAINER ════════════ */}
            <div className="container" style={{ padding: '0 clamp(1rem,5vw,2.5rem) clamp(1rem,3vw,2.5rem)', maxWidth: 1400, margin: '0 auto' }}>

                {/* ── DESKTOP STAT CARDS (3 big cards) ── */}
                <div className="att-desktop-stats">
                    {/* Total Days */}
                    <div className="card" style={{ background: 'linear-gradient(135deg,#3b82f6,#60a5fa)', color: 'white', cursor: 'pointer', transition: 'transform 0.2s' }}
                        onClick={() => setViewingStatus('all')}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: 56, height: 56, background: 'rgba(255,255,255,0.2)', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Calendar size={28} />
                            </div>
                            <div>
                                <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>Total Days</p>
                                <h3 style={{ margin: '0.25rem 0 0', fontSize: '2rem', fontWeight: 800 }}>{totalRecords}</h3>
                            </div>
                        </div>
                    </div>

                    {/* Present */}
                    <div className="card" style={{ background: 'linear-gradient(135deg,#10b981,#34d399)', color: 'white', cursor: 'pointer', transition: 'transform 0.2s' }}
                        onClick={() => setViewingStatus('present')}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: 56, height: 56, background: 'rgba(255,255,255,0.2)', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <TrendingUp size={28} />
                            </div>
                            <div>
                                <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>Present</p>
                                <h3 style={{ margin: '0.25rem 0 0', fontSize: '2rem', fontWeight: 800 }}>{presentRecords}</h3>
                                <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', opacity: 0.8 }}>Click to view dates</p>
                            </div>
                        </div>
                    </div>

                    {/* Absent */}
                    <div className="card" style={{ background: 'linear-gradient(135deg,#ef4444,#f87171)', color: 'white', cursor: 'pointer', transition: 'transform 0.2s' }}
                        onClick={() => setViewingStatus('absent')}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: 56, height: 56, background: 'rgba(255,255,255,0.2)', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <XCircle size={28} />
                            </div>
                            <div>
                                <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>Absent</p>
                                <h3 style={{ margin: '0.25rem 0 0', fontSize: '2rem', fontWeight: 800 }}>{absentRecords}</h3>
                                <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', opacity: 0.8 }}>Click to view dates</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── MOBILE STAT CARDS (2-col like Fees) ── */}
                <div className="att-mobile-stats" style={{ gridTemplateColumns: 'repeat(2,1fr)', gap: '0.75rem', marginBottom: '1.25rem', marginTop: '1.5rem' }}>
                    <div style={{ borderRadius: 20, padding: '1rem', background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', cursor: 'pointer' }} onClick={() => setViewingStatus('all')}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                            <div>
                                <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Days</p>
                                <p style={{ margin: '0.25rem 0 0', fontSize: 'clamp(1.1rem,3vw,1.6rem)', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1 }}>{totalRecords}</p>
                            </div>
                            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg,#3b82f6,#60a5fa)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(59,130,246,0.35)', flexShrink: 0 }}>
                                <Calendar size={17} color="white" />
                            </div>
                        </div>
                        <div style={{ marginTop: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <TrendingUp size={11} color="#10b981" />
                            <span style={{ fontSize: '0.68rem', color: '#10b981', fontWeight: 700 }}>Click to view all</span>
                        </div>
                    </div>

                    <div style={{ borderRadius: 20, padding: '1rem', background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', cursor: 'pointer' }} onClick={() => setViewingStatus('present')}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                            <div>
                                <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Present</p>
                                <p style={{ margin: '0.25rem 0 0', fontSize: 'clamp(1.1rem,3vw,1.6rem)', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1 }}>{presentRecords}</p>
                            </div>
                            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg,#10b981,#34d399)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(16,185,129,0.35)', flexShrink: 0 }}>
                                <CheckCircle size={17} color="white" />
                            </div>
                        </div>
                        <div style={{ marginTop: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <TrendingUp size={11} color="#10b981" />
                            <span style={{ fontSize: '0.68rem', color: '#10b981', fontWeight: 700 }}>Click to view dates</span>
                        </div>
                    </div>

                    {/* Absent full width */}
                    <div style={{ gridColumn: '1 / -1', borderRadius: 20, padding: '1rem', background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', cursor: 'pointer' }} onClick={() => setViewingStatus('absent')}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                            <div>
                                <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Absent</p>
                                <p style={{ margin: '0.25rem 0 0', fontSize: 'clamp(1.1rem,3vw,1.6rem)', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1 }}>{absentRecords}</p>
                            </div>
                            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg,#ef4444,#f87171)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(239,68,68,0.35)', flexShrink: 0 }}>
                                <AlertCircle size={17} color="white" />
                            </div>
                        </div>
                        <div style={{ marginTop: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <TrendingUp size={11} color="#10b981" />
                            <span style={{ fontSize: '0.68rem', color: '#10b981', fontWeight: 700 }}>Click to view absent dates</span>
                        </div>
                    </div>
                </div>

                {/* ── STATUS ALERT (both views) ── */}
                <div className="card" style={{ marginBottom: '2rem', background: `${getStatusColor(attendancePercentage)}15`, border: `2px solid ${getStatusColor(attendancePercentage)}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Award size={32} color={getStatusColor(attendancePercentage)} />
                        <div>
                            <h4 style={{ margin: 0, color: getStatusColor(attendancePercentage) }}>Attendance Status: {getStatusText(attendancePercentage)}</h4>
                            <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)' }}>
                                {attendancePercentage >= 80 ? 'Great job! Keep maintaining your attendance.' : 'Warning: You need to maintain at least 80% attendance to be eligible for exams.'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── MOBILE PROGRESS BAR ── */}
                <div className="att-desktop-progress card" style={{ marginBottom: '1.25rem', borderRadius: 14, padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <h3 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800 }}>Attendance Progress</h3>
                        <span style={{ background: attendancePercentage >= 80 ? 'linear-gradient(135deg,#10b981,#34d399)' : 'linear-gradient(135deg,#ef4444,#f87171)', color: 'white', fontSize: '0.7rem', fontWeight: 800, padding: '2px 10px', borderRadius: 50 }}>{attendancePercentage}%</span>
                    </div>
                    <div style={{ width: '100%', height: 10, background: 'var(--background)', borderRadius: 50, overflow: 'hidden' }}>
                        <div style={{ width: `${attendancePercentage}%`, height: '100%', background: `linear-gradient(90deg,${getStatusColor(attendancePercentage)},${getStatusColor(attendancePercentage)}cc)`, borderRadius: 50, transition: 'width 0.6s ease' }} />
                    </div>
                    <p style={{ margin: '0.4rem 0 0', color: 'var(--text-muted)', fontSize: '0.75rem' }}>{presentRecords} present out of {totalRecords} school days</p>
                </div>

                {/* ── MONTHLY BREAKDOWN ── */}
                <div className="card" style={{ marginBottom: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Monthly Breakdown</h3>

                    {/* Desktop Table */}
                    <div className="att-desktop-table">
                        <div className="table-responsive">
                            <table className="table">
                                <thead>
                                    <tr>
                                        {['Month', 'Total Days', 'Present', 'Absent', 'Percentage', 'Status'].map(h => (
                                            <th key={h}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {monthlyData.map((month, i) => (
                                        <tr key={i}>
                                            <td style={{ fontWeight: 600 }}>{month.month}</td>
                                            <td>{month.total}</td>
                                            <td style={{ color: 'var(--success)' }}>{month.present}</td>
                                            <td style={{ color: 'var(--danger)' }}>{month.total - month.present}</td>
                                            <td style={{ fontWeight: 900, color: getStatusColor(month.percentage) }}>{month.percentage}%</td>
                                            <td><span style={{ fontWeight: 800, color: getStatusColor(month.percentage), fontSize: '0.9rem', textTransform: 'uppercase' }}>{getStatusText(month.percentage)}</span></td>
                                        </tr>
                                    ))}
                                    {monthlyData.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No records found.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Mobile Cards */}
                    <div className="att-mobile-cards" style={{ flexDirection: 'column', gap: '0.6rem' }}>
                        {monthlyData.map((month, i) => (
                            <div key={i} style={{ padding: '1rem 1.1rem', border: '1px solid var(--border)', borderRadius: 12, borderLeft: `3px solid ${getStatusColor(month.percentage)}` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{month.month}</span>
                                    <span style={{ fontWeight: 900, color: getStatusColor(month.percentage), fontSize: '1rem' }}>{month.percentage}%</span>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.5rem', textAlign: 'center' }}>
                                    <div><div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Total</div><div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{month.total}</div></div>
                                    <div><div style={{ color: '#10b981', fontSize: '0.7rem' }}>Present</div><div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#10b981' }}>{month.present}</div></div>
                                    <div><div style={{ color: '#ef4444', fontSize: '0.7rem' }}>Absent</div><div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#ef4444' }}>{month.total - month.present}</div></div>
                                </div>
                            </div>
                        ))}
                        {monthlyData.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1.5rem' }}>No records found.</p>}
                    </div>
                </div>

                {/* ── SUBJECT BREAKDOWN ── */}
                <div className="card">
                    <h3 style={{ marginBottom: '1.5rem' }}>Subject-wise Attendance</h3>

                    {/* Desktop Table */}
                    <div className="att-desktop-table">
                        <div className="table-responsive">
                            <table className="table">
                                <thead>
                                    <tr>
                                        {['Subject/Category', 'Total Classes', 'Attended', 'Percentage', 'Progress'].map(h => (
                                            <th key={h}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {subjectData.map((s, i) => (
                                        <tr key={i}>
                                            <td style={{ fontWeight: 600 }}>{s.subject}</td>
                                            <td>{s.total}</td>
                                            <td>{s.present}</td>
                                            <td style={{ fontWeight: 700, color: getStatusColor(s.percentage) }}>{s.percentage}%</td>
                                            <td>
                                                <div style={{ width: '100%', height: 8, background: 'var(--background)', borderRadius: 4, overflow: 'hidden' }}>
                                                    <div style={{ width: `${s.percentage}%`, height: '100%', background: getStatusColor(s.percentage), transition: 'width 0.3s ease' }} />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Mobile Cards */}
                    <div className="att-mobile-cards" style={{ flexDirection: 'column', gap: '0.6rem' }}>
                        {subjectData.map((s, i) => (
                            <div key={i} style={{ padding: '1rem 1.1rem', border: '1px solid var(--border)', borderRadius: 12 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{s.subject}</span>
                                    <span style={{ fontWeight: 700, color: getStatusColor(s.percentage) }}>{s.percentage}%</span>
                                </div>
                                <div style={{ width: '100%', height: 8, background: 'var(--background)', borderRadius: 10, overflow: 'hidden', marginBottom: '0.4rem' }}>
                                    <div style={{ width: `${s.percentage}%`, height: '100%', background: getStatusColor(s.percentage), borderRadius: 10 }} />
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.present} classes attended out of {s.total}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── DETAIL MODAL ── */}
            {viewingStatus && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}
                    onClick={() => setViewingStatus(null)}>
                    <div className="att-modal card" style={{ maxWidth: 500, width: '100%', position: 'relative', maxHeight: '80vh', overflowY: 'auto', borderRadius: 20, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
                        onClick={e => e.stopPropagation()}>
                        <button onClick={() => setViewingStatus(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'var(--background)', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <XCircle size={20} />
                        </button>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0, textTransform: 'capitalize', color: viewingStatus === 'present' ? '#10b981' : viewingStatus === 'absent' ? '#ef4444' : 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {viewingStatus === 'present' ? <CheckCircle size={24} /> : viewingStatus === 'absent' ? <XCircle size={24} /> : <Calendar size={24} />}
                                {viewingStatus === 'all' ? 'All Records' : viewingStatus} Records
                            </h3>
                            <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)' }}>Detailed list of dates and weekdays</p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {attendanceRecords
                                .filter(r => viewingStatus === 'all' || r.status === viewingStatus)
                                .map((record, i) => {
                                    const dateObj = new Date(record.date);
                                    return (
                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderRadius: 12, background: 'var(--background)', borderLeft: `5px solid ${record.status === 'present' ? '#10b981' : '#ef4444'}`, boxShadow: 'var(--shadow-sm)' }}>
                                            <div>
                                                <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{dateObj.toLocaleDateString('en-US', { weekday: 'long' })}</div>
                                                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{record.date}</div>
                                            </div>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', padding: '0.4rem 0.8rem', borderRadius: 20, background: record.status === 'present' ? '#10b98120' : '#ef444420', color: record.status === 'present' ? '#10b981' : '#ef4444' }}>
                                                {record.status}
                                            </span>
                                        </div>
                                    );
                                })}
                            {attendanceRecords.filter(r => viewingStatus === 'all' || r.status === viewingStatus).length === 0 && (
                                <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No records found.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

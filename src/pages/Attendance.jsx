import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { api } from '../utils/api';
import { CheckCircle, XCircle, Clock, Calendar, Users, ArrowLeft, TrendingUp, Award } from 'lucide-react';
import LoadingScreen from '../components/LoadingScreen';
import FeatureLocked from '../components/FeatureLocked';

export default function Attendance() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewingStatus, setViewingStatus] = useState(null); // 'present', 'absent', or null

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

    if (!user) {
        return <Navigate to="/login" />;
    }

    const studentLocks = JSON.parse(localStorage.getItem('admin_student_locks') || '{}');
    if (studentLocks[`${user.id}_attendance`]) {
        return <FeatureLocked featureName="Attendance" />;
    }

    if (loading) return <LoadingScreen message="Loading attendance records..." />;

    // Calculate aggregated stats
    const totalRecords = attendanceRecords.length;
    const presentRecords = attendanceRecords.filter(r => r.status === 'present').length;
    const attendancePercentage = totalRecords > 0 ? ((presentRecords / totalRecords) * 100).toFixed(1) : 0;

    // Group by month for the table
    const groupedByMonth = attendanceRecords.reduce((acc, record) => {
        const date = new Date(record.date);
        const monthName = date.toLocaleString('default', { month: 'long' });
        const year = date.getFullYear();
        const key = `${monthName} ${year}`;

        if (!acc[key]) {
            acc[key] = { month: key, total: 0, present: 0, percentage: 0 };
        }
        acc[key].total += 1;
        if (record.status === 'present') acc[key].present += 1;
        acc[key].percentage = ((acc[key].present / acc[key].total) * 100).toFixed(0);
        return acc;
    }, {});

    const monthlyData = Object.values(groupedByMonth);

    // Group by subject (if subject is provided in record, else skip or group by 'General')
    const subjectWise = attendanceRecords.reduce((acc, record) => {
        const subject = record.subject || 'School Days';
        if (!acc[subject]) {
            acc[subject] = { subject, total: 0, present: 0, percentage: 0 };
        }
        acc[subject].total += 1;
        if (record.status === 'present') acc[subject].present += 1;
        acc[subject].percentage = ((acc[subject].present / acc[subject].total) * 100).toFixed(0);
        return acc;
    }, {});

    const subjectData = Object.values(subjectWise);

    const getStatusColor = (percentage) => {
        if (percentage >= 90) return '#10b981';
        if (percentage >= 75) return '#f59e0b';
        return '#ef4444';
    };

    const getStatusText = (percentage) => {
        if (percentage >= 90) return 'Excellent';
        if (percentage >= 75) return 'Good';
        return 'Poor';
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
                    <h2 style={{ fontSize: 'clamp(1.5rem, 5vw, 2.25rem)', fontWeight: '800', margin: 0, color: 'var(--text)' }}>
                        Attendance Record
                    </h2>
                </div>
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div
                    className="card"
                    style={{ background: 'linear-gradient(135deg, #3b82f6, #60a5fa)', color: 'white', cursor: 'pointer', transition: 'transform 0.2s' }}
                    onClick={() => setViewingStatus('all')}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '56px', height: '56px', background: 'rgba(255,255,255,0.2)', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Calendar size={28} />
                        </div>
                        <div>
                            <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>Total Days</p>
                            <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '2rem', fontWeight: '800' }}>{totalRecords}</h3>
                        </div>
                    </div>
                </div>

                <div
                    className="card"
                    style={{ background: 'linear-gradient(135deg, #10b981, #34d399)', color: 'white', cursor: 'pointer', transition: 'transform 0.2s' }}
                    onClick={() => setViewingStatus('present')}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '56px', height: '56px', background: 'rgba(255,255,255,0.2)', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <TrendingUp size={28} />
                        </div>
                        <div>
                            <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>Present</p>
                            <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '2rem', fontWeight: '800' }}>{presentRecords}</h3>
                            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', opacity: 0.8 }}>Click to view dates</p>
                        </div>
                    </div>
                </div>

                <div
                    className="card"
                    style={{ background: `linear-gradient(135deg, #ef4444, #f87171)`, color: 'white', cursor: 'pointer', transition: 'transform 0.2s' }}
                    onClick={() => setViewingStatus('absent')}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '56px', height: '56px', background: 'rgba(255,255,255,0.2)', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <XCircle size={28} />
                        </div>
                        <div>
                            <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>Absent</p>
                            <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '2rem', fontWeight: '800' }}>{totalRecords - presentRecords}</h3>
                            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', opacity: 0.8 }}>Click to view dates</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Status Alert */}
            <div className="card" style={{
                marginBottom: '2rem',
                background: `${getStatusColor(attendancePercentage)}15`,
                border: `2px solid ${getStatusColor(attendancePercentage)}`
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Award size={32} color={getStatusColor(attendancePercentage)} />
                    <div>
                        <h4 style={{ margin: 0, color: getStatusColor(attendancePercentage) }}>
                            Attendance Status: {getStatusText(attendancePercentage)}
                        </h4>
                        <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)' }}>
                            {attendancePercentage >= 80
                                ? 'Great job! Keep maintaining your attendance.'
                                : 'Warning: You need to maintain at least 80% attendance to be eligible for exams.'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Desktop Tables (Visible on Desktop) */}
            <div className="desktop-view">
                <div className="card" style={{ marginBottom: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Monthly Breakdown</h3>
                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Month</th>
                                    <th>Total Days</th>
                                    <th>Present</th>
                                    <th>Absent</th>
                                    <th>Percentage</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {monthlyData.map((month, index) => (
                                    <tr key={index}>
                                        <td style={{ fontWeight: '600' }}>{month.month}</td>
                                        <td>{month.total}</td>
                                        <td style={{ color: 'var(--success)' }}>{month.present}</td>
                                        <td style={{ color: 'var(--danger)' }}>{month.total - month.present}</td>
                                        <td style={{ fontWeight: '900', color: getStatusColor(month.percentage) }}>{month.percentage}%</td>
                                        <td>
                                            <span style={{
                                                fontWeight: '800',
                                                color: getStatusColor(month.percentage),
                                                fontSize: '0.9rem',
                                                textTransform: 'uppercase'
                                            }}>
                                                {getStatusText(month.percentage)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="card">
                    <h3 style={{ marginBottom: '1.5rem' }}>Subject-wise Attendance</h3>
                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Subject/Category</th>
                                    <th>Total Classes</th>
                                    <th>Attended</th>
                                    <th>Percentage</th>
                                    <th>Progress</th>
                                </tr>
                            </thead>
                            <tbody>
                                {subjectData.map((subject, index) => (
                                    <tr key={index}>
                                        <td style={{ fontWeight: '600' }}>{subject.subject}</td>
                                        <td>{subject.total}</td>
                                        <td>{subject.present}</td>
                                        <td style={{ fontWeight: '700', color: getStatusColor(subject.percentage) }}>
                                            {subject.percentage}%
                                        </td>
                                        <td>
                                            <div style={{ width: '100%', height: '8px', background: 'var(--background)', borderRadius: '4px', overflow: 'hidden' }}>
                                                <div style={{
                                                    width: `${subject.percentage}%`,
                                                    height: '100%',
                                                    background: getStatusColor(subject.percentage),
                                                    transition: 'width 0.3s ease'
                                                }} />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Mobile-Only Unique UI (Visible on Mobile) */}
            <div className="mobile-view">
                <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Monthly History</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {monthlyData.map((month, index) => (
                        <div key={index} className="card" style={{ padding: '1rem', borderTop: `4px solid ${getStatusColor(month.percentage)}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>{month.month}</span>
                                <span style={{ color: getStatusColor(month.percentage), fontWeight: '900', fontSize: '1.2rem' }}>
                                    {month.percentage}%
                                </span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
                                <div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Total</div>
                                    <div style={{ fontWeight: '700' }}>{month.total}</div>
                                </div>
                                <div>
                                    <div style={{ color: '#10b981', fontSize: '0.75rem' }}>Present</div>
                                    <div style={{ fontWeight: '700', color: '#10b981' }}>{month.present}</div>
                                </div>
                                <div>
                                    <div style={{ color: '#ef4444', fontSize: '0.75rem' }}>Absent</div>
                                    <div style={{ fontWeight: '700', color: '#ef4444' }}>{month.total - month.present}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <h3 style={{ marginTop: '2rem', marginBottom: '1rem', fontSize: '1.25rem' }}>Subject Breakdown</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {subjectData.map((subject, index) => (
                        <div key={index} className="card" style={{ padding: '1.25rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <span style={{ fontWeight: '600' }}>{subject.subject}</span>
                                <span style={{ fontWeight: '700', color: getStatusColor(subject.percentage) }}>{subject.percentage}%</span>
                            </div>
                            <div style={{ width: '100%', height: '8px', background: 'var(--background)', borderRadius: '10px', overflow: 'hidden', marginBottom: '0.5rem' }}>
                                <div style={{
                                    width: `${subject.percentage}%`,
                                    height: '100%',
                                    background: getStatusColor(subject.percentage),
                                    borderRadius: '10px'
                                }} />
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                {subject.present} classes attended out of {subject.total}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                .mobile-view { display: none; }
                .desktop-view { display: block; }
                
                @media (max-width: 768px) {
                    .mobile-view { display: block; }
                    .desktop-view { display: none; }
                    .card { padding: 1rem !important; }
                    .container { padding: 0 1rem 2rem 1rem !important; }
                }

                @keyframes pop {
                    0% { transform: scale(0.95); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }
                
                .detail-modal-content {
                    animation: pop 0.3s ease-out;
                }
            `}</style>

            {/* Detail Modal */}
            {viewingStatus && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
                    padding: '1rem'
                }} onClick={() => setViewingStatus(null)}>
                    <div
                        className="detail-modal-content"
                        style={{
                            background: 'var(--surface)', padding: '2rem', borderRadius: '20px',
                            width: '100%', maxWidth: '500px', maxHeight: '80vh', overflowY: 'auto',
                            position: 'relative', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setViewingStatus(null)}
                            style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'var(--background)', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <XCircle size={20} />
                        </button>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0, textTransform: 'capitalize', color: viewingStatus === 'present' ? '#10b981' : viewingStatus === 'absent' ? '#ef4444' : 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {viewingStatus === 'present' ? <CheckCircle size={24} /> : viewingStatus === 'absent' ? <XCircle size={24} /> : <Calendar size={24} />}
                                {viewingStatus} Records
                            </h3>
                            <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)' }}>Detailed list of dates and weekdays</p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {attendanceRecords
                                .filter(r => viewingStatus === 'all' || r.status === viewingStatus)
                                .map((record, i) => {
                                    const dateObj = new Date(record.date);
                                    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
                                    return (
                                        <div key={i} style={{
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            padding: '1rem', borderRadius: '12px',
                                            background: 'var(--background)',
                                            borderLeft: `5px solid ${record.status === 'present' ? '#10b981' : '#ef4444'}`,
                                            boxShadow: 'var(--shadow-sm)'
                                        }}>
                                            <div>
                                                <div style={{ fontWeight: '700', fontSize: '1.05rem' }}>{dayName}</div>
                                                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{record.date}</div>
                                            </div>
                                            <div style={{
                                                fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase',
                                                padding: '0.4rem 0.8rem', borderRadius: '20px',
                                                background: record.status === 'present' ? '#10b98120' : '#ef444420',
                                                color: record.status === 'present' ? '#10b981' : '#ef4444'
                                            }}>
                                                {record.status}
                                            </div>
                                        </div>
                                    );
                                })}
                            {attendanceRecords.filter(r => viewingStatus === 'all' || r.status === viewingStatus).length === 0 && (
                                <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No {viewingStatus} records found.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

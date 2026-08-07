import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { api } from '../../utils/api';
import { CheckCircle, XCircle, Clock, Calendar, Users, ArrowLeft } from 'lucide-react';
import LoadingScreen from '../../components/LoadingScreen';

export default function AdminTeacherAttendance() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [teachers, setTeachers] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceData, setAttendanceData] = useState([]);
    const [historyModal, setHistoryModal] = useState(null);
    const [loading, setLoading] = useState(false);

    const openHistory = (teacherId, teacherName) => {
        const records = attendanceData
            .filter(a => a.user_id === teacherId)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
        setHistoryModal({ teacherId, teacherName, records });
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [teachersData, attendanceList] = await Promise.all([
                    api.getTeachers(),
                    api.getAllAttendance()
                ]);
                setTeachers(teachersData);
                setAttendanceData(attendanceList);
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (!user || user.role !== 'admin') {
        return <Navigate to="/login" />;
    }

    if (loading) return <LoadingScreen message="Loading Teacher Attendance..." />;

    const markAttendance = async (teacherId, status, targetDate = selectedDate) => {
        const tId = String(teacherId); // Ensure ID is a string for Firebase consistency
        try {
            await api.markAttendance({
                userId: tId,
                date: targetDate,
                status,
                type: 'teacher'
            });

            // Refresh attendance data
            const updatedAttendance = await api.getAllAttendance();
            setAttendanceData(updatedAttendance);

            // If history modal is open for this teacher, update its records from the fresh data
            setHistoryModal(prev => {
                if (prev && prev.teacherId === tId) {
                    const refreshedRecords = updatedAttendance
                        .filter(a => a.user_id === tId)
                        .sort((a, b) => new Date(b.date) - new Date(a.date));
                    return { ...prev, records: refreshedRecords };
                }
                return prev;
            });
        } catch (error) {
            console.error('Attendance update failed:', error);
            alert('Failed to mark attendance. Please check your connection or try again.');
        }
    };

    const getTeacherStatus = (teacherId) => {
        const record = attendanceData.find(a => a.user_id === teacherId && a.date === selectedDate);
        return record ? record.status : null;
    };

    const getAttendanceStats = (teacherId) => {
        const records = attendanceData.filter(a => a.user_id === teacherId);
        const present = records.filter(r => r.status === 'present').length;
        const absent = records.filter(r => r.status === 'absent').length;
        return { present, absent, total: records.length };
    };

    // Calculate daily stats
    const todaysRecords = attendanceData.filter(a => a.date === selectedDate);
    const presentToday = todaysRecords.filter(r => r.status === 'present').length;
    const absentToday = todaysRecords.filter(r => r.status === 'absent').length;

    return (
        <div className="container" style={{ padding: '0 clamp(1rem, 5vw, 2.5rem) clamp(1rem, 3vw, 2.5rem)', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', padding: '1.5rem 0' }}>
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
                            Teacher Attendance
                        </h2>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', minWidth: '220px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
                            <Calendar size={20} color="var(--primary)" />
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                style={{
                                    padding: '0.75rem 1rem',
                                    border: '2px solid var(--border)',
                                    borderRadius: 'var(--radius)',
                                    background: 'var(--surface)',
                                    fontWeight: '600',
                                    width: '100%',
                                    fontSize: '0.9rem'
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(150px, 45%, 200px), 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div className="card" style={{ background: 'linear-gradient(135deg, #3b82f6, #60a5fa)', color: 'white', padding: 'clamp(1rem, 3vw, 1.5rem)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(0.5rem, 2vw, 1rem)' }}>
                        <div style={{ width: 'clamp(40px, 8vw, 48px)', height: 'clamp(40px, 8vw, 48px)', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Users size={20} />
                        </div>
                        <div>
                            <p style={{ margin: 0, opacity: 0.9, fontSize: 'clamp(0.75rem, 2vw, 0.85rem)' }}>Total Teachers</p>
                            <h3 style={{ margin: '0.25rem 0 0 0', fontSize: 'clamp(1.25rem, 4vw, 1.75rem)', fontWeight: '800' }}>{teachers.length}</h3>
                        </div>
                    </div>
                </div>

                <div className="card" style={{ background: 'linear-gradient(135deg, #10b981, #34d399)', color: 'white', padding: 'clamp(1rem, 3vw, 1.5rem)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(0.5rem, 2vw, 1rem)' }}>
                        <div style={{ width: 'clamp(40px, 8vw, 48px)', height: 'clamp(40px, 8vw, 48px)', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <CheckCircle size={20} />
                        </div>
                        <div>
                            <p style={{ margin: 0, opacity: 0.9, fontSize: 'clamp(0.75rem, 2vw, 0.85rem)' }}>Present Today</p>
                            <h3 style={{ margin: '0.25rem 0 0 0', fontSize: 'clamp(1.25rem, 4vw, 1.75rem)', fontWeight: '800' }}>
                                {presentToday}
                            </h3>
                        </div>
                    </div>
                </div>

                <div className="card" style={{ background: 'linear-gradient(135deg, #ef4444, #f87171)', color: 'white', padding: 'clamp(1rem, 3vw, 1.5rem)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(0.5rem, 2vw, 1rem)' }}>
                        <div style={{ width: 'clamp(40px, 8vw, 48px)', height: 'clamp(40px, 8vw, 48px)', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <XCircle size={20} />
                        </div>
                        <div>
                            <p style={{ margin: 0, opacity: 0.9, fontSize: 'clamp(0.75rem, 2vw, 0.85rem)' }}>Absent Today</p>
                            <h3 style={{ margin: '0.25rem 0 0 0', fontSize: 'clamp(1.25rem, 4vw, 1.75rem)', fontWeight: '800' }}>
                                {absentToday}
                            </h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Teacher List */}
            <div className="card">
                <h3 style={{ marginBottom: '1.5rem', fontSize: 'clamp(1.1rem, 3vw, 1.5rem)' }}>Mark Attendance for {selectedDate}</h3>

                <style>{`
                    @media (min-width: 992px) {
                        .attendance-table-responsive { display: block !important; }
                        .attendance-mobile-cards { display: none !important; }
                    }
                `}</style>

                {/* Desktop Table View */}
                <div className="attendance-table-responsive table-responsive" style={{ display: 'none' }}>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Teacher</th>
                                <th>Monthly Attendance (30 Days)</th>
                                <th>Performance (Click for History)</th>
                                <th>Yesterday's Status</th>
                                <th>Mark Today ({selectedDate})</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teachers.map(teacher => {
                                // Calculate Monthly Stats (Current Month)
                                const now = new Date();
                                const currentMonthRecords = attendanceData.filter(a => {
                                    const d = new Date(a.date);
                                    return a.user_id === teacher.id &&
                                        d.getMonth() === now.getMonth() &&
                                        d.getFullYear() === now.getFullYear();
                                });

                                const presentCount = currentMonthRecords.filter(r => r.status === 'present').length;
                                const absentCount = currentMonthRecords.filter(r => r.status === 'absent').length;

                                // Red circle if > 5 holidays (absent)
                                const isDanger = absentCount > 5;
                                const circleColor = isDanger ? '#ef4444' : '#10b981';
                                const circleTrack = isDanger ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)';

                                // Yesterday's Status Logic
                                const today = new Date();
                                const yesterday = new Date(today);
                                yesterday.setDate(yesterday.getDate() - 1);
                                const yesterdayStr = yesterday.toISOString().split('T')[0];
                                const yesterdayRecord = attendanceData.find(a => a.user_id === teacher.id && a.date === yesterdayStr);

                                // Today's Status
                                const currentStatus = getTeacherStatus(teacher.id);

                                return (
                                    <tr key={teacher.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                {teacher.photo ? (
                                                    <img
                                                        src={teacher.photo}
                                                        alt={teacher.name}
                                                        style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)' }}
                                                    />
                                                ) : (
                                                    <div style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        borderRadius: '50%',
                                                        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: 'white',
                                                        fontWeight: '700'
                                                    }}>
                                                        {teacher.name.charAt(0)}
                                                    </div>
                                                )}
                                                <div>
                                                    <div style={{ fontWeight: '600' }}>{teacher.name}</div>
                                                    <div style={{ fontSize: '0.81rem', color: 'var(--text-muted)' }}>ID: {teacher.id}</div>
                                                    <div style={{ fontSize: '0.81rem', color: 'var(--text-muted)' }}>Subject: {teacher.subject}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                                    <span style={{ color: '#10b981', fontWeight: '600' }}>{presentCount} Present</span>
                                                    <span style={{ color: '#ef4444', fontWeight: '600' }}>{absentCount} Absent</span>
                                                </div>
                                                <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                                                    <div style={{
                                                        width: `${Math.min((presentCount / 30) * 100, 100)}%`,
                                                        height: '100%',
                                                        background: circleColor,
                                                        borderRadius: '10px'
                                                    }} />
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                                                    Out of 30 Days
                                                </div>
                                            </div>
                                        </td>
                                        <td onClick={() => openHistory(teacher.id, teacher.name)} style={{ cursor: 'pointer' }}>
                                            <div style={{ position: 'relative', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <svg width="50" height="50" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                                                    <circle cx="50" cy="50" r="40" fill="transparent" stroke={circleTrack} strokeWidth="10" />
                                                    <circle
                                                        cx="50" cy="50" r="40"
                                                        fill="transparent"
                                                        stroke={circleColor}
                                                        strokeWidth="10"
                                                        strokeDasharray={`${(presentCount / 30) * 251.2} 251.2`}
                                                        strokeLinecap="round"
                                                    />
                                                </svg>
                                                <div style={{ position: 'absolute', fontSize: '0.7rem', fontWeight: '700', color: circleColor }}>
                                                    {Math.round((presentCount / 30) * 100)}%
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            {yesterdayRecord ? (
                                                <span className="badge" style={{
                                                    background: yesterdayRecord.status === 'present' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                    color: yesterdayRecord.status === 'present' ? '#10b981' : '#ef4444'
                                                }}>
                                                    {yesterdayRecord.status === 'present' ? 'Present' : 'Absent'}
                                                </span>
                                            ) : <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>-</span>}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); markAttendance(teacher.id, 'present'); }}
                                                    className="btn btn-sm"
                                                    style={{
                                                        background: currentStatus === 'present' ? '#10b981' : 'transparent',
                                                        color: currentStatus === 'present' ? 'white' : '#10b981',
                                                        border: '2px solid #10b981',
                                                        opacity: currentStatus === 'present' ? 1 : 0.6
                                                    }}
                                                >
                                                    <CheckCircle size={16} /> P
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); markAttendance(teacher.id, 'absent'); }}
                                                    className="btn btn-sm"
                                                    style={{
                                                        background: currentStatus === 'absent' ? '#ef4444' : 'transparent',
                                                        color: currentStatus === 'absent' ? 'white' : '#ef4444',
                                                        border: '2px solid #ef4444',
                                                        opacity: currentStatus === 'absent' ? 1 : 0.6
                                                    }}
                                                >
                                                    <XCircle size={16} /> A
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Mobile/Tablet Card View */}
                <div className="attendance-mobile-cards" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {teachers.map(teacher => {
                        const now = new Date();
                        const currentMonthRecords = attendanceData.filter(a => {
                            const d = new Date(a.date);
                            return a.user_id === teacher.id &&
                                d.getMonth() === now.getMonth() &&
                                d.getFullYear() === now.getFullYear();
                        });

                        const presentCount = currentMonthRecords.filter(r => r.status === 'present').length;
                        const absentCount = currentMonthRecords.filter(r => r.status === 'absent').length;
                        const isDanger = absentCount > 5;
                        const circleColor = isDanger ? '#ef4444' : '#10b981';
                        const currentStatus = getTeacherStatus(teacher.id);

                        return (
                            <div key={teacher.id} style={{
                                border: '2px solid var(--border)',
                                borderRadius: '16px',
                                padding: '1rem',
                                background: 'var(--surface)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        {teacher.photo ? (
                                            <img
                                                src={teacher.photo}
                                                alt={teacher.name}
                                                style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)' }}
                                            />
                                        ) : (
                                            <div style={{
                                                width: '45px', height: '45px', borderRadius: '50%',
                                                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: 'white', fontWeight: '700'
                                            }}>
                                                {teacher.name.charAt(0)}
                                            </div>
                                        )}
                                        <div>
                                            <div style={{ fontWeight: '700', fontSize: '1rem' }}>{teacher.name}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID: {teacher.id}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Subject: {teacher.subject}</div>
                                        </div>
                                    </div>
                                    <div
                                        onClick={() => openHistory(teacher.id, teacher.name)}
                                        style={{ textAlign: 'center', cursor: 'pointer' }}
                                    >
                                        <div style={{ fontSize: '1.2rem', fontWeight: '800', color: circleColor }}>
                                            {Math.round((presentCount / 30) * 100)}%
                                        </div>
                                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '600' }}>HISTORY</div>
                                    </div>
                                </div>

                                <div style={{ background: 'var(--background-alt)', padding: '0.75rem', borderRadius: '12px', marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                                        <span style={{ color: '#10b981', fontWeight: '700' }}>{presentCount} P</span>
                                        <span style={{ color: '#ef4444', fontWeight: '700' }}>{absentCount} A</span>
                                        <span style={{ color: 'var(--text-muted)' }}>of 30 Days</span>
                                    </div>
                                    <div style={{ width: '100%', height: '6px', background: 'rgba(0,0,0,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
                                        <div style={{
                                            width: `${Math.min((presentCount / 30) * 100, 100)}%`,
                                            height: '100%', background: circleColor, borderRadius: '10px'
                                        }} />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => markAttendance(teacher.id, 'present')}
                                        className="btn btn-sm"
                                        style={{
                                            flex: 1,
                                            background: currentStatus === 'present' ? '#10b981' : 'transparent',
                                            color: currentStatus === 'present' ? 'white' : '#10b981',
                                            border: '2px solid #10b981',
                                            opacity: currentStatus === 'present' ? 1 : 0.6
                                        }}
                                    >
                                        <CheckCircle size={16} /> Present
                                    </button>
                                    <button
                                        onClick={() => markAttendance(teacher.id, 'absent')}
                                        className="btn btn-sm"
                                        style={{
                                            flex: 1,
                                            background: currentStatus === 'absent' ? '#ef4444' : 'transparent',
                                            color: currentStatus === 'absent' ? 'white' : '#ef4444',
                                            border: '2px solid #ef4444',
                                            opacity: currentStatus === 'absent' ? 1 : 0.6
                                        }}
                                    >
                                        <XCircle size={16} /> Absent
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* History Modal */}
            {historyModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }} onClick={() => setHistoryModal(null)}>
                    <div style={{
                        background: 'var(--surface)', padding: '2rem', borderRadius: '12px',
                        width: '90%', maxWidth: '500px', maxHeight: '80vh', overflowY: 'auto',
                        position: 'relative'
                    }} onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setHistoryModal(null)}
                            style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                        >
                            <XCircle size={24} />
                        </button>

                        <h3 style={{ marginBottom: '1rem' }}>Attendance History: {historyModal.teacherName}</h3>

                        {historyModal.records.length === 0 ? (
                            <p>No records found.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {historyModal.records.map(record => (
                                    <div key={record.id || record.date} style={{
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        padding: '0.75rem', borderRadius: '8px',
                                        background: 'var(--background)',
                                        borderLeft: `4px solid ${record.status === 'present' ? '#10b981' : '#ef4444'}`
                                    }}>
                                        <div>
                                            <span style={{ fontWeight: '600' }}>{record.date}</span>
                                            <div style={{
                                                color: record.status === 'present' ? '#10b981' : '#ef4444',
                                                fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.8rem'
                                            }}>{record.status}</div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                                            <button
                                                onClick={() => markAttendance(historyModal.teacherId, 'present', record.date)}
                                                className="btn btn-sm"
                                                style={{
                                                    padding: '0.4rem 0.6rem',
                                                    fontSize: '0.75rem',
                                                    background: record.status === 'present' ? '#10b981' : 'transparent',
                                                    color: record.status === 'present' ? 'white' : '#10b981',
                                                    border: '1px solid #10b981'
                                                }}
                                            >P</button>
                                            <button
                                                onClick={() => markAttendance(historyModal.teacherId, 'absent', record.date)}
                                                className="btn btn-sm"
                                                style={{
                                                    padding: '0.4rem 0.6rem',
                                                    fontSize: '0.75rem',
                                                    background: record.status === 'absent' ? '#ef4444' : 'transparent',
                                                    color: record.status === 'absent' ? 'white' : '#ef4444',
                                                    border: '1px solid #ef4444'
                                                }}
                                            >A</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
                            <button className="btn btn-primary" onClick={() => setHistoryModal(null)}>Save Changes</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

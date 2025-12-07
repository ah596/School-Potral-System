import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { api } from '../../utils/api';
import { CheckCircle, XCircle, Clock, Calendar, Users } from 'lucide-react';

export default function AdminTeacherAttendance() {
    const { user } = useAuth();
    const [teachers, setTeachers] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceData, setAttendanceData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [teachersData, attendanceList] = await Promise.all([
                    api.getTeachers(),
                    api.getAllAttendance()
                ]);
                setTeachers(teachersData);
                setAttendanceData(attendanceList);
            } catch (error) {
                console.error('Failed to fetch data:', error);
            }
        };
        fetchData();
    }, []);

    if (!user || user.role !== 'admin') {
        return <Navigate to="/login" />;
    }

    const markAttendance = async (teacherId, status) => {
        try {
            await api.markAttendance({
                userId: teacherId,
                date: selectedDate,
                status,
                type: 'teacher'
            });

            // Refresh attendance data
            const updatedAttendance = await api.getAllAttendance();
            setAttendanceData(updatedAttendance);
        } catch (error) {
            console.error('Failed to mark attendance:', error);
            alert('Failed to mark attendance');
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
        <div className="container" style={{ padding: '2rem 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: '700', margin: 0 }}>Teacher Attendance</h2>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Calendar size={20} color="var(--primary)" />
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            style={{
                                padding: '0.75rem 1rem',
                                border: '2px solid var(--border)',
                                borderRadius: 'var(--radius)',
                                background: 'var(--background)',
                                fontWeight: '600'
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="card" style={{ background: 'linear-gradient(135deg, #3b82f6, #60a5fa)', color: 'white' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '48px', height: '48px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Users size={24} />
                        </div>
                        <div>
                            <p style={{ margin: 0, opacity: 0.9, fontSize: '0.85rem' }}>Total Teachers</p>
                            <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '1.75rem', fontWeight: '800' }}>{teachers.length}</h3>
                        </div>
                    </div>
                </div>

                <div className="card" style={{ background: 'linear-gradient(135deg, #10b981, #34d399)', color: 'white' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '48px', height: '48px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <p style={{ margin: 0, opacity: 0.9, fontSize: '0.85rem' }}>Present Today</p>
                            <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '1.75rem', fontWeight: '800' }}>
                                {presentToday}
                            </h3>
                        </div>
                    </div>
                </div>

                <div className="card" style={{ background: 'linear-gradient(135deg, #ef4444, #f87171)', color: 'white' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '48px', height: '48px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <XCircle size={24} />
                        </div>
                        <div>
                            <p style={{ margin: 0, opacity: 0.9, fontSize: '0.85rem' }}>Absent Today</p>
                            <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '1.75rem', fontWeight: '800' }}>
                                {absentToday}
                            </h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Teacher List */}
            <div className="card">
                <h3 style={{ marginBottom: '1.5rem' }}>Mark Attendance for {selectedDate}</h3>
                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Teacher</th>
                                <th>Subject</th>
                                <th>Total Present</th>
                                <th>Total Absent</th>
                                <th>Today's Status</th>
                                <th>Mark Attendance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teachers.map(teacher => {
                                const stats = getAttendanceStats(teacher.id);
                                const currentStatus = getTeacherStatus(teacher.id);

                                return (
                                    <tr key={teacher.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
                                                <div>
                                                    <div style={{ fontWeight: '600' }}>{teacher.name}</div>
                                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{teacher.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{teacher.subject}</td>
                                        <td style={{ color: 'var(--success)', fontWeight: '600' }}>{stats.present}</td>
                                        <td style={{ color: 'var(--danger)', fontWeight: '600' }}>{stats.absent}</td>
                                        <td>
                                            {currentStatus ? (
                                                <span className="badge" style={{
                                                    background: currentStatus === 'present' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                    color: currentStatus === 'present' ? '#10b981' : '#ef4444',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                    width: 'fit-content'
                                                }}>
                                                    {currentStatus === 'present' ? <CheckCircle size={16} /> : <XCircle size={16} />}
                                                    {currentStatus.toUpperCase()}
                                                </span>
                                            ) : (
                                                <span style={{ color: 'var(--text-muted)' }}>Not marked</span>
                                            )}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    onClick={() => markAttendance(teacher.id, 'present')}
                                                    className="btn btn-sm"
                                                    style={{
                                                        background: currentStatus === 'present' ? '#10b981' : 'transparent',
                                                        color: currentStatus === 'present' ? 'white' : '#10b981',
                                                        border: '2px solid #10b981'
                                                    }}
                                                >
                                                    <CheckCircle size={16} /> Present
                                                </button>
                                                <button
                                                    onClick={() => markAttendance(teacher.id, 'absent')}
                                                    className="btn btn-sm"
                                                    style={{
                                                        background: currentStatus === 'absent' ? '#ef4444' : 'transparent',
                                                        color: currentStatus === 'absent' ? 'white' : '#ef4444',
                                                        border: '2px solid #ef4444'
                                                    }}
                                                >
                                                    <XCircle size={16} /> Absent
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

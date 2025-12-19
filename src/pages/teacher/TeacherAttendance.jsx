import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { CheckCircle, XCircle, Clock, Calendar, Users, History, ArrowLeft } from 'lucide-react';
import LoadingScreen from '../../components/LoadingScreen';

export default function TeacherAttendance() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [assignedClasses, setAssignedClasses] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState('');
    const [students, setStudents] = useState([]);
    const [attendanceData, setAttendanceData] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [historyModal, setHistoryModal] = useState(null);
    const [loading, setLoading] = useState(false);

    const isSunday = (dateString) => {
        // Use a format that is consistent
        const date = new Date(dateString);
        return date.getDay() === 0;
    };

    const isDateSunday = isSunday(selectedDate);

    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            try {
                // 1. Get Teacher's Classes
                const classes = await api.getTeacherClasses(user.id);
                setAssignedClasses(classes);
                if (classes.length > 0) {
                    setSelectedClassId(classes[0].name); // Default to first class name (assuming gradeLevel matches class name)
                }

                // 2. Get All Attendance (Optimized: In real app, query by class/date)
                refreshAttendance();
            } catch (error) {
                console.error("Failed to load data", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            loadInitialData();
        }
    }, [user]);

    const refreshAttendance = async () => {
        try {
            const data = await api.getAllAttendance();
            setAttendanceData(data);
        } catch (error) {
            console.error("Failed to load attendance", error);
        }
    };

    // Reload students when class selection changes
    useEffect(() => {
        const loadStudents = async () => {
            if (!selectedClassId) return;
            try {
                const allStudents = await api.getStudents();
                // Filter by Class Name (assuming gradeLevel === Class Name)
                // In production, robust linking via IDs is better.
                const classStudents = allStudents.filter(s =>
                    s.gradeLevel === selectedClassId ||
                    s.gradeLevel === selectedClassId.split(' - ')[0] // Handle "Class 10 - A" vs "Class 10"
                );
                setStudents(classStudents);
            } catch (error) {
                console.error("Failed to load students", error);
            }
        };
        loadStudents();
    }, [selectedClassId]);


    const markAttendance = async (studentId, status, targetDate = selectedDate) => {
        const sId = String(studentId);
        if (isSunday(targetDate)) {
            alert('Attendance cannot be marked on Sundays.');
            return;
        }

        try {
            await api.markAttendance({
                userId: sId,
                date: targetDate,
                status,
                type: 'student'
            });

            // Refresh attendance data
            const updatedAttendance = await api.getAllAttendance();
            setAttendanceData(updatedAttendance);

            // If history modal is open, refresh records
            setHistoryModal(prev => {
                if (prev && prev.studentId === sId) {
                    const refreshedRecords = updatedAttendance
                        .filter(a => a.user_id === sId)
                        .sort((a, b) => new Date(b.date) - new Date(a.date));
                    return { ...prev, records: refreshedRecords };
                }
                return prev;
            });
        } catch (error) {
            console.error('Failed to mark attendance:', error);
            alert('Failed to mark attendance. Please check your connection.');
        }
    };

    const getStudentStatus = (studentId) => {
        const record = attendanceData.find(a => a.user_id === studentId && a.date === selectedDate);
        return record ? record.status : null;
    };

    const openHistory = (studentId, studentName) => {
        const records = attendanceData
            .filter(a => a.user_id === studentId)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
        setHistoryModal({ studentId: String(studentId), studentName, records });
    };

    // Stats for the top cards
    const todaysRecords = attendanceData.filter(a => {
        // Must match date AND belong to current student list
        const isToday = a.date === selectedDate;
        const isMyStudent = students.find(s => s.id === a.user_id);
        return isToday && isMyStudent;
    });
    const presentToday = todaysRecords.filter(r => r.status === 'present').length;
    const absentToday = todaysRecords.filter(r => r.status === 'absent').length;

    if (loading) return <LoadingScreen message="Loading Attendance Data..." />;

    return (
        <div className="container" style={{ padding: '0 clamp(1rem, 5vw, 2.5rem) clamp(1rem, 3vw, 2.5rem)', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 0', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1.5rem' }}>
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
                        <h2 style={{ fontSize: 'clamp(1.5rem, 5vw, 2.25rem)', fontWeight: '800', margin: 0, color: 'var(--text)' }}>
                            Student Attendance
                        </h2>
                        <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: 'clamp(0.875rem, 2vw, 1rem)' }}>Manage attendance for your classes</p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Class Selector */}
                    <select
                        value={selectedClassId}
                        onChange={(e) => setSelectedClassId(e.target.value)}
                        style={{
                            padding: '0.75rem 1rem',
                            border: '2px solid var(--border)',
                            borderRadius: 'var(--radius)',
                            background: 'var(--background)',
                            fontWeight: '600',
                            maxWidth: '300px',
                            width: '100%'
                        }}
                    >
                        {assignedClasses.length === 0 && <option value="">No Classes Assigned</option>}
                        {assignedClasses.map(cls => (
                            <option key={cls.id} value={cls.name}>{cls.name} - {cls.section}</option>
                        ))}
                    </select>

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
                                fontWeight: '600',
                                maxWidth: '200px',
                                width: '100%'
                            }}
                        />
                    </div>
                </div>
            </div>

            {isDateSunday && (
                <div className="card" style={{
                    marginBottom: '2rem',
                    background: '#fff7ed',
                    border: '2px solid #fb923c',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    color: '#9a3412'
                }}>
                    <Calendar size={24} color="#fb923c" />
                    <div>
                        <h4 style={{ margin: 0 }}>Sunday - School Holiday</h4>
                        <p style={{ margin: '0.25rem 0 0 0', opacity: 0.9 }}>Attendance marking is disabled on Sundays.</p>
                    </div>
                </div>
            )}

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(150px, 45%, 200px), 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div className="card" style={{ background: 'linear-gradient(135deg, #3b82f6, #60a5fa)', color: 'white', padding: 'clamp(1rem, 3vw, 1.5rem)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(0.5rem, 2vw, 1rem)' }}>
                        <div style={{ width: 'clamp(40px, 8vw, 48px)', height: 'clamp(40px, 8vw, 48px)', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Users size={20} />
                        </div>
                        <div>
                            <p style={{ margin: 0, opacity: 0.9, fontSize: 'clamp(0.75rem, 2vw, 0.85rem)' }}>Total Students</p>
                            <h3 style={{ margin: '0.25rem 0 0 0', fontSize: 'clamp(1.25rem, 4vw, 1.75rem)', fontWeight: '800' }}>{students.length}</h3>
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

            {/* Student List Table */}
            <div className="card">
                <h3 style={{ marginBottom: '1.5rem' }}>Atttendance List for {selectedClassId}</h3>

                {students.length === 0 ? (
                    <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No students found in this class.</p>
                ) : (
                    <>
                        <style>{`
                            @media (min-width: 768px) {
                                .attendance-table-responsive { display: block !important; }
                                .attendance-mobile-cards { display: none !important; }
                            }
                        `}</style>

                        {/* Desktop Table View */}
                        <div className="attendance-table-responsive table-responsive" style={{ display: 'none' }}>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Student</th>
                                        <th>Monthly Stats (30 Days)</th>
                                        <th>Performance</th>
                                        <th>Yesterday's Status</th>
                                        <th>Mark Today ({selectedDate})</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map(student => {
                                        // Calculate Stats
                                        const now = new Date();
                                        // Filter records for this student in current month
                                        const currentMonthRecords = attendanceData.filter(a => {
                                            const d = new Date(a.date);
                                            return a.user_id === student.id &&
                                                d.getMonth() === now.getMonth() &&
                                                d.getFullYear() === now.getFullYear();
                                        });

                                        const presentCount = currentMonthRecords.filter(r => r.status === 'present').length;
                                        const absentCount = currentMonthRecords.filter(r => r.status === 'absent').length;

                                        // Circle Chart Logic
                                        const totalDays = 30; // Denominator
                                        const percentage = Math.min((presentCount / totalDays) * 100, 100);
                                        const isDanger = absentCount > 5;
                                        const circleColor = isDanger ? '#ef4444' : '#10b981';
                                        const circleTrack = isDanger ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)';

                                        // Yesterday
                                        const today = new Date();
                                        const yesterday = new Date(today);
                                        yesterday.setDate(yesterday.getDate() - 1);
                                        const yesterdayStr = yesterday.toISOString().split('T')[0];
                                        const yesterdayRecord = attendanceData.find(a => a.user_id === student.id && a.date === yesterdayStr);

                                        // Current Status
                                        const currentStatus = getStudentStatus(student.id);

                                        return (
                                            <tr key={student.id}>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                        {student.photo ? (
                                                            <img
                                                                src={student.photo}
                                                                alt={student.name}
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
                                                                {student.name.charAt(0)}
                                                            </div>
                                                        )}
                                                        <div>
                                                            <div style={{ fontWeight: '600' }}>{student.name}</div>
                                                            <div style={{ fontSize: '0.81rem', color: 'var(--text-muted)' }}>ID: {student.id}</div>
                                                            <div style={{ fontSize: '0.81rem', color: 'var(--text-muted)' }}>Class: {student.gradeLevel}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', width: '150px' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                                                            <span style={{ color: '#10b981', fontWeight: '600' }}>{presentCount} P</span>
                                                            <span style={{ color: '#ef4444', fontWeight: '600' }}>{absentCount} A</span>
                                                        </div>
                                                        <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                                                            <div style={{
                                                                width: `${percentage}%`,
                                                                height: '100%',
                                                                background: circleColor,
                                                                borderRadius: '10px'
                                                            }} />
                                                        </div>
                                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                                                            Out of 30 Days
                                                        </div>
                                                    </div>
                                                </td>
                                                <td onClick={() => openHistory(student.id, student.name)} style={{ cursor: 'pointer' }}>
                                                    <div style={{ position: 'relative', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <svg width="45" height="45" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                                                            <circle cx="50" cy="50" r="40" fill="transparent" stroke={circleTrack} strokeWidth="10" />
                                                            <circle
                                                                cx="50" cy="50" r="40"
                                                                fill="transparent"
                                                                stroke={circleColor}
                                                                strokeWidth="10"
                                                                strokeDasharray={`${(percentage / 100) * 251.2} 251.2`}
                                                                strokeLinecap="round"
                                                            />
                                                        </svg>
                                                        <div style={{ position: 'absolute', fontSize: '0.7rem', fontWeight: '700', color: circleColor }}>
                                                            {Math.round(percentage)}%
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    {yesterdayRecord ? (
                                                        <span className={`badge`} style={{
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
                                                            onClick={() => markAttendance(student.id, 'present')}
                                                            className="btn btn-sm"
                                                            disabled={isDateSunday}
                                                            style={{
                                                                background: currentStatus === 'present' ? '#10b981' : 'transparent',
                                                                color: currentStatus === 'present' ? 'white' : '#10b981',
                                                                border: '2px solid #10b981',
                                                                opacity: (currentStatus === 'present' && !isDateSunday) ? 1 : 0.6,
                                                                cursor: isDateSunday ? 'not-allowed' : 'pointer'
                                                            }}
                                                        >
                                                            <CheckCircle size={16} /> P
                                                        </button>
                                                        <button
                                                            onClick={() => markAttendance(student.id, 'absent')}
                                                            className="btn btn-sm"
                                                            disabled={isDateSunday}
                                                            style={{
                                                                background: currentStatus === 'absent' ? '#ef4444' : 'transparent',
                                                                color: currentStatus === 'absent' ? 'white' : '#ef4444',
                                                                border: '2px solid #ef4444',
                                                                opacity: (currentStatus === 'absent' && !isDateSunday) ? 1 : 0.6,
                                                                cursor: isDateSunday ? 'not-allowed' : 'pointer'
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

                        {/* Mobile Card View */}
                        <div className="attendance-mobile-cards" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {students.map(student => {
                                // Calculate Stats (same logic as table)
                                const now = new Date();
                                const currentMonthRecords = attendanceData.filter(a => {
                                    const d = new Date(a.date);
                                    return a.user_id === student.id &&
                                        d.getMonth() === now.getMonth() &&
                                        d.getFullYear() === now.getFullYear();
                                });

                                const presentCount = currentMonthRecords.filter(r => r.status === 'present').length;
                                const absentCount = currentMonthRecords.filter(r => r.status === 'absent').length;
                                const totalDays = 30;
                                const percentage = Math.min((presentCount / totalDays) * 100, 100);
                                const isDanger = absentCount > 5;
                                const circleColor = isDanger ? '#ef4444' : '#10b981';

                                const currentStatus = getStudentStatus(student.id);

                                return (
                                    <div key={student.id} style={{
                                        border: '2px solid var(--border)',
                                        borderRadius: 'var(--radius)',
                                        padding: '1rem',
                                        background: 'var(--surface)'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                {student.photo ? (
                                                    <img
                                                        src={student.photo}
                                                        alt={student.name}
                                                        style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)' }}
                                                    />
                                                ) : (
                                                    <div style={{
                                                        width: '50px', height: '50px', borderRadius: '50%',
                                                        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        color: 'white', fontWeight: '700'
                                                    }}>
                                                        {student.name.charAt(0)}
                                                    </div>
                                                )}
                                                <div>
                                                    <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>{student.name}</div>
                                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>ID: {student.id}</div>
                                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Class: {student.gradeLevel}</div>
                                                </div>
                                            </div>
                                            <div
                                                onClick={() => openHistory(student.id, student.name)}
                                                style={{ textAlign: 'center', cursor: 'pointer' }}
                                            >
                                                <div style={{ fontSize: '1.2rem', fontWeight: '800', color: circleColor }}>
                                                    {Math.round(percentage)}%
                                                </div>
                                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '600' }}>HISTORY</div>
                                            </div>
                                        </div>

                                        <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'var(--background-alt)', borderRadius: '12px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                                                <span style={{ color: '#10b981', fontWeight: '700' }}>{presentCount} P</span>
                                                <span style={{ color: '#ef4444', fontWeight: '700' }}>{absentCount} A</span>
                                                <span style={{ color: 'var(--text-muted)' }}>of 30 Days</span>
                                            </div>
                                            <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
                                                <div style={{
                                                    width: `${percentage}%`,
                                                    height: '100%',
                                                    background: circleColor,
                                                    borderRadius: '10px'
                                                }} />
                                            </div>
                                        </div>

                                        {/* Attendance Buttons */}
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                onClick={() => markAttendance(student.id, 'present')}
                                                className="btn btn-sm"
                                                disabled={isDateSunday}
                                                style={{
                                                    flex: 1,
                                                    background: currentStatus === 'present' ? '#10b981' : 'transparent',
                                                    color: currentStatus === 'present' ? 'white' : '#10b981',
                                                    border: '2px solid #10b981',
                                                    opacity: (currentStatus === 'present' && !isDateSunday) ? 1 : 0.6,
                                                    cursor: isDateSunday ? 'not-allowed' : 'pointer'
                                                }}
                                            >
                                                <CheckCircle size={16} /> Present
                                            </button>
                                            <button
                                                onClick={() => markAttendance(student.id, 'absent')}
                                                className="btn btn-sm"
                                                disabled={isDateSunday}
                                                style={{
                                                    flex: 1,
                                                    background: currentStatus === 'absent' ? '#ef4444' : 'transparent',
                                                    color: currentStatus === 'absent' ? 'white' : '#ef4444',
                                                    border: '2px solid #ef4444',
                                                    opacity: (currentStatus === 'absent' && !isDateSunday) ? 1 : 0.6,
                                                    cursor: isDateSunday ? 'not-allowed' : 'pointer'
                                                }}
                                            >
                                                <XCircle size={16} /> Absent
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
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

                        <h3 style={{ marginBottom: '1rem' }}>Attendance History: {historyModal.studentName}</h3>

                        {historyModal.records.length === 0 ? (
                            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No records found.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {historyModal.records.map((record, i) => (
                                    <div key={i} style={{
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
                                                onClick={() => markAttendance(historyModal.studentId, 'present', record.date)}
                                                className="btn btn-sm"
                                                disabled={isSunday(record.date)}
                                                style={{
                                                    padding: '0.4rem 0.6rem',
                                                    fontSize: '0.75rem',
                                                    background: record.status === 'present' ? '#10b981' : 'transparent',
                                                    color: record.status === 'present' ? 'white' : '#10b981',
                                                    border: '1px solid #10b981',
                                                    opacity: isSunday(record.date) ? 0.5 : 1,
                                                    cursor: isSunday(record.date) ? 'not-allowed' : 'pointer'
                                                }}
                                            >P</button>
                                            <button
                                                onClick={() => markAttendance(historyModal.studentId, 'absent', record.date)}
                                                className="btn btn-sm"
                                                disabled={isSunday(record.date)}
                                                style={{
                                                    padding: '0.4rem 0.6rem',
                                                    fontSize: '0.75rem',
                                                    background: record.status === 'absent' ? '#ef4444' : 'transparent',
                                                    color: record.status === 'absent' ? 'white' : '#ef4444',
                                                    border: '1px solid #ef4444',
                                                    opacity: isSunday(record.date) ? 0.5 : 1,
                                                    cursor: isSunday(record.date) ? 'not-allowed' : 'pointer'
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

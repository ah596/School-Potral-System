import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { Clock, BookOpen, Calendar, MapPin, User, ArrowLeft } from 'lucide-react';
import LoadingScreen from '../components/LoadingScreen';
import FeatureLocked from '../components/FeatureLocked';
import { api } from '../utils/api';

const DEFAULT_TIMETABLE = {
    Monday: [
        { time: '08:00 - 09:00', subject: 'Mathematics', teacher: 'Mr. Anderson', room: 'Room 101' },
        { time: '09:00 - 10:00', subject: 'Science', teacher: 'Ms. Roberts', room: 'Lab 1' },
        { time: '10:00 - 10:15', subject: 'Break', teacher: '-', room: '-' },
        { time: '10:15 - 11:15', subject: 'English', teacher: 'Mrs. Johnson', room: 'Room 203' },
        { time: '11:15 - 12:15', subject: 'History', teacher: 'Mr. Davis', room: 'Room 105' },
        { time: '12:15 - 01:00', subject: 'Lunch', teacher: '-', room: '-' },
        { time: '01:00 - 02:00', subject: 'Geography', teacher: 'Ms. Wilson', room: 'Room 107' },
    ],
    Tuesday: [
        { time: '08:00 - 09:00', subject: 'Science', teacher: 'Ms. Roberts', room: 'Lab 1' },
        { time: '09:00 - 10:00', subject: 'Mathematics', teacher: 'Mr. Anderson', room: 'Room 101' },
        { time: '10:00 - 10:15', subject: 'Break', teacher: '-', room: '-' },
        { time: '10:15 - 11:15', subject: 'Physical Education', teacher: 'Coach Brown', room: 'Gym' },
        { time: '11:15 - 12:15', subject: 'English', teacher: 'Mrs. Johnson', room: 'Room 203' },
        { time: '12:15 - 01:00', subject: 'Lunch', teacher: '-', room: '-' },
        { time: '01:00 - 02:00', subject: 'Art', teacher: 'Ms. Taylor', room: 'Art Room' },
    ],
    Wednesday: [
        { time: '08:00 - 09:00', subject: 'Mathematics', teacher: 'Mr. Anderson', room: 'Room 101' },
        { time: '09:00 - 10:00', subject: 'History', teacher: 'Mr. Davis', room: 'Room 105' },
        { time: '10:00 - 10:15', subject: 'Break', teacher: '-', room: '-' },
        { time: '10:15 - 11:15', subject: 'Science', teacher: 'Ms. Roberts', room: 'Lab 1' },
        { time: '11:15 - 12:15', subject: 'Computer Science', teacher: 'Mr. Lee', room: 'Computer Lab' },
        { time: '12:15 - 01:00', subject: 'Lunch', teacher: '-', room: '-' },
        { time: '01:00 - 02:00', subject: 'Music', teacher: 'Ms. Garcia', room: 'Music Room' },
    ],
    Thursday: [
        { time: '08:00 - 09:00', subject: 'English', teacher: 'Mrs. Johnson', room: 'Room 203' },
        { time: '09:00 - 10:00', subject: 'Mathematics', teacher: 'Mr. Anderson', room: 'Room 101' },
        { time: '10:00 - 10:15', subject: 'Break', teacher: '-', room: '-' },
        { time: '10:15 - 11:15', subject: 'Geography', teacher: 'Ms. Wilson', room: 'Room 107' },
        { time: '11:15 - 12:15', subject: 'Science', teacher: 'Ms. Roberts', room: 'Lab 1' },
        { time: '12:15 - 01:00', subject: 'Lunch', teacher: '-', room: '-' },
        { time: '01:00 - 02:00', subject: 'Physical Education', teacher: 'Coach Brown', room: 'Gym' },
    ],
    Friday: [
        { time: '08:00 - 09:00', subject: 'Science', teacher: 'Ms. Roberts', room: 'Lab 1' },
        { time: '09:00 - 10:00', subject: 'English', teacher: 'Mrs. Johnson', room: 'Room 203' },
        { time: '10:00 - 10:15', subject: 'Break', teacher: '-', room: '-' },
        { time: '10:15 - 11:15', subject: 'Mathematics', teacher: 'Mr. Anderson', room: 'Room 101' },
        { time: '11:15 - 12:15', subject: 'History', teacher: 'Mr. Davis', room: 'Room 105' },
        { time: '12:15 - 01:00', subject: 'Lunch', teacher: '-', room: '-' },
        { time: '01:00 - 02:00', subject: 'Library', teacher: '-', room: 'Library' },
    ],
};

export default function Timetable() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [timetable, setTimetable] = useState(null);
    const [loading, setLoading] = useState(false);

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const currentDay = days[new Date().getDay() - 1] || 'Monday';

    useEffect(() => {
        if (user) loadTimetable();
    }, [user]);

    const loadTimetable = async () => {
        try {
            const grade = user.grade_level || "Class 10"; // Default fallback
            let data = await api.getTimetable(grade);

            if (!data) {
                // Seed default if missing
                await api.saveTimetable(grade, DEFAULT_TIMETABLE);
                data = DEFAULT_TIMETABLE;
            }
            setTimetable(data);
        } catch (error) {
            console.error("Failed to load timetable", error);
            setTimetable(DEFAULT_TIMETABLE); // Fallback to local on error
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return <Navigate to="/login" />;
    }

    const studentLocks = JSON.parse(localStorage.getItem('admin_student_locks') || '{}');
    if (studentLocks[`${user.id}_timetable`]) {
        return <FeatureLocked featureName="Timetable" />;
    }

    const getSubjectColor = (subject) => {
        const colors = {
            'Mathematics': '#3b82f6',
            'Science': '#10b981',
            'English': '#8b5cf6',
            'History': '#f59e0b',
            'Geography': '#06b6d4',
            'Physical Education': '#ef4444',
            'Art': '#ec4899',
            'Music': '#f97316',
            'Computer Science': '#6366f1',
            'Break': '#9ca3af',
            'Lunch': '#9ca3af',
            'Library': '#84cc16'
        };
        return colors[subject] || '#6b7280';
    };

    if (loading) return <LoadingScreen message="Loading Timetable..." />;

    // Safety check if timetable structure is valid
    const safeTimetable = timetable || DEFAULT_TIMETABLE;

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
                        <h2 style={{ fontSize: 'clamp(1.5rem, 5vw, 2.25rem)', fontWeight: '800', margin: 0, color: 'var(--text)' }}>
                            Class Timetable
                        </h2>
                        <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)' }}>
                            {user.grade_level || "Class 10"} - Weekly Schedule
                        </p>
                    </div>
                </div>
            </div>

            {/* Day Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {days.map(day => (
                    <div key={day} style={{
                        padding: '0.75rem 1.5rem',
                        borderRadius: 'var(--radius)',
                        background: day === currentDay ? 'var(--primary)' : 'var(--surface)',
                        color: day === currentDay ? 'white' : 'var(--text-main)',
                        fontWeight: day === currentDay ? '700' : '500',
                        border: day === currentDay ? 'none' : '1px solid var(--border)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        whiteSpace: 'nowrap'
                    }}>
                        {day}
                    </div>
                ))
                }
            </div >

            {/* Timetable for Each Day */}
            {
                days.map(day => (
                    <div key={day} className="card" style={{ marginBottom: '2rem' }}>
                        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <BookOpen size={24} color="var(--primary)" />
                            {day}
                            {day === currentDay && (
                                <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', marginLeft: '0.5rem' }}>
                                    Today
                                </span>
                            )}
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {safeTimetable[day] && safeTimetable[day].map((period, index) => (
                                <div key={index} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '1rem',
                                    background: period.subject === 'Break' || period.subject === 'Lunch' ? 'var(--background)' : 'transparent',
                                    border: '1px solid var(--border)',
                                    borderRadius: 'var(--radius)',
                                    borderLeft: `4px solid ${getSubjectColor(period.subject)}`
                                }}>
                                    <div style={{ minWidth: '140px', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                        <Clock size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                        {period.time}
                                    </div>
                                    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>
                                        <div>
                                            <span style={{ fontWeight: '700', fontSize: '1.1rem', color: getSubjectColor(period.subject) }}>
                                                {period.subject}
                                            </span>
                                        </div>
                                        <div style={{ color: 'var(--text-muted)' }}>
                                            {period.teacher}
                                        </div>
                                        <div style={{ color: 'var(--text-muted)' }}>
                                            {period.room}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            }
        </div >
    );
}

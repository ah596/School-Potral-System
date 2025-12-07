import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Calendar, TrendingUp, Award } from 'lucide-react';

export default function Attendance() {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" />;
    }

    const attendance = user.attendance || { total: 100, present: 85, percentage: 85 };

    const monthlyData = [
        { month: 'September', total: 22, present: 20, percentage: 91 },
        { month: 'October', total: 24, present: 22, percentage: 92 },
        { month: 'November', total: 26, present: 21, percentage: 81 },
        { month: 'December', total: 28, present: 22, percentage: 79 },
    ];

    const subjectWise = [
        { subject: 'Mathematics', total: 25, present: 23, percentage: 92 },
        { subject: 'Science', total: 25, present: 21, percentage: 84 },
        { subject: 'English', total: 25, present: 22, percentage: 88 },
        { subject: 'History', total: 25, present: 19, percentage: 76 },
    ];

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
        <div className="container" style={{ padding: '2rem 0' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '2rem' }}>Attendance Record</h2>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="card" style={{ background: 'linear-gradient(135deg, #3b82f6, #60a5fa)', color: 'white' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '56px', height: '56px', background: 'rgba(255,255,255,0.2)', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Calendar size={28} />
                        </div>
                        <div>
                            <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>Total Days</p>
                            <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '2rem', fontWeight: '800' }}>{attendance.total}</h3>
                        </div>
                    </div>
                </div>

                <div className="card" style={{ background: 'linear-gradient(135deg, #10b981, #34d399)', color: 'white' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '56px', height: '56px', background: 'rgba(255,255,255,0.2)', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <TrendingUp size={28} />
                        </div>
                        <div>
                            <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>Present</p>
                            <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '2rem', fontWeight: '800' }}>{attendance.present}</h3>
                        </div>
                    </div>
                </div>

                <div className="card" style={{ background: `linear-gradient(135deg, ${getStatusColor(attendance.percentage)}, ${getStatusColor(attendance.percentage)}dd)`, color: 'white' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '56px', height: '56px', background: 'rgba(255,255,255,0.2)', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Award size={28} />
                        </div>
                        <div>
                            <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>Percentage</p>
                            <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '2rem', fontWeight: '800' }}>{attendance.percentage}%</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Status Alert */}
            <div className="card" style={{
                marginBottom: '2rem',
                background: `${getStatusColor(attendance.percentage)}15`,
                border: `2px solid ${getStatusColor(attendance.percentage)}`
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Award size={32} color={getStatusColor(attendance.percentage)} />
                    <div>
                        <h4 style={{ margin: 0, color: getStatusColor(attendance.percentage) }}>
                            Attendance Status: {getStatusText(attendance.percentage)}
                        </h4>
                        <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)' }}>
                            {attendance.percentage >= 80
                                ? 'Great job! Keep maintaining your attendance.'
                                : 'Warning: You need to maintain at least 80% attendance to be eligible for exams.'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Monthly Attendance */}
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
                                    <td style={{ fontWeight: '700' }}>{month.percentage}%</td>
                                    <td>
                                        <span className="badge" style={{
                                            background: `${getStatusColor(month.percentage)}20`,
                                            color: getStatusColor(month.percentage)
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

            {/* Subject-wise Attendance */}
            <div className="card">
                <h3 style={{ marginBottom: '1.5rem' }}>Subject-wise Attendance</h3>
                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Subject</th>
                                <th>Total Classes</th>
                                <th>Attended</th>
                                <th>Percentage</th>
                                <th>Progress</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subjectWise.map((subject, index) => (
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
    );
}

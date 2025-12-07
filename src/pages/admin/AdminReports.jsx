import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { storage } from '../../utils/storage';
import { Users, GraduationCap, TrendingUp, BarChart } from 'lucide-react';

export default function AdminReports() {
    const { user } = useAuth();
    const [students, setStudents] = useState([]);
    const [teachers, setTeachers] = useState([]);

    useEffect(() => {
        setStudents(storage.getStudents());
        setTeachers(storage.getTeachers());
    }, []);

    if (!user || user.role !== 'admin') {
        return <Navigate to="/login" />;
    }

    const gradeDistribution = students.reduce((acc, student) => {
        acc[student.gradeLevel] = (acc[student.gradeLevel] || 0) + 1;
        return acc;
    }, {});

    const stats = [
        { label: 'Total Students', value: students.length, icon: GraduationCap, color: '#10b981' },
        { label: 'Total Teachers', value: teachers.length, icon: Users, color: '#3b82f6' },
        { label: 'Total Classes', value: Object.keys(gradeDistribution).length, icon: BarChart, color: '#f59e0b' },
        { label: 'Avg. Class Size', value: students.length > 0 ? Math.round(students.length / Object.keys(gradeDistribution).length) : 0, icon: TrendingUp, color: '#8b5cf6' },
    ];

    return (
        <div className="container" style={{ padding: '2rem 0' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '2rem' }}>School Reports & Analytics</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                {stats.map((stat, index) => (
                    <div key={index} className="card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '56px', height: '56px', background: `${stat.color}20`, borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <stat.icon size={28} color={stat.color} />
                            </div>
                            <div>
                                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>{stat.label}</p>
                                <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '2rem', fontWeight: '800' }}>{stat.value}</h3>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>Grade Distribution</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    {Object.entries(gradeDistribution).map(([grade, count]) => (
                        <div key={grade} style={{ padding: '1rem', background: 'var(--background)', borderRadius: 'var(--radius)' }}>
                            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>{grade}</p>
                            <h4 style={{ margin: '0.25rem 0 0 0', fontSize: '1.5rem', fontWeight: '700' }}>{count} Students</h4>
                        </div>
                    ))}
                </div>
            </div>

            <div className="card">
                <h3 style={{ marginBottom: '1.5rem' }}>Teacher Overview</h3>
                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Subject</th>
                                <th>Classes Assigned</th>
                                <th>Students</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teachers.map(teacher => {
                                const teacherStudents = teacher.classes?.reduce((sum, className) => {
                                    return sum + (gradeDistribution[className] || 0);
                                }, 0) || 0;

                                return (
                                    <tr key={teacher.id}>
                                        <td>{teacher.name}</td>
                                        <td>{teacher.subject}</td>
                                        <td>{(teacher.classes || []).join(', ')}</td>
                                        <td>{teacherStudents}</td>
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

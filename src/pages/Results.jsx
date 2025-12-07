import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { api } from '../utils/api';
import { Trophy, TrendingUp, Award, Download, FileText } from 'lucide-react';

export default function Results() {
    const { user } = useAuth();
    const [tests, setTests] = useState([]);

    useEffect(() => {
        const fetchTests = async () => {
            try {
                const allTests = await api.getTests();
                // Filter tests for this student that have marks
                const myTests = allTests.filter(test =>
                    test.marks && test.marks[user.id] !== undefined
                );
                setTests(myTests);
            } catch (error) {
                console.error('Failed to fetch tests:', error);
            }
        };

        if (user) {
            fetchTests();
        }
    }, [user]);

    if (!user) {
        return <Navigate to="/login" />;
    }

    const termResults = [
        {
            term: 'Term 1 - 2024',
            subjects: [
                { name: 'Mathematics', marks: 85, total: 100, grade: 'A' },
                { name: 'Science', marks: 78, total: 100, grade: 'B+' },
                { name: 'English', marks: 92, total: 100, grade: 'A+' },
                { name: 'History', marks: 75, total: 100, grade: 'B' },
                { name: 'Geography', marks: 88, total: 100, grade: 'A' },
            ],
            average: 83.6,
            rank: 5,
            totalStudents: 45
        },
        {
            term: 'Term 2 - 2024',
            subjects: [
                { name: 'Mathematics', marks: 90, total: 100, grade: 'A+' },
                { name: 'Science', marks: 82, total: 100, grade: 'A' },
                { name: 'English', marks: 88, total: 100, grade: 'A' },
                { name: 'History', marks: 80, total: 100, grade: 'A' },
                { name: 'Geography', marks: 85, total: 100, grade: 'A' },
            ],
            average: 85,
            rank: 3,
            totalStudents: 45
        }
    ];

    const getGradeColor = (grade) => {
        if (grade.includes('A')) return '#10b981';
        if (grade.includes('B')) return '#3b82f6';
        if (grade.includes('C')) return '#f59e0b';
        return '#ef4444';
    };

    const calculatePercentage = (marks, total) => {
        return ((marks / total) * 100).toFixed(1);
    };

    const getGradeFromPercentage = (percentage) => {
        if (percentage >= 90) return 'A+';
        if (percentage >= 80) return 'A';
        if (percentage >= 70) return 'B+';
        if (percentage >= 60) return 'B';
        if (percentage >= 50) return 'C';
        return 'F';
    };

    return (
        <div className="container" style={{ padding: '2rem 0' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '2rem' }}>Exam Results</h2>

            {/* Overall Performance */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="card" style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)', color: 'white' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '56px', height: '56px', background: 'rgba(255,255,255,0.2)', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Trophy size={28} />
                        </div>
                        <div>
                            <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>Current Rank</p>
                            <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '2rem', fontWeight: '800' }}>
                                #{termResults[termResults.length - 1].rank}
                            </h3>
                        </div>
                    </div>
                </div>

                <div className="card" style={{ background: 'linear-gradient(135deg, #10b981, #34d399)', color: 'white' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '56px', height: '56px', background: 'rgba(255,255,255,0.2)', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <TrendingUp size={28} />
                        </div>
                        <div>
                            <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>Average Score</p>
                            <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '2rem', fontWeight: '800' }}>
                                {termResults[termResults.length - 1].average}%
                            </h3>
                        </div>
                    </div>
                </div>

                <div className="card" style={{ background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)', color: 'white' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '56px', height: '56px', background: 'rgba(255,255,255,0.2)', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Award size={28} />
                        </div>
                        <div>
                            <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>Overall Grade</p>
                            <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '2rem', fontWeight: '800' }}>A</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Test Marks */}
            {tests.length > 0 && (
                <div className="card" style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FileText size={24} color="var(--primary)" />
                            Test Marks
                        </h3>
                    </div>
                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Test Name</th>
                                    <th>Subject</th>
                                    <th>Section</th>
                                    <th>Date</th>
                                    <th>Marks Obtained</th>
                                    <th>Total Marks</th>
                                    <th>Percentage</th>
                                    <th>Grade</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tests.map(test => {
                                    const marks = parseInt(test.marks[user.id]);
                                    const percentage = (marks / test.totalMarks) * 100;
                                    const grade = getGradeFromPercentage(percentage);

                                    return (
                                        <tr key={test.id}>
                                            <td style={{ fontWeight: '600' }}>{test.name}</td>
                                            <td>{test.subject}</td>
                                            <td>Section {test.section}</td>
                                            <td>{test.date}</td>
                                            <td style={{ fontWeight: '700', color: 'var(--primary)' }}>{marks}</td>
                                            <td>{test.totalMarks}</td>
                                            <td>{percentage.toFixed(1)}%</td>
                                            <td>
                                                <span className="badge" style={{
                                                    background: `${getGradeColor(grade)}20`,
                                                    color: getGradeColor(grade)
                                                }}>
                                                    {grade}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Term Results */}
            {termResults.map((term, termIndex) => (
                <div key={termIndex} className="card" style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <div>
                            <h3 style={{ margin: 0 }}>{term.term}</h3>
                            <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)' }}>
                                Rank: #{term.rank} out of {term.totalStudents} students
                            </p>
                        </div>
                        <button className="btn btn-outline btn-sm">
                            <Download size={16} /> Download Report
                        </button>
                    </div>

                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Subject</th>
                                    <th>Marks Obtained</th>
                                    <th>Total Marks</th>
                                    <th>Percentage</th>
                                    <th>Grade</th>
                                    <th>Progress</th>
                                </tr>
                            </thead>
                            <tbody>
                                {term.subjects.map((subject, index) => (
                                    <tr key={index}>
                                        <td style={{ fontWeight: '600' }}>{subject.name}</td>
                                        <td style={{ fontWeight: '700', color: 'var(--primary)' }}>{subject.marks}</td>
                                        <td>{subject.total}</td>
                                        <td>{calculatePercentage(subject.marks, subject.total)}%</td>
                                        <td>
                                            <span className="badge" style={{
                                                background: `${getGradeColor(subject.grade)}20`,
                                                color: getGradeColor(subject.grade)
                                            }}>
                                                {subject.grade}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ width: '100%', maxWidth: '150px', height: '8px', background: 'var(--background)', borderRadius: '4px', overflow: 'hidden' }}>
                                                <div style={{
                                                    width: `${calculatePercentage(subject.marks, subject.total)}%`,
                                                    height: '100%',
                                                    background: getGradeColor(subject.grade),
                                                    transition: 'width 0.3s ease'
                                                }} />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                <tr style={{ background: 'var(--background)', fontWeight: '700' }}>
                                    <td>Average</td>
                                    <td colSpan="2"></td>
                                    <td style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>{term.average}%</td>
                                    <td colSpan="2"></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}

            {/* Performance Chart */}
            <div className="card">
                <h3 style={{ marginBottom: '1.5rem' }}>Performance Trend</h3>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', height: '200px', padding: '1rem', background: 'var(--background)', borderRadius: 'var(--radius)' }}>
                    {termResults.map((term, index) => (
                        <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{
                                width: '100%',
                                height: `${term.average}%`,
                                background: 'linear-gradient(to top, var(--primary), var(--secondary))',
                                borderRadius: '0.5rem',
                                display: 'flex',
                                alignItems: 'flex-start',
                                justifyContent: 'center',
                                padding: '0.5rem',
                                color: 'white',
                                fontWeight: '700'
                            }}>
                                {term.average}%
                            </div>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                                {term.term.split(' - ')[0]}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { api } from '../utils/api';
import { Trophy, Award, TrendingUp, Download, Eye, ArrowLeft, FileText, Calendar } from 'lucide-react';
import LoadingScreen from '../components/LoadingScreen';
import FeatureLocked from '../components/FeatureLocked';

export default function Results() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchTests = async () => {
            setLoading(true);
            try {
                const allTests = await api.getTests();
                // Filter tests for this student that have marks
                const myTests = allTests.filter(test =>
                    test.marks && test.marks[user.id] !== undefined
                );
                setTests(myTests);
                localStorage.setItem(`last_viewed_results_${user.id}`, new Date().toISOString());
            } catch (error) {
                console.error('Failed to fetch tests:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchTests();
        }
    }, [user]);

    if (!user) {
        return <Navigate to="/login" />;
    }

    const studentLocks = JSON.parse(localStorage.getItem('admin_student_locks') || '{}');
    if (studentLocks[`${user.id}_results`]) {
        return <FeatureLocked featureName="Results" />;
    }

    if (loading) return <LoadingScreen message="Loading Results..." />;

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
                        Exam Results
                    </h2>
                </div>
            </div>

            {/* Overall Performance */}
            <div className="performance-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>
                <div className="card" style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)', color: 'white' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '56px', height: '56px', background: 'rgba(255,255,255,0.2)', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Trophy size={28} />
                        </div>
                        <div>
                            <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>Tests Attempted</p>
                            <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '2rem', fontWeight: '800' }}>
                                {tests.length}
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
                            <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>Current Average</p>
                            <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '2rem', fontWeight: '800' }}>
                                {tests.length > 0
                                    ? (tests.reduce((acc, t) => acc + (parseInt(t.marks[user.id]) / (t.totalMarks || t.total_marks) * 100), 0) / tests.length).toFixed(1)
                                    : '0'}%
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
                            <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>Recent Status</p>
                            <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '2rem', fontWeight: '800' }}>
                                {tests.length > 0 ? getGradeFromPercentage(parseInt(tests[0].marks[user.id]) / (tests[0].totalMarks || tests[0].total_marks) * 100) : 'N/A'}
                            </h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Test Marks */}
            {tests.length > 0 ? (
                <div className="card results-table-card" style={{ marginBottom: '2rem', padding: 'clamp(1rem, 3vw, 1.5rem)' }}>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '1.5rem',
                        flexWrap: 'wrap',
                        gap: '1rem'
                    }}>
                        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FileText size={24} color="var(--primary)" />
                            Academic Test Results
                        </h3>
                    </div>
                    <div className="table-responsive results-scroll-container">
                        <table className="table results-table">
                            <thead>
                                <tr>
                                    <th>Test Details</th>
                                    <th className="hide-mobile">Subject</th>
                                    <th className="hide-mobile">Date</th>
                                    <th>Marks</th>
                                    <th className="hide-mobile">Total</th>
                                    <th>%</th>
                                    <th>Grade</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tests.map(test => {
                                    const marks = parseInt(test.marks[user.id]);
                                    const total = test.totalMarks || test.total_marks;
                                    const percentage = (marks / total) * 100;
                                    const grade = getGradeFromPercentage(percentage);

                                    return (
                                        <tr key={test.id}>
                                            <td>
                                                <div style={{ fontWeight: '700', color: 'var(--text-main)' }}>{test.name}</div>
                                                <div className="show-mobile-only" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                                    {test.subject} • {test.date}
                                                </div>
                                            </td>
                                            <td className="hide-mobile">{test.subject}</td>
                                            <td className="hide-mobile">{test.date}</td>
                                            <td style={{ fontWeight: '700', color: 'var(--primary)' }}>{marks}</td>
                                            <td className="hide-mobile" style={{ color: 'var(--text-muted)' }}>{total}</td>
                                            <td style={{ fontWeight: '600' }}>{percentage.toFixed(0)}%</td>
                                            <td>
                                                <span className="badge" style={{
                                                    background: 'transparent',
                                                    color: getGradeColor(grade),
                                                    padding: '4px 0',
                                                    fontSize: '0.9rem',
                                                    fontWeight: '800',
                                                    minWidth: '35px',
                                                    textAlign: 'center',
                                                    border: 'none'
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
            ) : (
                <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-muted)', margin: 0 }}>No test results available yet.</p>
                </div>
            )}
        </div>
    );
}

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { api } from '../../utils/api';
import { Plus, Edit2, Trash2, Save, X, BookOpen, Clock, CheckCircle, ArrowLeft, FileText } from 'lucide-react';
import LoadingScreen from '../../components/LoadingScreen';

export default function TeacherTests() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [tests, setTests] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [editingDetailsId, setEditingDetailsId] = useState(null);
    const [isAdding, setIsAdding] = useState(false);
    const [editingTest, setEditingTest] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        subject: '',
        class: '',
        totalMarks: 100,
        date: '',
        section: 'A'
    });
    const [marksEntry, setMarksEntry] = useState({});
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

    const [assignedClasses, setAssignedClasses] = useState([]);

    useEffect(() => {
        const fetchClasses = async () => {
            setLoading(true);
            if (user?.id) {
                try {
                    const classes = await api.getTeacherClasses(user.id);
                    setAssignedClasses(classes);
                    if (classes.length > 0) {
                        // Construct class name format to match what's saved (e.g., "Class 10" or "Class 10 - A")
                        // Adjust based on your data. AdminTeacherAttendance uses cls.name
                        // TeacherTests previously expected string array.
                        // Let's default to the first class name.
                        setSelectedClass(classes[0].name);
                    } else if (user?.classes?.length > 0) {
                        // Fallback to user.classes if api returns nothing (legacy support)
                        setSelectedClass(user.classes[0]);
                        setAssignedClasses(user.classes.map(c => ({ name: c, id: c })));
                    } else {
                        // Even if no classes, try loading tests for this teacher to avoid empty screen
                        loadTests();
                    }
                } catch (e) {
                    console.error("Failed to load classes", e);
                    loadTests();
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchClasses();
    }, [user]);

    useEffect(() => {
        loadTests();
        if (selectedClass) {
            loadStudents();
        }
    }, [selectedClass]);

    const loadTests = async () => {
        try {
            const allTests = await api.getTests();
            const myTests = allTests.filter(t =>
                t.teacher_id === user.id || t.teacherId === user.id
            );
            setTests(myTests);
        } catch (error) {
            console.error('Failed to load tests:', error);
        }
    };

    const loadStudents = async () => {
        try {
            const allStudents = await api.getStudents();
            const classFilter = selectedClass.split('-')[0].trim();
            const myStudents = allStudents.filter(s => s.gradeLevel === classFilter || s.grade_level === classFilter);
            setStudents(myStudents);
        } catch (error) {
            console.error('Failed to load students:', error);
        }
    };

    const handleAddTest = () => {
        setEditingDetailsId(null);
        setIsAdding(true);
        setFormData({
            name: '',
            subject: user.subject || '',
            class: selectedClass,
            totalMarks: 100,
            date: new Date().toISOString().split('T')[0],
            section: 'A'
        });
    };

    const handleEditInfo = (test) => {
        setEditingDetailsId(test.id);
        setIsAdding(true);
        setFormData({
            name: test.name,
            subject: test.subject,
            class: test.class_name || selectedClass,
            totalMarks: test.total_marks || test.totalMarks,
            date: test.date,
            section: test.section
        });
    };

    const handleSaveTest = async () => {
        try {
            const payload = {
                name: formData.name,
                subject: formData.subject,
                date: formData.date,
                total_marks: formData.totalMarks,
                section: formData.section,
                teacher_id: user.id,
                class_name: formData.class
            };

            if (editingDetailsId) {
                await api.updateTest(editingDetailsId, payload);
            } else {
                await api.addTest(payload);
            }

            await loadTests();
            setIsAdding(false);
            setEditingDetailsId(null);
        } catch (error) {
            console.error('Failed to save test:', error);
            alert('Failed to save test');
        }
    };

    const handleDeleteTest = async (testId) => {
        if (window.confirm('Are you sure you want to delete this test? This action cannot be undone.')) {
            setLoading(true);
            setLoadingMessage('Deleting Test...');
            try {
                await api.deleteTest(testId);
                await loadTests(); // Reload the tests list
                alert('Test deleted successfully!');
            } catch (error) {
                console.error('Failed to delete test:', error);
                alert('Failed to delete test. Please try again.');
            } finally {
                setLoading(false);
            }
        }
    };


    // ...

    const handleUploadMarks = (test) => {
        // Navigate to dedicated marks page with pre-selected test if possible
        // Since TeacherMarks uses selectedClass/Test state, we can't easily deep link without query params support there.
        // For now, we'll just navigate, and the user can select.
        // Ideally: navigate(`/teacher/marks?class=${test.class_name}&test=${test.id}`)
        // Let's execute that plan and update TeacherMarks to read params next if needed.
        navigate('/teacher/marks');
    };

    const handleSaveMarks = async () => {
        try {
            await api.updateMarks(editingTest.id, marksEntry);
            await loadTests();
            setEditingTest(null);
            setMarksEntry({});
        } catch (error) {
            console.error('Failed to save marks:', error);
            alert('Failed to save marks');
        }
    };

    if (!user || user.role !== 'teacher') {
        return <Navigate to="/login" />;
    }

    if (loading) return <LoadingScreen message={loadingMessage || 'Loading Tests...'} />;

    return (
        <div className="container" style={{ padding: '0 clamp(1rem, 5vw, 2.5rem) clamp(1rem, 3vw, 2.5rem)', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1.5rem 0',
                marginBottom: '1.5rem',
                flexWrap: 'wrap',
                gap: '1.5rem'
            }}>
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
                        Test Marks Management
                    </h2>
                </div>
                {!isAdding && !editingTest && (
                    <button onClick={handleAddTest} className="btn btn-primary" style={{ whiteSpace: 'nowrap', padding: '0.8rem 1.5rem', borderRadius: '12px' }}>
                        <Plus size={20} /> Create New Test
                    </button>
                )}
            </div>

            {/* Class Selection */}
            <div className="card" style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Select Class</label>
                <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    style={{ width: '100%', maxWidth: '300px', padding: '0.9rem 1rem', border: '2px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--background)' }}
                >
                    <option value="">All Classes</option>
                    {assignedClasses.map(cls => (
                        <option key={cls.id || cls.name} value={cls.name}>{cls.name} {cls.section ? `- ${cls.section}` : ''}</option>
                    ))}
                </select>
            </div>

            {/* Create Test Form */}
            {isAdding && (
                <div className="card" style={{ marginBottom: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Create New Test</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                        <div className="form-group">
                            <label>Test Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., Mid-Term Exam"
                            />
                        </div>
                        <div className="form-group">
                            <label>Subject</label>
                            <input
                                type="text"
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Section</label>
                            <select
                                value={formData.section}
                                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                                style={{ width: '100%', padding: '0.9rem 1rem', border: '2px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--background)' }}
                            >
                                <option value="A">Section A</option>
                                <option value="B">Section B</option>
                                <option value="C">Section C</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Total Marks</label>
                            <input
                                type="number"
                                value={formData.totalMarks}
                                onChange={(e) => setFormData({ ...formData, totalMarks: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Date</label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                        <button onClick={handleSaveTest} className="btn btn-primary">
                            <Save size={18} /> Create Test
                        </button>
                        <button onClick={() => setIsAdding(false)} className="btn btn-outline">
                            <X size={18} /> Cancel
                        </button>
                    </div>
                </div>
            )}



            {/* Tests List */}
            <div className="card">
                <h3 style={{ marginBottom: '1.5rem' }}>All Tests - {selectedClass}</h3>
                {tests.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No tests created yet</p>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className="table-responsive" style={{ display: 'none' }}>
                            <style>{`
                                @media (min-width: 768px) {
                                    .table-responsive { display: block !important; }
                                    .mobile-test-cards { display: none !important; }
                                }
                            `}</style>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Test Name</th>
                                        <th>Subject</th>
                                        <th>Section</th>
                                        <th>Total Marks</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tests.map(test => (
                                        <tr key={test.id}>
                                            <td style={{ fontWeight: '600' }}>{test.name}</td>
                                            <td>{test.subject}</td>
                                            <td>Section {test.section}</td>
                                            <td>{test.total_marks || test.totalMarks}</td>
                                            <td>{test.date}</td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                    <button onClick={() => handleUploadMarks(test)} className="btn btn-sm btn-primary">
                                                        <FileText size={16} /> Upload Marks
                                                    </button>
                                                    <button onClick={() => handleEditInfo(test)} className="btn btn-sm btn-outline">
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button onClick={() => handleDeleteTest(test.id)} className="btn btn-sm btn-outline" style={{ color: 'var(--danger)' }}>
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="mobile-test-cards" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {tests.map(test => (
                                <div key={test.id} style={{
                                    border: '2px solid var(--border)',
                                    borderRadius: 'var(--radius)',
                                    padding: '1rem',
                                    background: 'var(--surface)'
                                }}>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: '700' }}>{test.name}</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                            <div><strong>Subject:</strong> {test.subject}</div>
                                            <div><strong>Section:</strong> {test.section}</div>
                                            <div><strong>Marks:</strong> {test.total_marks || test.totalMarks}</div>
                                            <div><strong>Date:</strong> {test.date}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        <button onClick={() => handleUploadMarks(test)} className="btn btn-sm btn-primary" style={{ flex: '1 1 auto' }}>
                                            <FileText size={16} /> Upload Marks
                                        </button>
                                        <button onClick={() => handleEditInfo(test)} className="btn btn-sm btn-outline">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => handleDeleteTest(test.id)} className="btn btn-sm btn-outline" style={{ color: 'var(--danger)' }}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

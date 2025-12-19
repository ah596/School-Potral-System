import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { Save, X, Edit2, Trash2, ArrowLeft, AlertCircle } from 'lucide-react';
import LoadingScreen from '../../components/LoadingScreen';

export default function TeacherMarks() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [assignedClasses, setAssignedClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [tests, setTests] = useState([]);
    const [selectedTestId, setSelectedTestId] = useState('');
    const [students, setStudents] = useState([]);
    const [marksEntry, setMarksEntry] = useState({});
    const [loading, setLoading] = useState(false); // Only for save/update operations
    const [loadingMessage, setLoadingMessage] = useState('');
    const [initialLoading, setInitialLoading] = useState(true); // For initial data fetch
    const [message, setMessage] = useState({ type: '', text: '' });

    // 1. Load Classes
    useEffect(() => {
        const fetchClasses = async () => {
            if (user?.id) {
                try {
                    const classes = await api.getTeacherClasses(user.id);
                    setAssignedClasses(classes);
                    if (classes.length > 0) {
                        setSelectedClass(classes[0].name);
                    } else if (user?.classes?.length > 0) {
                        // Fallback
                        setSelectedClass(user.classes[0]);
                        setAssignedClasses(user.classes.map(c => ({ name: c, id: c })));
                    }
                } catch (e) {
                    console.error("Failed to load classes", e);
                } finally {
                    setInitialLoading(false);
                }
            }
        };
        fetchClasses();
    }, [user]);

    // 2. Load Tests & Students when Class Changes
    useEffect(() => {
        if (!selectedClass) return;

        const loadData = async () => {
            try {
                // Fetch Tests
                const allTests = await api.getTests();
                const myTests = allTests.filter(t =>
                    (t.teacher_id === user.id || t.teacherId === user.id) &&
                    (t.class_name === selectedClass || !t.class_name)
                );
                setTests(myTests);
                if (myTests.length > 0) {
                    setSelectedTestId(myTests[0].id);
                } else {
                    setSelectedTestId('');
                }

                // Fetch Students
                const allStudents = await api.getStudents();
                const classFilter = selectedClass.split('-')[0].trim();
                const myStudents = allStudents.filter(s => s.gradeLevel === classFilter || s.grade_level === classFilter);
                setStudents(myStudents);

            } catch (error) {
                console.error("Failed to load data", error);
            }
        };
        loadData();
    }, [selectedClass, user.id]);

    // 3. Load Existing Marks when Test Changes
    useEffect(() => {
        if (!selectedTestId) {
            setMarksEntry({});
            return;
        }

        const fetchTestDetails = async () => {
            try {
                // Fetch fresh test data to ensure we have the latest marks
                const freshTest = await api.getTestById(selectedTestId);

                if (freshTest) {
                    const initialMarks = {};
                    if (freshTest.marks) {
                        students.forEach(s => {
                            // Ensure string/number ID matching resilience
                            const val = freshTest.marks[s.id] || freshTest.marks[String(s.id)];
                            if (val !== undefined && val !== null) {
                                initialMarks[s.id] = val;
                            } else {
                                initialMarks[s.id] = '';
                            }
                        });
                    }
                    setMarksEntry(initialMarks);

                    // Also update the test in the local list if needed to reflect any other changes
                    setTests(prev => prev.map(t => t.id === freshTest.id ? freshTest : t));
                }
            } catch (error) {
                console.error("Failed to fetch fresh test details", error);
            }
        };

        if (students.length > 0) {
            fetchTestDetails();
        }
    }, [selectedTestId, students]); // Students need to be loaded first


    const handleMarkChange = (studentId, val) => {
        setMarksEntry(prev => ({
            ...prev,
            [studentId]: val
        }));
    };

    const saveMarks = async () => {
        if (!selectedTestId) return;

        try {
            const test = tests.find(t => t.id === selectedTestId);
            const maxMarks = parseInt(test.total_marks || test.totalMarks || 100);

            // Validation
            for (const [sid, mark] of Object.entries(marksEntry)) {
                if (mark !== '' && (parseFloat(mark) < 0 || parseFloat(mark) > maxMarks)) {
                    setMessage({ type: 'error', text: `Invalid marks for student ID ${sid}. detail: Must be between 0 and ${maxMarks}` });
                    return;
                }
            }

            setLoading(true);
            setLoadingMessage('Saving Marks...');

            // Save
            await api.updateMarks(selectedTestId, marksEntry);

            // Refresh tests to get latest data
            const allTests = await api.getTests();
            const myTests = allTests.filter(t =>
                (t.teacher_id === user.id || t.teacherId === user.id) &&
                (t.class_name === selectedClass || !t.class_name)
            );
            setTests(myTests);

            setMessage({ type: 'success', text: 'Marks saved successfully!' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            console.error("Failed to save marks", error);
            setMessage({ type: 'error', text: 'Failed to save marks. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    const [isEditingTest, setIsEditingTest] = useState(false);
    const [editFormData, setEditFormData] = useState({});

    // ... (existing effects remain, placing state at top)
    const handleEditTestClick = () => {
        const test = tests.find(t => t.id === selectedTestId);
        if (!test) return;
        setEditFormData({
            name: test.name,
            total_marks: test.total_marks || test.totalMarks || 100,
            date: test.date
        });
        setIsEditingTest(true);
    };

    const handleUpdateTest = async () => {
        setLoading(true);
        setLoadingMessage('Updating Test Details...');
        try {
            await api.updateTest(selectedTestId, {
                ...editFormData,
                total_marks: editFormData.total_marks // ensure snake_case for DB
            });

            // Refresh tests
            const allTests = await api.getTests();
            const myTests = allTests.filter(t =>
                (t.teacher_id === user.id || t.teacherId === user.id) &&
                (t.class_name === selectedClass || !t.class_name)
            );
            setTests(myTests);

            setIsEditingTest(false);
            setMessage({ type: 'success', text: 'Test details updated!' });
        } catch (error) {
            console.error("Failed to update test", error);
            setMessage({ type: 'error', text: 'Failed to update test details.' });
        } finally {
            setLoading(false);
        }
    };

    // ... (keep saveMarks)

    const handleResetMarks = async (testId) => {
        if (!window.confirm("Are you sure you want to reset (delete) all marks for this test? This cannot be undone.")) return;

        setLoading(true);
        setLoadingMessage('Resetting Marks...');
        try {
            // Reset marks to empty object in DB
            await api.updateMarks(testId, {});

            // Update local state
            setTests(prev => prev.map(t => t.id === testId ? { ...t, marks: {} } : t));

            // If currently viewing this test, clear the form
            if (selectedTestId === testId) {
                setMarksEntry({});
            }

            setMessage({ type: 'success', text: 'Marks reset successfully.' });
        } catch (error) {
            console.error("Failed to reset marks", error);
            setMessage({ type: 'error', text: 'Failed to reset marks.' });
        } finally {
            setLoading(false);
        }
    };

    // Only show full-screen loading for save/update operations
    if (loading) return <LoadingScreen message={loadingMessage} />;

    const currentTest = tests.find(t => t.id === selectedTestId);
    const maxMarks = currentTest ? (currentTest.total_marks || currentTest.totalMarks || 100) : 100;

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
                    <h2 className="page-title" style={{ fontSize: 'clamp(1.5rem, 5vw, 2.25rem)', fontWeight: '800', margin: 0, color: 'var(--text)' }}>
                        Upload Marks
                    </h2>
                </div>
            </div>

            <style>{`
                @media (max-width: 768px) {
                    .desktop-table { display: none !important; }
                    .mobile-cards { display: flex !important; flex-direction: column; gap: 1rem; }
                }
                @media (min-width: 769px) {
                    .desktop-table { display: block !important; }
                    .mobile-cards { display: none !important; }
                }
            `}</style>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Select Class</label>
                        <select
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            disabled={initialLoading}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', border: '2px solid var(--border)' }}
                        >
                            <option value="">{initialLoading ? 'Loading classes...' : 'Select Class'}</option>
                            {assignedClasses.map(cls => (
                                <option key={cls.id || cls.name} value={cls.name}>{cls.name} {cls.section ? `- ${cls.section}` : ''}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Select Test</label>
                        <select
                            value={selectedTestId}
                            onChange={(e) => setSelectedTestId(e.target.value)}
                            disabled={!selectedClass || tests.length === 0}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', border: '2px solid var(--border)' }}
                        >
                            {tests.length === 0 ? <option>No tests found</option> : null}
                            {tests.map(t => (
                                <option key={t.id} value={t.id}>{t.name} ({t.date})</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Edit Test Modal */}
            {isEditingTest && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="card" style={{ maxWidth: '500px', width: '90%' }}>
                        <h3>Edit Test Details</h3>
                        <div className="form-group">
                            <label>Test Name</label>
                            <input
                                type="text"
                                value={editFormData.name}
                                onChange={e => setEditFormData({ ...editFormData, name: e.target.value })}
                                style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem', border: '1px solid var(--border)', borderRadius: '4px' }}
                            />
                        </div>
                        <div className="form-group">
                            <label>Max Marks</label>
                            <input
                                type="number"
                                value={editFormData.total_marks}
                                onChange={e => setEditFormData({ ...editFormData, total_marks: e.target.value })}
                                style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem', border: '1px solid var(--border)', borderRadius: '4px' }}
                            />
                        </div>
                        <div className="form-group">
                            <label>Date</label>
                            <input
                                type="date"
                                value={editFormData.date}
                                onChange={e => setEditFormData({ ...editFormData, date: e.target.value })}
                                style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem', border: '1px solid var(--border)', borderRadius: '4px' }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button className="btn btn-outline" onClick={() => setIsEditingTest(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleUpdateTest}>Update</button>
                        </div>
                    </div>
                </div>
            )}

            {message.text && (
                <div className={`alert ${message.type === 'error' ? 'alert-danger' : 'alert-success'}`}
                    style={{
                        padding: '1rem',
                        borderRadius: '8px',
                        marginBottom: '1rem',
                        background: message.type === 'error' ? '#fee2e2' : '#dcfce7',
                        color: message.type === 'error' ? '#991b1b' : '#166534',
                        display: 'flex', alignItems: 'center', gap: '0.5rem'
                    }}>
                    {message.type === 'error' && <AlertCircle size={20} />}
                    {message.text}
                </div>
            )}

            {currentTest ? (
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <h3 style={{ margin: 0 }}>Marks Entry: {currentTest.name}</h3>
                            <button onClick={handleEditTestClick} className="btn btn-sm btn-outline" style={{ padding: '0.25rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} title="Edit Test Details">
                                ✏️ Edit
                            </button>
                        </div>
                        <span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)', fontSize: '0.9rem', fontWeight: '800' }}>
                            Max Marks: {maxMarks}
                        </span>
                    </div>

                    <div className="table-responsive desktop-table">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Student Name</th>
                                    <th>Obtained Marks</th>
                                    <th>Percentage</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map(student => {
                                    const mark = marksEntry[student.id] || '';
                                    const percentage = mark ? ((parseFloat(mark) / maxMarks) * 100).toFixed(1) : '-';

                                    return (
                                        <tr key={student.id}>
                                            <td style={{ fontWeight: '500' }}>{student.id}</td>
                                            <td style={{ fontWeight: '600' }}>{student.name}</td>
                                            <td>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max={maxMarks}
                                                    value={mark}
                                                    onChange={(e) => handleMarkChange(student.id, e.target.value)}
                                                    placeholder="-"
                                                    style={{
                                                        width: '100px',
                                                        padding: '0.5rem',
                                                        border: '2px solid var(--border)',
                                                        borderRadius: 'var(--radius)',
                                                        textAlign: 'center',
                                                        fontWeight: 'bold'
                                                    }}
                                                />
                                            </td>
                                            <td>
                                                <span style={{
                                                    color: percentage !== '-' && percentage < 35 ? 'var(--danger)' : 'inherit',
                                                    fontWeight: 'bold'
                                                }}>
                                                    {percentage}%
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Student Cards for Entry */}
                    <div className="mobile-cards">
                        {students.map(student => {
                            const mark = marksEntry[student.id] || '';
                            const percentage = mark ? ((parseFloat(mark) / maxMarks) * 100).toFixed(1) : '-';
                            return (
                                <div key={student.id} className="card-item" style={{
                                    padding: '1rem',
                                    border: '1px solid var(--border)',
                                    borderRadius: 'var(--radius)',
                                    marginBottom: '0.5rem'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                        <div>
                                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {student.id}</p>
                                            <p style={{ margin: 0, fontWeight: '700' }}>{student.name}</p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Percentage</p>
                                            <p style={{ margin: 0, fontWeight: '800', color: percentage !== '-' && percentage < 35 ? 'var(--danger)' : 'var(--primary)' }}>{percentage}%</p>
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.25rem' }}>Enter Marks (Max: {maxMarks})</label>
                                        <input
                                            type="number"
                                            value={mark}
                                            onChange={(e) => handleMarkChange(student.id, e.target.value)}
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', border: '2px solid var(--border)' }}
                                            placeholder={`0 - ${maxMarks}`}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>


                    <div style={{ marginTop: '2rem', textAlign: 'right' }}>
                        <button onClick={saveMarks} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 2rem' }}>
                            <Save size={20} /> Save Marks
                        </button>
                    </div>
                </div>
            ) : (
                <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
                    {selectedClass ? 'Please select a test to enter marks.' : 'Please select a class to view tests.'}
                </div>
            )}

            {/* ... End of Marks Entry Card ... */}

            {/* List of Saved/Uploaded Marks Section */}
            <div className="card" style={{ marginTop: '2rem', borderTop: '4px solid var(--primary)' }}>
                <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Save size={24} /> Uploaded Marks History
                </h3>

                {tests.filter(t => t.marks && Object.keys(t.marks).length > 0).length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No marks uploaded yet for this class.</p>
                ) : (
                    <>
                        {/* Desktop View */}
                        <div className="table-responsive desktop-table">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Test Name</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tests.filter(t => t.marks && Object.keys(t.marks).length > 0).map(test => (
                                        <tr key={test.id} style={{ background: selectedTestId === test.id ? 'var(--background)' : 'transparent' }}>
                                            <td style={{ fontWeight: '600' }}>{test.name}</td>
                                            <td>{test.date}</td>
                                            <td>
                                                <span style={{ fontWeight: 'bold', color: '#166534' }}>
                                                    Uploaded
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                    <button
                                                        onClick={() => setSelectedTestId(test.id)}
                                                        className="btn btn-sm btn-outline"
                                                        title="Edit/Change Marks"
                                                    >
                                                        Change
                                                    </button>
                                                    <button
                                                        onClick={() => handleResetMarks(test.id)}
                                                        className="btn btn-sm btn-outline"
                                                        style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
                                                        title="Reset/Delete All Marks"
                                                    >
                                                        Reset
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile View */}
                        <div className="mobile-cards">
                            {tests.filter(t => t.marks && Object.keys(t.marks).length > 0).map(test => (
                                <div key={test.id} style={{
                                    padding: '1.25rem',
                                    borderRadius: 'var(--radius)',
                                    border: '1px solid var(--border)',
                                    background: selectedTestId === test.id ? 'var(--background)' : 'var(--surface)',
                                    boxShadow: 'var(--shadow-sm)'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                        <div>
                                            <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700' }}>{test.name}</h4>
                                            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{test.date}</p>
                                        </div>
                                        <span style={{
                                            background: '#dcfce7',
                                            color: '#166534',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '2rem',
                                            fontSize: '0.75rem',
                                            fontWeight: '700'
                                        }}>
                                            Uploaded
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                        <button
                                            onClick={() => setSelectedTestId(test.id)}
                                            style={{ flex: 1, padding: '0.75rem' }}
                                            className="btn btn-sm btn-outline"
                                        >
                                            Change
                                        </button>
                                        <button
                                            onClick={() => handleResetMarks(test.id)}
                                            style={{ flex: 1, padding: '0.75rem', color: 'var(--danger)', borderColor: 'var(--danger)' }}
                                            className="btn btn-sm btn-outline"
                                        >
                                            Reset
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

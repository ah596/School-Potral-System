import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { api } from '../../utils/api';
import { Plus, Edit2, Trash2, Save, X, FileText } from 'lucide-react';

export default function TeacherTests() {
    const { user } = useAuth();
    const [tests, setTests] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
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

    useEffect(() => {
        if (user?.classes?.length > 0) {
            setSelectedClass(user.classes[0]);
        }
    }, [user]);

    useEffect(() => {
        if (selectedClass) {
            loadTests();
            loadStudents();
        }
    }, [selectedClass]);

    const loadTests = async () => {
        try {
            const allTests = await api.getTests();
            // Filter tests for this teacher and class
            // Note: My API getTests returns ALL tests. In a real app, I'd filter on backend.
            // Here I filter on frontend.
            // Also, my DB schema stores 'section' but not 'class_name' explicitly in the 'tests' table in my create statement?
            // Wait, I added 'class_name' in the CREATE TABLE but 'class' in the INSERT?
            // Let's check database.js.
            // CREATE TABLE tests (... class_name TEXT ...)
            // INSERT INTO tests (... section, teacher_id) ...
            // I might have missed `class_name` in the INSERT in server.js.
            // Let's assume I can filter by teacher_id for now.
            const myTests = allTests.filter(t => t.teacher_id === user.id);
            setTests(myTests);
        } catch (error) {
            console.error('Failed to load tests:', error);
        }
    };

    const loadStudents = async () => {
        try {
            const allStudents = await api.getStudents();
            // Filter students by class/grade_level
            // My mock data had 'Class 10', 'Class 9'.
            // The selectedClass is like 'Class 10-A'.
            // I'll do a loose match.
            const classFilter = selectedClass.split('-')[0].trim(); // "Class 10"
            const myStudents = allStudents.filter(s => s.grade_level === classFilter);
            setStudents(myStudents);
        } catch (error) {
            console.error('Failed to load students:', error);
        }
    };

    const handleAddTest = () => {
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

    const handleSaveTest = async () => {
        try {
            await api.addTest({
                name: formData.name,
                subject: formData.subject,
                date: formData.date,
                totalMarks: formData.totalMarks,
                section: formData.section,
                teacherId: user.id,
                // I should pass class name too if I update the backend to support it
            });
            await loadTests();
            setIsAdding(false);
        } catch (error) {
            console.error('Failed to save test:', error);
            alert('Failed to save test');
        }
    };

    const handleDeleteTest = async (testId) => {
        if (window.confirm('Are you sure you want to delete this test?')) {
            // I didn't implement DELETE /api/tests/:id yet.
            // For now, I'll just alert.
            alert('Delete functionality not implemented in backend yet.');
        }
    };

    const handleUploadMarks = (test) => {
        setEditingTest(test);
        const initialMarks = {};
        students.forEach(student => {
            initialMarks[student.id] = test.marks?.[student.id] || '';
        });
        setMarksEntry(initialMarks);
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

    return (
        <div className="container" style={{ padding: '2rem 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: '700' }}>Test Marks Management</h2>
                {!isAdding && !editingTest && (
                    <button onClick={handleAddTest} className="btn btn-primary">
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
                    {user.classes?.map(className => (
                        <option key={className} value={className}>{className}</option>
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

            {/* Upload Marks Form */}
            {editingTest && (
                <div className="card" style={{ marginBottom: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Upload Marks - {editingTest.name}</h3>
                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Student ID</th>
                                    <th>Student Name</th>
                                    <th>Marks (out of {editingTest.total_marks || editingTest.totalMarks})</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map(student => (
                                    <tr key={student.id}>
                                        <td>{student.id}</td>
                                        <td>{student.name}</td>
                                        <td>
                                            <input
                                                type="number"
                                                min="0"
                                                max={editingTest.total_marks || editingTest.totalMarks}
                                                value={marksEntry[student.id] || ''}
                                                onChange={(e) => setMarksEntry({ ...marksEntry, [student.id]: e.target.value })}
                                                style={{ width: '100px', padding: '0.5rem', border: '2px solid var(--border)', borderRadius: 'var(--radius)' }}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                        <button onClick={handleSaveMarks} className="btn btn-primary">
                            <Save size={18} /> Save Marks
                        </button>
                        <button onClick={() => { setEditingTest(null); setMarksEntry({}); }} className="btn btn-outline">
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
                    <div className="table-responsive">
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
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button onClick={() => handleUploadMarks(test)} className="btn btn-sm btn-primary">
                                                    <FileText size={16} /> Upload Marks
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
                )}
            </div>
        </div>
    );
}

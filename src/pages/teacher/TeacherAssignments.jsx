import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { api } from '../../utils/api';
import { BookOpen, FileText, Plus, Trash2, ArrowLeft, Calendar, Upload, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import LoadingScreen from '../../components/LoadingScreen';

export default function TeacherAssignments() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [assignments, setAssignments] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        subject: user.subject || 'General',
        className: '',
        dueDate: '',
        message: '', // Description
        file: null
    });

    useEffect(() => {
        loadData();
    }, [user.id]);

    const loadData = async () => {
        setLoading(true);
        try {
            // Load Classes
            const myClasses = await api.getTeacherClasses(user.id);
            // Fallback if no specific classes assigned, maybe try user.classes from profile
            const classOptions = myClasses.length > 0
                ? myClasses.map(c => c.name)
                : (user.classes || []);

            setClasses(classOptions);
            if (classOptions.length > 0 && !formData.className) {
                setFormData(prev => ({ ...prev, className: classOptions[0] }));
            }

            // Load Assignments
            const myAssignments = await api.getAssignments({ teacherId: user.id });
            setAssignments(myAssignments);

        } catch (error) {
            console.error("Failed to load data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setFormData({ ...formData, file: e.target.files[0] });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.className || !formData.dueDate) {
            setMessage({ type: 'error', text: 'Please fill in all required fields.' });
            return;
        }

        setIsSubmitting(true);
        setMessage({ type: '', text: '' });

        try {
            let fileUrl = '';
            if (formData.file) {
                // Upload to Firebase Storage
                try {
                    // Unique path: assignments/{class}/{timestamp}_{filename}
                    const path = `assignments/${formData.className}/${Date.now()}_${formData.file.name}`;
                    fileUrl = await api.uploadFile(formData.file, path);
                } catch (uploadError) {
                    console.error("Upload failed", uploadError);
                    // Fallback: If storage fails, maybe alert user? 
                    // For now, we will proceed without file or throw
                    throw new Error("File upload failed. Please check your connection or try a smaller file.");
                }
            }

            const newAssignment = {
                title: formData.title,
                subject: formData.subject,
                className: formData.className,
                dueDate: formData.dueDate,
                message: formData.message,
                fileUrl: fileUrl,
                teacherId: user.id,
                teacherName: user.name
            };

            await api.addAssignment(newAssignment);

            setMessage({ type: 'success', text: 'Assignment created successfully!' });
            setFormData({
                title: '',
                subject: user.subject || 'General',
                className: classes[0] || '',
                dueDate: '',
                message: '',
                file: null
            });
            // Reload list
            const updated = await api.getAssignments({ teacherId: user.id });
            setAssignments(updated);

        } catch (error) {
            console.error("Creation failed", error);
            setMessage({ type: 'error', text: 'Failed to create assignment: ' + error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this assignment?")) return;
        try {
            await api.deleteAssignment(id);
            setAssignments(assignments.filter(a => a.id !== id));
        } catch (error) {
            alert("Failed to delete");
        }
    };

    if (loading) return <LoadingScreen message="Loading Assignments..." />;

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
                        Class Assignments
                    </h2>
                </div>
            </div>

            <div className="grid" style={{ gridTemplateColumns: '1fr 1.5fr', gap: '2rem', alignItems: 'start' }}>

                {/* Create Form */}
                <div className="card">
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>Create New Assignment</h3>

                    {message.text && (
                        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'}`} style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Target Class <span style={{ color: 'red' }}>*</span></label>
                            <select
                                value={formData.className}
                                onChange={e => setFormData({ ...formData, className: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)' }}
                                required
                            >
                                <option value="" disabled>Select Class</option>
                                {classes.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Subject</label>
                            <input
                                type="text"
                                value={formData.subject}
                                onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)' }}
                                placeholder="e.g. Mathematics"
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Title <span style={{ color: 'red' }}>*</span></label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)' }}
                                placeholder="Assignment Title"
                                required
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Due Date <span style={{ color: 'red' }}>*</span></label>
                            <input
                                type="date"
                                value={formData.dueDate}
                                onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)' }}
                                required
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Instructions</label>
                            <textarea
                                value={formData.message}
                                onChange={e => setFormData({ ...formData, message: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', minHeight: '100px' }}
                                placeholder="Details about what needs to be done..."
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Sample Paper / File (Optional)</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    style={{ width: '100%' }}
                                />
                            </div>
                            <small style={{ color: 'var(--text-muted)' }}>PDF, Doc, Image (Max 5MB)</small>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isSubmitting}
                            style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                        >
                            {isSubmitting ? <Loader className="spin" size={20} /> : <><Upload size={20} /> Assign Task</>}
                        </button>

                    </form>
                </div>

                {/* List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Active Assignments ({assignments.length})</h3>

                    {assignments.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--surface)', borderRadius: '12px', border: '1px border var(--border)' }}>
                            <p style={{ color: 'var(--text-muted)' }}>No assignments created yet.</p>
                        </div>
                    ) : (
                        assignments.map(assign => (
                            <div key={assign.id} className="card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--primary)', position: 'relative' }}>
                                <button
                                    onClick={() => handleDelete(assign.id)}
                                    style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                                    title="Delete Assignment"
                                >
                                    <Trash2 size={18} />
                                </button>

                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span className="badge" style={{ background: 'var(--background)' }}>{assign.className}</span>
                                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <Calendar size={14} /> Due: {assign.dueDate}
                                    </span>
                                </div>

                                <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--heading)' }}>{assign.title}</h4>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>{assign.subject}</p>

                                {assign.message && (
                                    <p style={{ fontSize: '0.95rem', marginBottom: '1rem', whiteSpace: 'pre-wrap' }}>{assign.message}</p>
                                )}

                                {assign.fileUrl && (
                                    <a
                                        href={assign.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-outline btn-sm"
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                                    >
                                        <FileText size={16} /> View/Download Attachment
                                    </a>
                                )}
                            </div>
                        ))
                    )}
                </div>

            </div>
        </div>
    );
}

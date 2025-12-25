import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { api } from '../../utils/api';
import { auth } from '../../firebase';
import { Plus, Edit2, Trash2, Save, X, Search, Loader, ArrowLeft } from 'lucide-react';
import LoadingScreen from '../../components/LoadingScreen';


export default function AdminTeachers() {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [teachers, setTeachers] = useState([]);
    const [classes, setClasses] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [selectedFile, setSelectedFile] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        subject: '',
        classes: [],
        email: '',
        phone: '',
        photo: '',
        salary: '',
        password: 'password123'
    });
    const [emailError, setEmailError] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [teachersData, classesData] = await Promise.all([
                api.getTeachers(),
                api.getClasses()
            ]);

            // Map classes to teachers for display
            // This is the source of truth from "Manage Classes"
            const teachersWithClasses = teachersData.map(teacher => {
                const assigned = classesData
                    .filter(c => c.classTeacherId === teacher.id)
                    .map(c => `${c.name} - ${c.section}`);
                return { ...teacher, assignedClasses: assigned };
            });

            setTeachers(teachersWithClasses);
            setClasses(classesData);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setIsAdding(true);
        setEmailError('');
        setFormData({
            id: `TCH${String(teachers.length + 1).padStart(3, '0')}`,
            name: '',
            subject: '',
            classes: [],
            email: '',
            phone: '',
            salary: '',
            password: 'password123'
        });
    };

    const handleEdit = (teacher) => {
        setEditingId(teacher.id);
        setFormData({ ...teacher, classes: teacher.classes || [] });
        setEmailError('');
    };

    const handleSave = async () => {
        if (!formData.name || !formData.id) {
            alert("Name and ID are required");
            return;
        }

        setIsSaving(true);
        setEmailError('');
        try {
            // Check for duplicate email
            if (!formData.email) {
                setEmailError("Email is required");
                setIsSaving(false);
                return;
            }
            const emailExists = await api.checkEmailExists(formData.email, isAdding ? null : formData.id);
            if (emailExists) {
                setEmailError("This email is already registered. Kindly use another email.");
                setIsSaving(false);
                return;
            }

            let photoUrl = formData.photo;

            if (selectedFile) {
                // Convert to Base64 for direct database storage (bypassing Storage bucket for simplicity)
                // Limit size to 1MB to respect Firestore limits
                if (selectedFile.size > 1024 * 1024) {
                    alert("Image too large. Please choose an image under 1MB.");
                    setIsSaving(false);
                    return;
                }

                const toBase64 = (file) => new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = error => reject(error);
                });

                try {
                    photoUrl = await toBase64(selectedFile);
                } catch (e) {
                    console.error("File reading failed", e);
                    alert("Failed to read file.");
                    setIsSaving(false);
                    return;
                }
            }

            const dataToSave = { ...formData, photo: photoUrl };

            if (isAdding) {
                await api.addTeacher(dataToSave);
            } else {
                await api.updateTeacher(editingId, dataToSave);
            }
            setIsAdding(false);
            setEditingId(null);
            setSelectedFile(null); // Reset file
            await loadData();
        } catch (error) {
            console.error('Failed to save teacher:', error);
            alert(`Failed to save: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };


    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this teacher?')) {
            try {
                await api.deleteTeacher(id);
                await loadData();
            } catch (error) {
                console.error('Failed to delete teacher:', error);
                alert('Failed to delete teacher');
            }
        }
    };

    const handleCancel = () => {
        setIsAdding(false);
        setEditingId(null);
    };

    const handleClassToggle = (className) => {
        const currentClasses = formData.classes || [];
        if (currentClasses.includes(className)) {
            setFormData({ ...formData, classes: currentClasses.filter(c => c !== className) });
        } else {
            setFormData({ ...formData, classes: [...currentClasses, className] });
        }
    };

    if (authLoading) {
        return <LoadingScreen message="Checking permissions..." />;
    }

    if (!user || user.role !== 'admin') {
        return <Navigate to="/login" replace />;
    }

    if (loading) return <LoadingScreen message="Loading Teachers..." />;

    // Format classes for display: "Class 10 - A"
    const availableClasses = classes.map(cls => `${cls.name} - ${cls.section}`);

    // Filter teachers based on search
    const filteredTeachers = teachers.filter(t =>
        (t.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (t.id?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (t.subject?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    );

    return (
        <div className="container" style={{ padding: '0 clamp(1rem, 5vw, 2.5rem) clamp(1rem, 3vw, 2.5rem)', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', padding: '1.5rem 0' }}>
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
                            Manage Teachers
                        </h2>
                    </div>
                    {!isAdding && (
                        <button onClick={handleAdd} className="btn btn-primary" style={{ whiteSpace: 'nowrap', padding: '0.8rem 1.5rem', borderRadius: '12px' }}>
                            <Plus size={20} /> Add Teacher
                        </button>
                    )}
                </div>

                {/* Search Bar */}
                {!isAdding && !editingId && (
                    <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
                        <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Search by Name, ID, or Subject..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.9rem 1rem 0.9rem 3rem',
                                border: '1px solid var(--border)',
                                borderRadius: '24px',
                                background: 'var(--surface)',
                                fontSize: '0.95rem'
                            }}
                        />
                    </div>
                )}
            </div>

            {(isAdding || editingId) && (
                <div className="card" style={{ marginBottom: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>{isAdding ? 'Add New Teacher' : 'Edit Teacher'}</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                        <div className="form-group">
                            <label>Teacher ID</label>
                            <input
                                type="text"
                                value={formData.id}
                                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                                disabled={!isAdding}
                            />
                        </div>
                        <div className="form-group">
                            <label>Name <span style={{ color: 'red' }}>*</span></label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                            <label>Email <span style={{ color: 'red' }}>*</span></label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => {
                                    setFormData({ ...formData, email: e.target.value });
                                    if (emailError) setEmailError('');
                                }}
                                style={{ borderColor: emailError ? '#ef4444' : 'var(--border)' }}
                            />
                            {emailError && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.4rem', fontWeight: '500' }}>{emailError}</p>}
                        </div>
                        <div className="form-group">
                            <label>Phone</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label>Profile Picture</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setSelectedFile(e.target.files[0])}
                            />
                            {formData.photo && !selectedFile && (
                                <div style={{ marginTop: '0.5rem' }}>
                                    <img src={formData.photo} alt="Current" style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }} />
                                    <span style={{ fontSize: '0.8rem', marginLeft: '0.5rem', color: 'var(--text-muted)' }}>Current Photo</span>
                                </div>
                            )}
                        </div>
                        <div className="form-group">
                            <label>Salary ($)</label>
                            <input
                                type="number"
                                value={formData.salary}
                                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="text"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="Set login password"
                            />
                        </div>
                    </div>

                    <div className="form-group" style={{ marginTop: '1rem' }}>
                        {/* Classes are now assigned via "Manage Classes" page to ensure single source of truth */}
                        {/* 
                        <div className="form-group" style={{ marginTop: '1rem' }}>
                            <label>Assign Classes</label>
                            ...
                        </div> 
                        */}
                        <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--background-alt)', borderRadius: 'var(--radius)', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            ℹ️ To assign classes to this teacher, please go to <strong>Manage Classes</strong> and set the Class Teacher there.
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                        <button onClick={handleSave} className="btn btn-primary" disabled={isSaving} style={{ minWidth: '120px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            {isSaving ? <Loader className="spin" size={18} /> : <><Save size={18} style={{ marginRight: '0.5rem' }} /> Save</>}
                        </button>
                        <button onClick={handleCancel} className="btn btn-outline" disabled={isSaving}>
                            <X size={18} /> Cancel
                        </button>
                    </div>

                </div>
            )
            }


            <div className="card">
                <style>{`
                    @media (min-width: 768px) {
                        .teachers-table-responsive { display: block !important; }
                        .teachers-mobile-cards { display: none !important; }
                    }
                `}</style>

                {/* Desktop Table View */}
                <div className="teachers-table-responsive table-responsive" style={{ display: 'none' }}>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Photo</th>
                                <th>Name</th>
                                <th>Subject</th>
                                <th>Classes</th>
                                <th>Email</th>
                                <th>Password</th>
                                <th>Salary</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTeachers.length === 0 ? (
                                <tr>
                                    <td colSpan="9" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                        {searchQuery ? 'No teachers match your search.' : 'No teachers found. Add one to get started.'}
                                    </td>
                                </tr>
                            ) : (
                                filteredTeachers.map(teacher => (
                                    <tr key={teacher.id}>
                                        <td>{teacher.id}</td>
                                        <td>
                                            {teacher.photo ? (
                                                <img src={teacher.photo} alt={teacher.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <span style={{ fontSize: '0.8rem', color: '#888' }}>{teacher.name?.charAt(0)}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td>{teacher.name}</td>
                                        <td>{teacher.subject}</td>
                                        <td>{(teacher.assignedClasses || []).join(', ') || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>None</span>}</td>
                                        <td>{teacher.email}</td>
                                        <td>
                                            <code style={{ background: '#eee', padding: '2px 6px', borderRadius: '4px' }}>
                                                {teacher.password || 'N/A'}
                                            </code>
                                        </td>
                                        <td>${teacher.salary}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                <button onClick={() => handleEdit(teacher)} className="btn btn-sm btn-outline">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(teacher.id)} className="btn btn-sm btn-outline" style={{ color: 'var(--danger)' }}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="teachers-mobile-cards" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {filteredTeachers.length === 0 ? (
                        <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                            {searchQuery ? 'No teachers match your search.' : 'No teachers found. Add one to get started.'}
                        </p>
                    ) : (
                        filteredTeachers.map(teacher => (
                            <div key={teacher.id} style={{
                                border: '2px solid var(--border)',
                                borderRadius: 'var(--radius)',
                                padding: '1rem',
                                background: 'var(--surface)'
                            }}>
                                {/* Teacher Header */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                    {teacher.photo ? (
                                        <img src={teacher.photo} alt={teacher.name} style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)' }} />
                                    ) : (
                                        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--background-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--border)' }}>
                                            <span style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-muted)' }}>{teacher.name?.charAt(0)}</span>
                                        </div>
                                    )}
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem', fontWeight: '700' }}>{teacher.name}</h4>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>ID: {teacher.id}</div>
                                    </div>
                                </div>

                                {/* Teacher Details */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem', fontSize: '0.9rem' }}>
                                    <div>
                                        <strong style={{ color: 'var(--text-secondary)' }}>Subject:</strong>
                                        <div>{teacher.subject}</div>
                                    </div>
                                    <div>
                                        <strong style={{ color: 'var(--text-secondary)' }}>Salary:</strong>
                                        <div>${teacher.salary}</div>
                                    </div>
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <strong style={{ color: 'var(--text-secondary)' }}>Email:</strong>
                                        <div style={{ wordBreak: 'break-all' }}>{teacher.email}</div>
                                    </div>
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <strong style={{ color: 'var(--text-secondary)' }}>Classes:</strong>
                                        <div>{(teacher.assignedClasses || []).join(', ') || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>None</span>}</div>
                                    </div>
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <strong style={{ color: 'var(--text-secondary)' }}>Password:</strong>
                                        <code style={{ background: 'var(--background)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>
                                            {teacher.password || 'N/A'}
                                        </code>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button onClick={() => handleEdit(teacher)} className="btn btn-sm btn-primary" style={{ flex: 1 }}>
                                        <Edit2 size={16} /> Edit
                                    </button>
                                    <button onClick={() => handleDelete(teacher.id)} className="btn btn-sm btn-outline" style={{ color: 'var(--danger)' }}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div >
    );
}

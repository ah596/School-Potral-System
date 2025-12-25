import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { api } from '../../utils/api';
import { auth } from '../../firebase';
import { Plus, Edit2, Trash2, Save, X, Search, Loader, RefreshCw, ArrowLeft } from 'lucide-react';
import LoadingScreen from '../../components/LoadingScreen';


export default function AdminStudents() {
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [selectedClass, setSelectedClass] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [selectedFile, setSelectedFile] = useState(null);
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        gradeLevel: '',
        email: '',
        phone: '',
        photo: '',
        password: 'password123'
    });
    const [emailError, setEmailError] = useState('');


    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isClassMenuOpen, setIsClassMenuOpen] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [studentsData, classesData] = await Promise.all([
                api.getStudents(),
                api.getClasses()
            ]);
            setStudents(studentsData);
            setClasses(classesData);
        } catch (error) {
            console.error('Failed to load data:', error);
            setError(error.message);
            setStudents([]);
            setClasses([]);
        } finally {
            setLoading(false);
            setIsInitialLoad(false);
        }
    };

    const handleAdd = () => {
        if (!selectedClass) {
            alert("Please select a class first.");
            return;
        }
        setIsAdding(true);
        setEmailError('');

        // Enhanced ID Generation Logic
        const numberMap = {
            '1': 'ONE', '2': 'TWO', '3': 'THREE', '4': 'FOUR', '5': 'FIVE',
            '6': 'SIX', '7': 'SEVEN', '8': 'EIGHT', '9': 'NINE', '10': 'TEN',
            '11': 'ELEVEN', '12': 'TWELVE',
            'ONE': 'ONE', 'TWO': 'TWO', 'THREE': 'THREE', 'FOUR': 'FOUR', 'FOURE': 'FOUR',
            'FIVE': 'FIVE', 'SIX': 'SIX', 'SEVEN': 'SEVEN', 'EIGHT': 'EIGHT',
            'NINE': 'NINE', 'TEN': 'TEN'
        };

        let prefix = 'STU';
        const upperName = selectedClass.toUpperCase();
        const cleanName = upperName.replace('CLASS', '').trim(); // Remove "CLASS" if present

        // 1. Determine Prefix
        if (numberMap[cleanName]) {
            prefix = numberMap[cleanName];
        } else {
            const num = parseInt(cleanName);
            if (!isNaN(num) && numberMap[num]) {
                prefix = numberMap[num];
            } else {
                // Fallback: Use first 4 letters of the name
                prefix = (selectedClass.split(' ')[0] || 'STU').toUpperCase().substring(0, 4);
                if (prefix.length < 3) prefix = 'STU';
            }
        }

        // 2. Find next number for this PREFIX (not just class name match)
        // This is safer to avoid duplicates if multiple classes somehow map to same prefix
        // But strictly user asked "for student of one class is ONE-1... two class is TWO-1"
        // So checking by class name filtering is generally correct.

        const baseClassName = selectedClass.split('-')[0].trim();

        const existingIds = students
            .filter(s => {
                const sGrade = (s.gradeLevel || s.grade_level || '').split('-')[0].trim();
                return sGrade === baseClassName;
            })
            .map(s => {
                // Expecting ID format PREFIX-NUMBER or just extracting number from end
                const match = s.id.match(/(\d+)$/);
                return match ? parseInt(match[1]) : 0;
            });

        const nextNum = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
        const newId = `${prefix}-${nextNum}`;

        setFormData({
            id: newId,
            name: '',
            gradeLevel: selectedClass,
            email: '',
            phone: '',
            photo: '',
            password: 'password123'
        });
    };

    const handleEdit = (student) => {
        setEditingId(student.id);
        setFormData(student);
        setEmailError('');
    };

    const handleSave = async () => {
        if (!formData.name || !formData.id || !formData.email) {
            alert("Name, ID, and Email are required");
            return;
        }

        setIsSaving(true);
        setEmailError('');
        try {
            // Check for duplicate email
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
                await api.addStudent(dataToSave);
            } else {
                await api.updateStudent(editingId, dataToSave);
            }
            setIsAdding(false);
            setEditingId(null);
            setSelectedFile(null); // Reset file
            await loadData();
        } catch (error) {
            console.error('Failed to save student:', error);
            alert(`Failed to save student: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };


    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this student?')) {
            try {
                await api.deleteStudent(id);
                await loadData();
            } catch (error) {
                console.error('Failed to delete student:', error);
                alert('Failed to delete student');
            }
        }
    };

    const handleCancel = () => {
        setIsAdding(false);
        setEditingId(null);
    };

    // Data check
    if (loading && isInitialLoad) {
        return <LoadingScreen message="Loading student data..." />;
    }

    if (error) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '5rem' }}>
                <h2 style={{ color: 'var(--danger)' }}>Error Loading Data</h2>
                <p>{error}</p>
                <button onClick={loadData} className="btn btn-primary" style={{ marginTop: '1rem' }}>Try Again</button>
            </div>
        );
    }

    // Get unique class names
    const gradeOptions = Array.isArray(classes)
        ? [...new Set(classes.map(cls => cls?.name).filter(Boolean))].sort()
        : [];

    // Filter students
    const filteredStudents = students.filter(s => {
        // if class selected, must match class
        const matchesClass = selectedClass
            ? (s.gradeLevel === selectedClass || s.grade_level === selectedClass)
            : true;

        // if search query, must match search
        const matchesSearch = searchQuery
            ? (
                (s.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                (s.id?.toLowerCase() || '').includes(searchQuery.toLowerCase())
            )
            : true;

        // Display if: (Class is Selected) OR (Search Query exists)
        if (!selectedClass && !searchQuery) return false;

        return matchesClass && matchesSearch;
    });

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
                            Manage Students
                        </h2>
                    </div>
                    {!isAdding && (
                        <button onClick={handleAdd} className="btn btn-primary" style={{ whiteSpace: 'nowrap', padding: '0.8rem 1.5rem', borderRadius: '12px' }}>
                            <Plus size={20} /> Add Student
                        </button>
                    )}
                </div>

                {/* Search Bar */}
                {!isAdding && !editingId && (
                    <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
                        <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Search student by Name or ID..."
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

            {/* Class Selection */}
            <div style={{ marginBottom: '2rem' }}>
                <style>{`
                    .add-student-btn {
                        width: 45px;
                        height: 45px;
                        border-radius: 50%;
                        padding: 0;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        box-shadow: var(--shadow-md);
                        flex-shrink: 0;
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    }

                    .add-student-btn .btn-text {
                        display: none;
                        margin-left: 0.5rem;
                        white-space: nowrap;
                    }

                    @media (min-width: 768px) {
                        .add-student-btn {
                            width: auto;
                            height: auto;
                            padding: 0.75rem 1.5rem;
                            border-radius: 12px;
                        }
                        .add-student-btn .btn-text {
                            display: inline;
                        }
                    }

                    .mobile-dropdown-container {
                        display: none;
                        position: relative;
                        width: 100%;
                    }

                    .mobile-dropdown-trigger {
                        width: 100%;
                        padding: 1.1rem 1.5rem;
                        background: var(--primary);
                        color: white;
                        border: none;
                        border-radius: 14px;
                        font-weight: 700;
                        text-align: left;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        box-shadow: var(--shadow-md);
                        cursor: pointer;
                        font-size: 1.1rem;
                    }

                    .mobile-dropdown-list {
                        margin-top: 0.75rem;
                        display: flex;
                        flex-direction: column;
                        gap: 0.6rem;
                    }

                    .mobile-dropdown-item {
                        width: 100%;
                        padding: 1.1rem 1.5rem;
                        background: #1e293b; /* Dark surface color from image */
                        color: rgba(255, 255, 255, 0.9);
                        border: none;
                        border-radius: 14px;
                        text-align: left;
                        font-size: 1rem;
                        font-weight: 500;
                        transition: all 0.2s;
                        cursor: pointer;
                    }

                    .mobile-dropdown-item:hover {
                        background: #2d3e5a; /* Slightly lighter on hover */
                        transform: translateX(5px);
                    }

                    .mobile-dropdown-item.active {
                        background: var(--primary) !important;
                        color: white !important;
                        font-weight: 700;
                    }

                    .desktop-class-btn:hover {
                        background: var(--background-alt);
                        border-color: var(--primary);
                        transform: translateY(-2px);
                    }

                    .desktop-class-tabs {
                        display: flex;
                        gap: 0.75rem;
                        flex-wrap: wrap;
                    }

                    @media (max-width: 768px) {
                        .mobile-dropdown-container {
                            display: block;
                        }
                        .desktop-class-tabs {
                            display: none;
                        }
                    }
                `}</style>
                <h4 style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>Select Class:</h4>

                {/* Mobile Custom Dropdown View (Matching Image) */}
                <div className="mobile-dropdown-container">
                    <button
                        className="mobile-dropdown-trigger"
                        onClick={() => setIsClassMenuOpen(!isClassMenuOpen)}
                    >
                        {selectedClass || "Choose Class"}
                        <span style={{
                            transform: isClassMenuOpen ? 'rotate(180deg)' : 'rotate(0)',
                            transition: 'transform 0.3s',
                            fontSize: '0.8rem'
                        }}>▼</span>
                    </button>

                    {isClassMenuOpen && (
                        <div className="mobile-dropdown-list">
                            {gradeOptions.map(cls => (
                                <button
                                    key={cls}
                                    className={`mobile-dropdown-item ${selectedClass === cls ? 'active' : ''}`}
                                    onClick={() => {
                                        setSelectedClass(cls);
                                        setIsAdding(false);
                                        setEditingId(null);
                                        setIsClassMenuOpen(false);
                                    }}
                                >
                                    {cls}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Desktop Buttons View */}
                <div className="desktop-class-tabs">
                    {gradeOptions.length === 0 ? (
                        <div style={{ padding: '1rem', background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', width: '100%' }}>
                            No classes found. Please go to "Manage Classes" to create some first.
                        </div>
                    ) : (
                        gradeOptions.map(cls => (
                            <button
                                key={cls}
                                className="desktop-class-btn"
                                onClick={() => {
                                    setSelectedClass(cls);
                                    setIsAdding(false);
                                    setEditingId(null);
                                }}
                                style={{
                                    padding: '0.75rem 1.25rem',
                                    borderRadius: '12px',
                                    border: '1px solid var(--border)',
                                    background: selectedClass === cls ? 'var(--primary)' : 'var(--surface)',
                                    color: selectedClass === cls ? 'white' : 'var(--text-main)',
                                    fontWeight: selectedClass === cls ? '600' : '400',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    boxShadow: selectedClass === cls ? 'var(--shadow-md)' : 'none',
                                }}
                            >
                                {cls}
                            </button>
                        ))
                    )}
                </div>
            </div>

            {(isAdding || editingId) && (
                <div className="card" style={{ marginBottom: '2rem', borderLeft: '4px solid var(--primary)' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>{isAdding ? `Add Student to ${selectedClass}` : 'Edit Student'}</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                        <div className="form-group">
                            <label>Student ID</label>
                            <input
                                type="text"
                                value={formData.id}
                                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                                disabled={!isAdding}
                                placeholder="STU..."
                            />
                        </div>
                        <div className="form-group">
                            <label>Name <span style={{ color: 'red' }}>*</span></label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Full Name"
                            />
                        </div>
                        <div className="form-group">
                            <label>Grade Level / Class</label>
                            <input
                                type="text"
                                value={formData.gradeLevel}
                                disabled={true} // Lock to selected class when adding/editing in this view
                                style={{ background: 'var(--background-alt)', cursor: 'not-allowed' }}
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
                            <label>Email (for Login) <span style={{ color: 'red' }}>*</span></label>
                            <input
                                type="email"
                                value={formData.email || ''}
                                onChange={(e) => {
                                    setFormData({ ...formData, email: e.target.value });
                                    if (emailError) setEmailError('');
                                }}
                                placeholder="student@school.com"
                                style={{ borderColor: emailError ? '#ef4444' : 'var(--border)' }}
                            />
                            {emailError && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.4rem', fontWeight: '500' }}>{emailError}</p>}
                        </div>
                        <div className="form-group">
                            <label>Phone</label>
                            <input
                                type="tel"
                                value={formData.phone || ''}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="Optional"
                            />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="text"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                        <button onClick={handleSave} className="btn btn-primary" disabled={isSaving} style={{ minWidth: '150px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            {isSaving ? <Loader className="spin" size={18} /> : <><Save size={18} style={{ marginRight: '0.5rem' }} /> Save Student</>}
                        </button>
                        <button onClick={handleCancel} className="btn btn-outline" disabled={isSaving}>
                            <X size={18} /> Cancel
                        </button>
                    </div>

                </div>
            )}

            {/* Student List for Selected Class */}
            {
                (selectedClass || searchQuery) ? (
                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ margin: 0 }}>
                                {selectedClass ? `Students in ${selectedClass}` : 'Search Results'}
                            </h3>
                            <span style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '1rem' }}>
                                {filteredStudents.length} Students
                            </span>
                        </div>

                        <style>{`
                            @media (min-width: 768px) {
                                .students-table-responsive { display: block !important; }
                                .students-mobile-cards { display: none !important; }
                            }
                        `}</style>

                        {/* Desktop Table View */}
                        <div className="students-table-responsive table-responsive" style={{ display: 'none' }}>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Photo</th>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Phone</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStudents.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                                <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                                                    {searchQuery ? `No students found matching "${searchQuery}"` : `No students found in ${selectedClass}.`}
                                                </p>
                                                {!searchQuery && <button onClick={handleAdd} className="btn btn-sm btn-primary">Add First Student</button>}
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredStudents.map(student => (
                                            <tr key={student.id}>
                                                <td style={{ fontWeight: '600' }}>{student.id}</td>
                                                <td>
                                                    {student.photo ? (
                                                        <img src={student.photo} alt={student.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                                                    ) : (
                                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <span style={{ fontSize: '0.8rem', color: '#888' }}>{student.name?.charAt(0)}</span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td>{student.name}</td>
                                                <td>{student.email || <span style={{ opacity: 0.5 }}>-</span>}</td>
                                                <td>{student.phone || <span style={{ opacity: 0.5 }}>-</span>}</td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <button onClick={() => handleEdit(student)} className="btn btn-sm btn-outline">
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button onClick={() => handleDelete(student.id)} className="btn btn-sm btn-outline" style={{ color: 'var(--danger)' }}>
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
                        <div className="students-mobile-cards" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {filteredStudents.length === 0 ? (
                                <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                    {searchQuery ? `No students matched your search.` : `No students found in this class.`}
                                </p>
                            ) : (
                                filteredStudents.map(student => (
                                    <div key={student.id} style={{
                                        border: '2px solid var(--border)',
                                        borderRadius: 'var(--radius)',
                                        padding: '1rem',
                                        background: 'var(--surface)'
                                    }}>
                                        {/* Student Header */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                            {student.photo ? (
                                                <img src={student.photo} alt={student.name} style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)' }} />
                                            ) : (
                                                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--background-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--border)' }}>
                                                    <span style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-muted)' }}>{student.name?.charAt(0)}</span>
                                                </div>
                                            )}
                                            <div style={{ flex: 1 }}>
                                                <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem', fontWeight: '700' }}>{student.name}</h4>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>ID: {student.id}</div>
                                            </div>
                                        </div>

                                        {/* Student Details */}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem', marginBottom: '1rem', fontSize: '0.9rem' }}>
                                            <div>
                                                <strong style={{ color: 'var(--text-secondary)' }}>Email:</strong>
                                                <div style={{ wordBreak: 'break-all' }}>{student.email || '-'}</div>
                                            </div>
                                            <div>
                                                <strong style={{ color: 'var(--text-secondary)' }}>Phone:</strong>
                                                <div>{student.phone || '-'}</div>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button onClick={() => handleEdit(student)} className="btn btn-sm btn-primary" style={{ flex: 1 }}>
                                                <Edit2 size={16} /> Edit
                                            </button>
                                            <button onClick={() => handleDelete(student.id)} className="btn btn-sm btn-outline" style={{ color: 'var(--danger)' }}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)', border: '2px dashed var(--border)', borderRadius: 'var(--radius)' }}>
                        {gradeOptions.length === 0 ? (
                            <>
                                <div style={{ marginBottom: '1rem', opacity: 0.5 }}><X size={48} /></div>
                                <h3>No Classes Found</h3>
                                <p>You need to create classes before you can add students.</p>
                                <Link to="/admin/classes" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-flex' }}>
                                    Go to Manage Classes
                                </Link>
                            </>
                        ) : (
                            <>
                                <div style={{ marginBottom: '1rem', opacity: 0.5 }}><Plus size={48} /></div>
                                <h3>Select a Class Above</h3>
                                <p>Choose a class to view or manage its students.</p>
                            </>
                        )}
                    </div>
                )
            }
        </div >
    );
}

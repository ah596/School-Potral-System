
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { api } from '../../utils/api';
import { Trash2, ArrowLeft, Image as ImageIcon, Link as LinkIcon, ExternalLink, Loader2, Plus, Upload } from 'lucide-react';
import LoadingScreen from '../../components/LoadingScreen';

export default function AdminGallery() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [gallery, setGallery] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [uploadMethod, setUploadMethod] = useState('file'); // 'file' or 'url'
    const [formData, setFormData] = useState({
        title: '',
        imageUrl: '',
        file: null
    });

    useEffect(() => {
        const unsubscribe = api.subscribeToGallery((data) => {
            setGallery(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const toBase64 = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (uploadMethod === 'file' && !formData.file) {
            alert("Please select a file to upload");
            return;
        }
        if (uploadMethod === 'url' && !formData.imageUrl) {
            alert("Please enter an image URL");
            return;
        }

        setSubmitting(true);
        try {
            let finalUrl = formData.imageUrl;

            if (uploadMethod === 'file' && formData.file) {
                // Limit to 1.5MB for Firestore string storage
                if (formData.file.size > 1.5 * 1024 * 1024) {
                    alert("The photo is too large. Please choose a smaller photo (under 1.5MB).");
                    setSubmitting(false);
                    return;
                }
                finalUrl = await toBase64(formData.file);
            }

            await api.addGalleryItem(finalUrl, formData.title || 'Untitled Event');
            setFormData({ title: '', imageUrl: '', file: null });

            // Reset file input if exists
            const fileInput = document.getElementById('gallery-file');
            if (fileInput) fileInput.value = '';

            alert("Photo added successfully!");
        } catch (error) {
            console.error("Failed to add gallery item", error);
            alert("Failed to save. Error: " + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this photo from the gallery?')) {
            try {
                await api.deleteGalleryItem(id);
            } catch (error) {
                console.error("Failed to delete", error);
                alert("Delete failed");
            }
        }
    };

    if (!user || user.role !== 'admin') return <Navigate to="/login" />;
    if (loading) return <LoadingScreen message="Loading Gallery..." />;

    return (
        <div className="container" style={{ padding: '0 clamp(1rem, 5vw, 2.5rem) 4rem', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ padding: '1.5rem 0', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <button onClick={() => navigate(-1)} className="btn-back">
                    <ArrowLeft size={24} />
                </button>
                <h2 style={{ fontSize: 'clamp(1.5rem, 5vw, 2.25rem)', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
                    School Gallery Management
                </h2>
            </div>

            <div className="admin-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
                {/* Add Form */}
                <div>
                    <div className="card" style={{ border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'var(--primary-light)', color: 'var(--primary)' }}>
                                <ImageIcon size={24} />
                            </div>
                            <h3 style={{ margin: 0 }}>Add New Event Photo</h3>
                        </div>

                        {/* Method Switcher */}
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: 'var(--surface-alt)', padding: '0.4rem', borderRadius: '12px' }}>
                            <button
                                onClick={() => setUploadMethod('file')}
                                style={{
                                    flex: 1, padding: '0.6rem', borderRadius: '8px', border: 'none',
                                    background: uploadMethod === 'file' ? 'var(--primary)' : 'transparent',
                                    color: uploadMethod === 'file' ? 'white' : 'var(--text-muted)',
                                    fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s',
                                    display: 'flex', alignItems: 'center', justifyCenter: 'center', gap: '0.5rem'
                                }}
                            >
                                <Upload size={16} /> Device Upload
                            </button>
                            <button
                                onClick={() => setUploadMethod('url')}
                                style={{
                                    flex: 1, padding: '0.6rem', borderRadius: '8px', border: 'none',
                                    background: uploadMethod === 'url' ? 'var(--primary)' : 'transparent',
                                    color: uploadMethod === 'url' ? 'white' : 'var(--text-muted)',
                                    fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s',
                                    display: 'flex', alignItems: 'center', justifyCenter: 'center', gap: '0.5rem'
                                }}
                            >
                                <LinkIcon size={16} /> Using Link
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Photo Title / Event Name</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g. Annual Sports Day 2026"
                                    required
                                />
                            </div>

                            {uploadMethod === 'file' ? (
                                <div className="form-group">
                                    <label>Select Photo from Computer</label>
                                    <div style={{
                                        border: '2px dashed var(--border)',
                                        padding: '2rem 1rem',
                                        borderRadius: '12px',
                                        textAlign: 'center',
                                        background: 'var(--surface-alt)',
                                        cursor: 'pointer',
                                        position: 'relative'
                                    }}>
                                        <Upload size={32} style={{ color: 'var(--primary)', marginBottom: '0.5rem', opacity: 0.7 }} />
                                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: '600' }}>
                                            {formData.file ? formData.file.name : 'Click to select a photo'}
                                        </p>
                                        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            Max size: 1.5MB
                                        </p>
                                        <input
                                            type="file"
                                            id="gallery-file"
                                            accept="image/*"
                                            onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
                                            style={{
                                                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                                opacity: 0, cursor: 'pointer'
                                            }}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="form-group">
                                    <label>Image Direct Link (URL)</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type="url"
                                            value={formData.imageUrl}
                                            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                            placeholder="https://example.com/photo.jpg"
                                            style={{ paddingLeft: '2.75rem' }}
                                        />
                                        <LinkIcon size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                                    </div>
                                    <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        Tip: Host free photos on <a href="https://postimages.org" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>PostImages.org</a>
                                    </p>
                                </div>
                            )}

                            {(formData.file || formData.imageUrl) && (
                                <div style={{ marginBottom: '1.5rem', borderRadius: '12px', overflow: 'hidden', border: '2px dashed var(--border)', background: 'var(--surface-alt)' }}>
                                    <p style={{ margin: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>Live Preview:</p>
                                    <img
                                        src={uploadMethod === 'file' ? (formData.file ? URL.createObjectURL(formData.file) : '') : formData.imageUrl}
                                        alt="Preview"
                                        style={{ width: '100%', height: '180px', objectFit: 'cover' }}
                                        onError={(e) => {
                                            if (uploadMethod === 'url') {
                                                e.target.style.display = 'none';
                                                alert("Invalid Link. Please use a direct image link.");
                                            }
                                        }}
                                    />
                                </div>
                            )}

                            <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '52px', marginTop: '1rem' }} disabled={submitting}>
                                {submitting ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />}
                                {submitting ? 'Saving Photo...' : 'Add to Home Gallery'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* List/Preview */}
                <div className="card" style={{ border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: 0 }}>Active Gallery ({gallery.length})</h3>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Auto-scrolling on Home</span>
                    </div>

                    {gallery.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem 1rem', opacity: 0.5 }}>
                            <ImageIcon size={48} style={{ marginBottom: '1rem' }} />
                            <p>No photos added yet.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                            {gallery.map(item => (
                                <div key={item.id} style={{
                                    display: 'flex',
                                    gap: '1rem',
                                    padding: '0.75rem',
                                    borderRadius: '12px',
                                    background: 'var(--surface-alt)',
                                    border: '1px solid var(--border)',
                                    alignItems: 'center'
                                }}>
                                    <img src={item.imageUrl} alt={item.title} style={{ width: '70px', height: '70px', borderRadius: '8px', objectFit: 'cover' }} />
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-main)', fontWeight: '700' }}>{item.title}</h4>
                                        <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            {item.imageUrl.startsWith('data:') ? 'Local Upload' : 'Linked Photo'}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        style={{ padding: '0.5rem', borderRadius: '8px', border: 'none', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', cursor: 'pointer' }}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .btn-back {
                    width: 45px; height: 45px; border-radius: 12px;
                    background: var(--surface); border: 1px solid var(--border);
                    color: var(--primary); display: flex; align-items: center; justify-content: center;
                    cursor: pointer; transition: all 0.2s;
                }
                .btn-back:hover { background: var(--primary); color: white; transform: translateX(-3px); }
                .admin-grid { min-height: 600px; }
            `}</style>
        </div>
    );
}

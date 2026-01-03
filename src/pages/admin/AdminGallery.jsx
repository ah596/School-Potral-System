
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { api } from '../../utils/api';
import { Plus, Trash2, ArrowLeft, Image as ImageIcon, Upload, Loader2 } from 'lucide-react';
import LoadingScreen from '../../components/LoadingScreen';

export default function AdminGallery() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [gallery, setGallery] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [formData, setFormData] = useState({
        title: '',
        file: null
    });

    useEffect(() => {
        // Real-time subscription
        const unsubscribe = api.subscribeToGallery((data) => {
            setGallery(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Gallery Upload Version: 2.0");
        if (!formData.file) {
            alert("Please select an image");
            return;
        }
        setUploading(true);
        setUploadProgress(0);
        try {
            await api.addGalleryItem(formData.file, formData.title, (progress) => {
                setUploadProgress(Math.round(progress));
            });
            setFormData({ title: '', file: null });
            // Reset file input
            const fileInput = document.getElementById('gallery-file');
            if (fileInput) fileInput.value = '';
        } catch (error) {
            console.error("Failed to add gallery item", error);
            alert("FAILED: " + (error.code || error.message || "Unknown error") + "\n\nPlease check Firebase Storage Rules.");
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this photo?')) {
            try {
                await api.deleteGalleryItem(id);
            } catch (error) {
                console.error("Failed to delete gallery item", error);
                alert("Failed to delete photo");
            }
        }
    };

    if (!user || user.role !== 'admin') {
        return <Navigate to="/login" />;
    }

    if (loading) return <LoadingScreen message="Loading Gallery..." />;

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
                    <h2 style={{ fontSize: 'clamp(1.5rem, 5vw, 2.25rem)', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
                        School Gallery Management
                    </h2>
                </div>
            </div>

            <div style={{ padding: '1rem', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid var(--warning)', borderRadius: '12px', marginBottom: '2rem' }}>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--warning)', fontWeight: '600' }}>
                    🔍 Upload Debug Info:
                    <span style={{ marginLeft: '10px', opacity: 0.8 }}>UID: {user.uid || 'Not Verified'}</span>
                    <span style={{ marginLeft: '10px', opacity: 0.8 }}>| Role: {user.role}</span>
                </p>
                <p style={{ margin: '5px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    If upload stays at 0%, please ensure your Firebase Storage Rules allow "write" access for authenticated users.
                </p>
            </div>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <ImageIcon size={24} color="var(--primary)" />
                    Upload New Image
                </h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Activity/Event Title</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g. Annual Sports Day 2026"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Image File</label>
                        <input
                            type="file"
                            id="gallery-file"
                            accept="image/*"
                            onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
                            style={{ padding: '0.5rem 0' }}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={uploading}>
                        {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                        {uploading ? `Uploading ${uploadProgress}%...` : 'Upload to Gallery'}
                    </button>
                </form>
            </div>

            <div className="card">
                <h3 style={{ marginBottom: '2rem' }}>Gallery Preview</h3>
                {gallery.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 2rem', border: '2px dashed var(--border)', borderRadius: 'var(--radius)' }}>
                        <ImageIcon size={48} color="var(--text-light)" style={{ marginBottom: '1rem' }} />
                        <p style={{ color: 'var(--text-muted)' }}>No images in the gallery yet. Start by uploading one!</p>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: '1.5rem'
                    }}>
                        {gallery.map(item => (
                            <div key={item.id} className="gallery-item-card" style={{
                                position: 'relative',
                                borderRadius: 'var(--radius)',
                                overflow: 'hidden',
                                border: '1px solid var(--border)',
                                background: 'var(--surface)',
                                transition: 'all 0.3s ease'
                            }}>
                                <img
                                    src={item.imageUrl}
                                    alt={item.title}
                                    style={{
                                        width: '100%',
                                        height: '200px',
                                        objectFit: 'cover',
                                        display: 'block'
                                    }}
                                />
                                <div style={{ padding: '1rem' }}>
                                    <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem', fontWeight: '700' }}>{item.title}</h4>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        {new Date(item.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    style={{
                                        position: 'absolute',
                                        top: '0.75rem',
                                        right: '0.75rem',
                                        padding: '0.5rem',
                                        borderRadius: '50%',
                                        background: 'rgba(239, 68, 68, 0.9)',
                                        color: 'white',
                                        border: 'none',
                                        cursor: 'pointer',
                                        boxShadow: 'var(--shadow-md)',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                    title="Delete Photo"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

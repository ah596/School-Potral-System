
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { api } from '../../utils/api';
import { Trash2, ArrowLeft, Image as ImageIcon, Link as LinkIcon, ExternalLink, Loader2, Plus } from 'lucide-react';
import LoadingScreen from '../../components/LoadingScreen';

export default function AdminGallery() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [gallery, setGallery] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        imageUrl: ''
    });

    useEffect(() => {
        const unsubscribe = api.subscribeToGallery((data) => {
            setGallery(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.imageUrl) return;

        setSubmitting(true);
        try {
            await api.addGalleryItem(formData.imageUrl, formData.title || 'Untitled Event');
            setFormData({ title: '', imageUrl: '' });
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
                    <div className="card" style={{ sticky: 'top 2rem', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'var(--primary-light)', color: 'var(--primary)' }}>
                                <ImageIcon size={24} />
                            </div>
                            <h3 style={{ margin: 0 }}>Add New Event Photo</h3>
                        </div>

                        <div style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.2)', marginBottom: '1.5rem' }}>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <ExternalLink size={14} /> Free Photo Tip:
                            </p>
                            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                To use your own photos without a paid plan, upload them to <a href="https://postimages.org" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontWeight: '700' }}>PostImages.org</a> and paste the <b>Direct Link</b> below.
                            </p>
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
                            <div className="form-group">
                                <label>Image Direct URL</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="url"
                                        value={formData.imageUrl}
                                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                        placeholder="https://example.com/photo.jpg"
                                        style={{ paddingLeft: '2.75rem' }}
                                        required
                                    />
                                    <LinkIcon size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                                </div>
                            </div>

                            {formData.imageUrl && (
                                <div style={{ marginBottom: '1.5rem', borderRadius: '12px', overflow: 'hidden', border: '2px dashed var(--border)', background: 'var(--surface-alt)' }}>
                                    <p style={{ margin: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>Live Preview:</p>
                                    <img
                                        src={formData.imageUrl}
                                        alt="Preview"
                                        style={{ width: '100%', height: '180px', objectFit: 'cover' }}
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            alert("Invalid Image URL. Please use a direct link ending in .jpg, .png or .webp");
                                        }}
                                        onLoad={(e) => e.target.style.display = 'block'}
                                    />
                                </div>
                            )}

                            <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '52px' }} disabled={submitting}>
                                {submitting ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />}
                                {submitting ? 'Saving...' : 'Add to Home Gallery'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* List/Preview */}
                <div className="card" style={{ border: '1px solid var(--border)' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Active Gallery Items ({gallery.length})</h3>
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
                                        <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-main)' }}>{item.title}</h4>
                                        <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            {new Date(item.createdAt).toLocaleDateString()}
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

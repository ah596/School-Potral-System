import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { MessageSquare, Send, User, Search, ArrowLeft } from 'lucide-react';
import LoadingScreen from '../components/LoadingScreen';
import { api } from '../utils/api';

export default function Messages() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [newMessage, setNewMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            loadMessages();
        }
    }, [user]);

    const loadMessages = async () => {
        try {
            const data = await api.getMessages(user.id, user.role);
            setMessages(data);
        } catch (error) {
            console.error("Failed to load messages", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (newMessage.trim()) {
            const msgData = {
                fromId: user.id,
                from: user.name,
                toId: 'ADM001', // Defaulting to Admin for now
                role: user.role, // Sender role
                subject: 'General Enquiry',
                message: newMessage,
                date: new Date().toISOString().split('T')[0],
                time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
            };

            try {
                await api.sendMessage(msgData);
                setNewMessage('');
                // Optimistically update or reload
                // Since getMessages fetches 'toId', and we sent to Admin, it won't appear in our inbox unless we also fetch 'sent' messages.
                // For this UI, let's just append it locally so user sees they sent it.
                setMessages([{ ...msgData, id: Date.now() }, ...messages]);
            } catch (error) {
                alert("Failed to send message");
            }
        }
    };

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (loading) return <LoadingScreen message="Loading Messages..." />;

    const getRoleColor = (role) => {
        switch (role) {
            case 'Teacher': return '#3b82f6';
            case 'admin':
            case 'Admin': return '#8b5cf6';
            case 'student':
            case 'Student': return '#10b981';
            default: return '#6b7280';
        }
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
                    <div>
                        <h2 style={{ fontSize: 'clamp(1.5rem, 5vw, 2.25rem)', fontWeight: '800', margin: 0, color: 'var(--text)' }}>
                            Messages & Enquiries
                        </h2>
                        <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)' }}>
                            Contact your teachers or administrator
                        </p>
                    </div>
                </div>
            </div>

            {/* Send New Message */}
            <div className="card" style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>Send Message to Admin</h3>
                <form onSubmit={handleSendMessage}>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message..."
                            rows="3"
                            style={{
                                flex: 1,
                                padding: '0.9rem 1rem',
                                border: '2px solid var(--border)',
                                borderRadius: 'var(--radius)',
                                background: 'var(--background)',
                                fontFamily: 'inherit',
                                resize: 'vertical'
                            }}
                        />
                        <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-end' }}>
                            <Send size={18} /> Send
                        </button>
                    </div>
                </form>
            </div>

            {/* Messages List */}
            <div className="card">
                <h3 style={{ marginBottom: '1.5rem' }}>Inbox</h3>
                {messages.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        <MessageSquare size={64} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                        <p>No messages yet</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {messages.map(msg => (
                            <div key={msg.id} style={{
                                padding: '1.5rem',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius)',
                                borderLeft: `4px solid ${getRoleColor(msg.role)}`,
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                cursor: 'pointer'
                            }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateX(4px)';
                                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateX(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{
                                            width: '48px', height: '48px',
                                            background: `${getRoleColor(msg.role)}20`,
                                            borderRadius: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: getRoleColor(msg.role)
                                        }}>
                                            <UserIcon size={24} />
                                        </div>
                                        <div>
                                            <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700' }}>{msg.from}</h4>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
                                                <span className="badge" style={{
                                                    background: `${getRoleColor(msg.role)}20`,
                                                    color: getRoleColor(msg.role),
                                                    fontSize: '0.75rem'
                                                }}>
                                                    {msg.role}
                                                </span>
                                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                    {msg.subject}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        <div>{msg.date}</div>
                                        <div>{msg.time}</div>
                                    </div>
                                </div>
                                <p style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.05rem', lineHeight: '1.6', paddingLeft: '64px' }}>
                                    {msg.message}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

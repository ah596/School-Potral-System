import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { MessageSquare, Send, User as UserIcon } from 'lucide-react';

export default function Messages() {
    const { user } = useAuth();
    const [newMessage, setNewMessage] = useState('');
    const [messages, setMessages] = useState([
        {
            id: 1,
            from: 'Mr. Anderson',
            role: 'Teacher',
            subject: 'Mathematics',
            message: 'Great work on your last assignment! Keep it up.',
            date: '2024-12-01',
            time: '10:30 AM'
        },
        {
            id: 2,
            from: 'Ms. Roberts',
            role: 'Teacher',
            subject: 'Science',
            message: 'Please submit your lab report by Friday.',
            date: '2024-11-30',
            time: '02:15 PM'
        },
        {
            id: 3,
            from: 'Principal Office',
            role: 'Admin',
            subject: 'General',
            message: 'Parent-teacher meeting scheduled for next week.',
            date: '2024-11-28',
            time: '09:00 AM'
        },
    ]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim()) {
            const message = {
                id: messages.length + 1,
                from: 'You',
                role: 'Student',
                subject: 'General',
                message: newMessage,
                date: new Date().toISOString().split('T')[0],
                time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
            };
            setMessages([message, ...messages]);
            setNewMessage('');
        }
    };

    if (!user) {
        return <Navigate to="/login" />;
    }

    const getRoleColor = (role) => {
        switch (role) {
            case 'Teacher': return '#3b82f6';
            case 'Admin': return '#8b5cf6';
            case 'Student': return '#10b981';
            default: return '#6b7280';
        }
    };

    return (
        <div className="container" style={{ padding: '2rem 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{
                    width: '64px', height: '64px',
                    background: 'linear-gradient(135deg, #ec4899, #f472b6)',
                    borderRadius: '16px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white'
                }}>
                    <MessageSquare size={32} />
                </div>
                <div>
                    <h2 style={{ fontSize: '2rem', fontWeight: '700', margin: 0 }}>Messages</h2>
                    <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)' }}>
                        {messages.length} conversations
                    </p>
                </div>
            </div>

            {/* Send New Message */}
            <div className="card" style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>Send New Message</h3>
                <form onSubmit={handleSendMessage}>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message to teachers..."
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
                <h3 style={{ marginBottom: '1.5rem' }}>All Messages</h3>
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

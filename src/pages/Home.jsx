import { Link } from 'react-router-dom';
import {
    GraduationCap, Users, Heart, BookOpen, FlaskConical, Music,
    Dumbbell, FileText, Calendar, Mail, Phone, MapPin,
    Facebook, Twitter, Instagram, Linkedin
} from 'lucide-react';

export default function Home() {
    const features = [
        {
            icon: GraduationCap,
            title: 'Academic Excellence',
            description: 'Committed to rigorous academic standards while fostering intellectual curiosity and personal growth in every student.'
        },
        {
            icon: Users,
            title: 'Community Focus',
            description: 'Building a supportive, inclusive environment that encourages collaboration and mutual respect.'
        },
        {
            icon: Heart,
            title: 'Holistic Development',
            description: 'Nurturing the minds, emotions, and physical well-being of students throughout their academic journey.'
        }
    ];

    const programs = [
        { title: 'Core Curriculum', icon: BookOpen, color: '#3b82f6' },
        { title: 'STEM Programs', icon: FlaskConical, color: '#10b981' },
        { title: 'Arts & Humanities', icon: Music, color: '#f59e0b' },
        { title: 'Athletics & Physical Education', icon: Dumbbell, color: '#ef4444' }
    ];

    const events = [
        {
            date: { month: 'DEC', day: '25' },
            title: 'Fall Open House',
            description: 'Committed to rigorous academic standards while fostering intellectual curiosity.',
            location: 'Free • Our Location'
        },
        {
            date: { month: 'JAN', day: '28' },
            title: 'Parent-Teacher Conference',
            description: 'Committed to rigorous academic standards while fostering intellectual curiosity.',
            location: 'Free • Our Location'
        },
        {
            date: { month: 'FEB', day: '25' },
            title: 'Annual School Play: "The Tempest"',
            description: 'Committed to rigorous academic standards while fostering intellectual curiosity.',
            location: 'Free • Our Location'
        }
    ];

    return (
        <div style={{ background: 'var(--background)', minHeight: '100vh' }}>
            {/* Hero Section */}
            <section style={{
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.9), rgba(139, 92, 246, 0.9)), url("https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200") center/cover',
                minHeight: '600px',
                display: 'flex',
                alignItems: 'center',
                color: 'white',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div className="container" style={{ padding: '4rem 2rem', maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                    <h1 style={{ fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', fontWeight: '800', marginBottom: '1rem', lineHeight: '1.1' }}>
                        Welcome to<br />Our School
                    </h1>
                    <p style={{ fontSize: 'clamp(1.1rem, 3vw, 1.5rem)', marginBottom: '2.5rem', opacity: 0.95, maxWidth: '600px' }}>
                        Inspiring Excellence, Building Futures
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <Link to="/login" className="btn" style={{
                            background: 'white',
                            color: 'var(--primary)',
                            padding: '1rem 2rem',
                            fontSize: '1.1rem',
                            fontWeight: '700',
                            borderRadius: '12px',
                            textDecoration: 'none',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
                        }}>
                            Student/Teacher Login
                        </Link>
                        <button className="btn" style={{
                            background: 'rgba(255,255,255,0.2)',
                            color: 'white',
                            border: '2px solid white',
                            padding: '1rem 2rem',
                            fontSize: '1.1rem',
                            fontWeight: '700',
                            borderRadius: '12px',
                            backdropFilter: 'blur(10px)'
                        }}>
                            Virtual Tour
                        </button>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section style={{ padding: '5rem 2rem', background: 'var(--surface)' }}>
                <div className="container" style={{ maxWidth: '1400px', margin: '0 auto' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
                        {features.map((feature, index) => (
                            <div key={index} style={{ textAlign: 'center' }}>
                                <div style={{
                                    width: '80px',
                                    height: '80px',
                                    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                                    borderRadius: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 1.5rem',
                                    boxShadow: 'var(--shadow-lg)'
                                }}>
                                    <feature.icon size={40} color="white" />
                                </div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem' }}>{feature.title}</h3>
                                <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section style={{ padding: '5rem 2rem' }}>
                <div className="container" style={{ maxWidth: '1400px', margin: '0 auto', textAlign: 'center' }}>
                    <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: '800', marginBottom: '4rem' }}>About Us</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                        {features.map((feature, index) => (
                            <div key={index} className="card" style={{ padding: '2rem', textAlign: 'center' }}>
                                <div style={{
                                    width: '60px',
                                    height: '60px',
                                    background: 'rgba(99, 102, 241, 0.1)',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 1rem'
                                }}>
                                    <feature.icon size={30} color="var(--primary)" />
                                </div>
                                <h4 style={{ fontWeight: '700', marginBottom: '0.5rem' }}>{feature.title}</h4>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Programs Section */}
            <section style={{ padding: '5rem 2rem', background: 'var(--surface)' }}>
                <div className="container" style={{ maxWidth: '1400px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: '800', marginBottom: '3rem', textAlign: 'center' }}>Our Programs</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                        {programs.map((program, index) => (
                            <div key={index} className="card" style={{
                                padding: '2rem',
                                textAlign: 'center',
                                transition: 'transform 0.3s',
                                cursor: 'pointer'
                            }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-8px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                                <div style={{
                                    width: '80px',
                                    height: '80px',
                                    background: program.color,
                                    borderRadius: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 1.5rem',
                                    boxShadow: `0 8px 24px ${program.color}40`
                                }}>
                                    <program.icon size={36} color="white" />
                                </div>
                                <h4 style={{ fontWeight: '700', marginBottom: '1rem' }}>{program.title}</h4>
                                <button className="btn btn-primary" style={{ fontSize: '0.9rem', padding: '0.6rem 1.5rem' }}>
                                    Learn More
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Upcoming Events */}
            <section style={{ padding: '5rem 2rem' }}>
                <div className="container" style={{ maxWidth: '1400px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: '800', marginBottom: '3rem', textAlign: 'center' }}>Upcoming Events</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                        {events.map((event, index) => (
                            <div key={index} className="card" style={{ padding: '2rem' }}>
                                <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem' }}>
                                    <div style={{
                                        width: '70px',
                                        height: '70px',
                                        background: 'var(--primary)',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        flexShrink: 0
                                    }}>
                                        <div style={{ fontSize: '0.8rem', fontWeight: '600' }}>{event.date.month}</div>
                                        <div style={{ fontSize: '1.8rem', fontWeight: '800', lineHeight: 1 }}>{event.date.day}</div>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ fontWeight: '700', marginBottom: '0.5rem' }}>{event.title}</h4>
                                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                            {event.description}
                                        </p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                            <MapPin size={14} />
                                            <span>{event.location}</span>
                                        </div>
                                    </div>
                                </div>
                                <button className="btn btn-outline" style={{ width: '100%', marginTop: '1rem' }}>
                                    View Details
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section style={{ padding: '5rem 2rem', background: 'var(--surface)' }}>
                <div className="container" style={{ maxWidth: '1400px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: '800', marginBottom: '3rem', textAlign: 'center' }}>Contact Us</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
                        <div>
                            <div style={{ marginBottom: '2rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                    <MapPin size={24} color="var(--primary)" />
                                    <span style={{ fontWeight: '600' }}>123 Education Lane, Cityville, State, 54321</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                    <Phone size={24} color="var(--primary)" />
                                    <span style={{ fontWeight: '600' }}>(123) 456-7890</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <Mail size={24} color="var(--primary)" />
                                    <span style={{ fontWeight: '600' }}>info@ourschool.edu</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <a href="#" style={{
                                    width: '40px',
                                    height: '40px',
                                    background: 'var(--primary)',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white'
                                }}>
                                    <Facebook size={20} />
                                </a>
                                <a href="#" style={{
                                    width: '40px',
                                    height: '40px',
                                    background: 'var(--primary)',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white'
                                }}>
                                    <Twitter size={20} />
                                </a>
                                <a href="#" style={{
                                    width: '40px',
                                    height: '40px',
                                    background: 'var(--primary)',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white'
                                }}>
                                    <Instagram size={20} />
                                </a>
                                <a href="#" style={{
                                    width: '40px',
                                    height: '40px',
                                    background: 'var(--primary)',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white'
                                }}>
                                    <Linkedin size={20} />
                                </a>
                            </div>
                        </div>
                        <div className="card" style={{ padding: '2rem' }}>
                            <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <input
                                    type="text"
                                    placeholder="Name"
                                    style={{
                                        padding: '0.9rem',
                                        borderRadius: 'var(--radius)',
                                        border: '2px solid var(--border)',
                                        background: 'var(--background)'
                                    }}
                                />
                                <input
                                    type="email"
                                    placeholder="Email Address"
                                    style={{
                                        padding: '0.9rem',
                                        borderRadius: 'var(--radius)',
                                        border: '2px solid var(--border)',
                                        background: 'var(--background)'
                                    }}
                                />
                                <input
                                    type="text"
                                    placeholder="Subject"
                                    style={{
                                        padding: '0.9rem',
                                        borderRadius: 'var(--radius)',
                                        border: '2px solid var(--border)',
                                        background: 'var(--background)'
                                    }}
                                />
                                <textarea
                                    placeholder="Message"
                                    rows="4"
                                    style={{
                                        padding: '0.9rem',
                                        borderRadius: 'var(--radius)',
                                        border: '2px solid var(--border)',
                                        background: 'var(--background)',
                                        resize: 'vertical'
                                    }}
                                />
                                <button type="submit" className="btn btn-primary" style={{ padding: '1rem' }}>
                                    Send Message
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={{
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                color: 'white',
                padding: '2rem',
                textAlign: 'center'
            }}>
                <p style={{ margin: 0, opacity: 0.9 }}>© 2024 Our School. All rights reserved.</p>
            </footer>
        </div>
    );
}

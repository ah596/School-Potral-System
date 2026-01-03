import { useState, useEffect } from 'react';
import { GraduationCap, LogIn, Users, BookOpen, Clock, ShieldCheck, CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';

export default function Home() {
    const [gallery, setGallery] = useState([]);

    useEffect(() => {
        const unsubscribe = api.subscribeToGallery((data) => {
            setGallery(data);
        });
        return () => unsubscribe();
    }, []);

    return (
        <div className="home-container">
            {/* Hero Section */}
            <header id="home" className="hero">
                <div className="container hero-content">
                    <div className="hero-text">
                        <div className="badge">Education Excellence</div>
                        <h1>Modern School <br /><span className="text-gradient">Portal System</span></h1>
                        <p>Streamline education with our comprehensive management system. Connecting students, teachers, and administration in one seamless platform.</p>

                        <div className="hero-actions">
                            <Link to="/login" className="btn btn-primary btn-lg">
                                Access Portal <ArrowRight size={20} />
                            </Link>
                            <a href="#features" className="btn btn-outline btn-lg">Learn More</a>
                        </div>

                        <div className="hero-stats">
                            <div className="stat">
                                <strong>1000+</strong>
                                <span>Students</span>
                            </div>
                            <div className="stat">
                                <strong>50+</strong>
                                <span>Expert Teachers</span>
                            </div>
                            <div className="stat">
                                <strong>99%</strong>
                                <span>Success Rate</span>
                            </div>
                        </div>
                    </div>

                    <div className="hero-image">
                        <div className="image-card main-image">
                            <img src="/school-hero.png" alt="School" />
                        </div>
                        <div className="floating-card user-count">
                            <Users size={20} />
                            <div>
                                <strong>+20 New</strong>
                                <span>Admissions Today</span>
                            </div>
                        </div>
                        <div className="floating-card progress-card">
                            <CheckCircle size={20} color="var(--success)" />
                            <div>
                                <strong>Attendance</strong>
                                <span>98% Average</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Features Section */}
            <section id="features" className="features container">
                <div className="section-header">
                    <h2>Everything You Need</h2>
                    <p>Designed to make school management simple and efficient for everyone.</p>
                </div>

                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
                            <GraduationCap size={32} />
                        </div>
                        <h3>Student Portal</h3>
                        <p>Access attendance, results, assignments, and timetables in one place.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                            <BookOpen size={32} />
                        </div>
                        <h3>Teacher Management</h3>
                        <p>Post updates, mark attendance, and manage marks with real-time sync.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                            <ShieldCheck size={32} />
                        </div>
                        <h3>Admin Control</h3>
                        <p>Full oversight of students, teachers, results, and school-wide communications.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon" style={{ background: 'rgba(236, 72, 153, 0.1)', color: '#ec4899' }}>
                            <Clock size={32} />
                        </div>
                        <h3>Real-time Sync</h3>
                        <p>Instant notifications and live updates across the entire school network.</p>
                    </div>
                </div>
            </section>

            {/* Gallery Section */}
            {gallery.length > 0 && (
                <section id="gallery" className="home-gallery">
                    <div className="container">
                        <div className="section-header">
                            <h2>School Gallery</h2>
                            <p>Capturing the best moments of our school activities and events.</p>
                        </div>
                    </div>

                    <div className="gallery-track-container">
                        <div className="gallery-track">
                            {[...gallery, ...gallery, ...gallery].map((item, index) => (
                                <div key={`${item.id}-${index}`} className="gallery-slide">
                                    <div className="gallery-card">
                                        <img src={item.imageUrl} alt={item.title} />
                                        <div className="gallery-overlay">
                                            <span>{item.title}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Footer */}
            <footer className="footer-main">
                <div className="container">
                    <div className="footer-grid">
                        <div className="footer-brand">
                            <div className="footer-logo">
                                <GraduationCap size={24} />
                                <span>SchoolPortal</span>
                            </div>
                            <p>Moving education into the digital age with modern tools and smart design.</p>
                        </div>
                        <div className="footer-nav">
                            <h4>Quick Links</h4>
                            <ul>
                                <li><Link to="/">Home</Link></li>
                                <li><Link to="/login">Portal Login</Link></li>
                                <li><a href="#gallery">School Gallery</a></li>
                                <li><a href="#features">Features</a></li>
                            </ul>
                        </div>
                        <div className="footer-contact">
                            <h4>Contact Us</h4>
                            <p>Email: support@schoolportal.com</p>
                            <p>Help Desk: +1 234 567 890</p>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p>© 2026 Modern School Portal. All rights reserved.</p>
                        <div className="footer-legal">
                            <span>Privacy Policy</span>
                            <span>Terms of Service</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

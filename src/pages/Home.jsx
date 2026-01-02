
import { GraduationCap, LogIn, Users, BookOpen, Clock, ShieldCheck, CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
    return (
        <div className="home-container">
            {/* Hero Section */}
            <header className="hero">
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
                            <img src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80" alt="School" />
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

            {/* Footer */}
            <footer className="footer shadow-lg">
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-brand">
                            <span className="logo-text">SchoolPortal</span>
                            <p>Moving education into the digital age with modern tools and smart design.</p>
                        </div>
                        <div className="footer-links">
                            <p>© 2026 Modern School Portal. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

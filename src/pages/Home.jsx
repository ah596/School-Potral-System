import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Users, Award } from 'lucide-react';

export default function Home() {
    return (
        <div className="home-page">
            <section className="hero">
                <div className="container">
                    <h1>Empowering Education for the Future</h1>
                    <p>Streamline your school management with our comprehensive portal. Access grades, schedules, and resources in one place.</p>
                    <div className="hero-actions">
                        <Link to="/login" className="btn btn-primary">
                            Get Started <ArrowRight className="icon-sm" />
                        </Link>
                        <Link to="/about" className="btn btn-outline">Learn More</Link>
                    </div>
                </div>
            </section>

            <section className="features">
                <div className="container">
                    <div className="feature-grid">
                        <div className="feature-card">
                            <BookOpen className="feature-icon" />
                            <h3>Digital Library</h3>
                            <p>Access thousands of resources anytime, anywhere.</p>
                        </div>
                        <div className="feature-card">
                            <Users className="feature-icon" />
                            <h3>Community</h3>
                            <p>Connect with teachers and students easily.</p>
                        </div>
                        <div className="feature-card">
                            <Award className="feature-icon" />
                            <h3>Achievements</h3>
                            <p>Track your progress and earn certificates.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

import { NavLink } from 'react-router-dom';
import {
    CreditCard,
    Clock,
    FileText,
    BookOpen,
    Bell,
    Calendar
} from 'lucide-react';

export default function StudentNav() {
    const navItems = [
        { to: '/fees', label: 'Fees', icon: CreditCard },
        { to: '/attendance', label: 'Attendance', icon: Clock },
        { to: '/results', label: 'Marks/Results', icon: FileText },
        { to: '/assignments', label: 'Assignments', icon: BookOpen },
        { to: '/notices', label: 'Notices', icon: Bell },
        { to: '/timetable', label: 'Timetable', icon: Calendar },
    ];

    return (
        <div className="student-nav-container">
            <div className="container">
                <nav className="student-nav">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) => `student-nav-link ${isActive ? 'active' : ''}`}
                        >
                            <item.icon size={18} />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>
            </div>
        </div>
    );
}

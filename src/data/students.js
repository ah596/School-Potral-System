export const students = [
    {
        id: 'STU001',
        password: 'password123', // In a real app, this would be hashed
        name: 'Alex Johnson',
        gradeLevel: '10th Grade',
        contact: { email: 'alex.j@school.edu', phone: '555-0101', address: '123 Main St, City' },
        schedule: [
            { subject: 'Mathematics', time: '09:00 AM', room: '101' },
            { subject: 'History', time: '10:30 AM', room: '204' },
            { subject: 'Physics', time: '01:00 PM', room: 'Lab 3' },
            { subject: 'English', time: '02:30 PM', room: '105' },
        ],
        grades: [
            { subject: 'Mathematics', grade: 'A', score: 95 },
            { subject: 'History', grade: 'B+', score: 88 },
            { subject: 'Physics', grade: 'A-', score: 91 },
            { subject: 'English', grade: 'B', score: 85 },
        ],
        announcements: [
            { id: 1, title: 'Science Fair', date: '2024-03-15', content: 'Sign up for the annual Science Fair by Friday.' },
            { id: 2, title: 'Library Hours', date: '2024-03-10', content: 'Library will be closed this Saturday for maintenance.' },
        ],
        photo: '/assets/photos/STU001.jpg',
        attendance: {
            summary: { present: 85, absent: 5, leave: 2 },
            monthly: [
                { month: 'Jan', present: 20, absent: 1 },
                { month: 'Feb', present: 18, absent: 2 }
            ],
            subject: [
                { subject: 'Mathematics', present: 18, absent: 0 },
                { subject: 'History', present: 15, absent: 2 }
            ],
            daily: [
                { date: '2024-03-01', status: 'Present' },
                { date: '2024-03-02', status: 'Absent' }
            ]
        },
        results: [
            { subject: 'Mathematics', midTerm: 92, final: 96, assignment: 94 },
            { subject: 'History', midTerm: 88, final: 90, assignment: 85 }
        ],
        assignments: [
            { id: 1, title: 'Math Homework', due: '2024-04-10', status: 'Submitted' },
            { id: 2, title: 'History Essay', due: '2024-04-12', status: 'Pending' }
        ],
        fees: {
            pending: [{ id: 1, amount: 200, due: '2024-05-01' }],
            paid: [{ id: 2, amount: 500, date: '2024-01-15' }]
        },
        messages: [
            { id: 1, from: 'Teacher', content: 'Please submit your assignment.', date: '2024-03-20' }
        ],
        timetable: [
            { day: 'Monday', subject: 'Mathematics', time: '09:00 AM' },
            { day: 'Monday', subject: 'History', time: '10:30 AM' }
        ],
    },
    {
        id: 'STU002',
        password: 'password123',
        name: 'Sarah Williams',
        gradeLevel: '11th Grade',
        contact: { email: 'sarah.w@school.edu', phone: '555-0102', address: '456 Oak Ave, Town' },
        schedule: [
            { subject: 'Chemistry', time: '09:00 AM', room: 'Lab 1' },
            { subject: 'Literature', time: '10:30 AM', room: '202' },
            { subject: 'Calculus', time: '01:00 PM', room: '102' },
            { subject: 'Art', time: '02:30 PM', room: 'Studio B' },
        ],
        grades: [
            { subject: 'Chemistry', grade: 'A', score: 94 },
            { subject: 'Literature', grade: 'A', score: 96 },
            { subject: 'Calculus', grade: 'B', score: 82 },
            { subject: 'Art', grade: 'A+', score: 98 },
        ],
        announcements: [
            { id: 1, title: 'Art Exhibition', date: '2024-03-20', content: 'Submit your artwork for the spring exhibition.' },
        ],
        photo: '/assets/photos/STU002.jpg',
        attendance: {
            summary: { present: 90, absent: 3, leave: 1 },
            monthly: [
                { month: 'Jan', present: 22, absent: 0 },
                { month: 'Feb', present: 20, absent: 1 }
            ],
            subject: [
                { subject: 'Chemistry', present: 20, absent: 0 },
                { subject: 'Literature', present: 18, absent: 2 }
            ],
            daily: [
                { date: '2024-03-01', status: 'Present' },
                { date: '2024-03-02', status: 'Present' }
            ]
        },
        results: [
            { subject: 'Chemistry', midTerm: 94, final: 95, assignment: 93 },
            { subject: 'Literature', midTerm: 96, final: 97, assignment: 95 }
        ],
        assignments: [
            { id: 1, title: 'Chemistry Lab', due: '2024-04-15', status: 'Submitted' },
            { id: 2, title: 'Literature Review', due: '2024-04-18', status: 'Pending' }
        ],
        fees: {
            pending: [{ id: 1, amount: 150, due: '2024-06-01' }],
            paid: [{ id: 2, amount: 600, date: '2024-02-10' }]
        },
        messages: [
            { id: 1, from: 'Teacher', content: 'Prepare for the upcoming test.', date: '2024-03-22' }
        ],
        timetable: [
            { day: 'Monday', subject: 'Chemistry', time: '09:00 AM' },
            { day: 'Monday', subject: 'Literature', time: '10:30 AM' }
        ],
    }
];

const express = require('express');
const cors = require('cors');
const { initializeDatabase, getDb } = require('./database');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Initialize DB
initializeDatabase().then(() => {
    console.log('Database initialized');
}).catch(err => {
    console.error('Failed to initialize database:', err);
});

// --- Auth Routes ---

app.post('/api/login', async (req, res) => {
    const { id, password } = req.body;
    const db = getDb();

    try {
        const user = await db.get('SELECT * FROM users WHERE id = ? AND password = ?', [id, password]);

        if (user) {
            // Fetch extra details based on role
            let details = {};
            if (user.role === 'student') {
                details = await db.get('SELECT * FROM students WHERE id = ?', [user.id]);
            } else if (user.role === 'teacher') {
                details = await db.get('SELECT * FROM teachers WHERE id = ?', [user.id]);
                if (details && details.classes) {
                    details.classes = JSON.parse(details.classes);
                }
            }

            res.json({ ...user, ...details });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// --- Password Reset Routes ---

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'process.env.EMAIL_USER', // Replace with environment variable or real email
        pass: 'process.env.EMAIL_PASS'  // Replace with environment variable or real app password
    }
});

app.post('/api/forgot-password', async (req, res) => {
    const { email } = req.body;
    const db = getDb();
    try {
        const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
        if (!user) {
            return res.status(404).json({ message: 'User with this email does not exist' });
        }

        const token = crypto.randomBytes(20).toString('hex');
        const expiresAt = new Date(Date.now() + 3600000); // 1 hour

        // Clean up old tokens
        await db.run('DELETE FROM password_resets WHERE email = ?', [email]);

        await db.run(
            'INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, ?)',
            [email, token, expiresAt.toISOString()]
        );

        const resetLink = `http://localhost:5173/reset-password?token=${token}`;

        const mailOptions = {
            from: 'your-school-portal@gmail.com',
            to: email,
            subject: 'Password Reset Request',
            text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n` +
                `Please click on the following link, or paste this into your browser to complete the process:\n\n` +
                `${resetLink}\n\n` +
                `If you did not request this, please ignore this email and your password will remain unchanged.\n`
        };

        // For demo purposes, we'll log the link
        console.log('Reset Link:', resetLink);

        try {
            await transporter.sendMail(mailOptions);
        } catch (mailError) {
            console.log("Email service not configured, check console for link");
        }

        res.json({ message: 'Recovery email sent' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;
    const db = getDb();
    try {
        const record = await db.get(
            'SELECT * FROM password_resets WHERE token = ? AND expires_at > ?',
            [token, new Date().toISOString()]
        );

        if (!record) {
            return res.status(400).json({ message: 'Password reset token is invalid or has expired' });
        }

        await db.run(
            'UPDATE users SET password = ? WHERE email = ?',
            [newPassword, record.email]
        );

        await db.run('DELETE FROM password_resets WHERE email = ?', [record.email]);

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/teachers', async (req, res) => {
    const { id, name, subject, classes, email, phone, salary, password } = req.body;
    const db = getDb();
    try {
        // Insert into users table
        await db.run(
            'INSERT INTO users (id, password, name, role, email) VALUES (?, ?, ?, ?, ?)',
            [id, password || 'password123', name, 'teacher', email]
        );

        // Insert into teachers table
        await db.run(
            'INSERT INTO teachers (id, subject, classes, salary, join_date) VALUES (?, ?, ?, ?, ?)',
            [id, subject, JSON.stringify(classes || []), salary, new Date().toISOString().split('T')[0]]
        );

        res.json({ message: 'Teacher created successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.put('/api/teachers/:id', async (req, res) => {
    const { name, subject, classes, email, phone, salary } = req.body;
    const db = getDb();
    try {
        // Update users table
        await db.run(
            'UPDATE users SET name = ?, email = ? WHERE id = ?',
            [name, email, req.params.id]
        );

        // Update teachers table
        await db.run(
            'UPDATE teachers SET subject = ?, classes = ?, salary = ? WHERE id = ?',
            [subject, JSON.stringify(classes || []), salary, req.params.id]
        );

        res.json({ message: 'Teacher updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.delete('/api/teachers/:id', async (req, res) => {
    const db = getDb();
    try {
        await db.run('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.json({ message: 'Teacher deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// --- Student Routes ---

app.get('/api/students', async (req, res) => {
    const db = getDb();
    try {
        const students = await db.all(`
            SELECT u.*, s.grade_level, s.attendance_percentage 
            FROM users u 
            JOIN students s ON u.id = s.id 
            WHERE u.role = 'student'
        `);
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/students/:id', async (req, res) => {
    const db = getDb();
    try {
        const student = await db.get(`
            SELECT u.*, s.grade_level, s.attendance_percentage 
            FROM users u 
            JOIN students s ON u.id = s.id 
            WHERE u.id = ?
        `, [req.params.id]);
        if (student) res.json(student);
        else res.status(404).json({ message: 'Student not found' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/students', async (req, res) => {
    const { id, name, gradeLevel, email, phone, password } = req.body;
    const db = getDb();
    try {
        // Insert into users table
        await db.run(
            'INSERT INTO users (id, password, name, role, email) VALUES (?, ?, ?, ?, ?)',
            [id, password || 'password123', name, 'student', email]
        );

        // Insert into students table
        await db.run(
            'INSERT INTO students (id, grade_level, attendance_percentage) VALUES (?, ?, ?)',
            [id, gradeLevel, 0]
        );

        res.json({ message: 'Student created successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.put('/api/students/:id', async (req, res) => {
    const { name, gradeLevel, email, phone } = req.body;
    const db = getDb();
    try {
        // Update users table
        await db.run(
            'UPDATE users SET name = ?, email = ? WHERE id = ?',
            [name, email, req.params.id]
        );

        // Update students table
        await db.run(
            'UPDATE students SET grade_level = ? WHERE id = ?',
            [gradeLevel, req.params.id]
        );

        res.json({ message: 'Student updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.delete('/api/students/:id', async (req, res) => {
    const db = getDb();
    try {
        await db.run('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.json({ message: 'Student deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// --- Teacher Routes ---

app.get('/api/teachers', async (req, res) => {
    const db = getDb();
    try {
        const teachers = await db.all(`
            SELECT u.*, t.subject, t.classes, t.salary, t.join_date 
            FROM users u 
            JOIN teachers t ON u.id = t.id 
            WHERE u.role = 'teacher'
        `);
        // Parse classes JSON
        const parsedTeachers = teachers.map(t => ({
            ...t,
            classes: JSON.parse(t.classes || '[]')
        }));
        res.json(parsedTeachers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// --- Notice Routes ---

app.get('/api/notices', async (req, res) => {
    const db = getDb();
    try {
        const notices = await db.all('SELECT * FROM notices ORDER BY date DESC');
        res.json(notices);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/notices', async (req, res) => {
    const { title, date, content, priority, audience } = req.body;
    const db = getDb();
    try {
        const result = await db.run(
            'INSERT INTO notices (title, date, content, priority, audience) VALUES (?, ?, ?, ?, ?)',
            [title, date, content, priority, audience]
        );
        res.json({ id: result.lastID, ...req.body });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// --- Test & Marks Routes ---

app.get('/api/tests', async (req, res) => {
    const db = getDb();
    try {
        const tests = await db.all('SELECT * FROM tests');
        // Fetch marks for each test
        for (let test of tests) {
            const marks = await db.all('SELECT student_id, marks_obtained FROM marks WHERE test_id = ?', [test.id]);
            test.marks = marks.reduce((acc, curr) => {
                acc[curr.student_id] = curr.marks_obtained;
                return acc;
            }, {});
        }
        res.json(tests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/tests', async (req, res) => {
    const { name, subject, date, totalMarks, section, teacherId, marks } = req.body;
    const db = getDb();

    try {
        const result = await db.run(
            'INSERT INTO tests (name, subject, date, total_marks, section, teacher_id) VALUES (?, ?, ?, ?, ?, ?)',
            [name, subject, date, totalMarks, section, teacherId]
        );
        const testId = result.lastID;

        // Insert marks
        if (marks) {
            for (const [studentId, score] of Object.entries(marks)) {
                await db.run(
                    'INSERT INTO marks (test_id, student_id, marks_obtained) VALUES (?, ?, ?)',
                    [testId, studentId, score]
                );
            }
        }

        res.json({ id: testId, message: 'Test created successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/marks/update', async (req, res) => {
    const { testId, marks } = req.body;
    const db = getDb();
    try {
        for (const [studentId, score] of Object.entries(marks)) {
            // Check if mark exists
            const existing = await db.get('SELECT id FROM marks WHERE test_id = ? AND student_id = ?', [testId, studentId]);
            if (existing) {
                await db.run('UPDATE marks SET marks_obtained = ? WHERE id = ?', [score, existing.id]);
            } else {
                await db.run('INSERT INTO marks (test_id, student_id, marks_obtained) VALUES (?, ?, ?)', [testId, studentId, score]);
            }
        }
        res.json({ message: 'Marks updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// --- Attendance Routes ---

app.get('/api/attendance', async (req, res) => {
    const db = getDb();
    try {
        const attendance = await db.all('SELECT * FROM attendance');
        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/attendance/:userId', async (req, res) => {
    const db = getDb();
    try {
        const attendance = await db.all('SELECT * FROM attendance WHERE user_id = ?', [req.params.userId]);
        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/attendance', async (req, res) => {
    const { userId, date, status, type } = req.body;
    const db = getDb();
    try {
        // Check if exists
        const existing = await db.get('SELECT id FROM attendance WHERE user_id = ? AND date = ?', [userId, date]);

        if (existing) {
            await db.run('UPDATE attendance SET status = ? WHERE id = ?', [status, existing.id]);
        } else {
            await db.run('INSERT INTO attendance (user_id, date, status, type) VALUES (?, ?, ?, ?)', [userId, date, status, type]);
        }
        res.json({ message: 'Attendance updated' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// --- Class Routes ---

app.get('/api/classes', async (req, res) => {
    const db = getDb();
    try {
        const classes = await db.all(`
            SELECT c.*, u.name as teacher_name 
            FROM classes c 
            LEFT JOIN users u ON c.class_teacher_id = u.id
        `);

        // Get student count for each class
        for (let cls of classes) {
            // Assuming grade_level matches "Name Section" or just "Name"
            // For better accuracy, we should link students to class ID, but for now we match string
            const className = `${cls.name}`; // Simplified matching
            const count = await db.get('SELECT count(*) as count FROM students WHERE grade_level LIKE ?', [`%${className}%`]);
            cls.student_count = count.count;
        }

        res.json(classes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/classes', async (req, res) => {
    const { name, section, classTeacherId, roomNumber, capacity } = req.body;
    const db = getDb();
    try {
        const result = await db.run(
            'INSERT INTO classes (name, section, class_teacher_id, room_number, capacity) VALUES (?, ?, ?, ?, ?)',
            [name, section, classTeacherId, roomNumber, capacity]
        );
        res.json({ id: result.lastID, message: 'Class created successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.delete('/api/classes/:id', async (req, res) => {
    const db = getDb();
    try {
        await db.run('DELETE FROM classes WHERE id = ?', [req.params.id]);
        res.json({ message: 'Class deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// For local development
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

// Export for Vercel serverless
module.exports = app;

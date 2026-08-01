const express = require('express');
const cors = require('cors');
const { initializeDatabase, getDb } = require('./database');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Initialize DB
initializeDatabase().then(() => {
    console.log('Database initialized');
}).catch(err => {
    console.error('Failed to initialize database:', err);
});

// Helper to save base64 string as a local file in public folder and return relative URL
function saveBase64File(base64String, folder, filenamePrefix) {
    if (!base64String || typeof base64String !== 'string' || !base64String.startsWith('data:')) {
        return base64String;
    }

    try {
        const commaIndex = base64String.indexOf(',');
        if (commaIndex === -1) return base64String;

        const metadata = base64String.substring(0, commaIndex);
        const base64Data = base64String.substring(commaIndex + 1);

        const mimeMatch = metadata.match(/data:([^;]+)/);
        if (!mimeMatch) return base64String;

        const mimeType = mimeMatch[1];
        
        // Determine extension
        let ext = 'png';
        if (mimeType.includes('jpeg') || mimeType.includes('jpg')) ext = 'jpg';
        else if (mimeType.includes('gif')) ext = 'gif';
        else if (mimeType.includes('webp')) ext = 'webp';
        else if (mimeType.includes('pdf')) ext = 'pdf';
        else if (mimeType.includes('msword')) ext = 'doc';
        else if (mimeType.includes('officedocument.wordprocessingml.document')) ext = 'docx';
        else {
            const parts = mimeType.split('/');
            if (parts.length === 2) ext = parts[1];
        }

        const filename = `${filenamePrefix}_${Date.now()}.${ext}`;
        const targetDir = path.join(__dirname, '../public', folder);
        
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        const filePath = path.join(targetDir, filename);
        fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
        
        return `/${folder}/${filename}`;
    } catch (error) {
        console.error('Failed to save base64 file:', error);
        return base64String;
    }
}

// ========================
// AUTH ROUTES
// ========================

app.post('/api/login', async (req, res) => {
    const { id, password } = req.body;
    const db = getDb();
    try {
        const lookupId = id?.toUpperCase() || id;
        // Fetch user by id only, then compare password manually
        let user = await db.get('SELECT id, name, email, phone, photo, role, created_at, password as pwd FROM users WHERE id = ?', [id]);
        if (!user) {
            user = await db.get('SELECT id, name, email, phone, photo, role, created_at, password as pwd FROM users WHERE id = ?', [lookupId]);
        }

        if (user && user.pwd === password) {
            let details = {};
            if (user.role === 'student') {
                details = await db.get('SELECT * FROM students WHERE id = ?', [user.id]) || {};
            } else if (user.role === 'teacher') {
                details = await db.get('SELECT * FROM teachers WHERE id = ?', [user.id]) || {};
                if (details.classes) details.classes = JSON.parse(details.classes);
            }
            const { pwd: _pwd, ...safeUser } = user;
            res.json({ ...safeUser, ...details });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ========================
// PASSWORD RESET
// ========================

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
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
        const expiresAt = new Date(Date.now() + 3600000);
        await db.run('DELETE FROM password_resets WHERE email = ?', [email]);
        await db.run('INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, ?)', [email, token, expiresAt.toISOString()]);
        const resetLink = `http://localhost:5173/reset-password?token=${token}`;
        console.log('Reset Link:', resetLink);
        try { await transporter.sendMail({ from: 'school-portal@gmail.com', to: email, subject: 'Password Reset', text: `Reset link: ${resetLink}` }); } catch (e) { }
        res.json({ message: 'Recovery email sent' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;
    const db = getDb();
    try {
        const record = await db.get('SELECT * FROM password_resets WHERE token = ? AND expires_at > ?', [token, new Date().toISOString()]);
        if (!record) return res.status(400).json({ message: 'Invalid or expired token' });
        await db.run('UPDATE users SET password = ? WHERE email = ?', [newPassword, record.email]);
        await db.run('DELETE FROM password_resets WHERE email = ?', [record.email]);
        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ========================
// USER PROFILE
// ========================

app.put('/api/users/:id', async (req, res) => {
    let { name, email, phone, photo } = req.body;
    const db = getDb();
    try {
        if (photo && photo.startsWith('data:')) {
            // Delete old photo file if it was local
            const oldUser = await db.get('SELECT photo FROM users WHERE id = ?', [req.params.id]);
            if (oldUser && oldUser.photo && oldUser.photo.startsWith('/avatars/')) {
                const oldPath = path.join(__dirname, '../public', oldUser.photo);
                if (fs.existsSync(oldPath)) {
                    try { fs.unlinkSync(oldPath); } catch (e) { }
                }
            }
            photo = saveBase64File(photo, 'avatars', req.params.id);
        }
        await db.run('UPDATE users SET name = ?, email = ?, phone = ?, photo = ? WHERE id = ?', [name, email, phone, photo, req.params.id]);
        res.json({ message: 'Profile updated' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.put('/api/users/:id/password', async (req, res) => {
    const { newPassword } = req.body;
    const db = getDb();
    try {
        await db.run('UPDATE users SET password = ? WHERE id = ?', [newPassword, req.params.id]);
        res.json({ message: 'Password changed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ========================
// STUDENTS
// ========================

app.get('/api/students', async (req, res) => {
    const db = getDb();
    try {
        const students = await db.all(`
            SELECT u.id, u.name, u.email, u.phone, u.photo, u.role, u.created_at,
                   s.grade_level, s.attendance_percentage, s.parent_name, s.parent_phone, s.address, s.dob, s.overtime_applicable, s.first_admission
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
            SELECT u.id, u.name, u.email, u.phone, u.photo, u.role, u.created_at,
                   s.grade_level, s.attendance_percentage, s.parent_name, s.parent_phone, s.address, s.dob, s.overtime_applicable, s.first_admission
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
    const { id, name, gradeLevel, email, phone, password, parentName, parentPhone, address, dob, firstAdmission } = req.body;
    const db = getDb();
    try {
        await db.run('INSERT INTO users (id, password, name, role, email, phone) VALUES (?, ?, ?, ?, ?, ?)',
            [id, password || 'password123', name, 'student', email, phone]);
        await db.run('INSERT INTO students (id, grade_level, attendance_percentage, parent_name, parent_phone, address, dob, overtime_applicable, first_admission) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)',
            [id, gradeLevel, 0, parentName, parentPhone, address, dob, firstAdmission !== undefined ? (firstAdmission ? 1 : 0) : 1]);
        await db.run('INSERT INTO fee_status (student_id, total, paid, pending) VALUES (?, ?, ?, ?)', [id, 5000, 0, 5000]);
        // Log
        await db.run('INSERT INTO logs (action, target_id, target_name, details) VALUES (?, ?, ?, ?)',
            ['ADD_STUDENT', id, name, `Student ${name} (ID: ${id}) enrolled in ${gradeLevel}`]);
        res.json({ message: 'Student created successfully', id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.put('/api/students/:id', async (req, res) => {
    let { name, gradeLevel, email, phone, photo, parentName, parentPhone, address, dob, overtimeApplicable, firstAdmission } = req.body;
    const db = getDb();
    try {
        if (photo && photo.startsWith('data:')) {
            // Delete old photo file if it was local
            const oldUser = await db.get('SELECT photo FROM users WHERE id = ?', [req.params.id]);
            if (oldUser && oldUser.photo && oldUser.photo.startsWith('/avatars/')) {
                const oldPath = path.join(__dirname, '../public', oldUser.photo);
                if (fs.existsSync(oldPath)) {
                    try { fs.unlinkSync(oldPath); } catch (e) { }
                }
            }
            photo = saveBase64File(photo, 'avatars', req.params.id);
        }
        await db.run('UPDATE users SET name = ?, email = ?, phone = ?, photo = ? WHERE id = ?', [name, email, phone, photo, req.params.id]);
        await db.run('UPDATE students SET grade_level = ?, parent_name = ?, parent_phone = ?, address = ?, dob = ?, overtime_applicable = ?, first_admission = ? WHERE id = ?',
            [gradeLevel, parentName, parentPhone, address, dob, overtimeApplicable ? 1 : 0, firstAdmission !== undefined ? (firstAdmission ? 1 : 0) : 1, req.params.id]);
        res.json({ message: 'Student updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.delete('/api/students/:id', async (req, res) => {
    const db = getDb();
    try {
        const student = await db.get('SELECT name FROM users WHERE id = ?', [req.params.id]);
        await db.run('DELETE FROM users WHERE id = ?', [req.params.id]);
        await db.run('INSERT INTO logs (action, target_id, target_name, details) VALUES (?, ?, ?, ?)',
            ['DELETE_STUDENT', req.params.id, student?.name, `Student removed from portal`]);
        res.json({ message: 'Student deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Migrate student ID
app.post('/api/students/migrate-id', async (req, res) => {
    const { oldId, newId, data } = req.body;
    const db = getDb();
    try {
        // Insert new user
        await db.run('INSERT INTO users (id, password, name, role, email, phone, photo) SELECT ?, password, name, role, email, phone, photo FROM users WHERE id = ?', [newId, oldId]);
        await db.run('INSERT INTO students (id, grade_level, attendance_percentage, parent_name, parent_phone) SELECT ?, grade_level, attendance_percentage, parent_name, parent_phone FROM students WHERE id = ?', [newId, oldId]);
        // Delete old
        await db.run('DELETE FROM users WHERE id = ?', [oldId]);
        res.json({ message: 'ID migrated', newId });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ========================
// TEACHERS
// ========================

app.get('/api/teachers', async (req, res) => {
    const db = getDb();
    try {
        const teachers = await db.all(`
            SELECT u.id, u.name, u.email, u.phone, u.photo, u.role, u.created_at,
                   t.subject, t.classes, t.salary, t.join_date, t.qualification
            FROM users u 
            JOIN teachers t ON u.id = t.id 
            WHERE u.role = 'teacher'
        `);
        const parsed = teachers.map(t => ({ ...t, classes: JSON.parse(t.classes || '[]') }));
        res.json(parsed);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/teachers/:id', async (req, res) => {
    const db = getDb();
    try {
        const teacher = await db.get(`
            SELECT u.id, u.name, u.email, u.phone, u.photo, u.role,
                   t.subject, t.classes, t.salary, t.join_date, t.qualification
            FROM users u 
            JOIN teachers t ON u.id = t.id 
            WHERE u.id = ?
        `, [req.params.id]);
        if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
        teacher.classes = JSON.parse(teacher.classes || '[]');
        res.json(teacher);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/teachers', async (req, res) => {
    const { id, name, subject, classes, email, phone, salary, password, qualification } = req.body;
    const db = getDb();
    try {
        await db.run('INSERT INTO users (id, password, name, role, email, phone) VALUES (?, ?, ?, ?, ?, ?)',
            [id, password || 'password123', name, 'teacher', email, phone]);
        await db.run('INSERT INTO teachers (id, subject, classes, salary, join_date, qualification) VALUES (?, ?, ?, ?, ?, ?)',
            [id, subject, JSON.stringify(classes || []), salary, new Date().toISOString().split('T')[0], qualification]);
        await db.run('INSERT INTO logs (action, target_id, target_name, details) VALUES (?, ?, ?, ?)',
            ['ADD_TEACHER', id, name, `Teacher ${name} joined for ${subject}`]);
        res.json({ message: 'Teacher created successfully', id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.put('/api/teachers/:id', async (req, res) => {
    let { name, subject, classes, email, phone, salary, photo, qualification } = req.body;
    const db = getDb();
    try {
        if (photo && photo.startsWith('data:')) {
            // Delete old photo file if it was local
            const oldUser = await db.get('SELECT photo FROM users WHERE id = ?', [req.params.id]);
            if (oldUser && oldUser.photo && oldUser.photo.startsWith('/avatars/')) {
                const oldPath = path.join(__dirname, '../public', oldUser.photo);
                if (fs.existsSync(oldPath)) {
                    try { fs.unlinkSync(oldPath); } catch (e) { }
                }
            }
            photo = saveBase64File(photo, 'avatars', req.params.id);
        }
        await db.run('UPDATE users SET name = ?, email = ?, phone = ?, photo = ? WHERE id = ?', [name, email, phone, photo, req.params.id]);
        await db.run('UPDATE teachers SET subject = ?, classes = ?, salary = ?, qualification = ? WHERE id = ?',
            [subject, JSON.stringify(classes || []), salary, qualification, req.params.id]);
        res.json({ message: 'Teacher updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.delete('/api/teachers/:id', async (req, res) => {
    const db = getDb();
    try {
        const teacher = await db.get('SELECT name FROM users WHERE id = ?', [req.params.id]);
        await db.run('DELETE FROM users WHERE id = ?', [req.params.id]);
        await db.run('INSERT INTO logs (action, target_id, target_name, details) VALUES (?, ?, ?, ?)',
            ['DELETE_TEACHER', req.params.id, teacher?.name, `Teacher removed from portal`]);
        res.json({ message: 'Teacher deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ========================
// ADMINS
// ========================

app.get('/api/admins', async (req, res) => {
    const db = getDb();
    try {
        const admins = await db.all(`SELECT id, name, email, phone, photo, role, created_at FROM users WHERE role IN ('admin', 'superadmin')`);
        res.json(admins);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/admins', async (req, res) => {
    const { id, name, email, phone, password } = req.body;
    const db = getDb();
    try {
        await db.run('INSERT INTO users (id, password, name, role, email, phone) VALUES (?, ?, ?, ?, ?, ?)',
            [id, password || 'admin123', name, 'admin', email, phone]);
        await db.run('INSERT INTO logs (action, target_id, target_name, details) VALUES (?, ?, ?, ?)',
            ['ADD_ADMIN', id, name, `New admin ${name} added`]);
        res.json({ message: 'Admin created', id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.delete('/api/admins/:id', async (req, res) => {
    const db = getDb();
    try {
        await db.run('DELETE FROM users WHERE id = ? AND role = ?', [req.params.id, 'admin']);
        res.json({ message: 'Admin deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ========================
// NOTICES
// ========================

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
    const { title, date, content, priority, audience, targetClass, type, authorId, authorName } = req.body;
    const db = getDb();
    try {
        const result = await db.run(
            'INSERT INTO notices (title, date, content, priority, audience, target_class, type, author_id, author_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [title, date, content, priority || 'Medium', audience || 'all', targetClass, type || 'global', authorId, authorName]
        );
        const notice = await db.get('SELECT * FROM notices WHERE id = ?', [result.lastID]);
        res.json(notice);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.put('/api/notices/:id', async (req, res) => {
    const { title, date, content, priority, audience, targetClass } = req.body;
    const db = getDb();
    try {
        await db.run('UPDATE notices SET title = ?, date = ?, content = ?, priority = ?, audience = ?, target_class = ?, updated_at = ? WHERE id = ?',
            [title, date, content, priority, audience, targetClass, new Date().toISOString(), req.params.id]);
        res.json({ message: 'Notice updated' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.delete('/api/notices/:id', async (req, res) => {
    const db = getDb();
    try {
        await db.run('DELETE FROM notices WHERE id = ?', [req.params.id]);
        res.json({ message: 'Notice deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ========================
// TESTS & MARKS
// ========================

app.get('/api/tests', async (req, res) => {
    const db = getDb();
    try {
        const tests = await db.all('SELECT * FROM tests ORDER BY date DESC');
        for (let test of tests) {
            const marks = await db.all('SELECT student_id, marks_obtained FROM marks WHERE test_id = ?', [test.id]);
            test.marks = marks.reduce((acc, curr) => { acc[curr.student_id] = curr.marks_obtained; return acc; }, {});
        }
        res.json(tests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/tests/:id', async (req, res) => {
    const db = getDb();
    try {
        const test = await db.get('SELECT * FROM tests WHERE id = ?', [req.params.id]);
        if (!test) return res.status(404).json({ message: 'Test not found' });
        const marks = await db.all('SELECT student_id, marks_obtained FROM marks WHERE test_id = ?', [test.id]);
        test.marks = marks.reduce((acc, curr) => { acc[curr.student_id] = curr.marks_obtained; return acc; }, {});
        res.json(test);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/tests', async (req, res) => {
    const { name, subject, date, totalMarks, section, className, teacherId, marks } = req.body;
    const db = getDb();
    try {
        const result = await db.run(
            'INSERT INTO tests (name, subject, date, total_marks, section, class_name, teacher_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, subject, date, totalMarks, section, className, teacherId]
        );
        const testId = result.lastID;
        if (marks) {
            for (const [studentId, score] of Object.entries(marks)) {
                await db.run('INSERT INTO marks (test_id, student_id, marks_obtained) VALUES (?, ?, ?)', [testId, studentId, score]);
            }
        }
        res.json({ id: testId, message: 'Test created' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.put('/api/tests/:id', async (req, res) => {
    const { name, subject, date, totalMarks, section, className, marks } = req.body;
    const db = getDb();
    try {
        await db.run('UPDATE tests SET name = ?, subject = ?, date = ?, total_marks = ?, section = ?, class_name = ? WHERE id = ?',
            [name, subject, date, totalMarks, section, className, req.params.id]);
        if (marks) {
            for (const [studentId, score] of Object.entries(marks)) {
                const existing = await db.get('SELECT id FROM marks WHERE test_id = ? AND student_id = ?', [req.params.id, studentId]);
                if (existing) {
                    await db.run('UPDATE marks SET marks_obtained = ? WHERE id = ?', [score, existing.id]);
                } else {
                    await db.run('INSERT INTO marks (test_id, student_id, marks_obtained) VALUES (?, ?, ?)', [req.params.id, studentId, score]);
                }
            }
        }
        res.json({ message: 'Test updated' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.delete('/api/tests/:id', async (req, res) => {
    const db = getDb();
    try {
        await db.run('DELETE FROM tests WHERE id = ?', [req.params.id]);
        res.json({ message: 'Test deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/marks/update', async (req, res) => {
    const { testId, marks } = req.body;
    const db = getDb();
    try {
        for (const [studentId, score] of Object.entries(marks)) {
            const existing = await db.get('SELECT id FROM marks WHERE test_id = ? AND student_id = ?', [testId, studentId]);
            if (existing) {
                await db.run('UPDATE marks SET marks_obtained = ? WHERE id = ?', [score, existing.id]);
            } else {
                await db.run('INSERT INTO marks (test_id, student_id, marks_obtained) VALUES (?, ?, ?)', [testId, studentId, score]);
            }
        }
        res.json({ message: 'Marks updated' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ========================
// ATTENDANCE
// ========================

app.get('/api/attendance', async (req, res) => {
    const db = getDb();
    try {
        const attendance = await db.all('SELECT * FROM attendance ORDER BY date DESC');
        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/attendance/:userId', async (req, res) => {
    const db = getDb();
    try {
        const attendance = await db.all('SELECT * FROM attendance WHERE user_id = ? ORDER BY date DESC', [req.params.userId]);
        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/attendance', async (req, res) => {
    const { userId, date, status, type } = req.body;
    const db = getDb();
    try {
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

// ========================
// CLASSES
// ========================

app.get('/api/classes', async (req, res) => {
    const db = getDb();
    try {
        const classes = await db.all(`
            SELECT c.*, u.name as teacher_name 
            FROM classes c 
            LEFT JOIN users u ON c.class_teacher_id = u.id
        `);
        for (let cls of classes) {
            const count = await db.get('SELECT count(*) as count FROM students WHERE grade_level LIKE ?', [`%${cls.name}%`]);
            cls.student_count = count.count;
        }
        res.json(classes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/classes', async (req, res) => {
    const {
        name, section, classTeacherId, roomNumber, capacity,
        monthlyFee, annualDues, overtimeCharges, otherCharges,
        admissionFee, admissionFeeEnabled,
        annualFeeEnabled,
        tuitionFeeEnabled,
        overtimeFeeEnabled,
        labFee, labFeeEnabled,
        securityCharges, securityChargesEnabled,
        sportsFee, sportsFeeEnabled,
        otherChargesEnabled
    } = req.body;
    const db = getDb();
    try {
        const result = await db.run(
            `INSERT INTO classes (
                name, section, class_teacher_id, room_number, capacity,
                monthly_fee, annual_dues, overtime_charges, other_charges,
                admission_fee, admission_fee_enabled,
                annual_fee, annual_fee_enabled,
                tuition_fee, tuition_fee_enabled,
                overtime_fee, overtime_fee_enabled,
                lab_fee, lab_fee_enabled,
                security_charges, security_charges_enabled,
                sports_fee, sports_fee_enabled,
                other_charges_enabled
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                name, section, classTeacherId, roomNumber, capacity,
                monthlyFee || 0, annualDues || 0, overtimeCharges || 0, otherCharges || 0,
                admissionFee || 0, admissionFeeEnabled !== undefined ? (admissionFeeEnabled ? 1 : 0) : 1,
                annualDues || 0, annualFeeEnabled !== undefined ? (annualFeeEnabled ? 1 : 0) : 1,
                monthlyFee || 0, tuitionFeeEnabled !== undefined ? (tuitionFeeEnabled ? 1 : 0) : 1,
                overtimeCharges || 0, overtimeFeeEnabled !== undefined ? (overtimeFeeEnabled ? 1 : 0) : 0,
                labFee || 0, labFeeEnabled !== undefined ? (labFeeEnabled ? 1 : 0) : 1,
                securityCharges || 0, securityChargesEnabled !== undefined ? (securityChargesEnabled ? 1 : 0) : 1,
                sportsFee || 0, sportsFeeEnabled !== undefined ? (sportsFeeEnabled ? 1 : 0) : 0,
                otherChargesEnabled !== undefined ? (otherChargesEnabled ? 1 : 0) : 1
            ]
        );
        res.json({ id: result.lastID, message: 'Class created' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.put('/api/classes/:id', async (req, res) => {
    const {
        name, section, classTeacherId, roomNumber, capacity,
        monthlyFee, annualDues, overtimeCharges, otherCharges,
        admissionFee, admissionFeeEnabled,
        annualFeeEnabled,
        tuitionFeeEnabled,
        overtimeFeeEnabled,
        labFee, labFeeEnabled,
        securityCharges, securityChargesEnabled,
        sportsFee, sportsFeeEnabled,
        otherChargesEnabled
    } = req.body;
    const db = getDb();
    try {
        await db.run(
            `UPDATE classes SET 
                name = ?, section = ?, class_teacher_id = ?, room_number = ?, capacity = ?,
                monthly_fee = ?, annual_dues = ?, overtime_charges = ?, other_charges = ?,
                admission_fee = ?, admission_fee_enabled = ?,
                annual_fee = ?, annual_fee_enabled = ?,
                tuition_fee = ?, tuition_fee_enabled = ?,
                overtime_fee = ?, overtime_fee_enabled = ?,
                lab_fee = ?, lab_fee_enabled = ?,
                security_charges = ?, security_charges_enabled = ?,
                sports_fee = ?, sports_fee_enabled = ?,
                other_charges_enabled = ?
            WHERE id = ?`,
            [
                name, section, classTeacherId, roomNumber, capacity,
                monthlyFee || 0, annualDues || 0, overtimeCharges || 0, otherCharges || 0,
                admissionFee || 0, admissionFeeEnabled !== undefined ? (admissionFeeEnabled ? 1 : 0) : 1,
                annualDues || 0, annualFeeEnabled !== undefined ? (annualFeeEnabled ? 1 : 0) : 1,
                monthlyFee || 0, tuitionFeeEnabled !== undefined ? (tuitionFeeEnabled ? 1 : 0) : 1,
                overtimeCharges || 0, overtimeFeeEnabled !== undefined ? (overtimeFeeEnabled ? 1 : 0) : 0,
                labFee || 0, labFeeEnabled !== undefined ? (labFeeEnabled ? 1 : 0) : 1,
                securityCharges || 0, securityChargesEnabled !== undefined ? (securityChargesEnabled ? 1 : 0) : 1,
                sportsFee || 0, sportsFeeEnabled !== undefined ? (sportsFeeEnabled ? 1 : 0) : 0,
                otherChargesEnabled !== undefined ? (otherChargesEnabled ? 1 : 0) : 1,
                req.params.id
            ]
        );
        res.json({ message: 'Class updated' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.delete('/api/classes/:id', async (req, res) => {
    const db = getDb();
    try {
        await db.run('DELETE FROM classes WHERE id = ?', [req.params.id]);
        res.json({ message: 'Class deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ========================
// FEES
// ========================

app.get('/api/fees/reports', async (req, res) => {
    const db = getDb();
    try {
        const summary = await db.get('SELECT SUM(total) as grandTotal, SUM(paid) as grandPaid, SUM(pending) as grandPending FROM fee_status');
        const classWise = await db.all(`
            SELECT s.grade_level as className, SUM(fs.total) as total, SUM(fs.paid) as paid, SUM(fs.pending) as pending
            FROM students s
            JOIN fee_status fs ON s.id = fs.student_id
            GROUP BY s.grade_level
        `);
        res.json({ summary, classWise });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/fees/:studentId', async (req, res) => {
    const db = getDb();
    try {
        const summary = await db.get('SELECT * FROM fee_status WHERE student_id = ?', [req.params.studentId]);
        const history = await db.all('SELECT * FROM payments WHERE student_id = ? ORDER BY date DESC', [req.params.studentId]);
        const invoices = await db.all('SELECT * FROM student_fees WHERE student_id = ? ORDER BY updated_at DESC', [req.params.studentId]);
        res.json({ ...(summary || { total: 0, paid: 0, pending: 0 }), history, invoices });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/fees/:studentId/record/:month', async (req, res) => {
    const db = getDb();
    try {
        const id = `${req.params.studentId}_${req.params.month}`;
        const record = await db.get('SELECT * FROM student_fees WHERE id = ?', [id]);
        res.json(record || null);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/fees/:studentId/record/:month', async (req, res) => {
    let { status, amount, proofUrl } = req.body;
    const db = getDb();
    try {
        const id = `${req.params.studentId}_${req.params.month}`;
        if (proofUrl && proofUrl.startsWith('data:')) {
            // Delete old proof if exists and local
            const oldFee = await db.get('SELECT proof_url FROM student_fees WHERE id = ?', [id]);
            if (oldFee && oldFee.proof_url && oldFee.proof_url.startsWith('/fees/')) {
                const oldPath = path.join(__dirname, '../public', oldFee.proof_url);
                if (fs.existsSync(oldPath)) {
                    try { fs.unlinkSync(oldPath); } catch (e) { }
                }
            }
            proofUrl = saveBase64File(proofUrl, 'fees', `proof_${id}`);
        }
        await db.run(`
            INSERT INTO student_fees (id, student_id, month, status, amount, proof_url, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
            ON CONFLICT(id) DO UPDATE SET status=excluded.status, amount=excluded.amount, proof_url=excluded.proof_url, updated_at=excluded.updated_at
        `, [id, req.params.studentId, req.params.month, status, amount, proofUrl]);
        res.json({ message: 'Fee record updated' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/fees', async (req, res) => {
    const db = getDb();
    try {
        const fees = await db.all(`
            SELECT u.id, u.name, u.email, s.grade_level, fs.total, fs.paid, fs.pending
            FROM users u
            JOIN students s ON u.id = s.id
            LEFT JOIN fee_status fs ON u.id = fs.student_id
            WHERE u.role = 'student'
        `);
        res.json(fees);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/payments', async (req, res) => {
    const { studentId, amount, date, method, description, receiptNo, transactionId, status, studentFeeId } = req.body;
    const db = getDb();
    try {
        const result = await db.run('INSERT INTO payments (student_id, amount, date, method, description, receipt_no, transaction_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [studentId, amount, date, method, description, receiptNo, transactionId, status || 'success']);
        
        if (status !== 'failed') {
            // Update fee_status
            await db.run('UPDATE fee_status SET paid = paid + ?, pending = pending - ? WHERE student_id = ?', [amount, amount, studentId]);
            
            // Mark the specific challan as paid if provided
            if (studentFeeId) {
                await db.run('UPDATE student_fees SET status = "paid", transaction_id = ? WHERE id = ?', [transactionId, studentFeeId]);
            }
        }
        res.json({ id: result.lastID, message: 'Payment recorded' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Generate Monthly Fees
app.post('/api/fees/generate-monthly', async (req, res) => {
    const { month, dueDate, forceIncludeAdmission, forceIncludeAnnual } = req.body;
    const db = getDb();
    try {
        const classes = await db.all('SELECT * FROM classes');
        const students = await db.all('SELECT * FROM students');
        const isJanuary = month && month.endsWith('-01');
        
        for (let student of students) {
            const cls = classes.find(c => student.grade_level === c.name || student.grade_level?.includes(c.name));
            if (!cls) continue;
            
            // 1. Determine active fees and amounts
            const isNew = student.first_admission === 1;
            
            const tuitionActive = cls.tuition_fee_enabled !== 0;
            const tuitionVal = tuitionActive ? (cls.monthly_fee || cls.tuition_fee || 0) : 0;
            
            const overtimeActive = cls.overtime_fee_enabled === 1 && student.overtime_applicable === 1;
            const overtimeVal = overtimeActive ? (cls.overtime_charges || cls.overtime_fee || 0) : 0;
            
            const labActive = cls.lab_fee_enabled !== 0;
            const labVal = labActive ? (cls.lab_fee || 0) : 0;
            
            const securityActive = cls.security_charges_enabled !== 0;
            const securityVal = securityActive ? (cls.security_charges || 0) : 0;
            
            const sportsActive = cls.sports_fee_enabled === 1;
            const sportsVal = sportsActive ? (cls.sports_fee || 0) : 0;
            
            const otherActive = cls.other_charges_enabled !== 0;
            const otherVal = otherActive ? (cls.other_charges || 0) : 0;
            
            // Admission Fee rules:
            // Included if student is new and it is enabled, OR if admin forced it.
            const admissionActive = (isNew && cls.admission_fee_enabled !== 0) || forceIncludeAdmission;
            const admissionVal = admissionActive ? (cls.admission_fee || 0) : 0;
            
            // Annual Fee rules:
            // Included if student is new and it is enabled, OR if month is January, OR if admin forced it.
            const annualActive = (isNew && cls.annual_fee_enabled !== 0) || isJanuary || forceIncludeAnnual;
            const annualVal = annualActive ? (cls.annual_dues || cls.annual_fee || 0) : 0;
            
            const amount = tuitionVal + overtimeVal + labVal + securityVal + sportsVal + otherVal + admissionVal + annualVal;
            if (amount <= 0) continue;
            
            // 2. Fetch current arrears (pending dues)
            const feeStatus = await db.get('SELECT pending FROM fee_status WHERE student_id = ?', [student.id]);
            const arrearsVal = feeStatus ? feeStatus.pending : 0;
            
            const feeId = `${student.id}_${month}_monthly`;
            
            await db.run(`
                INSERT INTO student_fees (
                    id, student_id, month, status, amount, fee_type, due_date,
                    admission_fee, annual_fee, tuition_fee, overtime_fee, lab_fee,
                    security_charges, sports_fee, other_charges, arrears
                ) 
                VALUES (?, ?, ?, 'pending', ?, 'monthly', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO NOTHING
            `, [
                feeId, student.id, month, amount, dueDate,
                admissionVal, annualVal, tuitionVal, overtimeVal, labVal,
                securityVal, sportsVal, otherVal, arrearsVal
            ]);
            
            // Update fee_status sum
            const existingStatus = await db.get('SELECT student_id FROM fee_status WHERE student_id = ?', [student.id]);
            if (existingStatus) {
                await db.run('UPDATE fee_status SET total = total + ?, pending = pending + ? WHERE student_id = ?', [amount, amount, student.id]);
            } else {
                await db.run('INSERT INTO fee_status (student_id, total, paid, pending) VALUES (?, ?, 0, ?)', [student.id, amount, amount]);
            }
            
            // 3. Mark student as no longer new
            if (isNew) {
                await db.run('UPDATE students SET first_admission = 0 WHERE id = ?', [student.id]);
            }
        }
        res.json({ message: 'Monthly fees generated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Generate Annual Dues
app.post('/api/fees/generate-annual', async (req, res) => {
    const { year, dueDate } = req.body;
    const db = getDb();
    try {
        const classes = await db.all('SELECT * FROM classes');
        const students = await db.all('SELECT * FROM students');
        
        for (let student of students) {
            const cls = classes.find(c => student.grade_level === c.name || student.grade_level?.includes(c.name));
            if (!cls || !cls.annual_dues) continue;
            
            let amount = cls.annual_dues;
            
            const feeStatus = await db.get('SELECT pending FROM fee_status WHERE student_id = ?', [student.id]);
            const arrearsVal = feeStatus ? feeStatus.pending : 0;
            
            const feeId = `${student.id}_${year}_annual`;
            
            await db.run(`
                INSERT INTO student_fees (
                    id, student_id, month, status, amount, fee_type, due_date,
                    admission_fee, annual_fee, tuition_fee, overtime_fee, lab_fee,
                    security_charges, sports_fee, other_charges, arrears
                ) 
                VALUES (?, ?, ?, 'pending', ?, 'annual', ?, 0, ?, 0, 0, 0, 0, 0, 0, ?)
                ON CONFLICT(id) DO NOTHING
            `, [feeId, student.id, year, amount, dueDate, amount, arrearsVal]);
            
            // Update fee_status sum
            const existingStatus = await db.get('SELECT student_id FROM fee_status WHERE student_id = ?', [student.id]);
            if (existingStatus) {
                await db.run('UPDATE fee_status SET total = total + ?, pending = pending + ? WHERE student_id = ?', [amount, amount, student.id]);
            } else {
                await db.run('INSERT INTO fee_status (student_id, total, paid, pending) VALUES (?, ?, 0, ?)', [student.id, amount, amount]);
            }
        }
        res.json({ message: 'Annual dues generated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ========================
// TIMETABLE
// ========================

app.get('/api/timetable/:gradeLevel', async (req, res) => {
    const db = getDb();
    try {
        const tt = await db.get('SELECT * FROM timetables WHERE grade_level = ?', [req.params.gradeLevel]);
        if (tt) {
            res.json({ ...tt, data: JSON.parse(tt.data) });
        } else {
            res.json(null);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/timetable/:gradeLevel', async (req, res) => {
    const db = getDb();
    try {
        const data = JSON.stringify(req.body);
        await db.run(`
            INSERT INTO timetables (id, grade_level, data, updated_at) VALUES (?, ?, ?, datetime('now'))
            ON CONFLICT(grade_level) DO UPDATE SET data=excluded.data, updated_at=excluded.updated_at
        `, [req.params.gradeLevel, req.params.gradeLevel, data]);
        res.json({ message: 'Timetable saved' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ========================
// MESSAGES
// ========================

app.get('/api/messages/:userId', async (req, res) => {
    const db = getDb();
    try {
        const msgs = await db.all('SELECT * FROM messages WHERE to_id = ? ORDER BY timestamp DESC', [req.params.userId]);
        res.json(msgs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/messages', async (req, res) => {
    const { fromId, fromName, toId, subject, message, role, date, time } = req.body;
    const db = getDb();
    try {
        const result = await db.run('INSERT INTO messages (from_id, from_name, to_id, subject, message, role, date, time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [fromId, fromName, toId, subject, message, role, date, time]);
        res.json({ id: result.lastID, message: 'Sent' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ========================
// ASSIGNMENTS
// ========================

app.get('/api/assignments', async (req, res) => {
    const db = getDb();
    const { className, teacherId } = req.query;
    try {
        let query = 'SELECT * FROM assignments';
        const params = [];
        const conditions = [];
        if (className) { conditions.push('class_name = ?'); params.push(className); }
        if (teacherId) { conditions.push('teacher_id = ?'); params.push(teacherId); }
        if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
        query += ' ORDER BY created_at DESC';
        const assignments = await db.all(query, params);
        res.json(assignments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/assignments', async (req, res) => {
    let { title, subject, className, dueDate, message, fileUrl, teacherId } = req.body;
    const db = getDb();
    try {
        if (fileUrl && fileUrl.startsWith('data:')) {
            fileUrl = saveBase64File(fileUrl, 'assignments', `asgn_${className}`);
        }
        const result = await db.run('INSERT INTO assignments (title, subject, class_name, due_date, message, file_url, teacher_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [title, subject, className, dueDate, message, fileUrl, teacherId]);
        res.json({ id: result.lastID, message: 'Assignment created' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.delete('/api/assignments/:id', async (req, res) => {
    const db = getDb();
    try {
        const asgn = await db.get('SELECT file_url FROM assignments WHERE id = ?', [req.params.id]);
        if (asgn && asgn.file_url && asgn.file_url.startsWith('/assignments/')) {
            const filePath = path.join(__dirname, '../public', asgn.file_url);
            if (fs.existsSync(filePath)) {
                try { fs.unlinkSync(filePath); } catch (e) { }
            }
        }
        await db.run('DELETE FROM assignments WHERE id = ?', [req.params.id]);
        res.json({ message: 'Assignment deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ========================
// GALLERY
// ========================

app.get('/api/gallery', async (req, res) => {
    const db = getDb();
    try {
        const items = await db.all('SELECT * FROM gallery ORDER BY created_at DESC');
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/gallery', async (req, res) => {
    let { title, imageUrl } = req.body;
    const db = getDb();
    try {
        if (imageUrl && imageUrl.startsWith('data:')) {
            imageUrl = saveBase64File(imageUrl, 'gallery', 'gallery');
        }
        const result = await db.run('INSERT INTO gallery (title, image_url) VALUES (?, ?)', [title, imageUrl]);
        const item = await db.get('SELECT * FROM gallery WHERE id = ?', [result.lastID]);
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.delete('/api/gallery/:id', async (req, res) => {
    const db = getDb();
    try {
        const item = await db.get('SELECT image_url FROM gallery WHERE id = ?', [req.params.id]);
        if (item && item.image_url && item.image_url.startsWith('/gallery/')) {
            const filePath = path.join(__dirname, '../public', item.image_url);
            if (fs.existsSync(filePath)) {
                try { fs.unlinkSync(filePath); } catch (e) { }
            }
        }
        await db.run('DELETE FROM gallery WHERE id = ?', [req.params.id]);
        res.json({ message: 'Deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ========================
// AUDIT LOGS
// ========================

app.get('/api/logs', async (req, res) => {
    const db = getDb();
    try {
        const logs = await db.all('SELECT * FROM logs ORDER BY timestamp DESC');
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/logs', async (req, res) => {
    const { action, targetId, targetName, details } = req.body;
    const db = getDb();
    try {
        const result = await db.run('INSERT INTO logs (action, target_id, target_name, details) VALUES (?, ?, ?, ?)',
            [action, targetId, targetName, details]);
        res.json({ id: result.lastID });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.delete('/api/logs/:id', async (req, res) => {
    const db = getDb();
    try {
        await db.run('DELETE FROM logs WHERE id = ?', [req.params.id]);
        res.json({ message: 'Log deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Check email exists
app.get('/api/check-email', async (req, res) => {
    const { email, excludeId } = req.query;
    const db = getDb();
    try {
        let user;
        if (excludeId) {
            user = await db.get('SELECT id FROM users WHERE email = ? AND id != ?', [email, excludeId]);
        } else {
            user = await db.get('SELECT id FROM users WHERE email = ?', [email]);
        }
        res.json({ exists: !!user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ========================
// SERVER START
// ========================
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;

const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

let db;

async function initializeDatabase() {
    db = await open({
        filename: path.join(__dirname, 'school.db'),
        driver: sqlite3.Database
    });

    // Enable foreign keys
    await db.exec('PRAGMA foreign_keys = ON');

    // Create Users Table (Base table for Auth)
    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            password TEXT NOT NULL,
            name TEXT NOT NULL,
            role TEXT NOT NULL CHECK(role IN ('admin', 'teacher', 'student')),
            email TEXT,
            photo TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Create Students Table (Extra details)
    await db.exec(`
        CREATE TABLE IF NOT EXISTS students (
            id TEXT PRIMARY KEY,
            grade_level TEXT,
            attendance_percentage REAL,
            FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    // Create Teachers Table (Extra details)
    await db.exec(`
        CREATE TABLE IF NOT EXISTS teachers (
            id TEXT PRIMARY KEY,
            subject TEXT,
            classes TEXT, -- JSON string of classes
            salary INTEGER,
            join_date DATE,
            FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    // Create Notices Table
    await db.exec(`
        CREATE TABLE IF NOT EXISTS notices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            date DATE NOT NULL,
            content TEXT NOT NULL,
            priority TEXT CHECK(priority IN ('High', 'Medium', 'Low')),
            audience TEXT CHECK(audience IN ('all', 'student', 'teacher'))
        )
    `);

    // Create Tests Table
    await db.exec(`
        CREATE TABLE IF NOT EXISTS tests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            subject TEXT NOT NULL,
            date DATE NOT NULL,
            total_marks INTEGER NOT NULL,
            section TEXT,
            class_name TEXT,
            teacher_id TEXT,
            FOREIGN KEY (teacher_id) REFERENCES users(id)
        )
    `);

    // Create Marks Table
    await db.exec(`
        CREATE TABLE IF NOT EXISTS marks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            test_id INTEGER,
            student_id TEXT,
            marks_obtained INTEGER,
            FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE,
            FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    // Create Attendance Table (For Teachers and Students)
    await db.exec(`
        CREATE TABLE IF NOT EXISTS attendance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            date DATE NOT NULL,
            status TEXT CHECK(status IN ('present', 'absent')),
            type TEXT CHECK(type IN ('student', 'teacher')),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    // Create Classes Table
    await db.exec(`
        CREATE TABLE IF NOT EXISTS classes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL, -- e.g. "Class 10"
            section TEXT NOT NULL, -- e.g. "A"
            class_teacher_id TEXT,
            room_number TEXT,
            capacity INTEGER DEFAULT 40,
            FOREIGN KEY (class_teacher_id) REFERENCES users(id)
        )
    `);

    // Seed Data if empty
    const userCount = await db.get('SELECT count(*) as count FROM users');
    if (userCount.count === 0) {
        console.log('Seeding database...');

        // Admin
        await db.run(`INSERT INTO users (id, password, name, role, email) VALUES ('ADM001', 'admin123', 'Principal Anderson', 'admin', 'admin@school.com')`);

        // Teacher
        await db.run(`INSERT INTO users (id, password, name, role, email, photo) VALUES ('TCH001', 'password123', 'Sarah Wilson', 'teacher', 'sarah.wilson@school.com', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80')`);
        await db.run(`INSERT INTO teachers (id, subject, classes, salary, join_date) VALUES ('TCH001', 'Mathematics', '["Class 10-A", "Class 9-B"]', 5000, '2020-01-15')`);

        // Student
        await db.run(`INSERT INTO users (id, password, name, role, email, photo) VALUES ('STU001', 'password123', 'Alex Johnson', 'student', 'alex.j@school.com', 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80')`);
        await db.run(`INSERT INTO students (id, grade_level, attendance_percentage) VALUES ('STU001', 'Class 10', 85.5)`);

        // Notices
        await db.run(`INSERT INTO notices (title, date, content, priority, audience) VALUES ('Annual Sports Day', '2024-03-15', 'The annual sports day will be held on March 20th. All students must participate.', 'High', 'all')`);
        await db.run(`INSERT INTO notices (title, date, content, priority, audience) VALUES ('Mid-Term Exams', '2024-04-10', 'Mid-term examinations start from April 15th. Schedule attached.', 'High', 'student')`);

        console.log('Database seeded successfully.');
    }
}

function getDb() {
    if (!db) {
        throw new Error('Database not initialized. Call initializeDatabase first.');
    }
    return db;
}

module.exports = { initializeDatabase, getDb };

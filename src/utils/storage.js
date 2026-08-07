import { students as initialStudents } from '../data/students';

const STORAGE_KEY_STUDENTS = 'school_portal_students';
const STORAGE_KEY_TEACHERS = 'school_portal_teachers';
const STORAGE_KEY_ADMINS = 'school_portal_admins';
const STORAGE_KEY_NOTICES = 'school_portal_notices';

// Mock Admin Data
const initialAdmins = [
    {
        id: 'ADM001',
        password: 'admin123',
        name: 'Principal John Smith',
        role: 'admin',
        email: 'admin@school.com',
        phone: '+1234567890'
    }
];

// Mock Teacher Data
const initialTeachers = [
    {
        id: 'TCH001',
        password: 'password123',
        name: 'Mr. Anderson',
        role: 'teacher',
        subject: 'Mathematics',
        classes: ['10th Grade', '11th Grade'],
        email: 'anderson@school.com',
        phone: '+1234567891',
        salary: 5000,
        joinDate: '2020-01-15'
    },
    {
        id: 'TCH002',
        password: 'password123',
        name: 'Ms. Roberts',
        role: 'teacher',
        subject: 'Science',
        classes: ['9th Grade', '10th Grade'],
        email: 'roberts@school.com',
        phone: '+1234567892',
        salary: 4800,
        joinDate: '2021-03-20'
    }
];

// Mock Notices
const initialNotices = [
    {
        id: 1,
        title: 'Fee Deadline Approaching',
        content: 'Please note that fee submission deadline is May 30, 2025. Late fees will apply after this date.',
        date: '2024-12-01',
        priority: 'high',
        createdBy: 'ADM001'
    },
    {
        id: 2,
        title: 'Attendance Policy',
        content: 'All students are required to maintain a minimum of 80% attendance to be eligible for final exams.',
        date: '2024-11-28',
        priority: 'medium',
        createdBy: 'ADM001'
    }
];

export const storage = {
    initialize: () => {
        if (!localStorage.getItem(STORAGE_KEY_STUDENTS)) {
            localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(initialStudents));
        }
        if (!localStorage.getItem(STORAGE_KEY_TEACHERS)) {
            localStorage.setItem(STORAGE_KEY_TEACHERS, JSON.stringify(initialTeachers));
        }
        if (!localStorage.getItem(STORAGE_KEY_ADMINS)) {
            localStorage.setItem(STORAGE_KEY_ADMINS, JSON.stringify(initialAdmins));
        }
        if (!localStorage.getItem(STORAGE_KEY_NOTICES)) {
            localStorage.setItem(STORAGE_KEY_NOTICES, JSON.stringify(initialNotices));
        }
    },

    // Students
    getStudents: () => {
        const data = localStorage.getItem(STORAGE_KEY_STUDENTS);
        return data ? JSON.parse(data) : [];
    },

    getStudent: (id) => {
        const students = storage.getStudents();
        return students.find(s => s.id === id);
    },

    updateStudent: (updatedStudent) => {
        const students = storage.getStudents();
        const index = students.findIndex(s => s.id === updatedStudent.id);
        if (index !== -1) {
            students[index] = updatedStudent;
            localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
            return true;
        }
        return false;
    },

    addStudent: (student) => {
        const students = storage.getStudents();
        students.push(student);
        localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
        return true;
    },

    deleteStudent: (id) => {
        const students = storage.getStudents();
        const filtered = students.filter(s => s.id !== id);
        localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(filtered));
        return true;
    },

    // Teachers
    getTeachers: () => {
        const data = localStorage.getItem(STORAGE_KEY_TEACHERS);
        return data ? JSON.parse(data) : [];
    },

    getTeacher: (id) => {
        const teachers = storage.getTeachers();
        return teachers.find(t => t.id === id);
    },

    updateTeacher: (updatedTeacher) => {
        const teachers = storage.getTeachers();
        const index = teachers.findIndex(t => t.id === updatedTeacher.id);
        if (index !== -1) {
            teachers[index] = updatedTeacher;
            localStorage.setItem(STORAGE_KEY_TEACHERS, JSON.stringify(teachers));
            return true;
        }
        return false;
    },

    addTeacher: (teacher) => {
        const teachers = storage.getTeachers();
        teachers.push(teacher);
        localStorage.setItem(STORAGE_KEY_TEACHERS, JSON.stringify(teachers));
        return true;
    },

    deleteTeacher: (id) => {
        const teachers = storage.getTeachers();
        const filtered = teachers.filter(t => t.id !== id);
        localStorage.setItem(STORAGE_KEY_TEACHERS, JSON.stringify(filtered));
        return true;
    },

    // Admins
    getAdmins: () => {
        const data = localStorage.getItem(STORAGE_KEY_ADMINS);
        return data ? JSON.parse(data) : [];
    },

    getAdmin: (id) => {
        const admins = storage.getAdmins();
        return admins.find(a => a.id === id);
    },

    // Notices
    getNotices: () => {
        const data = localStorage.getItem(STORAGE_KEY_NOTICES);
        return data ? JSON.parse(data) : [];
    },

    addNotice: (notice) => {
        const notices = storage.getNotices();
        const newNotice = {
            ...notice,
            id: Date.now(),
            date: new Date().toISOString().split('T')[0]
        };
        notices.unshift(newNotice);
        localStorage.setItem(STORAGE_KEY_NOTICES, JSON.stringify(notices));
        return newNotice;
    },

    deleteNotice: (id) => {
        const notices = storage.getNotices();
        const filtered = notices.filter(n => n.id !== id);
        localStorage.setItem(STORAGE_KEY_NOTICES, JSON.stringify(filtered));
        return true;
    },

    // Helper to get students by class (for teacher view)
    getStudentsByClass: (gradeLevel) => {
        const students = storage.getStudents();
        return students.filter(s => s.gradeLevel === gradeLevel);
    }
};

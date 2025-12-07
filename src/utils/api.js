const API_URL = 'http://localhost:5000/api';

export const api = {
    // Auth
    login: async (id, password) => {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, password })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Login failed');
        }
        return response.json();
    },

    // Students
    getStudents: async () => {
        const response = await fetch(`${API_URL}/students`);
        return response.json();
    },

    getStudent: async (id) => {
        const response = await fetch(`${API_URL}/students/${id}`);
        return response.json();
    },

    addStudent: async (studentData) => {
        const response = await fetch(`${API_URL}/students`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(studentData)
        });
        return response.json();
    },

    updateStudent: async (id, studentData) => {
        const response = await fetch(`${API_URL}/students/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(studentData)
        });
        return response.json();
    },

    deleteStudent: async (id) => {
        const response = await fetch(`${API_URL}/students/${id}`, {
            method: 'DELETE'
        });
        return response.json();
    },

    // Teachers
    getTeachers: async () => {
        const response = await fetch(`${API_URL}/teachers`);
        return response.json();
    },

    addTeacher: async (teacherData) => {
        const response = await fetch(`${API_URL}/teachers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(teacherData)
        });
        return response.json();
    },

    updateTeacher: async (id, teacherData) => {
        const response = await fetch(`${API_URL}/teachers/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(teacherData)
        });
        return response.json();
    },

    deleteTeacher: async (id) => {
        const response = await fetch(`${API_URL}/teachers/${id}`, {
            method: 'DELETE'
        });
        return response.json();
    },

    // Notices
    getNotices: async () => {
        const response = await fetch(`${API_URL}/notices`);
        return response.json();
    },

    addNotice: async (notice) => {
        const response = await fetch(`${API_URL}/notices`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(notice)
        });
        return response.json();
    },

    // Tests
    getTests: async () => {
        const response = await fetch(`${API_URL}/tests`);
        return response.json();
    },

    addTest: async (testData) => {
        const response = await fetch(`${API_URL}/tests`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testData)
        });
        return response.json();
    },

    updateMarks: async (testId, marks) => {
        const response = await fetch(`${API_URL}/marks/update`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ testId, marks })
        });
        return response.json();
    },

    // Attendance
    getAllAttendance: async () => {
        const response = await fetch(`${API_URL}/attendance`);
        return response.json();
    },

    getAttendance: async (userId) => {
        const response = await fetch(`${API_URL}/attendance/${userId}`);
        return response.json();
    },

    markAttendance: async (data) => {
        const response = await fetch(`${API_URL}/attendance`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return response.json();
    },

    // Classes
    getClasses: async () => {
        const response = await fetch(`${API_URL}/classes`);
        return response.json();
    },

    addClass: async (classData) => {
        const response = await fetch(`${API_URL}/classes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(classData)
        });
        return response.json();
    },

    deleteClass: async (id) => {
        const response = await fetch(`${API_URL}/classes/${id}`, {
            method: 'DELETE'
        });
        return response.json();
    }
};

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherAttendance from './pages/teacher/TeacherAttendance';
import TeacherMarks from './pages/teacher/TeacherMarks';
import TeacherAssignments from './pages/teacher/TeacherAssignments';
import TeacherStudents from './pages/teacher/TeacherStudents';
import TeacherTests from './pages/teacher/TeacherTests';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminTeachers from './pages/admin/AdminTeachers';
import AdminStudents from './pages/admin/AdminStudents';
import AdminNotices from './pages/admin/AdminNotices';
import AdminPayments from './pages/admin/AdminPayments';
import AdminReports from './pages/admin/AdminReports';
import AdminStudentView from './pages/admin/AdminStudentView';
import AdminTeacherView from './pages/admin/AdminTeacherView';
import AdminTeacherAttendance from './pages/admin/AdminTeacherAttendance';
import AdminClasses from './pages/admin/AdminClasses';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Fees from './pages/Fees';
import Attendance from './pages/Attendance';
import Results from './pages/Results';
import Assignments from './pages/Assignments';
import Notices from './pages/Notices';
import Timetable from './pages/Timetable';
import Messages from './pages/Messages';
import Profile from './pages/Profile';

import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="login" element={<Login />} />
              <Route path="dashboard" element={<Dashboard />} />

              {/* Student Routes */}
              <Route path="fees" element={<Fees />} />
              <Route path="attendance" element={<Attendance />} />
              <Route path="results" element={<Results />} />
              <Route path="assignments" element={<Assignments />} />
              <Route path="notices" element={<Notices />} />
              <Route path="timetable" element={<Timetable />} />
              <Route path="messages" element={<Messages />} />
              <Route path="profile" element={<Profile />} />

              {/* Teacher Routes */}
              <Route path="teacher/dashboard" element={<TeacherDashboard />} />
              <Route path="teacher/attendance" element={<TeacherAttendance />} />
              <Route path="teacher/marks" element={<TeacherMarks />} />
              <Route path="teacher/tests" element={<TeacherTests />} />
              <Route path="teacher/assignments" element={<TeacherAssignments />} />
              <Route path="teacher/students" element={<TeacherStudents />} />

              {/* Admin Routes */}
              <Route path="admin/dashboard" element={<AdminDashboard />} />
              <Route path="admin/classes" element={<AdminClasses />} />
              <Route path="admin/teachers" element={<AdminTeachers />} />
              <Route path="admin/students" element={<AdminStudents />} />
              <Route path="admin/teacher-attendance" element={<AdminTeacherAttendance />} />
              <Route path="admin/student-access" element={<AdminStudentView />} />
              <Route path="admin/teacher-access" element={<AdminTeacherView />} />
              <Route path="admin/notices" element={<AdminNotices />} />
              <Route path="admin/payments" element={<AdminPayments />} />
              <Route path="admin/reports" element={<AdminReports />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherMyAttendance from './pages/teacher/TeacherMyAttendance';
import TeacherAttendance from './pages/teacher/TeacherAttendance';
import TeacherMarks from './pages/teacher/TeacherMarks';
import TeacherAssignments from './pages/teacher/TeacherAssignments';
import TeacherStudents from './pages/teacher/TeacherStudents';
import TeacherTests from './pages/teacher/TeacherTests';
import TeacherNotices from './pages/teacher/TeacherNotices';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminTeachers from './pages/admin/AdminTeachers';
import AdminStudents from './pages/admin/AdminStudents';
import AdminNotices from './pages/admin/AdminNotices';
import AdminPayments from './pages/admin/AdminPayments';
import AdminReports from './pages/admin/AdminReports';
import AdminStudentView from './pages/admin/AdminStudentView';
import AdminTeacherView from './pages/admin/AdminTeacherView';
import AdminTeacherAttendance from './pages/admin/AdminTeacherAttendance';
import AdminFees from './pages/admin/AdminFees';
import AdminClasses from './pages/admin/AdminClasses';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import MigrateData from './pages/MigrateData';
import Dashboard from './pages/Dashboard';
import Fees from './pages/Fees';
import Attendance from './pages/Attendance';
import Results from './pages/Results';
import Assignments from './pages/Assignments';
import Notices from './pages/Notices';
import Timetable from './pages/Timetable';
import Messages from './pages/Messages';
import Profile from './pages/Profile';

import ProtectedRoute from './components/ProtectedRoute';
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
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route path="reset-password" element={<ResetPassword />} />
              <Route path="migrate" element={<MigrateData />} />

              {/* Common Protected Routes */}
              <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />

              {/* Student Routes */}
              <Route path="fees" element={<ProtectedRoute role="student"><Fees /></ProtectedRoute>} />
              <Route path="attendance" element={<ProtectedRoute role="student"><Attendance /></ProtectedRoute>} />
              <Route path="results" element={<ProtectedRoute role="student"><Results /></ProtectedRoute>} />
              <Route path="assignments" element={<ProtectedRoute role="student"><Assignments /></ProtectedRoute>} />
              <Route path="notices" element={<ProtectedRoute role="student"><Notices /></ProtectedRoute>} />
              <Route path="timetable" element={<ProtectedRoute role="student"><Timetable /></ProtectedRoute>} />

              {/* Teacher Routes */}
              <Route path="teacher/dashboard" element={<ProtectedRoute role="teacher"><TeacherDashboard /></ProtectedRoute>} />
              <Route path="teacher/my-attendance" element={<ProtectedRoute role="teacher"><TeacherMyAttendance /></ProtectedRoute>} />
              <Route path="teacher/attendance" element={<ProtectedRoute role="teacher"><TeacherAttendance /></ProtectedRoute>} />
              <Route path="teacher/marks" element={<ProtectedRoute role="teacher"><TeacherMarks /></ProtectedRoute>} />
              <Route path="teacher/tests" element={<ProtectedRoute role="teacher"><TeacherTests /></ProtectedRoute>} />
              <Route path="teacher/assignments" element={<ProtectedRoute role="teacher"><TeacherAssignments /></ProtectedRoute>} />
              <Route path="teacher/students" element={<ProtectedRoute role="teacher"><TeacherStudents /></ProtectedRoute>} />
              <Route path="teacher/notices" element={<ProtectedRoute role="teacher"><TeacherNotices /></ProtectedRoute>} />

              {/* Admin Routes */}
              <Route path="admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
              <Route path="admin/classes" element={<ProtectedRoute role="admin"><AdminClasses /></ProtectedRoute>} />
              <Route path="admin/teachers" element={<ProtectedRoute role="admin"><AdminTeachers /></ProtectedRoute>} />
              <Route path="admin/students" element={<ProtectedRoute role="admin"><AdminStudents /></ProtectedRoute>} />
              <Route path="admin/teacher-attendance" element={<ProtectedRoute role="admin"><AdminTeacherAttendance /></ProtectedRoute>} />
              <Route path="admin/student-access" element={<ProtectedRoute role="admin"><AdminStudentView /></ProtectedRoute>} />
              <Route path="admin/teacher-access" element={<ProtectedRoute role="admin"><AdminTeacherView /></ProtectedRoute>} />
              <Route path="admin/notices" element={<ProtectedRoute role="admin"><AdminNotices /></ProtectedRoute>} />
              <Route path="admin/fees" element={<ProtectedRoute role="admin"><AdminFees /></ProtectedRoute>} />
              <Route path="admin/payments" element={<ProtectedRoute role="admin"><AdminPayments /></ProtectedRoute>} />
              <Route path="admin/reports" element={<ProtectedRoute role="admin"><AdminReports /></ProtectedRoute>} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

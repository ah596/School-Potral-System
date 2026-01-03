import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import LoadingScreen from './components/LoadingScreen';
import ProtectedRoute from './components/ProtectedRoute';

// Eager load critical pages
import Login from './pages/Login';
import Home from './pages/Home';

// Lazy load feature pages
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const MigrateData = lazy(() => import('./pages/MigrateData'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Fees = lazy(() => import('./pages/Fees'));
const Attendance = lazy(() => import('./pages/Attendance'));
const Results = lazy(() => import('./pages/Results'));
const Assignments = lazy(() => import('./pages/Assignments'));
const Notices = lazy(() => import('./pages/Notices'));
const Timetable = lazy(() => import('./pages/Timetable'));
const Messages = lazy(() => import('./pages/Messages'));
const Profile = lazy(() => import('./pages/Profile'));

// Teacher Pages
const TeacherDashboard = lazy(() => import('./pages/teacher/TeacherDashboard'));
const TeacherMyAttendance = lazy(() => import('./pages/teacher/TeacherMyAttendance'));
const TeacherAttendance = lazy(() => import('./pages/teacher/TeacherAttendance'));
const TeacherMarks = lazy(() => import('./pages/teacher/TeacherMarks'));
const TeacherAssignments = lazy(() => import('./pages/teacher/TeacherAssignments'));
const TeacherStudents = lazy(() => import('./pages/teacher/TeacherStudents'));
const TeacherTests = lazy(() => import('./pages/teacher/TeacherTests'));
const TeacherNotices = lazy(() => import('./pages/teacher/TeacherNotices'));

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminTeachers = lazy(() => import('./pages/admin/AdminTeachers'));
const AdminStudents = lazy(() => import('./pages/admin/AdminStudents'));
const AdminNotices = lazy(() => import('./pages/admin/AdminNotices'));
const AdminPayments = lazy(() => import('./pages/admin/AdminPayments'));
const AdminReports = lazy(() => import('./pages/admin/AdminReports'));
const AdminStudentView = lazy(() => import('./pages/admin/AdminStudentView'));
const AdminTeacherView = lazy(() => import('./pages/admin/AdminTeacherView'));
const AdminTeacherAttendance = lazy(() => import('./pages/admin/AdminTeacherAttendance'));
const AdminFees = lazy(() => import('./pages/admin/AdminFees'));
const AdminClasses = lazy(() => import('./pages/admin/AdminClasses'));
const AdminGallery = lazy(() => import('./pages/admin/AdminGallery'));


function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<LoadingScreen message="Loading..." />}>
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
                <Route path="admin/gallery" element={<ProtectedRoute role="admin"><AdminGallery /></ProtectedRoute>} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;


import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { TrendingUp, Smartphone } from 'lucide-react';

// Marketing components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Dashboard components
import Sidebar from './components/Sidebar';

// Marketing pages (Web 3)
import LandingPage from './pages/LandingPage';
import PricingPage from './pages/PricingPage';
import ContactPage from './pages/ContactPage';
import AboutPage from './pages/AboutPage';

// Auth
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import ForgotPasswordPage from './pages/ForgotPassword';
import PaymentCallback from './pages/PaymentCallback';

// Dashboard pages (Web 1 & 2)
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import UserManagement from './pages/UserManagement';
import B2BManagement from './pages/B2BManagement';
import SubscriptionManagement from './pages/SubscriptionManagement';
import PlansManagement from './pages/PlansManagement';
import ContentManagement from './pages/ContentManagement';
import AnalyticsManagement from './pages/AnalyticsManagement';
import RevenueManagement from './pages/RevenueManagement';
import CenterAdminDashboard from './pages/CenterAdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';

import CenterClasses from './pages/CenterClasses';
import CenterStudents from './pages/CenterStudents';
import CenterSubscription from './pages/CenterSubscription';
import CenterTeachers from './pages/CenterTeachers';
import CenterReports from './pages/CenterReports';
import CenterContent from './pages/CenterContent';

import StudentAssignments from './pages/StudentAssignments';
import StudentProgress from './pages/StudentProgress';
import NotificationsPage from './pages/NotificationsPage';
import TeacherStudentsPage from './pages/TeacherStudentsPage';
import TeacherAssign from './pages/TeacherAssign';
import TeacherReports from './pages/TeacherReports';
import TeacherVocabulary from './pages/TeacherVocabulary';

// Marketing Layout (Navbar + Footer)
const MarketingLayout = ({ children }) => (
  <>
    <Navbar />
    {children}
    <Footer />
  </>
);
MarketingLayout.propTypes = { children: PropTypes.node };

// Dashboard Layout (Sidebar)
const DashboardLayout = ({ role, children }) => (
  <div style={{ display: 'flex' }}>
    <Sidebar role={role} />
    <main className="main-content">
      {children}
    </main>
  </div>
);
DashboardLayout.propTypes = {
  role: PropTypes.string,
  children: PropTypes.node,
};

/**
 * Guards a dashboard route by role. Pass allow="any" for any logged-in user,
 * otherwise the exact role string. Renders inside the dashboard layout when
 * allowed, or redirects to /login.
 */
const ProtectedRoute = ({ currentRole, allow, children }) => {
  const allowed = allow === 'any'
    ? Boolean(currentRole) && currentRole !== 'Guest'
    : currentRole === allow;

  if (!allowed) return <Navigate to="/login" />;
  return <DashboardLayout role={currentRole}>{children}</DashboardLayout>;
};
ProtectedRoute.propTypes = {
  currentRole: PropTypes.string,
  allow: PropTypes.string.isRequired,
  children: PropTypes.node,
};

// Static placeholder content kept out of the App body to keep it simple.
const StudentProgressPlaceholder = (
  <>
    <div className="page-header"><h1 className="page-title">Kết quả Luyện tập</h1><p className="page-subtitle">Biểu đồ kỹ năng và lịch sử điểm số của bạn</p></div>
    <div className="card" style={{ textAlign: 'center', padding: '100px', color: 'var(--gray-300)' }}>
      <TrendingUp size={64} style={{ marginBottom: '24px', opacity: 0.3 }} />
      <div>Tính năng đang đồng bộ từ ứng dụng di động...</div>
    </div>
  </>
);

const StudentMobilePlaceholder = (
  <>
    <div className="page-header"><h1 className="page-title">Tải ứng dụng SignMate</h1><p className="page-subtitle">Học tập mọi lúc mọi nơi với AI Feedback</p></div>
    <div className="card" style={{ background: 'var(--primary)', color: 'white', textAlign: 'center', padding: '60px' }}>
      <Smartphone size={80} style={{ marginBottom: '24px' }} />
      <h2 style={{ color: 'white', marginBottom: '16px' }}>Trải nghiệm AI tốt nhất trên di động</h2>
      <p style={{ maxWidth: '500px', margin: '0 auto 40px', opacity: 0.9 }}>Quét mã QR trên Dashboard để bắt đầu hành trình ký hiệu cùng chúng tôi!</p>
      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
        <button className="btn btn-white">iOS App Store</button>
        <button className="btn btn-white">Google Play Store</button>
      </div>
    </div>
  </>
);

const TeacherAssignPlaceholder = (
  <>
    <div className="page-header"><h1 className="page-title">Giao Bài</h1><p className="page-subtitle">Giao bài theo topic, đặt deadline</p></div>
    <div className="card" style={{ textAlign: 'center', padding: '60px' }}><p style={{ color: 'var(--gray-300)', fontSize: '18px' }}>🚧 Đang phát triển...</p></div>
  </>
);

const TeacherReportsPlaceholder = (
  <>
    <div className="page-header"><h1 className="page-title">Báo cáo</h1><p className="page-subtitle">Export PDF, weekly report</p></div>
    <div className="card" style={{ textAlign: 'center', padding: '60px' }}><p style={{ color: 'var(--gray-300)', fontSize: '18px' }}>🚧 Đang phát triển...</p></div>
  </>
);

function App() {
  const [role, setRole] = useState(localStorage.getItem('userRole') || 'Guest');

  const updateRole = (newRole) => {
    setRole(newRole);
    localStorage.setItem('userRole', newRole);
  };

  // Convenience wrapper so each route reads as a single concise line.
  const guard = (allow, element) => (
    <ProtectedRoute currentRole={role} allow={allow}>{element}</ProtectedRoute>
  );

  return (
    <Router>
      <Routes>
        {/* ===== WEB 3: Marketing Website (Public) ===== */}
        <Route path="/" element={<MarketingLayout><LandingPage /></MarketingLayout>} />
        <Route path="/pricing" element={<MarketingLayout><PricingPage /></MarketingLayout>} />
        <Route path="/contact" element={<MarketingLayout><ContactPage /></MarketingLayout>} />
        <Route path="/about" element={<MarketingLayout><AboutPage /></MarketingLayout>} />

        {/* ===== Login ===== */}
        <Route path="/login" element={<LoginPage setRole={updateRole} />} />
        <Route path="/register" element={<RegisterPage setRole={updateRole} />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/payment-callback" element={<PaymentCallback />} />

        {/* ===== STUDENT DASHBOARD ===== */}
        <Route path="/student" element={guard('Student', <StudentDashboard />)} />
        <Route path="/student/assignments" element={guard('Student', <StudentAssignments />)} />
        <Route path="/student/progress" element={guard('Student', <StudentProgress />)} />
        <Route path="/student/mobile" element={guard('Student', StudentMobilePlaceholder)} />

        {/* ===== WEB 1: Super Admin Dashboard ===== */}
        <Route path="/admin" element={guard('SuperAdmin', <SuperAdminDashboard />)} />
        <Route path="/admin/users" element={guard('SuperAdmin', <UserManagement />)} />
        <Route path="/admin/b2b" element={guard('SuperAdmin', <B2BManagement />)} />
        <Route path="/admin/subscriptions" element={guard('SuperAdmin', <SubscriptionManagement />)} />
        <Route path="/admin/plans" element={guard('SuperAdmin', <PlansManagement />)} />
        <Route path="/admin/content" element={guard('SuperAdmin', <ContentManagement />)} />
        <Route path="/admin/analytics" element={guard('SuperAdmin', <AnalyticsManagement />)} />
        <Route path="/admin/revenue" element={guard('SuperAdmin', <RevenueManagement />)} />

        {/* ===== WEB 2: Center Admin Dashboard ===== */}
        <Route path="/center" element={guard('CenterAdmin', <CenterAdminDashboard />)} />
        <Route path="/center/classes" element={guard('CenterAdmin', <CenterClasses />)} />
        <Route path="/center/content" element={guard('CenterAdmin', <CenterContent />)} />
        <Route path="/center/students" element={guard('CenterAdmin', <CenterStudents />)} />
        <Route path="/center/subscription" element={guard('CenterAdmin', <CenterSubscription />)} />
        <Route path="/center/teachers" element={guard('CenterAdmin', <CenterTeachers />)} />
        <Route path="/center/reports" element={guard('CenterAdmin', <CenterReports />)} />

        {/* ===== WEB 2: Teacher Dashboard ===== */}
        <Route path="/teacher" element={guard('Teacher', <TeacherDashboard />)} />
        <Route path="/teacher/assign" element={guard('Teacher', <TeacherAssign />)} />
        <Route path="/teacher/progress" element={guard('Teacher', <TeacherStudentsPage />)} />
        <Route path="/teacher/reports" element={guard('Teacher', <TeacherReports />)} />
        <Route path="/teacher/vocabulary" element={guard('Teacher', <TeacherVocabulary />)} />

        {/* ===== Shared: Notifications (any logged-in role) ===== */}
        <Route path="/notifications" element={guard('any', <NotificationsPage />)} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;

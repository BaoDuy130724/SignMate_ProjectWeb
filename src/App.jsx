import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

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

// Dashboard pages (Web 1 & 2)
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import UserManagement from './pages/UserManagement';
import B2BManagement from './pages/B2BManagement';
import SubscriptionManagement from './pages/SubscriptionManagement';
import ContentManagement from './pages/ContentManagement';
import AnalyticsManagement from './pages/AnalyticsManagement';
import CenterAdminDashboard from './pages/CenterAdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';

// Marketing Layout (Navbar + Footer)
const MarketingLayout = ({ children }) => (
  <>
    <Navbar />
    {children}
    <Footer />
  </>
);

// Dashboard Layout (Sidebar)
const DashboardLayout = ({ role, children }) => (
  <div style={{ display: 'flex' }}>
    <Sidebar role={role} />
    <main className="main-content">
      {children}
    </main>
  </div>
);

function App() {
  const [role, setRole] = useState(localStorage.getItem('userRole') || 'Guest');

  const updateRole = (newRole) => {
    setRole(newRole);
    localStorage.setItem('userRole', newRole);
  };

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

        {/* ===== STUDENT DASHBOARD ===== */}
        <Route path="/student" element={
          role === 'Student' 
            ? <DashboardLayout role="Student"><StudentDashboard /></DashboardLayout>
            : <Navigate to="/login" />
        } />

        {/* ===== WEB 1: Super Admin Dashboard ===== */}
        <Route path="/admin" element={
          role === 'SuperAdmin' 
            ? <DashboardLayout role="SuperAdmin"><SuperAdminDashboard /></DashboardLayout>
            : <Navigate to="/login" />
        } />
        <Route path="/admin/users" element={
          role === 'SuperAdmin'
            ? <DashboardLayout role="SuperAdmin">
                <UserManagement />
              </DashboardLayout>
            : <Navigate to="/login" />
        } />
        <Route path="/admin/b2b" element={
          role === 'SuperAdmin'
            ? <DashboardLayout role="SuperAdmin">
                <B2BManagement />
              </DashboardLayout>
            : <Navigate to="/login" />
        } />
        <Route path="/admin/subscriptions" element={
          role === 'SuperAdmin'
            ? <DashboardLayout role="SuperAdmin">
                <SubscriptionManagement />
              </DashboardLayout>
            : <Navigate to="/login" />
        } />
        <Route path="/admin/content" element={
          role === 'SuperAdmin'
            ? <DashboardLayout role="SuperAdmin">
                <ContentManagement />
              </DashboardLayout>
            : <Navigate to="/login" />
        } />
        <Route path="/admin/analytics" element={
          role === 'SuperAdmin'
            ? <DashboardLayout role="SuperAdmin">
                <AnalyticsManagement />
              </DashboardLayout>
            : <Navigate to="/login" />
        } />

        {/* ===== WEB 2: Center Admin Dashboard ===== */}
        <Route path="/center" element={
          role === 'CenterAdmin'
            ? <DashboardLayout role="CenterAdmin"><CenterAdminDashboard /></DashboardLayout>
            : <Navigate to="/login" />
        } />
        <Route path="/center/classes" element={
          role === 'CenterAdmin'
            ? <DashboardLayout role="CenterAdmin">
                <div className="page-header"><h1 className="page-title">Quản lý Lớp học</h1><p className="page-subtitle">Tạo lớp, thêm giáo viên, gán giáo viên</p></div>
                <div className="card" style={{ textAlign: 'center', padding: '60px' }}><p style={{ color: 'var(--gray-300)', fontSize: '18px' }}>🚧 Đang phát triển...</p></div>
              </DashboardLayout>
            : <Navigate to="/login" />
        } />
        <Route path="/center/students" element={
          role === 'CenterAdmin'
            ? <DashboardLayout role="CenterAdmin">
                <div className="page-header"><h1 className="page-title">Quản lý Học viên</h1><p className="page-subtitle">Thêm, import danh sách, xóa học viên</p></div>
                <div className="card" style={{ textAlign: 'center', padding: '60px' }}><p style={{ color: 'var(--gray-300)', fontSize: '18px' }}>🚧 Đang phát triển...</p></div>
              </DashboardLayout>
            : <Navigate to="/login" />
        } />
        <Route path="/center/subscription" element={
          role === 'CenterAdmin'
            ? <DashboardLayout role="CenterAdmin">
                <div className="page-header"><h1 className="page-title">Gói dịch vụ</h1><p className="page-subtitle">Seats, usage, payment status</p></div>
                <div className="card" style={{ textAlign: 'center', padding: '60px' }}><p style={{ color: 'var(--gray-300)', fontSize: '18px' }}>🚧 Đang phát triển...</p></div>
              </DashboardLayout>
            : <Navigate to="/login" />
        } />

        {/* ===== WEB 2: Teacher Dashboard ===== */}
        <Route path="/teacher" element={
          role === 'Teacher'
            ? <DashboardLayout role="Teacher"><TeacherDashboard /></DashboardLayout>
            : <Navigate to="/login" />
        } />
        <Route path="/teacher/assign" element={
          role === 'Teacher'
            ? <DashboardLayout role="Teacher">
                <div className="page-header"><h1 className="page-title">Giao Bài</h1><p className="page-subtitle">Giao bài theo topic, đặt deadline</p></div>
                <div className="card" style={{ textAlign: 'center', padding: '60px' }}><p style={{ color: 'var(--gray-300)', fontSize: '18px' }}>🚧 Đang phát triển...</p></div>
              </DashboardLayout>
            : <Navigate to="/login" />
        } />
        <Route path="/teacher/progress" element={
          role === 'Teacher'
            ? <DashboardLayout role="Teacher">
                <div className="page-header"><h1 className="page-title">Tiến độ Học viên</h1><p className="page-subtitle">Weak topics, practice frequency, improvement</p></div>
                <div className="card" style={{ textAlign: 'center', padding: '60px' }}><p style={{ color: 'var(--gray-300)', fontSize: '18px' }}>🚧 Đang phát triển...</p></div>
              </DashboardLayout>
            : <Navigate to="/login" />
        } />
        <Route path="/teacher/reports" element={
          role === 'Teacher'
            ? <DashboardLayout role="Teacher">
                <div className="page-header"><h1 className="page-title">Báo cáo</h1><p className="page-subtitle">Export PDF, weekly report</p></div>
                <div className="card" style={{ textAlign: 'center', padding: '60px' }}><p style={{ color: 'var(--gray-300)', fontSize: '18px' }}>🚧 Đang phát triển...</p></div>
              </DashboardLayout>
            : <Navigate to="/login" />
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;

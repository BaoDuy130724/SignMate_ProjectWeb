import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import PaymentCallback from './pages/PaymentCallback';

// Dashboard pages (Web 1 & 2)
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import UserManagement from './pages/UserManagement';
import B2BManagement from './pages/B2BManagement';
import SubscriptionManagement from './pages/SubscriptionManagement';
import ContentManagement from './pages/ContentManagement';
import AnalyticsManagement from './pages/AnalyticsManagement';
import RevenueManagement from './pages/RevenueManagement';
import CenterAdminDashboard from './pages/CenterAdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';

import CenterClasses from './pages/CenterClasses';
import CenterStudents from './pages/CenterStudents';
import CenterSubscription from './pages/CenterSubscription';

import StudentAssignments from './pages/StudentAssignments';

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
        <Route path="/register" element={<RegisterPage setRole={updateRole} />} />
        <Route path="/payment-callback" element={<PaymentCallback />} />

        {/* ===== STUDENT DASHBOARD ===== */}
        <Route path="/student" element={
          role === 'Student' 
            ? <DashboardLayout role="Student"><StudentDashboard /></DashboardLayout>
            : <Navigate to="/login" />
        } />
        <Route path="/student/assignments" element={
          role === 'Student'
            ? <DashboardLayout role="Student"><StudentAssignments /></DashboardLayout>
            : <Navigate to="/login" />
        } />
        <Route path="/student/progress" element={
          role === 'Student'
            ? <DashboardLayout role="Student">
                <div className="page-header"><h1 className="page-title">Kết quả Luyện tập</h1><p className="page-subtitle">Biểu đồ kỹ năng và lịch sử điểm số của bạn</p></div>
                <div className="card" style={{ textAlign: 'center', padding: '100px', color: 'var(--gray-300)' }}>
                  <TrendingUp size={64} style={{ marginBottom: '24px', opacity: 0.3 }} />
                  <div>Tính năng đang đồng bộ từ ứng dụng di động...</div>
                </div>
              </DashboardLayout>
            : <Navigate to="/login" />
        } />
        <Route path="/student/mobile" element={
          role === 'Student'
            ? <DashboardLayout role="Student">
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
              </DashboardLayout>
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
        <Route path="/admin/revenue" element={
          role === 'SuperAdmin'
            ? <DashboardLayout role="SuperAdmin">
                <RevenueManagement />
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
                <CenterClasses />
              </DashboardLayout>
            : <Navigate to="/login" />
        } />
        <Route path="/center/students" element={
          role === 'CenterAdmin'
            ? <DashboardLayout role="CenterAdmin">
                <CenterStudents />
              </DashboardLayout>
            : <Navigate to="/login" />
        } />
        <Route path="/center/subscription" element={
          role === 'CenterAdmin'
            ? <DashboardLayout role="CenterAdmin">
                <CenterSubscription />
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

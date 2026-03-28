import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Building2, CreditCard, BookOpen, BarChart3, LogOut,
  GraduationCap, UserPlus, ClipboardList,
  Eye, FileText, Settings, Map, Layers, Smartphone, TrendingUp
} from 'lucide-react';

const Sidebar = ({ role }) => {
  const getConfig = () => {
    switch (role) {
      case 'SuperAdmin':
        return {
          title: 'SUPER ADMIN',
          sections: [
            {
              label: 'Tổng quan',
              links: [
                { to: '/admin', icon: <LayoutDashboard size={20} />, label: 'Dashboard', end: true },
              ]
            },
            {
              label: 'Quản lý',
              links: [
                { to: '/admin/users', icon: <Users size={20} />, label: 'User Management' },
                { to: '/admin/b2b', icon: <Building2 size={20} />, label: 'B2B Management' },
                { to: '/admin/subscriptions', icon: <CreditCard size={20} />, label: 'Subscriptions' },
                { to: '/admin/content', icon: <BookOpen size={20} />, label: 'Content' },
              ]
            },
            {
              label: 'Phân tích & Tài chính',
              links: [
                { to: '/admin/analytics', icon: <BarChart3 size={20} />, label: 'Analytics' },
                { to: '/admin/revenue', icon: <CreditCard size={20} />, label: 'Doanh thu' },
              ]
            },
          ]
        };
      case 'CenterAdmin':
        return {
          title: 'CENTER ADMIN',
          sections: [
            {
              label: 'Tổng quan',
              links: [
                { to: '/center', icon: <LayoutDashboard size={20} />, label: 'Dashboard', end: true },
              ]
            },
            {
              label: 'Quản lý',
              links: [
                { to: '/center/classes', icon: <GraduationCap size={20} />, label: 'Lớp học' },
                { to: '/center/students', icon: <UserPlus size={20} />, label: 'Học viên' },
                { to: '/center/subscription', icon: <CreditCard size={20} />, label: 'Gói dịch vụ' },
              ]
            },
          ]
        };
      case 'Teacher':
        return {
          title: 'TEACHER',
          sections: [
            {
              label: 'Tổng quan',
              links: [
                { to: '/teacher', icon: <Eye size={20} />, label: 'Lớp của tôi', end: true },
              ]
            },
            {
              label: 'Giảng dạy',
              links: [
                { to: '/teacher/assign', icon: <ClipboardList size={20} />, label: 'Giao bài' },
                { to: '/teacher/progress', icon: <BarChart3 size={20} />, label: 'Tiến độ học viên' },
                { to: '/teacher/reports', icon: <FileText size={20} />, label: 'Báo cáo' },
              ]
            },
          ]
        };
      case 'Student':
        return {
          title: 'LEARNER PORTAL',
          sections: [
            {
              label: 'Tổng quan',
              links: [
                { to: '/student', icon: <Map size={20} />, label: 'Lộ trình học tập', end: true },
              ]
            },
            {
              label: 'Học tập',
              links: [
                { to: '/student/assignments', icon: <Layers size={20} />, label: 'Bài tập từ GV' },
                { to: '/student/progress', icon: <TrendingUp size={20} />, label: 'Kết quả luyện tập' },
              ]
            },
            {
              label: 'Hệ thống',
              links: [
                { to: '/student/mobile', icon: <Smartphone size={20} />, label: 'Tải ứng dụng' },
                { to: '/pricing', icon: <CreditCard size={20} />, label: 'Nâng cấp Gói' },
              ]
            },
          ]
        };
      default:
        return { title: 'MENU', sections: [] };
    }
  };

  const config = getConfig();

  return (
    <div className="sidebar">
      <div className="sidebar-logo">SignMate</div>
      <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--gray-300)', padding: '0 12px 12px', textTransform: 'uppercase', letterSpacing: '1.5px', borderBottom: '2px solid var(--gray-100)', marginBottom: '8px' }}>
        {config.title}
      </div>

      {config.sections.map((section, idx) => (
        <div key={idx}>
          <div className="sidebar-section-label">{section.label}</div>
          {section.links.map((link) => (
            <NavLink 
              key={link.to} 
              to={link.to} 
              end={link.end || false}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              {link.icon}
              <span>{link.label}</span>
            </NavLink>
          ))}
        </div>
      ))}

      <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '2px solid var(--gray-100)' }}>
        <button 
          className="sidebar-link" 
          onClick={() => window.location.href = '/login'}
          style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--red)' }}
        >
          <LogOut size={20} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

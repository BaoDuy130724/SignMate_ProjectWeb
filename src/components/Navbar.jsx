import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { User, LogOut, Layout } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem('userRole');
  const fullName = localStorage.getItem('fullName') || 'User';
  const isLoggedIn = !!localStorage.getItem('accessToken');

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('fullName');
    localStorage.removeItem('centerId');
    navigate('/login');
    window.location.reload();
  };

  const getDashboardPath = () => {
    if (role === 'SuperAdmin') return '/admin';
    if (role === 'CenterAdmin') return '/center';
    if (role === 'Teacher') return '/teacher';
    if (role === 'Student') return '/student';
    return '/';
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">SignMate</Link>
        
        <div className="navbar-links">
          <NavLink to="/" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`} end>
            Trang chủ
          </NavLink>
          <NavLink to="/pricing" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
            Nâng cấp
          </NavLink>
          <NavLink to="/contact" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
            Liên hệ
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
            Về chúng tôi
          </NavLink>
        </div>

        <div className="navbar-actions">
          {isLoggedIn ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'var(--gray-50)', borderRadius: 'var(--radius-full)', fontSize: '14px', fontWeight: 700, color: 'var(--primary)' }}>
                <User size={16} />
                {fullName}
              </div>
              <Link to={getDashboardPath()} className="btn btn-primary btn-sm">
                <Layout size={16} style={{ marginRight: '6px' }} /> Dashboard
              </Link>
              <button onClick={handleLogout} className="btn btn-outline btn-sm" style={{ border: 'none', background: 'transparent', padding: '8px' }}>
                <LogOut size={18} color="var(--gray-400)" />
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-sm">Đăng nhập</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Đăng ký</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

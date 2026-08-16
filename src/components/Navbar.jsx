import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { User, LogOut, Layout, KeyRound, UserPlus, Receipt } from 'lucide-react';
import logoImg from '../assets/EXE201/logo.02-04.png';

const Navbar = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem('userRole');
  const fullName = localStorage.getItem('fullName') || 'User';
  const isLoggedIn = !!localStorage.getItem('accessToken');

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
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
    if (role === 'Student' || role === 'Learner') return '/student';
    return '/';
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <img src={logoImg} alt="SignMate" />
        </Link>
        
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', background: 'var(--gray-50)', borderRadius: 'var(--radius-full)', fontSize: '13px', fontWeight: 700, color: 'var(--primary)' }}>
                <User size={15} />
                {fullName}
              </div>
              {(!role || role === 'Student' || role === 'Learner') && (
                <Link to="/student/transactions" className="btn btn-outline btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }} title="Lịch sử giao dịch">
                  <Receipt size={15} /> Lịch sử GD
                </Link>
              )}
              <Link to={getDashboardPath()} className="btn btn-primary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                <Layout size={15} /> Dashboard
              </Link>
              <button type="button" onClick={handleLogout} className="btn btn-outline btn-sm" title="Đăng xuất" style={{ border: 'none', background: 'transparent', padding: '8px' }}>
                <LogOut size={18} color="var(--gray-400)" />
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-sm" title="Đăng nhập" style={{ padding: '8px 12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <KeyRound size={18} />
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm" title="Đăng ký" style={{ padding: '8px 12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <UserPlus size={18} />
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

import React from 'react';
import { NavLink } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="navbar-logo">SignMate</NavLink>
        
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
          <NavLink to="/login" className="btn btn-outline btn-sm">Đăng nhập</NavLink>
          <NavLink to="/" className="btn btn-primary btn-sm">Dùng thử miễn phí</NavLink>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

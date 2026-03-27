import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, AlertCircle, ArrowLeft } from 'lucide-react';
import { authApi } from '../services/api';

const LoginPage = ({ setRole }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Login via Backend API
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      localStorage.setItem('accessToken', res.accessToken);

      // Get user info to determine role
      const user = await authApi.me();
      const role = user.role || 'Learner';
      setRole(role);
      
      localStorage.setItem('userRole', role);
      if (user.centerId) {
        localStorage.setItem('centerId', user.centerId);
      }

      // Redirect based on role
      if (role === 'SuperAdmin') navigate('/admin');
      else if (role === 'CenterAdmin') navigate('/center');
      else if (role === 'Teacher') navigate('/teacher');
      else if (role === 'Student') navigate('/student');
      else navigate('/');
    } catch (err) {
      setError(err.message || 'Sai email hoặc mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'var(--gray-50)',
      padding: '24px'
    }}>
      <div style={{
        background: 'white',
        padding: '48px',
        borderRadius: 'var(--radius-xl)',
        border: '2px solid var(--gray-100)',
        boxShadow: 'var(--shadow-lg)',
        maxWidth: '440px',
        width: '100%',
        textAlign: 'center',
        position: 'relative'
      }}>
        <div style={{ marginBottom: '24px', textAlign: 'left' }}>
          <Link to="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            color: 'var(--gray-400)', fontWeight: 700, fontSize: '14px',
            textDecoration: 'none'
          }}>
            <ArrowLeft size={16} /> Về trang chủ
          </Link>
        </div>
        <div style={{ fontSize: '36px', fontWeight: 900, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>
          SignMate
        </div>
        <p style={{ color: 'var(--gray-400)', fontSize: '16px', marginBottom: '24px' }}>
          Đăng nhập vào hệ thống quản lý
        </p>

        <form onSubmit={handleLogin}>
          {error && (
            <div style={{
              background: '#ffebee', border: '2px solid var(--red)', borderRadius: 'var(--radius-md)',
              padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px',
              fontSize: '14px', color: 'var(--red-dark)', fontWeight: 600, textAlign: 'left'
            }}>
              <AlertCircle size={18} /> {error}
            </div>
          )}
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label className="form-label">Email</label>
            <input type="email" className="form-input" placeholder="admin@signmate.vn" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label className="form-label">Mật khẩu</label>
            <input type="password" className="form-input" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            <LogIn size={18} /> {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;

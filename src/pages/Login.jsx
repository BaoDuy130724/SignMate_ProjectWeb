import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  LogIn, AlertCircle, ArrowLeft, Eye, EyeOff, Mail, Lock, 
  Sparkles, CheckCircle2, Award, Flame, Users, ShieldCheck, Zap 
} from 'lucide-react';
import { authApi } from '../services/api';
import logoImg from '../assets/EXE201/logo.02-04.png';
import './Auth.css';

const LoginPage = ({ setRole }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  // Quick fill helper for testing demo accounts
  const handleQuickFill = (demoEmail, demoPw = 'SignMateDemo2026!') => {
    setEmail(demoEmail);
    setPassword(demoPw);
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      localStorage.setItem('accessToken', res.accessToken);
      if (res.refreshToken) localStorage.setItem('refreshToken', res.refreshToken);

      // Get user info to determine role
      const user = await authApi.me();
      let role = user.role || 'Student';
      if (role === 'Learner') role = 'Student';
      setRole(role);
      
      localStorage.setItem('userRole', role);
      if (user.fullName) {
        localStorage.setItem('fullName', user.fullName);
      }
      if (user.centerId && user.centerId !== 0 && user.centerId !== '0') {
        localStorage.setItem('centerId', user.centerId.toString());
      } else {
        localStorage.removeItem('centerId');
      }

      const from = location.state?.from || '';
      if (from === '/pricing') {
        navigate('/pricing');
        return;
      }

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
    <div className="auth-page">
      <div className="auth-bg-blob-1" />
      <div className="auth-bg-blob-2" />

      <div className="auth-container">
        {/* LEFT COLUMN: DYNAMIC AI HERO & VALUE PROPOSITION */}
        <div className="auth-hero-side">
          <div className="auth-brand-badge">
            <span className="auth-brand-badge-dot" />
            Nền tảng học Ngôn ngữ Ký hiệu với AI
          </div>

          <h1 className="auth-hero-title">
            Học Ký hiệu VSL chuẩn xác cùng <span>Trợ lý AI</span>
          </h1>

          <p className="auth-hero-desc">
            Nhận diện cử chỉ khớp xương bàn tay theo thời gian thực. Chấm điểm đa chiều và nhận phản hồi chi tiết từ công nghệ AI tiên tiến.
          </p>

          {/* AI Interactive Hand Tracking Visualizer */}
          <div className="auth-ai-showcase">
            <div className="auth-ai-showcase-header">
              <div className="auth-ai-showcase-status">
                <Sparkles size={16} color="#9b6aff" />
                <span>MediaPipe & Gemini Vision Active</span>
              </div>
              <div className="auth-ai-showcase-score">
                <CheckCircle2 size={14} /> Khớp 96% (Đạt)
              </div>
            </div>

            <div className="auth-ai-canvas-wrapper">
              <svg className="auth-ai-svg-hand" viewBox="0 0 400 160">
                {/* Radar Sweep Effect */}
                <g className="radar-sweep">
                  <circle cx="200" cy="80" r="65" fill="none" stroke="rgba(155, 106, 255, 0.15)" strokeWidth="1.5" strokeDasharray="6 6" />
                  <circle cx="200" cy="80" r="40" fill="none" stroke="rgba(155, 106, 255, 0.25)" strokeWidth="1" />
                </g>

                {/* Hand Skeleton Lines */}
                {/* Palm Base to Wrist */}
                <line x1="200" y1="135" x2="200" y2="105" className="keypoint-line" />
                {/* Thumb */}
                <line x1="200" y1="105" x2="165" y2="95" className="keypoint-line" />
                <line x1="165" y1="95" x2="145" y2="75" className="keypoint-line" />
                <line x1="145" y1="75" x2="135" y2="55" className="keypoint-line" />
                {/* Index Finger */}
                <line x1="200" y1="105" x2="180" y2="75" className="keypoint-line" />
                <line x1="180" y1="75" x2="175" y2="48" className="keypoint-line" />
                <line x1="175" y1="48" x2="170" y2="25" className="keypoint-line" />
                {/* Middle Finger */}
                <line x1="200" y1="105" x2="200" y2="70" className="keypoint-line" />
                <line x1="200" y1="70" x2="200" y2="42" className="keypoint-line" />
                <line x1="200" y1="42" x2="200" y2="18" className="keypoint-line" />
                {/* Ring Finger */}
                <line x1="200" y1="105" x2="220" y2="75" className="keypoint-line" />
                <line x1="220" y1="75" x2="225" y2="48" className="keypoint-line" />
                <line x1="225" y1="48" x2="230" y2="25" className="keypoint-line" />
                {/* Pinky */}
                <line x1="200" y1="105" x2="235" y2="85" className="keypoint-line" />
                <line x1="235" y1="85" x2="250" y2="65" className="keypoint-line" />
                <line x1="250" y1="65" x2="260" y2="45" className="keypoint-line" />

                {/* Keypoint Nodes (21 hand landmarks) */}
                {/* Wrist & Palm */}
                <circle cx="200" cy="135" r="5" className="keypoint-node active" />
                <circle cx="200" cy="105" r="4.5" className="keypoint-node active" />
                {/* Thumb */}
                <circle cx="165" cy="95" r="4" className="keypoint-node" />
                <circle cx="145" cy="75" r="4" className="keypoint-node" />
                <circle cx="135" cy="55" r="5" className="keypoint-node active" />
                {/* Index */}
                <circle cx="180" cy="75" r="4" className="keypoint-node" />
                <circle cx="175" cy="48" r="4" className="keypoint-node" />
                <circle cx="170" cy="25" r="5" className="keypoint-node active" />
                {/* Middle */}
                <circle cx="200" cy="70" r="4" className="keypoint-node" />
                <circle cx="200" cy="42" r="4" className="keypoint-node" />
                <circle cx="200" cy="18" r="5.5" className="keypoint-node active" />
                {/* Ring */}
                <circle cx="220" cy="75" r="4" className="keypoint-node" />
                <circle cx="225" cy="48" r="4" className="keypoint-node" />
                <circle cx="230" cy="25" r="5" className="keypoint-node active" />
                {/* Pinky */}
                <circle cx="235" cy="85" r="4" className="keypoint-node" />
                <circle cx="250" cy="65" r="4" className="keypoint-node" />
                <circle cx="260" cy="45" r="5" className="keypoint-node active" />
              </svg>
            </div>

            <div className="auth-ai-badges-row">
              <span className="auth-ai-tag"><Zap size={12} color="#f8d80f" /> 21 Khớp ngón tay</span>
              <span className="auth-ai-tag"><ShieldCheck size={12} color="#34d399" /> DTW Alignment</span>
              <span className="auth-ai-tag"><Sparkles size={12} color="#c084fc" /> Gemini AI Rubric</span>
            </div>
          </div>

          {/* Highlights List */}
          <div className="auth-highlights">
            <div className="auth-highlight-item">
              <div className="auth-highlight-icon">
                <Flame size={20} />
              </div>
              <div>
                <div className="auth-highlight-title">Chuỗi học Streak & XP</div>
                <div className="auth-highlight-desc">Tạo động lực học tập mỗi ngày qua game hóa.</div>
              </div>
            </div>

            <div className="auth-highlight-item">
              <div className="auth-highlight-icon">
                <Award size={20} />
              </div>
              <div>
                <div className="auth-highlight-title">Giáo trình VSL chuẩn hóa</div>
                <div className="auth-highlight-desc">Từ vựng & hội thoại giao tiếp thực tế.</div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LOGIN FORM CARD */}
        <div className="auth-form-side">
          <div className="auth-form-card">
            <Link to="/" className="auth-back-link">
              <ArrowLeft size={16} /> Về trang chủ
            </Link>

            <div className="auth-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <img src={logoImg} alt="SignMate" style={{ height: '36px', objectFit: 'contain' }} />
              </div>
              <h2 className="auth-card-title">Đăng nhập tài khoản</h2>
              <p className="auth-card-subtitle">Chào mừng bạn quay trở lại với SignMate</p>
            </div>

            {/* Quick Demo Switcher for fast reviewer access */}
            <div className="auth-demo-toolbar">
              <div className="auth-demo-toolbar-title">
                <span>Tài khoản Demo nhanh:</span>
                <span style={{ fontSize: '10px', color: '#9d96aa' }}>Pass: SignMateDemo2026!</span>
              </div>
              <div className="auth-demo-chips">
                <button type="button" className="auth-demo-chip" onClick={() => handleQuickFill('student@gmail.com')}>
                  👤 Học viên
                </button>
                <button type="button" className="auth-demo-chip" onClick={() => handleQuickFill('teacher@vslhanoi.edu.vn')}>
                  👩‍🏫 Giáo viên
                </button>
                <button type="button" className="auth-demo-chip" onClick={() => handleQuickFill('centeradmin@vslhanoi.edu.vn')}>
                  🏫 TT VSL
                </button>
                <button type="button" className="auth-demo-chip" onClick={() => handleQuickFill('admin@signmate.vn')}>
                  ⚡ Admin
                </button>
              </div>
            </div>

            {error && (
              <div className="auth-error-banner">
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div className="auth-input-group">
                <label className="auth-label">Email đăng nhập</label>
                <div className="auth-input-container">
                  <div className="auth-input-icon">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    className="auth-input"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label className="auth-label" style={{ margin: 0 }}>Mật khẩu</label>
                  <Link to="/forgot-password" style={{ fontSize: '12px', color: 'var(--primary, #9b6aff)', fontWeight: 700, textDecoration: 'none' }}>
                    Quên mật khẩu?
                  </Link>
                </div>
                <div className="auth-input-container">
                  <div className="auth-input-icon">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPw ? 'text' : 'password'}
                    className="auth-input"
                    placeholder="Nhập mật khẩu..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="auth-pw-toggle"
                    onClick={() => setShowPw(!showPw)}
                    tabIndex="-1"
                  >
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                <LogIn size={18} />
                {loading ? 'Đang xác thực...' : 'Đăng nhập vào hệ thống'}
              </button>
            </form>

            <div className="auth-card-footer">
              Chưa có tài khoản?{' '}
              <Link to="/register">
                Đăng ký ngay miễn phí
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

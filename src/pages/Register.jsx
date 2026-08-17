import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  UserPlus, AlertCircle, ArrowLeft, Mail, Lock, User, 
  KeyRound, Loader2, CheckCircle2, Eye, EyeOff, Sparkles, 
  Video, Flame, ShieldCheck, HeartHandshake 
} from 'lucide-react';
import { authApi } from '../services/api';
import logoImg from '../assets/EXE201/logo.02-04.png';
import './Auth.css';

const RegisterPage = ({ setRole }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: form info, 2: OTP verification
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  // Step 1: Send OTP to email
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }
    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    setLoading(true);
    try {
      await authApi.sendRegisterOtp(email);
      setStep(2);
    } catch (err) {
      setError(err.message || 'Không thể gửi mã OTP. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and complete registration
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authApi.register({
        email,
        password,
        fullName,
        otpCode,
      });

      // Auto login after successful registration
      localStorage.setItem('accessToken', res.accessToken);
      if (res.refreshToken) localStorage.setItem('refreshToken', res.refreshToken);
      
      const user = await authApi.me();
      let role = user.role || 'Student';
      if (role === 'Learner') role = 'Student';
      setRole(role);
      localStorage.setItem('userRole', role);
      if (user.fullName) localStorage.setItem('fullName', user.fullName);
      if (user.centerId && user.centerId !== 0 && user.centerId !== '0') {
        localStorage.setItem('centerId', user.centerId.toString());
      } else {
        localStorage.removeItem('centerId');
      }

      navigate('/student');
    } catch (err) {
      setError(err.message || 'Đăng ký thất bại. Vui lòng kiểm tra mã OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-blob-1" />
      <div className="auth-bg-blob-2" />

      <div className="auth-container">
        {/* LEFT COLUMN: DYNAMIC VALUE PROPOSITION */}
        <div className="auth-hero-side">
          <div className="auth-brand-badge">
            <span className="auth-brand-badge-dot" />
            Khởi đầu hành trình học VSL
          </div>

          <h1 className="auth-hero-title">
            Gia nhập cộng đồng <span>SignMate</span> ngay hôm nay
          </h1>

          <p className="auth-hero-desc">
            Trải nghiệm phương pháp học Ngôn ngữ Ký hiệu hiện đại, tương tác 1-1 cùng trợ lý AI và kết nối với cộng đồng người khiếm thính Việt Nam.
          </p>

          {/* Feature highlights for register */}
          <div className="auth-ai-showcase" style={{ background: 'linear-gradient(145deg, #1e1533 0%, #130d24 100%)' }}>
            <div className="auth-ai-showcase-header">
              <div className="auth-ai-showcase-status">
                <Sparkles size={16} color="#f8d80f" />
                <span>Quyền lợi tài khoản mới</span>
              </div>
              <div className="auth-ai-showcase-score" style={{ background: 'rgba(155, 106, 255, 0.2)', borderColor: 'rgba(155, 106, 255, 0.4)', color: '#c084fc' }}>
                Gói Miễn Phí 0đ
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', margin: '8px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#e2d9f3', fontSize: '14px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399', flexShrink: 0 }}>
                  <CheckCircle2 size={16} />
                </div>
                <span>Truy cập bài học giao tiếp & bảng chữ cái chuẩn VSL</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#e2d9f3', fontSize: '14px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(155, 106, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c084fc', flexShrink: 0 }}>
                  <Video size={16} />
                </div>
                <span>Gương tập AI nhận diện tư thế qua Camera máy tính/điện thoại</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#e2d9f3', fontSize: '14px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(248, 216, 15, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f8d80f', flexShrink: 0 }}>
                  <Flame size={16} />
                </div>
                <span>Duy trì chuỗi ngày học Streak và nhận huy hiệu danh giá</span>
              </div>
            </div>
          </div>

          <div className="auth-highlights">
            <div className="auth-highlight-item">
              <div className="auth-highlight-icon">
                <ShieldCheck size={20} />
              </div>
              <div>
                <div className="auth-highlight-title">Bảo mật thông tin</div>
                <div className="auth-highlight-desc">Mã hóa dữ liệu và xác thực an toàn qua mã OTP.</div>
              </div>
            </div>

            <div className="auth-highlight-item">
              <div className="auth-highlight-icon">
                <HeartHandshake size={20} />
              </div>
              <div>
                <div className="auth-highlight-title">Học tập đa nền tảng</div>
                <div className="auth-highlight-desc">Đồng bộ tiến độ học liền mạch trên Web và Mobile.</div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: REGISTER FORM CARD */}
        <div className="auth-form-side">
          <div className="auth-form-card">
            <Link to="/" className="auth-back-link">
              <ArrowLeft size={16} /> Về trang chủ
            </Link>

            <div className="auth-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <img src={logoImg} alt="SignMate" style={{ height: '36px', objectFit: 'contain' }} />
              </div>
              <h2 className="auth-card-title">
                {step === 1 ? 'Đăng ký tài khoản' : 'Xác thực mã OTP'}
              </h2>
              <p className="auth-card-subtitle">
                {step === 1 ? 'Điền thông tin để bắt đầu học tập cùng SignMate' : `Mã 6 chữ số đã được gửi tới ${email}`}
              </p>
            </div>

            {/* Step Progress Bar */}
            <div className="auth-step-bar">
              <div className={`auth-step-circle ${step >= 1 ? 'active' : 'inactive'}`}>
                {step > 1 ? <CheckCircle2 size={16} /> : '1'}
              </div>
              <div className={`auth-step-line ${step >= 2 ? 'active' : ''}`} />
              <div className={`auth-step-circle ${step >= 2 ? 'active' : 'inactive'}`}>
                2
              </div>
            </div>

            {error && (
              <div className="auth-error-banner">
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            {step === 1 && (
              <form onSubmit={handleSendOtp}>
                <div className="auth-input-group">
                  <label className="auth-label">Họ và tên của bạn</label>
                  <div className="auth-input-container">
                    <div className="auth-input-icon">
                      <User size={18} />
                    </div>
                    <input
                      type="text"
                      className="auth-input"
                      placeholder="Ví dụ: Nguyễn Văn An"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="auth-input-group">
                  <label className="auth-label">Địa chỉ Email</label>
                  <div className="auth-input-container">
                    <div className="auth-input-icon">
                      <Mail size={18} />
                    </div>
                    <input
                      type="email"
                      className="auth-input"
                      placeholder="email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="auth-input-group">
                  <label className="auth-label">Mật khẩu</label>
                  <div className="auth-input-container">
                    <div className="auth-input-icon">
                      <Lock size={18} />
                    </div>
                    <input
                      type={showPw ? 'text' : 'password'}
                      className="auth-input"
                      placeholder="Tối thiểu 6 ký tự..."
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
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

                <div className="auth-input-group">
                  <label className="auth-label">Xác nhận mật khẩu</label>
                  <div className="auth-input-container">
                    <div className="auth-input-icon">
                      <Lock size={18} />
                    </div>
                    <input
                      type={showConfirmPw ? 'text' : 'password'}
                      className="auth-input"
                      placeholder="Nhập lại mật khẩu..."
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="auth-pw-toggle"
                      onClick={() => setShowConfirmPw(!showConfirmPw)}
                      tabIndex="-1"
                    >
                      {showConfirmPw ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button type="submit" className="auth-submit-btn" disabled={loading}>
                  {loading ? (
                    <><Loader2 size={18} className="spinning" /> Đang gửi mã OTP...</>
                  ) : (
                    <><Mail size={18} /> Nhận mã xác thực qua Email</>
                  )}
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleRegister}>
                <div style={{
                  background: '#f0fdf4',
                  border: '1.5px solid #bbf7d0',
                  borderRadius: '12px',
                  padding: '14px',
                  marginBottom: '20px',
                  fontSize: '13px',
                  color: '#166534',
                  textAlign: 'center'
                }}>
                  <CheckCircle2 size={20} style={{ margin: '0 auto 6px', color: '#16a34a' }} />
                  <div>Mã OTP đã được gửi thành công!</div>
                  <div style={{ fontSize: '12px', color: '#15803d', marginTop: '2px' }}>
                    Vui lòng kiểm tra hộp thư đến (hoặc thư rác/spam).
                  </div>
                </div>

                <div className="auth-input-group">
                  <label className="auth-label">Nhập mã OTP (6 chữ số)</label>
                  <div className="auth-input-container">
                    <div className="auth-input-icon">
                      <KeyRound size={18} />
                    </div>
                    <input
                      type="text"
                      className="auth-input"
                      placeholder="• • • • • •"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      required
                      maxLength={6}
                      style={{ textAlign: 'center', fontSize: '20px', fontWeight: 900, letterSpacing: '6px' }}
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="auth-submit-btn" 
                  disabled={loading || otpCode.length !== 6}
                >
                  {loading ? (
                    <><Loader2 size={18} className="spinning" /> Đang kích hoạt tài khoản...</>
                  ) : (
                    <><UserPlus size={18} /> Hoàn tất đăng ký & Đăng nhập</>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => { setStep(1); setError(''); setOtpCode(''); }}
                  style={{
                    width: '100%',
                    marginTop: '12px',
                    padding: '11px',
                    background: 'transparent',
                    border: '1.5px solid #e5deef',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#6b6480',
                    transition: 'all 0.2s'
                  }}
                >
                  ← Chỉnh sửa lại thông tin
                </button>
              </form>
            )}

            <div className="auth-card-footer">
              Đã có tài khoản?{' '}
              <Link to="/login">
                Đăng nhập ngay
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

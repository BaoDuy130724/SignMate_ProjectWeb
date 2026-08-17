import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  KeyRound, AlertCircle, ArrowLeft, Mail, Lock, 
  CheckCircle2, Loader2, Eye, EyeOff, ShieldAlert, Sparkles 
} from 'lucide-react';
import { authApi } from '../services/api';
import logoImg from '../assets/EXE201/logo.02-04.png';
import './Auth.css';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1); // 1 = Request OTP, 2 = Verify OTP & Reset
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await authApi.forgotPassword({ email });
      setMessage('Mã OTP khôi phục đã được gửi tới email của bạn.');
      setStep(2);
    } catch (err) {
      setError(err.message || 'Không thể gửi OTP. Vui lòng kiểm tra lại email.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await authApi.resetPassword({ email, otp, newPassword });
      setMessage('Mật khẩu của bạn đã được đặt lại thành công.');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Mã OTP không hợp lệ hoặc đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-blob-1" />
      <div className="auth-bg-blob-2" />

      <div className="auth-container">
        {/* LEFT COLUMN: HERO INFO */}
        <div className="auth-hero-side">
          <div className="auth-brand-badge">
            <span className="auth-brand-badge-dot" />
            Bảo mật & Khôi phục
          </div>

          <h1 className="auth-hero-title">
            Khôi phục quyền truy cập <span>SignMate</span>
          </h1>

          <p className="auth-hero-desc">
            Đừng lo lắng! Hãy nhập địa chỉ email bạn đã đăng ký để nhận mã xác thực OTP và thiết lập mật khẩu mới an toàn.
          </p>

          <div className="auth-highlights">
            <div className="auth-highlight-item">
              <div className="auth-highlight-icon">
                <ShieldAlert size={20} />
              </div>
              <div>
                <div className="auth-highlight-title">Xác thực 2 lớp OTP</div>
                <div className="auth-highlight-desc">Mã OTP có hiệu lực bảo mật trong vòng 5 phút.</div>
              </div>
            </div>

            <div className="auth-highlight-item">
              <div className="auth-highlight-icon">
                <Sparkles size={20} />
              </div>
              <div>
                <div className="auth-highlight-title">Hỗ trợ 24/7</div>
                <div className="auth-highlight-desc">Liên hệ admin nếu bạn gặp sự cố khi nhận email.</div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: FORGOT PW FORM */}
        <div className="auth-form-side">
          <div className="auth-form-card">
            <Link to="/login" className="auth-back-link">
              <ArrowLeft size={16} /> Quay lại đăng nhập
            </Link>

            <div className="auth-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <img src={logoImg} alt="SignMate" style={{ height: '36px', objectFit: 'contain' }} />
              </div>
              <h2 className="auth-card-title">
                {step === 1 ? 'Quên mật khẩu' : 'Đặt lại mật khẩu'}
              </h2>
              <p className="auth-card-subtitle">
                {step === 1 ? 'Nhập email để nhận mã OTP khôi phục' : `Nhập mã OTP từ email và mật khẩu mới`}
              </p>
            </div>

            {error && (
              <div className="auth-error-banner">
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            {message && (
              <div style={{
                background: '#f0fdf4',
                border: '1.5px solid #bbf7d0',
                borderRadius: '12px',
                padding: '12px 14px',
                marginBottom: '18px',
                fontSize: '13px',
                color: '#166534',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <CheckCircle2 size={18} style={{ color: '#16a34a', flexShrink: 0 }} />
                <span>{message}</span>
              </div>
            )}

            {step === 1 && (
              <form onSubmit={handleSendOtp}>
                <div className="auth-input-group">
                  <label className="auth-label">Địa chỉ Email tài khoản</label>
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

                <button type="submit" className="auth-submit-btn" disabled={loading}>
                  {loading ? (
                    <><Loader2 size={18} className="spinning" /> Đang gửi mã...</>
                  ) : (
                    <><Mail size={18} /> Gửi mã OTP xác nhận</>
                  )}
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleResetPassword}>
                <div className="auth-input-group">
                  <label className="auth-label">Mã OTP (6 chữ số)</label>
                  <div className="auth-input-container">
                    <div className="auth-input-icon">
                      <KeyRound size={18} />
                    </div>
                    <input
                      type="text"
                      className="auth-input"
                      placeholder="• • • • • •"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      required
                      maxLength={6}
                      style={{ textAlign: 'center', fontSize: '18px', fontWeight: 800, letterSpacing: '4px' }}
                    />
                  </div>
                </div>

                <div className="auth-input-group">
                  <label className="auth-label">Mật khẩu mới</label>
                  <div className="auth-input-container">
                    <div className="auth-input-icon">
                      <Lock size={18} />
                    </div>
                    <input
                      type={showPw ? 'text' : 'password'}
                      className="auth-input"
                      placeholder="Tối thiểu 6 ký tự..."
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
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

                <button type="submit" className="auth-submit-btn" disabled={loading || otp.length !== 6}>
                  {loading ? (
                    <><Loader2 size={18} className="spinning" /> Đang cập nhật...</>
                  ) : (
                    <><Lock size={18} /> Cập nhật mật khẩu mới</>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => { setStep(1); setError(''); setMessage(''); setOtp(''); }}
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
                    color: '#6b6480'
                  }}
                >
                  ← Nhập lại email khác
                </button>
              </form>
            )}

            <div className="auth-card-footer">
              Nhớ lại mật khẩu?{' '}
              <Link to="/login">
                Đăng nhập
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, AlertCircle, ArrowLeft, Mail, Lock, User, KeyRound, Loader2, CheckCircle2 } from 'lucide-react';
import { authApi } from '../services/api';

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
  const [otpSent, setOtpSent] = useState(false);

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
      setOtpSent(true);
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
      
      const user = await authApi.me();
      const role = user.role || 'Student';
      setRole(role);
      localStorage.setItem('userRole', role);
      if (user.fullName) localStorage.setItem('fullName', user.fullName);

      navigate('/student');
    } catch (err) {
      setError(err.message || 'Đăng ký thất bại. Vui lòng kiểm tra mã OTP.');
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
        maxWidth: '480px',
        width: '100%',
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

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '36px', fontWeight: 900, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>
            SignMate
          </div>
          <p style={{ color: 'var(--gray-400)', fontSize: '16px', margin: 0 }}>
            {step === 1 ? 'Tạo tài khoản mới' : 'Xác thực email của bạn'}
          </p>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px', justifyContent: 'center' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: 'var(--primary)', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px', fontWeight: 800
          }}>
            {step > 1 ? <CheckCircle2 size={18} /> : '1'}
          </div>
          <div style={{ width: '60px', height: '3px', background: step >= 2 ? 'var(--primary)' : 'var(--gray-200)', borderRadius: '2px', transition: 'background 0.3s' }} />
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: step >= 2 ? 'var(--primary)' : 'var(--gray-200)',
            color: step >= 2 ? 'white' : 'var(--gray-400)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px', fontWeight: 800, transition: 'all 0.3s'
          }}>
            2
          </div>
        </div>

        {error && (
          <div style={{
            background: '#ffebee', border: '2px solid var(--red)', borderRadius: 'var(--radius-md)',
            padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px',
            fontSize: '14px', color: 'var(--red-dark)', fontWeight: 600, textAlign: 'left'
          }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleSendOtp}>
            <div className="form-group" style={{ textAlign: 'left' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={14} /> Họ và tên
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Nguyễn Văn A"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ textAlign: 'left' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mail size={14} /> Email
              </label>
              <input
                type="email"
                className="form-input"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ textAlign: 'left' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lock size={14} /> Mật khẩu
              </label>
              <input
                type="password"
                className="form-input"
                placeholder="Tối thiểu 6 ký tự"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <div className="form-group" style={{ textAlign: 'left' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lock size={14} /> Xác nhận mật khẩu
              </label>
              <input
                type="password"
                className="form-input"
                placeholder="Nhập lại mật khẩu"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={loading}>
              {loading ? (
                <><Loader2 size={18} className="spinning" style={{ marginRight: '8px' }} /> Đang gửi mã OTP...</>
              ) : (
                <><Mail size={18} style={{ marginRight: '8px' }} /> Gửi mã xác thực</>
              )}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleRegister}>
            <div style={{
              background: 'var(--green-soft, #e8f5e9)', border: '2px solid var(--green, #4caf50)',
              borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '20px',
              fontSize: '14px', color: 'var(--green-dark, #2e7d32)', fontWeight: 600, textAlign: 'center'
            }}>
              <CheckCircle2 size={20} style={{ marginBottom: '4px' }} />
              <div>Mã OTP đã được gửi tới <strong>{email}</strong></div>
              <div style={{ fontSize: '12px', fontWeight: 500, opacity: 0.8, marginTop: '4px' }}>
                Vui lòng kiểm tra hộp thư (kể cả thư rác)
              </div>
            </div>

            <div className="form-group" style={{ textAlign: 'left' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <KeyRound size={14} /> Mã OTP (6 số)
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Nhập mã 6 số"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                maxLength={6}
                style={{ textAlign: 'center', fontSize: '24px', fontWeight: 900, letterSpacing: '8px' }}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={loading || otpCode.length !== 6}>
              {loading ? (
                <><Loader2 size={18} className="spinning" style={{ marginRight: '8px' }} /> Đang tạo tài khoản...</>
              ) : (
                <><UserPlus size={18} style={{ marginRight: '8px' }} /> Hoàn tất đăng ký</>
              )}
            </button>

            <button
              type="button"
              onClick={() => { setStep(1); setError(''); setOtpCode(''); }}
              style={{
                width: '100%', marginTop: '12px', padding: '10px',
                background: 'transparent', border: '2px solid var(--gray-200)',
                borderRadius: 'var(--radius-md)', cursor: 'pointer',
                fontSize: '14px', fontWeight: 700, color: 'var(--gray-400)'
              }}
            >
              ← Quay lại chỉnh sửa thông tin
            </button>
          </form>
        )}

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: 'var(--gray-400)' }}>
          Đã có tài khoản?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

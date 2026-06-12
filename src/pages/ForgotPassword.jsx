import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Key, AlertCircle, ArrowLeft, Mail, ShieldAlert, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { authApi } from '../services/api';

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
      }, 2000);
    } catch (err) {
      setError(err.message || 'Mã OTP không hợp lệ hoặc đã hết hạn.');
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
          <Link to="/login" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            color: 'var(--gray-400)', fontWeight: 700, fontSize: '14px',
            textDecoration: 'none'
          }}>
            <ArrowLeft size={16} /> Quay lại đăng nhập
          </Link>
        </div>
        <div style={{ fontSize: '36px', fontWeight: 900, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>
          Quên mật khẩu
        </div>
        <p style={{ color: 'var(--gray-400)', fontSize: '15px', marginBottom: '24px' }}>
          {step === 1 ? 'Nhập email để nhận mã OTP đặt lại mật khẩu' : 'Nhập mã OTP và mật khẩu mới'}
        </p>

        {error && (
          <div style={{
            background: '#ffebee', border: '2px solid var(--red)', borderRadius: 'var(--radius-md)',
            padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px',
            fontSize: '14px', color: 'var(--red-dark)', fontWeight: 600, textAlign: 'left'
          }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {message && (
          <div style={{
            background: '#e8f5e9', border: '2px solid var(--green)', borderRadius: 'var(--radius-md)',
            padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px',
            fontSize: '14px', color: 'var(--green-dark)', fontWeight: 600, textAlign: 'left'
          }}>
            <CheckCircle size={18} style={{ color: 'var(--green)' }} /> {message}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendOtp}>
            <div className="form-group" style={{ textAlign: 'left' }}>
              <label className="form-label">Email</label>
              <input type="email" className="form-input" placeholder="example@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={loading}>
              <Mail size={18} /> {loading ? 'Đang gửi mã...' : 'Nhận mã OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <div className="form-group" style={{ textAlign: 'left' }}>
              <label className="form-label">Mã OTP</label>
              <input type="text" className="form-input" placeholder="Nhập 6 số OTP" value={otp} onChange={(e) => setOtp(e.target.value)} required />
            </div>
            <div className="form-group" style={{ textAlign: 'left' }}>
              <label className="form-label">Mật khẩu mới</label>
              <div style={{ position: 'relative' }}>
                <input type={showPw ? 'text' : 'password'} className="form-input" placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required style={{ paddingRight: '44px' }} />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)',
                }}>
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={loading}>
              <Key size={18} /> {loading ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

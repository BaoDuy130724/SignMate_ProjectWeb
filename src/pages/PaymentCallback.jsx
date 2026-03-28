import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { API_BASE } from '../services/api';

const PaymentCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('Đang xử lý kết quả thanh toán...');

  useEffect(() => {
    const processPayment = async () => {
      // Get the full query string returned by VNPay
      const queryString = location.search;
      
      if (!queryString) {
        setStatus('error');
        setMessage('Không tìm thấy thông tin thanh toán.');
        return;
      }

      try {
        // Send the VNPay callback data to our backend to validate and update the database
        const res = await fetch(`${API_BASE}/subscription/vnpay-return${queryString}`, {
          method: 'GET',
        });

        if (res.ok) {
          // The backend HTML page will be returned if successful, meaning DB is updated
          setStatus('success');
          setMessage('Thanh toán thành công! Gói cước của bạn đã được kích hoạt.');
          
          // Auto redirect to dashboard after 3 seconds
          setTimeout(() => {
            const role = localStorage.getItem('userRole');
            if (role === 'Student') navigate('/student');
            else if (role === 'CenterAdmin') navigate('/center');
            else navigate('/');
          }, 3000);
        } else {
          setStatus('error');
          setMessage('Thanh toán thất bại hoặc chữ ký không hợp lệ.');
        }
      } catch (err) {
        setStatus('error');
        setMessage('Lỗi kết nối máy chủ khi xác nhận thanh toán.');
      }
    };

    processPayment();
  }, [location.search, navigate]);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: 'var(--gray-50)', padding: '20px'
    }}>
      <div className="card" style={{ 
        maxWidth: '400px', width: '100%', textAlign: 'center', padding: '48px 32px',
        borderTop: status === 'success' ? '4px solid var(--green)' : status === 'error' ? '4px solid var(--red)' : '4px solid var(--primary)'
      }}>
        {status === 'loading' && (
          <>
            <Loader2 className="spinning" size={64} color="var(--primary)" style={{ margin: '0 auto 24px' }} />
            <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Đang xác nhận...</h2>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 size={64} color="var(--green)" style={{ margin: '0 auto 24px' }} />
            <h2 style={{ fontSize: '24px', marginBottom: '8px', color: 'var(--green-dark)' }}>Giao dịch thành công</h2>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle size={64} color="var(--red)" style={{ margin: '0 auto 24px' }} />
            <h2 style={{ fontSize: '24px', marginBottom: '8px', color: 'var(--red-dark)' }}>Giao dịch thất bại</h2>
          </>
        )}

        <p style={{ color: 'var(--gray-400)', fontSize: '15px', marginBottom: '32px' }}>{message}</p>

        {status !== 'loading' && (
          <Link to="/" className={`btn ${status === 'success' ? 'btn-primary' : 'btn-outline'}`} style={{ width: '100%' }}>
            Về trang chủ <ArrowRight size={18} style={{ marginLeft: '8px' }} />
          </Link>
        )}
      </div>

      <style>{`
        .spinning { animation: spin 2s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default PaymentCallback;

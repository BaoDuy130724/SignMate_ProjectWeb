import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { subscriptionApi } from '../services/api';

// Đọc kết quả từ query string của PayOS — chỉ dùng làm "gợi ý" nhanh
// để báo thất bại sớm; thành công PHẢI được xác nhận lại với server.
const readGatewayHint = (params) => {
  if (params.get('cancel') === 'true') return 'failed';
  const payosCode = params.get('code');
  if (payosCode !== null) return payosCode === '00' ? 'success' : 'failed';
  const payosStatus = params.get('status');
  if (payosStatus !== null) return payosStatus === 'PAID' ? 'success' : 'failed';
  return 'unknown';
};


const PaymentCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('Đang xử lý kết quả thanh toán...');

  useEffect(() => {
    let cancelled = false;

    // Nguồn sự thật là server: gói chỉ được kích hoạt qua IPN/webhook của cổng
    // thanh toán. Poll /subscription/me một lúc để chờ IPN về.
    const confirmWithServer = async () => {
      const pendingPlanId = Number(localStorage.getItem('pendingPlanId')) || null;
      for (let attempt = 0; attempt < 5; attempt++) {
        if (cancelled) return false;
        try {
          const sub = await subscriptionApi.getMyPlan(); // 404 khi chưa có gói active
          if (sub && sub.isActive && (!pendingPlanId || sub.planId === pendingPlanId)) {
            return true;
          }
        } catch {
          // 404 / lỗi mạng: chưa ghi nhận — chờ rồi thử lại
        }
        await new Promise((r) => setTimeout(r, 2000));
      }
      return false;
    };

    const processPayment = async () => {
      const params = new URLSearchParams(location.search);

      if (!location.search) {
        setStatus('error');
        setMessage('Không tìm thấy thông tin thanh toán.');
        return;
      }

      const hint = readGatewayHint(params);
      if (hint === 'failed') {
        setStatus('error');
        setMessage('Thanh toán đã bị hủy hoặc không thành công. Bạn chưa bị trừ tiền cho gói này.');
        return;
      }

      setMessage('Đang xác nhận giao dịch với máy chủ...');
      
      // Kích hoạt thủ công qua API verify (cứu cánh cho test localhost khi webhook không tới)
      const orderCode = params.get('orderCode');
      if (orderCode) {
        try {
          await subscriptionApi.verifyPayment(orderCode);
        } catch (err) {
          // Bỏ qua lỗi nếu backend báo lỗi, vì có thể webhook đã xử lý xong rồi
          console.warn('Verify payment failed (might be processed already):', err);
        }
      }

      const confirmed = await confirmWithServer();
      if (cancelled) return;

      if (confirmed) {
        localStorage.removeItem('pendingPlanId');
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
        setMessage('Chưa ghi nhận được thanh toán cho gói của bạn. Nếu bạn đã bị trừ tiền, hệ thống sẽ tự xác nhận trong ít phút — hãy kiểm tra lại ở trang gói cước.');
      }
    };

    processPayment();
    return () => {
      cancelled = true;
    };
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

import React from 'react';
import { Smartphone, Download, LogOut } from 'lucide-react';

const StudentDashboard = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '70vh',
      textAlign: 'center',
      padding: '40px 20px'
    }}>
      <div style={{
        width: '120px',
        height: '120px',
        background: 'var(--primary-light)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '24px',
        color: 'var(--primary)'
      }}>
        <Smartphone size={64} />
      </div>

      <h1 style={{ fontSize: '32px', marginBottom: '16px', color: 'var(--text-dark)' }}>
        Chào mừng bạn đến với SignMate! 👋
      </h1>
      
      <p style={{
        fontSize: '18px',
        color: 'var(--gray-500)',
        maxWidth: '560px',
        lineHeight: '1.6',
        marginBottom: '36px'
      }}>
        Trải nghiệm học ngôn ngữ ký hiệu với AI Corrective Feedback được tối ưu hóa rành riêng cho điện thoại di động. 
        Vui lòng mở ứng dụng SignMate trên thiết bị di động của bạn để bắt đầu hành trình học tập!
      </p>

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button className="btn btn-primary btn-lg" style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '220px', justifyContent: 'center' }}>
          <Download size={24} />
          <div style={{ textAlign: 'left', lineHeight: '1.2' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 600 }}>Tải xuống trên</div>
            <div style={{ fontSize: '18px', fontWeight: 800 }}>App Store</div>
          </div>
        </button>
        
        <button className="btn btn-primary btn-lg" style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '220px', justifyContent: 'center' }}>
          <Download size={24} />
          <div style={{ textAlign: 'left', lineHeight: '1.2' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 600 }}>Tải xuống từ</div>
            <div style={{ fontSize: '18px', fontWeight: 800 }}>Google Play</div>
          </div>
        </button>
      </div>

      <button 
        className="btn btn-outline" 
        style={{ marginTop: '48px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        onClick={() => window.location.href = '/login'}
      >
        <LogOut size={18} /> Đăng xuất khỏi Web
      </button>
    </div>
  );
};

export default StudentDashboard;

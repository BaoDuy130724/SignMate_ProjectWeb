import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-logo">SignMate</div>
            <p className="footer-desc">
              Nền tảng học ngôn ngữ ký hiệu với AI Corrective Feedback. 
              Giúp người học nhận diện đúng - sai và cải thiện kỹ năng mỗi ngày.
            </p>
            <div style={{ marginTop: '24px', fontSize: '14px', color: 'var(--gray-300)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ fontSize: '18px' }}>📞</span> 0912 345 678 (B2B Hỗ trợ)
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ fontSize: '18px' }}>✉️</span> contact@signmate.vn
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <span style={{ fontSize: '18px', marginTop: '-2px' }}>📍</span> Tòa nhà Bitexco, Số 2 Hải Triều, Q.1, TP.HCM
              </div>
            </div>
          </div>
          <div>
            <div className="footer-title">Sản phẩm</div>
            <a href="#" className="footer-link">Tính năng</a>
            <a href="/pricing" className="footer-link">Nâng cấp</a>
            <a href="#" className="footer-link">API</a>
          </div>
          <div>
            <div className="footer-title">Công ty</div>
            <a href="/about" className="footer-link">Về chúng tôi</a>
            <a href="/contact" className="footer-link">Liên hệ</a>
            <a href="#" className="footer-link">Blog</a>
          </div>
          <div>
            <div className="footer-title">Hỗ trợ</div>
            <a href="#" className="footer-link">Tài liệu</a>
            <a href="#" className="footer-link">FAQ</a>
            <a href="#" className="footer-link">Chính sách</a>
          </div>
        </div>
        <div className="footer-bottom">
          © 2026 SignMate. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;

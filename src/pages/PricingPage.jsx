import React from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';

const PricingPage = () => {
  return (
    <section className="section" style={{ paddingTop: '140px' }}>
      <div className="container text-center">
        <span className="section-label">🚀 Nâng cấp</span>
        <h2 className="section-title">Chọn gói phù hợp với bạn</h2>
        <p className="section-subtitle mx-auto">
          Bắt đầu miễn phí, nâng cấp khi bạn cần thêm tính năng
        </p>

        {/* B2C Plans */}
        <h3 style={{ marginTop: '60px', marginBottom: '8px', color: 'var(--primary)' }}>
          🧑 Dành cho Cá nhân (B2C)
        </h3>
        <div className="pricing-grid">
          <div className="pricing-card">
            <div className="pricing-name">Free</div>
            <div className="pricing-price">0đ<span>/tháng</span></div>
            <p className="pricing-desc">Trải nghiệm cơ bản hoàn toàn miễn phí</p>
            <ul className="pricing-features">
              <li><Check size={18} className="check" /> 5 bài học / ngày</li>
              <li><Check size={18} className="check" /> AI Feedback cơ bản</li>
              <li><Check size={18} className="check" /> Theo dõi tiến độ</li>
            </ul>
            <Link to="/" className="btn btn-outline" style={{ width: '100%' }}>Bắt đầu ngay</Link>
          </div>

          <div className="pricing-card popular">
            <div className="pricing-badge">Phổ biến</div>
            <div className="pricing-name">Basic</div>
            <div className="pricing-price">49k<span>/tháng</span></div>
            <p className="pricing-desc">Dành cho người muốn học nghiêm túc</p>
            <ul className="pricing-features">
              <li><Check size={18} className="check" /> Không giới hạn bài học</li>
              <li><Check size={18} className="check" /> AI Feedback nâng cao</li>
              <li><Check size={18} className="check" /> Theo dõi tiến độ chi tiết</li>
              <li><Check size={18} className="check" /> Luyện tập theo chủ đề</li>
            </ul>
            <Link to="/" className="btn btn-primary" style={{ width: '100%' }}>Nâng cấp ngay</Link>
          </div>

          <div className="pricing-card">
            <div className="pricing-name">Pro</div>
            <div className="pricing-price">99k<span>/tháng</span></div>
            <p className="pricing-desc">Mọi tính năng cao cấp nhất</p>
            <ul className="pricing-features">
              <li><Check size={18} className="check" /> Tất cả tính năng Basic</li>
              <li><Check size={18} className="check" /> Phân tích chuyên sâu AI</li>
              <li><Check size={18} className="check" /> Lộ trình cá nhân hóa</li>
              <li><Check size={18} className="check" /> Hỗ trợ ưu tiên</li>
              <li><Check size={18} className="check" /> Xuất báo cáo PDF</li>
            </ul>
            <Link to="/" className="btn btn-blue" style={{ width: '100%' }}>Nâng cấp ngay</Link>
          </div>
        </div>

        {/* B2B Plan */}
        <h3 style={{ marginTop: '80px', marginBottom: '8px', color: 'var(--blue)' }}>
          🏫 Dành cho Trung tâm / Trường học (B2B)
        </h3>
        <div style={{ maxWidth: '500px', margin: '0 auto', marginTop: '24px' }}>
          <div className="pricing-card" style={{ border: '2px solid var(--blue)', textAlign: 'center' }}>
            <div className="pricing-name" style={{ color: 'var(--blue)' }}>Enterprise</div>
            <div className="pricing-price">79k<span>/học viên/tháng</span></div>
            <p className="pricing-desc">Tối thiểu 20 seats • Hỗ trợ chuyên biệt cho tổ chức</p>
            <ul className="pricing-features">
              <li><Check size={18} className="check" /> Dashboard quản lý dành riêng</li>
              <li><Check size={18} className="check" /> Quản lý lớp học & giáo viên</li>
              <li><Check size={18} className="check" /> Báo cáo tiến độ từng học viên</li>
              <li><Check size={18} className="check" /> Xuất báo cáo PDF hàng tuần</li>
              <li><Check size={18} className="check" /> Hỗ trợ kỹ thuật chuyên trách</li>
            </ul>
            <Link to="/contact" className="btn btn-blue" style={{ width: '100%' }}>
              Liên hệ chúng tôi <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingPage;

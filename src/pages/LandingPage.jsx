import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, CheckCircle, Zap } from 'lucide-react';

const LandingPage = () => {
  return (
    <>
      {/* ===== HERO ===== */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <span className="section-label">🤟 Học ngôn ngữ ký hiệu cùng AI</span>
              <h1>
                Học ký hiệu <span className="highlight">thông minh</span> hơn, không phải khó hơn
              </h1>
              <p>
                SignMate sử dụng AI Corrective Feedback giúp bạn nhận diện đúng - sai ngay lập tức.
                Luyện tập mọi lúc, tiến bộ mỗi ngày.
              </p>
              <div className="hero-buttons" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <a href="#" className="store-badge" title="Tải trên App Store">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="Download on the App Store" style={{ height: '48px', width: 'auto' }} />
                </a>
                <a href="#" className="store-badge" title="Tải trên Google Play">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Get it on Google Play" style={{ height: '48px', width: 'auto' }} />
                </a>
              </div>
            </div>

            <div className="hero-visual">
              <div className="hero-card">
                <div className="hero-card-header">
                  <div className="hero-card-avatar">M</div>
                  <div>
                    <div className="hero-card-name">Minh Anh</div>
                    <div className="hero-card-role">Chuỗi 12 ngày liên tục 🔥</div>
                  </div>
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#afafaf', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Tiến độ hôm nay
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '75%' }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#afafaf', fontWeight: 600 }}>
                  <span>75% hoàn thành</span>
                  <span>3/4 bài</span>
                </div>
                <div className="hero-card-signs">
                  <span className="sign-badge completed">✅ Xin chào</span>
                  <span className="sign-badge completed">✅ Cảm ơn</span>
                  <span className="sign-badge">📝 Xin lỗi</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PROBLEM SECTION ===== */}
      <section className="section section-alt">
        <div className="container text-center">
          <span className="section-label">😟 Vấn đề</span>
          <h2 className="section-title">Người học đang gặp khó khăn gì?</h2>
          <p className="section-subtitle mx-auto" style={{ marginBottom: '48px' }}>
            Những rào cản khiến việc học ngôn ngữ ký hiệu trở nên kém hiệu quả
          </p>
          <div className="grid-2" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="card" style={{ textAlign: 'left' }}>
              <div className="card-icon card-icon-yellow">❌</div>
              <h3 style={{ marginBottom: '8px' }}>Không biết đúng hay sai</h3>
              <p style={{ color: 'var(--gray-400)' }}>
                Người học thực hiện ký hiệu nhưng không ai phản hồi lại. Không biết mình sai ở đâu,
                đúng ở đâu — dẫn đến lặp lại lỗi cũ nhiều lần.
              </p>
            </div>
            <div className="card" style={{ textAlign: 'left' }}>
              <div className="card-icon card-icon-yellow">🔄</div>
              <h3 style={{ marginBottom: '8px' }}>Lặp lại lỗi sai</h3>
              <p style={{ color: 'var(--gray-400)' }}>
                Khi không có phản hồi chỉnh sửa (corrective feedback), người học sẽ tiếp tục luyện tập
                sai cách — và hình thành thói quen xấu rất khó sửa.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SOLUTION SECTION ===== */}
      <section className="section">
        <div className="container text-center">
          <span className="section-label">💡 Giải pháp</span>
          <h2 className="section-title">SignMate giải quyết vấn đề này như thế nào?</h2>
          <p className="section-subtitle mx-auto" style={{ marginBottom: '48px' }}>
            Công nghệ AI tiên tiến cùng phương pháp học được thiết kế cho hiệu quả tối đa
          </p>
          <div className="grid-2" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="card" style={{ textAlign: 'left' }}>
              <div className="card-icon card-icon-green">
                <Sparkles size={28} />
              </div>
              <h3 style={{ marginBottom: '8px' }}>AI Corrective Feedback</h3>
              <p style={{ color: 'var(--gray-400)' }}>
                Hệ thống AI phân tích chuyển động ký hiệu theo thời gian thực, chỉ ra chính xác
                vị trí sai và gợi ý cách sửa ngay lập tức.
              </p>
            </div>
            <div className="card" style={{ textAlign: 'left' }}>
              <div className="card-icon card-icon-blue">
                <Zap size={28} />
              </div>
              <h3 style={{ marginBottom: '8px' }}>Luyện tập mọi lúc, mọi nơi</h3>
              <p style={{ color: 'var(--gray-400)' }}>
                Chỉ cần một chiếc điện thoại có camera, bạn có thể luyện ký hiệu ở bất cứ đâu,
                bất cứ khi nào — không cần chờ giáo viên.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="section section-alt">
        <div className="container text-center">
          <span className="section-label">🔄 Quy trình</span>
          <h2 className="section-title">Cách SignMate hoạt động</h2>
          <p className="section-subtitle mx-auto">
            Chỉ cần 3 bước đơn giản để bắt đầu hành trình học ký hiệu
          </p>
          <div className="steps">
            <div className="step">
              <div className="step-number" style={{ background: 'var(--primary)' }}>1</div>
              <h3 style={{ marginBottom: '8px' }}>Practice</h3>
              <p style={{ color: 'var(--gray-400)', fontSize: '15px' }}>
                Chọn bài học và thực hành ký hiệu trước camera
              </p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number" style={{ background: 'var(--blue)' }}>2</div>
              <h3 style={{ marginBottom: '8px' }}>Feedback</h3>
              <p style={{ color: 'var(--gray-400)', fontSize: '15px' }}>
                AI phân tích và phản hồi ngay lập tức về độ chính xác
              </p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number" style={{ background: 'var(--orange)' }}>3</div>
              <h3 style={{ marginBottom: '8px' }}>Improve</h3>
              <p style={{ color: 'var(--gray-400)', fontSize: '15px' }}>
                Cải thiện dần qua từng bài tập, theo dõi tiến bộ hàng ngày
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="section" style={{ background: 'var(--primary)', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ color: 'white', marginBottom: '16px' }}>Sẵn sàng bắt đầu chưa?</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '18px', marginBottom: '32px', maxWidth: '500px', margin: '0 auto 32px' }}>
            Tham gia cùng hàng nghìn người học trên SignMate. Hoàn toàn miễn phí!
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <a href="#" className="store-badge" title="Tải trên App Store">
              <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="Download on the App Store" style={{ height: '54px', width: 'auto' }} />
            </a>
            <a href="#" className="store-badge" title="Tải trên Google Play">
              <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Get it on Google Play" style={{ height: '54px', width: 'auto' }} />
            </a>
          </div>
        </div>
      </section>
    </>
  );
};

export default LandingPage;

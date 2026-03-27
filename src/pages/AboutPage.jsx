import React from 'react';
import { Heart, Target, Eye, Users, Lightbulb } from 'lucide-react';

const AboutPage = () => {
  const team = [
    { name: 'Nguyễn Văn A', role: 'Co-Founder & CEO', initials: 'A', color: 'var(--primary)' },
    { name: 'Trần Thị B', role: 'CTO', initials: 'B', color: 'var(--blue)' },
    { name: 'Lê Văn C', role: 'AI Engineer', initials: 'C', color: 'var(--yellow-dark)' },
    { name: 'Phạm Thị D', role: 'Product Designer', initials: 'D', color: 'var(--purple-dark)' },
  ];

  return (
    <>
      {/* HERO */}
      <section className="section" style={{ paddingTop: '140px', textAlign: 'center' }}>
        <div className="container">
          <span className="section-label">🤟 Về chúng tôi</span>
          <h1 style={{ marginBottom: '20px' }}>
            Kết nối thế giới qua <span style={{ color: 'var(--primary)' }}>ngôn ngữ ký hiệu</span>
          </h1>
          <p className="section-subtitle mx-auto" style={{ maxWidth: '700px', fontSize: '20px' }}>
            SignMate được xây dựng với niềm tin rằng mọi người đều xứng đáng được giao tiếp 
            và học tập hiệu quả — bất kể họ nghe hay không nghe được.
          </p>
        </div>
      </section>

      {/* MISSION & VISION */}
      <section className="section section-alt">
        <div className="container">
          <div className="grid-2">
            <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
              <div className="card-icon card-icon-green">
                <Target size={28} />
              </div>
              <h3 style={{ marginBottom: '12px' }}>Sứ mệnh (Mission)</h3>
              <p style={{ color: 'var(--gray-400)', fontSize: '16px', lineHeight: '1.8' }}>
                Xây dựng công cụ học ngôn ngữ ký hiệu dễ tiếp cận nhất Việt Nam, ứng dụng công nghệ AI 
                để mang đến phương pháp học thông minh, cá nhân hóa cho mọi người — 
                từ cá nhân tự học đến trung tâm giáo dục chuyên biệt.
              </p>
            </div>
            <div className="card" style={{ borderLeft: '4px solid var(--blue)' }}>
              <div className="card-icon card-icon-blue">
                <Eye size={28} />
              </div>
              <h3 style={{ marginBottom: '12px' }}>Tầm nhìn (Vision)</h3>
              <p style={{ color: 'var(--gray-400)', fontSize: '16px', lineHeight: '1.8' }}>
                Trở thành nền tảng EdTech hàng đầu Đông Nam Á trong lĩnh vực ngôn ngữ ký hiệu, 
                góp phần xóa bỏ rào cản giao tiếp giữa cộng đồng người khiếm thính 
                và xã hội, tạo ra một thế giới hòa nhập hơn.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="section">
        <div className="container text-center">
          <span className="section-label">💎 Giá trị cốt lõi</span>
          <h2 className="section-title" style={{ marginBottom: '48px' }}>Điều chúng tôi tin tưởng</h2>
          <div className="grid-3">
            <div className="card" style={{ textAlign: 'center' }}>
              <div className="card-icon card-icon-green" style={{ margin: '0 auto 16px' }}>
                <Heart size={28} />
              </div>
              <h3 style={{ marginBottom: '8px', fontSize: '20px' }}>Hòa nhập</h3>
              <p style={{ color: 'var(--gray-400)' }}>
                Mọi người đều xứng đáng được tiếp cận giáo dục chất lượng, 
                bất kể điều kiện thể chất.
              </p>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <div className="card-icon card-icon-blue" style={{ margin: '0 auto 16px' }}>
                <Lightbulb size={28} />
              </div>
              <h3 style={{ marginBottom: '8px', fontSize: '20px' }}>Đổi mới</h3>
              <p style={{ color: 'var(--gray-400)' }}>
                Ứng dụng AI và công nghệ tiên tiến nhất để tạo ra giải pháp 
                chưa từng có trên thị trường.
              </p>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <div className="card-icon card-icon-yellow" style={{ margin: '0 auto 16px' }}>
                <Users size={28} />
              </div>
              <h3 style={{ marginBottom: '8px', fontSize: '20px' }}>Cộng đồng</h3>
              <p style={{ color: 'var(--gray-400)' }}>
                Xây dựng cộng đồng học tập mạnh mẽ, nơi người dùng 
                hỗ trợ và truyền cảm hứng cho nhau.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section className="section section-alt">
        <div className="container text-center">
          <span className="section-label">👥 Đội ngũ</span>
          <h2 className="section-title">Những con người đứng sau SignMate</h2>
          <p className="section-subtitle mx-auto">
            Đội ngũ trẻ, năng động, đam mê công nghệ và tác động xã hội
          </p>

          <div className="team-grid">
            {team.map((member, index) => (
              <div key={index} className="team-member">
                <div className="team-avatar" style={{ color: member.color }}>
                  {member.initials}
                </div>
                <div className="team-name">{member.name}</div>
                <div className="team-role">{member.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section" style={{ background: 'var(--primary)', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ color: 'white', marginBottom: '16px' }}>Cùng chúng tôi tạo nên sự thay đổi</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '18px', marginBottom: '32px', maxWidth: '500px', margin: '0 auto 32px' }}>
            Tham gia SignMate ngay hôm nay và trở thành một phần của hành trình hòa nhập.
          </p>
          <a href="/" className="btn btn-white btn-lg">
            Bắt đầu miễn phí
          </a>
        </div>
      </section>
    </>
  );
};

export default AboutPage;

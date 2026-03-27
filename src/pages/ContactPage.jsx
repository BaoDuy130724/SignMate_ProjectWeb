import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { contactApi } from '../services/api';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    centerName: '',
    contactPerson: '',
    email: '',
    phone: '',
    learners: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const payload = {
        centerName: formData.centerName,
        contactPerson: formData.contactPerson,
        email: formData.email,
        phone: formData.phone,
        numberOfLearners: parseInt(formData.learners, 10) || 0
      };
      
      await contactApi.submit(payload);
      setSuccess(true);
      setFormData({ centerName: '', contactPerson: '', email: '', phone: '', learners: '', message: '' });
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra, vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section" style={{ paddingTop: '140px' }}>
      <div className="container">
        <div className="text-center">
          <span className="section-label">📬 Liên hệ</span>
          <h2 className="section-title">Liên hệ với chúng tôi</h2>
          <p className="section-subtitle mx-auto" style={{ marginBottom: '48px' }}>
            Bạn là trung tâm hoặc trường học? Hãy cho chúng tôi biết nhu cầu của bạn
          </p>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          {success && (
            <div style={{ padding: '16px', background: '#e8f5e9', color: '#2e7d32', borderRadius: '8px', marginBottom: '24px', fontWeight: 600 }}>
              Cảm ơn bạn! Yêu cầu đã được gửi đến hệ thống SignMate thành công.
            </div>
          )}
          {error && (
            <div style={{ padding: '16px', background: '#ffebee', color: 'var(--red-dark)', borderRadius: '8px', marginBottom: '24px', fontWeight: 600 }}>
              {error}
            </div>
          )}
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Tên trung tâm / trường học</label>
              <input 
                type="text" 
                name="centerName"
                className="form-input" 
                placeholder="VD: Trung tâm Ngôn ngữ Ký hiệu Hà Nội"
                value={formData.centerName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Người liên hệ</label>
              <input 
                type="text" 
                name="contactPerson"
                className="form-input" 
                placeholder="Họ và tên"
                value={formData.contactPerson}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Email</label>
              <input 
                type="email" 
                name="email"
                className="form-input" 
                placeholder="email@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Số điện thoại</label>
              <input 
                type="tel" 
                name="phone"
                className="form-input" 
                placeholder="0912 345 678"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Số lượng học viên</label>
            <input 
              type="number" 
              name="learners"
              className="form-input" 
              placeholder="Tối thiểu 20 học viên"
              min="20"
              value={formData.learners}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tin nhắn (tùy chọn)</label>
            <textarea 
              name="message"
              className="form-textarea" 
              placeholder="Mô tả thêm nhu cầu của bạn..."
              value={formData.message}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
            {loading ? <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> Đang gửi...</span> : <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Send size={20} /> Gửi yêu cầu</span>}
          </button>
        </form>
      </div>
    </section>
  );
};

export default ContactPage;

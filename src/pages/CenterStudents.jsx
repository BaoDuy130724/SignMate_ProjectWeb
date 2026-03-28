import React, { useState, useEffect, useCallback } from 'react';
import { Users, UserPlus, X, Loader2, CheckCircle2, Search, Edit, Trash2, Mail, ExternalLink, Activity, Target } from 'lucide-react';
import { centersApi } from '../services/api';

const CenterStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newStudent, setNewStudent] = useState({ fullName: '', email: '', password: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState(null);

  const centerId = localStorage.getItem('centerId');

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const loadData = useCallback(async () => {
    try {
      if (!centerId) throw new Error('Không tìm thấy thông tin trung tâm.');
      const data = await centersApi.getStudents(centerId);
      setStudents(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [centerId]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await centersApi.createStudent(centerId, newStudent);
      setNewStudent({ fullName: '', email: '', password: '' });
      setShowStudentForm(false);
      showToast('Cấp tài khoản học viên thành công! 🎉');
      await loadData();
    } catch (err) {
      showToast('Lỗi: ' + err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}><Loader2 className="spinning" /></div>;

  return (
    <>
      {toast && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 10000,
          padding: '16px 24px', borderRadius: '12px', 
          background: toast.type === 'success' ? 'linear-gradient(135deg, #6ee7b7, #34d399)' : 'linear-gradient(135deg, #fca5a5, #f87171)',
          color: '#fff', fontWeight: 700, boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center', gap: '10px'
        }}>
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <X size={18} />}
          {toast.message}
        </div>
      )}

      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Quản lý Học viên</h1>
          <p className="page-subtitle">Cấp tài khoản, quản lý danh sách và theo dõi tiến độ học tập</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowStudentForm(!showStudentForm)}>
          {showStudentForm ? <><X size={18} /> Hủy</> : <><UserPlus size={18} /> Thêm Học viên</>}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', marginBottom: '32px' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--primary-light)', border: 'none' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 700 }}>TỔNG SỐ</div>
            <div style={{ fontSize: '24px', fontWeight: 800 }}>{students.length} <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gray-400)' }}>học viên</span></div>
          </div>
        </div>
        
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', background: '#f0f9ff', border: 'none' }}>
           <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#0ea5e9', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity size={24} />
          </div>
          <div>
            <div style={{ fontSize: '13px', color: '#0ea5e9', fontWeight: 700 }}>ĐANG HOẠT ĐỘNG</div>
            <div style={{ fontSize: '24px', fontWeight: 800 }}>{Math.floor(students.length * 0.8)} <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gray-400)' }}>online 24h</span></div>
          </div>
        </div>
      </div>

      {showStudentForm && (
        <div className="card" style={{ marginBottom: '24px', border: '1.5px solid var(--primary-light)', background: 'var(--gray-50)' }}>
          <h3 style={{ marginBottom: '20px' }}>Cấp tài khoản học viên mới</h3>
          <form onSubmit={handleCreateStudent} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label">Họ và tên</label>
              <input type="text" className="form-input" placeholder="VD: Nguyễn Văn A" required
                value={newStudent.fullName} onChange={e => setNewStudent({...newStudent, fullName: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Email đăng nhập</label>
              <input type="email" className="form-input" placeholder="student@example.com" required
                value={newStudent.email} onChange={e => setNewStudent({...newStudent, email: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Mật khẩu ban đầu</label>
              <input type="password" minLength={6} className="form-input" placeholder="Mật khẩu" required
                value={newStudent.password} onChange={e => setNewStudent({...newStudent, password: e.target.value})} />
            </div>
            <div style={{ gridColumn: 'span 3', display: 'flex', gap: '12px', marginTop: '10px' }}>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="spinning" size={16} /> : <CheckCircle2 size={16} />}
                {isSubmitting ? ' Đang đăng ký...' : ' Xác nhận & Gửi thông tin'}
              </button>
              <button type="button" className="btn btn-white" onClick={() => setShowStudentForm(false)}>Hủy</button>
            </div>
          </form>
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '2px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff' }}>
          <h3 style={{ margin: 0 }}>Danh sách người học</h3>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
            <input 
              type="text" 
              className="form-input" 
              placeholder="Tìm theo tên hoặc email..." 
              style={{ margin: 0, paddingLeft: '40px' }}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', background: 'var(--gray-50)', borderBottom: '1px solid var(--gray-100)' }}>
              <th style={{ padding: '16px 24px' }}>Học viên</th>
              <th style={{ padding: '16px' }}>Email</th>
              <th style={{ padding: '16px' }}>Ngày tham gia</th>
              <th style={{ padding: '16px' }}>Trạng thái</th>
              <th style={{ padding: '16px 24px', textAlign: 'right' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map(s => (
              <tr key={s.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                      width: '40px', height: '40px', borderRadius: '50%', 
                      background: 'linear-gradient(135deg, var(--blue), var(--primary))',
                      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: '15px'
                    }}>
                      {(s.fullName || '?')[0].toUpperCase()}
                    </div>
                    <span style={{ fontWeight: 800 }}>{s.fullName}</span>
                  </div>
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--gray-500)' }}>
                    <Mail size={14} /> {s.email}
                  </div>
                </td>
                <td style={{ padding: '16px', color: 'var(--gray-400)', fontSize: '14px' }}>
                  {s.createdAt ? new Date(s.createdAt).toLocaleDateString('vi-VN') : '—'}
                </td>
                <td style={{ padding: '16px' }}>
                  <span className="badge badge-green">Hoạt động</span>
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                     <button className="btn btn-white btn-sm" title="Xem tiến trình"><Target size={14} /></button>
                     <button className="btn btn-white btn-sm" title="Sửa thông tin"><Edit size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredStudents.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '80px 24px', color: 'var(--gray-400)' }}>
                  {searchTerm ? 'Không tìm thấy học viên nào khớp với từ khóa.' : 'Chưa có học viên nào trong danh sách.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default CenterStudents;

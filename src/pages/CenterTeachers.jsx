import React, { useState, useEffect, useCallback } from 'react';
import { Users, UserPlus, Search, Loader2, Edit, Trash2, ShieldCheck, Mail, Key, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { centersApi } from '../services/api';

const CenterTeachers = () => {
  const centerId = localStorage.getItem('centerId');
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  
  // Modals / forms state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  
  const [editingTeacher, setEditingTeacher] = useState(null);
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadTeachers = useCallback(async () => {
    if (!centerId) return;
    try {
      setLoading(true);
      const data = await centersApi.getTeachers(centerId) || [];
      setTeachers(data);
    } catch (err) {
      setError('Lỗi tải danh sách giáo viên: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [centerId]);

  useEffect(() => {
    loadTeachers();
  }, [loadTeachers]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await centersApi.createTeacher(centerId, { email, password, fullName });
      setSuccess('Thêm giáo viên thành công! 🧑‍🏫');
      setShowCreateModal(false);
      setEmail('');
      setPassword('');
      setFullName('');
      await loadTeachers();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.message || 'Lỗi thêm giáo viên.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
    setFullName(teacher.fullName || '');
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await centersApi.updateMember(centerId, editingTeacher.id, { fullName });
      setSuccess('Cập nhật thông tin thành công! 🎉');
      setShowEditModal(false);
      setEditingTeacher(null);
      setFullName('');
      await loadTeachers();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.message || 'Lỗi cập nhật giáo viên.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (teacherId, teacherName) => {
    if (!window.confirm(`Bạn có chắc muốn gỡ giáo viên "${teacherName}" ra khỏi trung tâm không?`)) return;
    
    setError('');
    setSuccess('');
    
    try {
      await centersApi.deleteMember(centerId, teacherId);
      setSuccess(`Gỡ giáo viên "${teacherName}" thành công!`);
      await loadTeachers();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.message || 'Lỗi gỡ giáo viên.');
    }
  };

  const filtered = teachers.filter(t => 
    (t.fullName || '').toLowerCase().includes(query.toLowerCase()) ||
    (t.email || '').toLowerCase().includes(query.toLowerCase())
  );

  if (!centerId) {
    return <div className="card" style={{ margin: '20px', color: 'var(--red)' }}>Lỗi: Không tìm thấy ID trung tâm. Vui lòng đăng nhập lại.</div>;
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 className="page-title">Quản lý Giáo viên</h1>
          <p className="page-subtitle">Thêm mới, cập nhật thông tin và quản trị danh sách giáo viên của trung tâm</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowCreateModal(true)}>
          <UserPlus size={16} /> Thêm Giáo viên
        </button>
      </div>

      {success && (
        <div style={{
          background: '#e8f5e9', border: '2px solid var(--green)', borderRadius: 'var(--radius-md)',
          padding: '12px 16px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px',
          fontSize: '14px', color: 'var(--green-dark)', fontWeight: 600
        }}>
          <CheckCircle2 size={18} style={{ color: 'var(--green)' }} /> {success}
        </div>
      )}

      {error && (
        <div style={{
          background: '#ffebee', border: '2px solid var(--red)', borderRadius: 'var(--radius-md)',
          padding: '12px 16px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px',
          fontSize: '14px', color: 'var(--red-dark)', fontWeight: 600
        }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      <div className="table-wrapper">
        <div className="table-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="table-title">Giáo viên thuộc Trung tâm ({filtered.length})</div>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-300)' }} />
            <input
              className="form-input"
              placeholder="Tìm theo tên hoặc email..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ margin: 0, paddingLeft: '36px', width: '260px' }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <Loader2 className="spinning" size={24} color="var(--primary)" />
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Họ tên</th>
                <th>Email liên hệ</th>
                <th style={{ width: '150px', textAlign: 'right', paddingRight: '20px' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id}>
                  <td style={{ fontWeight: 700 }}>{t.fullName}</td>
                  <td style={{ color: 'var(--gray-400)' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <Mail size={14} /> {t.email}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', paddingRight: '20px' }}>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                      <button className="btn btn-outline btn-xs" style={{ padding: '6px' }} onClick={() => handleEdit(t)}>
                        <Edit size={14} />
                      </button>
                      <button className="btn btn-xs" style={{ padding: '6px', background: 'var(--red)', color: '#fff' }} onClick={() => handleDelete(t.id, t.fullName)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: '32px', color: 'var(--gray-400)' }}>
                    Không tìm thấy giáo viên nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,18,37,0.5)', backdropFilter: 'blur(4px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '480px', boxShadow: '0 32px 64px rgba(0,0,0,0.2)', background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--gray-100)', paddingBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>Thêm Giáo viên mới</h3>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'var(--gray-50)', border: 'none', cursor: 'pointer', borderRadius: '50%', width: '32px', height: '32px' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="form-group" style={{ textAlign: 'left', marginBottom: '16px' }}>
                <label className="form-label">Họ tên</label>
                <input type="text" className="form-input" placeholder="Nguyễn Văn A" value={fullName} onChange={e => setFullName(e.target.value)} required />
              </div>
              <div className="form-group" style={{ textAlign: 'left', marginBottom: '16px' }}>
                <label className="form-label">Email</label>
                <input type="email" className="form-input" placeholder="teacher@gmail.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="form-group" style={{ textAlign: 'left', marginBottom: '24px' }}>
                <label className="form-label">Mật khẩu</label>
                <input type="password" className="form-input" placeholder="Mật khẩu khởi tạo" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
                {submitting ? <Loader2 className="spinning" size={18} /> : 'Tạo tài khoản'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,18,37,0.5)', backdropFilter: 'blur(4px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '480px', boxShadow: '0 32px 64px rgba(0,0,0,0.2)', background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--gray-100)', paddingBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>Cập nhật Giáo viên</h3>
              <button onClick={() => { setShowEditModal(false); setEditingTeacher(null); }} style={{ background: 'var(--gray-50)', border: 'none', cursor: 'pointer', borderRadius: '50%', width: '32px', height: '32px' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleUpdate}>
              <div style={{ marginBottom: '16px', fontSize: '14px', color: 'var(--gray-400)' }}>
                Email: <strong>{editingTeacher?.email}</strong>
              </div>
              <div className="form-group" style={{ textAlign: 'left', marginBottom: '24px' }}>
                <label className="form-label">Họ tên mới</label>
                <input type="text" className="form-input" value={fullName} onChange={e => setFullName(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
                {submitting ? <Loader2 className="spinning" size={18} /> : 'Lưu thay đổi'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CenterTeachers;

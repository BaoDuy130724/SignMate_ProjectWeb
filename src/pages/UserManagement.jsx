import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Users, Search, Filter, Loader2, Mail, Building2, Calendar, Plus, X, CheckCircle2, AlertCircle, Edit, Trash2 } from 'lucide-react';
import { usersApi, centersApi } from '../services/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [toast, setToast] = useState(null);

  // Create
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newUser, setNewUser] = useState({ fullName: '', email: '', password: '', role: 'Student' });

  // Edit
  const [editingUser, setEditingUser] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const loadData = useCallback(async () => {
    try {
      const [usersData, centersData] = await Promise.all([
        usersApi.getAll(roleFilter),
        centersApi.getAll()
      ]);
      setUsers(usersData || []);
      setCenters(centersData || []);
    } catch (err) {
      setError(err.message || 'Lỗi lấy dữ liệu người dùng');
    } finally {
      setLoading(false);
    }
  }, [roleFilter]);

  useEffect(() => { loadData(); }, [loadData]);

  const getCenterName = (centerId) => {
    if (!centerId) return 'B2C (Cá nhân)';
    const center = centers.find(c => c.id === centerId);
    return center ? center.name : '—';
  };

  const filteredUsers = useMemo(() => users.filter(user =>
    (user.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  ), [users, searchTerm]);

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'SuperAdmin': return 'badge-red';
      case 'CenterAdmin': return 'badge-purple';
      case 'Teacher': return 'badge-blue';
      case 'Student': return 'badge-green';
      default: return 'badge-gray';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'SuperAdmin': return 'S.Admin';
      case 'CenterAdmin': return 'C.Admin';
      case 'Teacher': return 'Giáo viên';
      case 'Student': return 'Học viên';
      default: return role;
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await usersApi.create(newUser);
      setNewUser({ fullName: '', email: '', password: '', role: 'Student' });
      setShowCreateForm(false);
      showToast('Tạo tài khoản thành công! 🎉');
      await loadData();
    } catch (err) {
      showToast('Lỗi: ' + err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await usersApi.update(editingUser.id, { fullName: editingUser.fullName, role: editingUser.role });
      setEditingUser(null);
      showToast('Cập nhật tài khoản thành công! 🎉');
      await loadData();
    } catch (err) {
      showToast('Lỗi cập nhật: ' + err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId, fullName) => {
    if (!globalThis.confirm(`Bạn có chắc chắn muốn xóa tài khoản "${fullName}"?`)) return;
    try {
      await usersApi.delete(userId);
      showToast('Đã xóa tài khoản thành công! 🗑️');
      await loadData();
    } catch (err) {
      showToast('Lỗi xóa tài khoản: ' + err.message, 'error');
    }
  };

  if (loading && users.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '120px', color: 'var(--primary)' }}>
        <Loader2 size={36} style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <>
      {toast && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
          padding: '16px 24px', borderRadius: '12px',
          background: toast.type === 'success' ? 'linear-gradient(135deg, #6ee7b7, #34d399)' : 'linear-gradient(135deg, #fca5a5, #f87171)',
          color: '#fff', fontWeight: 700, boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center', gap: '10px'
        }}>
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {toast.message}
        </div>
      )}

      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Quản lý Người dùng</h1>
          <p className="page-subtitle">Quản lý tài khoản hệ thống B2C (Cá nhân) và B2B (Doanh nghiệp)</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? <><X size={18} /> Hủy</> : <><Plus size={18} /> Thêm tài khoản</>}
        </button>
      </div>

      {showCreateForm && (
        <div className="card" style={{ marginBottom: '24px', border: '1.5px solid var(--primary-light)', background: 'var(--gray-50)' }}>
          <h3 style={{ marginBottom: '20px' }}>Tạo tài khoản mới</h3>
          <form onSubmit={handleCreateUser} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label htmlFor="cu-name" className="form-label">Họ và tên</label>
              <input id="cu-name" type="text" className="form-input" placeholder="Nguyễn Văn A" required
                value={newUser.fullName} onChange={e => setNewUser({ ...newUser, fullName: e.target.value })} />
            </div>
            <div className="form-group">
              <label htmlFor="cu-email" className="form-label">Email đăng nhập</label>
              <input id="cu-email" type="email" className="form-input" placeholder="user@example.com" required
                value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} />
            </div>
            <div className="form-group">
              <label htmlFor="cu-password" className="form-label">Mật khẩu</label>
              <input id="cu-password" type="password" className="form-input" placeholder="••••••••" required minLength={6}
                value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} />
            </div>
            <div className="form-group">
              <label htmlFor="cu-role" className="form-label">Vai trò</label>
              <select id="cu-role" className="form-input" value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
                <option value="Student">Học viên</option>
                <option value="Teacher">Giáo viên</option>
                <option value="CenterAdmin">Center Admin</option>
                <option value="SuperAdmin">Super Admin</option>
              </select>
            </div>
            <div style={{ gridColumn: 'span 3', display: 'flex', gap: '12px', marginTop: '10px' }}>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 style={{ animation: 'spin 1s linear infinite' }} size={16} /> : <CheckCircle2 size={16} />}
                {isSubmitting ? ' Đang tạo...' : ' Xác nhận tạo tài khoản'}
              </button>
              <button type="button" className="btn btn-white" onClick={() => setShowCreateForm(false)}>Hủy</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Tìm kiếm theo tên hoặc email..."
            style={{ paddingLeft: '48px' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gray-500)', fontWeight: 700, fontSize: '14px' }}>
            <Filter size={18} /> Lọc theo:
          </div>
          <select
            className="form-input"
            style={{ width: '180px' }}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">Tất cả vai trò</option>
            <option value="SuperAdmin">Super Admin</option>
            <option value="CenterAdmin">Center Admin</option>
            <option value="Teacher">Teacher</option>
            <option value="Student">Student</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="card" style={{ color: 'var(--red)', borderColor: 'var(--red)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <AlertCircle size={20} /> {error}
        </div>
      )}

      <div className="table-wrapper">
        <div className="table-header">
          <div className="table-title">Danh sách Người dùng ({filteredUsers.length})</div>
        </div>

        <table>
          <thead>
            <tr>
              <th style={{ width: '50px' }}>#</th>
              <th>Họ và Tên</th>
              <th>Email</th>
              <th>Vai trò</th>
              <th>Trung tâm</th>
              <th>Ngày tham gia</th>
              <th style={{ textAlign: 'right' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user, index) => (
              <tr key={user.id}>
                <td style={{ color: 'var(--gray-300)', fontWeight: 700 }}>{index + 1}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '50%',
                      background: user.role === 'SuperAdmin' ? 'var(--red)' : 'linear-gradient(135deg, var(--primary), var(--purple))',
                      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: '16px', flexShrink: 0
                    }}>
                      {(user.fullName || '?')[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, color: 'var(--text-dark)' }}>{user.fullName}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gray-600)', fontSize: '14px' }}>
                    <Mail size={14} /> {user.email}
                  </div>
                </td>
                <td>
                  <span className={`badge ${getRoleBadgeClass(user.role)}`} style={{ minWidth: '80px', textAlign: 'center' }}>
                    {getRoleLabel(user.role)}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: user.centerId ? 'var(--text)' : 'var(--gray-400)' }}>
                    <Building2 size={14} /> {getCenterName(user.centerId)}
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--gray-500)' }}>
                    <Calendar size={14} /> {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '—'}
                  </div>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                    <button className="btn btn-white btn-sm" onClick={() => setEditingUser({ ...user })} title="Chỉnh sửa">
                      <Edit size={14} />
                    </button>
                    <button className="btn btn-outline btn-sm" style={{ color: 'var(--red)', borderColor: '#fee2e2' }}
                      onClick={() => handleDeleteUser(user.id, user.fullName)} title="Xóa tài khoản">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && filteredUsers.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '60px', color: 'var(--gray-400)' }}>
                  <Users size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                  <div style={{ fontWeight: 700 }}>Không tìm thấy người dùng phù hợp</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editingUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,18,37,0.5)', backdropFilter: 'blur(4px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '480px', boxShadow: '0 32px 64px rgba(0,0,0,0.2)', background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0 }}>Chỉnh sửa tài khoản</h3>
              <button onClick={() => setEditingUser(null)} style={{ background: 'var(--gray-50)', border: 'none', cursor: 'pointer', borderRadius: '50%', width: '32px', height: '32px' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleUpdateUser} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="form-group">
                <label htmlFor="eu-name" className="form-label">Họ và tên</label>
                <input id="eu-name" type="text" className="form-input" required
                  value={editingUser.fullName} onChange={e => setEditingUser({ ...editingUser, fullName: e.target.value })} />
              </div>
              <div className="form-group">
                <label htmlFor="eu-email" className="form-label">Email (không thể thay đổi)</label>
                <input id="eu-email" type="email" className="form-input" disabled value={editingUser.email}
                  style={{ background: 'var(--gray-50)', color: 'var(--gray-400)' }} />
              </div>
              <div className="form-group">
                <label htmlFor="eu-role" className="form-label">Vai trò</label>
                <select id="eu-role" className="form-input" value={editingUser.role} onChange={e => setEditingUser({ ...editingUser, role: e.target.value })}>
                  <option value="Student">Học viên</option>
                  <option value="Teacher">Giáo viên</option>
                  <option value="CenterAdmin">Center Admin</option>
                  <option value="SuperAdmin">Super Admin</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" className="btn btn-white" onClick={() => setEditingUser(null)}>Hủy</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 style={{ animation: 'spin 1s linear infinite' }} size={16} /> : <CheckCircle2 size={16} />}
                  {isSubmitting ? ' Đang lưu...' : ' Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .badge-gray { background: var(--gray-100); color: var(--gray-500); }
      `}</style>
    </>
  );
};

export default UserManagement;

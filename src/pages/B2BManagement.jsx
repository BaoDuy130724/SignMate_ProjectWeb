import React, { useState, useEffect } from 'react';
import { Users, Activity, Building2, Plus, X, Loader2, Mail, Phone, UserCheck, Shield, Search, Edit, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { centersApi } from '../services/api';

const B2BManagement = () => {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adminFormCenterId, setAdminFormCenterId] = useState(null);
  const [editingCenter, setEditingCenter] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState(null);

  const [newAdmin, setNewAdmin] = useState({ fullName: '', email: '', password: '' });
  const [newCenter, setNewCenter] = useState({ name: '', contactPerson: '', email: '', phone: '', maxSeats: 50 });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchCenters = async () => {
    setLoading(true);
    try {
      const data = await centersApi.getAll();
      setCenters(data || []);
    } catch (error) {
      console.error('Failed to fetch centers', error);
    }
    setLoading(false);
  };

  useEffect(() => { fetchCenters(); }, []);

  const handleCreateCenter = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await centersApi.create({ ...newCenter, maxSeats: Number.parseInt(newCenter.maxSeats, 10) || 50 });
      setShowForm(false);
      setNewCenter({ name: '', contactPerson: '', email: '', phone: '', maxSeats: 50 });
      showToast('Tạo trung tâm thành công! 🎉');
      fetchCenters();
    } catch (error) {
      showToast('Lỗi tạo trung tâm: ' + error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateCenter = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await centersApi.update(editingCenter.id, {
        name: editingCenter.name,
        contactPerson: editingCenter.contactPerson,
        email: editingCenter.email,
        phone: editingCenter.phone,
        maxSeats: Number.parseInt(editingCenter.maxSeats, 10) || 50,
      });
      setEditingCenter(null);
      showToast('Cập nhật trung tâm thành công! 🎉');
      fetchCenters();
    } catch (error) {
      showToast('Lỗi cập nhật: ' + error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCenter = async (id, name) => {
    if (!globalThis.confirm(`Bạn có chắc chắn muốn xóa trung tâm "${name}"?`)) return;
    try {
      await centersApi.delete(id);
      showToast('Đã xóa trung tâm thành công! 🗑️');
      fetchCenters();
    } catch (error) {
      showToast('Lỗi xóa trung tâm: ' + error.message, 'error');
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await centersApi.createAdmin(adminFormCenterId, newAdmin);
      showToast('Tạo Quản lý Trung tâm thành công!');
      setAdminFormCenterId(null);
      setNewAdmin({ fullName: '', email: '', password: '' });
    } catch (error) {
      showToast('Lỗi tạo admin: ' + error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCenters = centers.filter(c =>
    (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.contactPerson || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCount = centers.filter(c => c.isActive).length;
  const totalSeats = centers.reduce((acc, c) => acc + (c.maxSeats || 0), 0);

  if (loading && centers.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '120px', color: 'var(--primary)' }}>
        <Loader2 className="spinning" size={36} />
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
          <h1 className="page-title">Quản lý Đối tác B2B</h1>
          <p className="page-subtitle">Quản lý hệ thống trung tâm, người đại diện và giới hạn truy cập</p>
        </div>
        {!showForm && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={18} /> Thêm Trung tâm mới
          </button>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '32px' }}>
        <div className="stat-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', justifyContent: 'space-between', minHeight: '136px', padding: '24px', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="stat-label" style={{ marginBottom: '4px' }}>Tổng số Trung tâm</div>
              <div className="stat-value">{centers.length}</div>
            </div>
            <div className="stat-icon card-icon-purple"><Building2 size={24} /></div>
          </div>
          <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: '12px', fontSize: '13px', color: 'var(--gray-400)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary-dark)' }}></span>
            Hệ thống đối tác liên kết
          </div>
        </div>
        <div className="stat-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', justifyContent: 'space-between', minHeight: '136px', padding: '24px', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="stat-label" style={{ marginBottom: '4px' }}>Tổng Seats cấp phát</div>
              <div className="stat-value">{totalSeats}</div>
            </div>
            <div className="stat-icon card-icon-blue"><Users size={24} /></div>
          </div>
          <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: '12px', fontSize: '13px', color: 'var(--gray-400)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--blue)' }}></span>
            Tổng giới hạn Seats cho học viên
          </div>
        </div>
        <div className="stat-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', justifyContent: 'space-between', minHeight: '136px', padding: '24px', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="stat-label" style={{ marginBottom: '4px' }}>Tỷ lệ Active</div>
              <div className="stat-value">
                {centers.length > 0 ? Math.round((activeCount / centers.length) * 100) : 0}%
              </div>
            </div>
            <div className="stat-icon card-icon-green"><Activity size={24} /></div>
          </div>
          <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: '12px', fontSize: '13px', color: 'var(--gray-400)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary-dark)' }}></span>
            {activeCount}/{centers.length} đang hoạt động
          </div>
        </div>
      </div>

      {/* Create Center Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: '32px', borderColor: 'var(--primary)', animation: 'slideDown 0.3s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building2 size={20} color="var(--primary)" /> Đăng ký Trung tâm mới
            </h3>
            <button className="btn btn-white btn-sm" onClick={() => setShowForm(false)}><X size={16} /> Đóng</button>
          </div>
          <form onSubmit={handleCreateCenter} style={{ margin: 0, maxWidth: '100%' }}>
            <div className="grid-2">
              <div className="form-group">
                <label htmlFor="nc-name" className="form-label">Tên trung tâm</label>
                <input id="nc-name" type="text" className="form-input" required
                  value={newCenter.name} onChange={e => setNewCenter({ ...newCenter, name: e.target.value })}
                  placeholder="VD: Trung tâm Ngôn ngữ ABC" />
              </div>
              <div className="form-group">
                <label htmlFor="nc-person" className="form-label">Người đại diện</label>
                <input id="nc-person" type="text" className="form-input" required
                  value={newCenter.contactPerson} onChange={e => setNewCenter({ ...newCenter, contactPerson: e.target.value })}
                  placeholder="Nguyễn Văn A" />
              </div>
              <div className="form-group">
                <label htmlFor="nc-email" className="form-label">Email pháp lý</label>
                <input id="nc-email" type="email" className="form-input" required
                  value={newCenter.email} onChange={e => setNewCenter({ ...newCenter, email: e.target.value })}
                  placeholder="contact@abc.vn" />
              </div>
              <div className="form-group">
                <label htmlFor="nc-phone" className="form-label">Số điện thoại</label>
                <input id="nc-phone" type="tel" className="form-input" required
                  value={newCenter.phone} onChange={e => setNewCenter({ ...newCenter, phone: e.target.value })} />
              </div>
              <div className="form-group">
                <label htmlFor="nc-seats" className="form-label">Giới hạn Seats</label>
                <input id="nc-seats" type="number" className="form-input" required min="1"
                  value={newCenter.maxSeats} onChange={e => setNewCenter({ ...newCenter, maxSeats: e.target.value })} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Đang lưu...' : 'Xác nhận tạo đối tác'}
              </button>
              <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Hủy bỏ</button>
            </div>
          </form>
        </div>
      )}

      {/* Create Admin Form */}
      {adminFormCenterId && (
        <div className="card" style={{ marginBottom: '32px', border: '2px dashed var(--blue)', background: 'var(--blue-50)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--blue)' }}>
                <Shield size={20} /> Cấp tài khoản Quản trị viên (Center Admin)
              </h3>
              <p style={{ margin: '4px 0 0', color: 'var(--blue-700)', fontSize: '13px' }}>
                Đang cấp cho: <strong>{centers.find(c => c.id === adminFormCenterId)?.name}</strong>
              </p>
            </div>
            <button className="btn btn-white btn-sm" onClick={() => setAdminFormCenterId(null)}><X size={16} /></button>
          </div>
          <form onSubmit={handleCreateAdmin} style={{ margin: 0, maxWidth: '100%' }}>
            <div className="grid-3">
              <div className="form-group">
                <label htmlFor="na-name" className="form-label">Họ và tên</label>
                <input id="na-name" type="text" className="form-input" required
                  value={newAdmin.fullName} onChange={e => setNewAdmin({ ...newAdmin, fullName: e.target.value })}
                  placeholder="Admin Name" />
              </div>
              <div className="form-group">
                <label htmlFor="na-email" className="form-label">Email đăng nhập</label>
                <input id="na-email" type="email" className="form-input" required
                  value={newAdmin.email} onChange={e => setNewAdmin({ ...newAdmin, email: e.target.value })}
                  placeholder="admin@center.com" />
              </div>
              <div className="form-group">
                <label htmlFor="na-pw" className="form-label">Mật khẩu khởi tạo</label>
                <input id="na-pw" type="password" className="form-input" required
                  value={newAdmin.password} onChange={e => setNewAdmin({ ...newAdmin, password: e.target.value })}
                  placeholder="••••••••" />
              </div>
            </div>
            <button type="submit" className="btn btn-blue" disabled={isSubmitting}>
              {isSubmitting ? 'Đang tạo...' : 'Xác nhận cấp quyền'}
            </button>
          </form>
        </div>
      )}

      {/* Centers Table */}
      <div className="table-wrapper">
        <div className="table-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px' }}>
          <div className="table-title" style={{ margin: 0 }}>Hệ thống Trung tâm đối tác</div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
              <input
                type="text"
                placeholder="Tìm trung tâm..."
                className="form-input"
                style={{ paddingLeft: '36px', height: '38px', margin: 0, width: '260px', fontSize: '14px', borderRadius: '10px' }}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Trung tâm</th>
              <th>Người đại diện</th>
              <th>Thông tin liên hệ</th>
              <th>Giới hạn Seats</th>
              <th>Trạng thái</th>
              <th style={{ textAlign: 'right' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredCenters.map(c => (
              <tr key={c.id}>
                <td style={{ fontWeight: 800, color: 'var(--text-dark)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Building2 size={16} />
                    </div>
                    {c.name}
                  </div>
                </td>
                <td>{c.contactPerson}</td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--gray-600)' }}><Mail size={12} /> {c.email}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--gray-600)' }}><Phone size={12} /> {c.phone}</div>
                  </div>
                </td>
                <td>
                  <div style={{ fontWeight: 800, fontSize: '15px' }}>{c.maxSeats}</div>
                  <div style={{ fontSize: '11px', color: 'var(--gray-400)', textTransform: 'uppercase' }}>User Licenses</div>
                </td>
                <td>
                  {c.isActive ? (
                    <span className="status-badge status-badge-active">
                      <span className="status-dot"></span>
                      Hoạt động
                    </span>
                  ) : (
                    <span className="status-badge status-badge-inactive">
                      <span className="status-dot"></span>
                      Vô hiệu
                    </span>
                  )}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <button className="action-btn action-btn-primary"
                      onClick={() => setAdminFormCenterId(c.id)} title="Cấp quyền Admin">
                      <UserCheck size={14} style={{ marginRight: '4px' }} /> Admin
                    </button>
                    <button className="action-btn"
                      onClick={() => setEditingCenter({ ...c })} title="Chỉnh sửa">
                      <Edit size={14} />
                    </button>
                    <button className="action-btn action-btn-danger"
                      onClick={() => handleDeleteCenter(c.id, c.name)} title="Xóa">
                      <Trash2 size={14} style={{ color: 'var(--red)' }} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredCenters.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '64px', color: 'var(--gray-400)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <Building2 size={40} style={{ opacity: 0.2 }} />
                    <div>Không tìm thấy trung tâm nào phù hợp</div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Center Modal */}
      {editingCenter && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,18,37,0.5)', backdropFilter: 'blur(4px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '560px', boxShadow: '0 32px 64px rgba(0,0,0,0.2)', background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0 }}>Chỉnh sửa Trung tâm</h3>
              <button onClick={() => setEditingCenter(null)} style={{ background: 'var(--gray-50)', border: 'none', cursor: 'pointer', borderRadius: '50%', width: '32px', height: '32px' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleUpdateCenter} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label htmlFor="ec-name" className="form-label">Tên trung tâm</label>
                <input id="ec-name" type="text" className="form-input" required
                  value={editingCenter.name} onChange={e => setEditingCenter({ ...editingCenter, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label htmlFor="ec-person" className="form-label">Người đại diện</label>
                <input id="ec-person" type="text" className="form-input" required
                  value={editingCenter.contactPerson || ''} onChange={e => setEditingCenter({ ...editingCenter, contactPerson: e.target.value })} />
              </div>
              <div className="form-group">
                <label htmlFor="ec-email" className="form-label">Email pháp lý</label>
                <input id="ec-email" type="email" className="form-input" required
                  value={editingCenter.email || ''} onChange={e => setEditingCenter({ ...editingCenter, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label htmlFor="ec-phone" className="form-label">Số điện thoại</label>
                <input id="ec-phone" type="tel" className="form-input" required
                  value={editingCenter.phone || ''} onChange={e => setEditingCenter({ ...editingCenter, phone: e.target.value })} />
              </div>
              <div className="form-group">
                <label htmlFor="ec-seats" className="form-label">Giới hạn Seats</label>
                <input id="ec-seats" type="number" className="form-input" required min="1"
                  value={editingCenter.maxSeats || 50} onChange={e => setEditingCenter({ ...editingCenter, maxSeats: e.target.value })} />
              </div>
              <div style={{ gridColumn: 'span 2', display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" className="btn btn-white" onClick={() => setEditingCenter(null)}>Hủy</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .spinning { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }

        /* Premium Table Action Buttons styling */
        .action-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: 1px solid var(--gray-100);
          background: white;
          color: var(--gray-600);
          cursor: pointer;
          transition: var(--transition);
          box-shadow: none;
        }
        .action-btn:hover {
          background: var(--gray-50);
          color: var(--primary);
          border-color: var(--primary-light);
        }
        .action-btn-danger:hover {
          background: #fee2e2;
          color: var(--red);
          border-color: #fca5a5;
        }
        .action-btn-primary {
          background: var(--primary-light);
          color: var(--primary-dark);
          border: none;
          font-weight: 700;
          padding: 0 12px;
          width: auto;
          height: 32px;
          font-size: 13px;
        }
        .action-btn-primary:hover {
          background: var(--primary);
          color: white;
        }

        /* Premium status badge styles */
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 9999px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          white-space: nowrap;
          letter-spacing: 0.5px;
        }
        .status-badge-active {
          background-color: #ecfdf5;
          color: #065f46;
          border: 1px solid #a7f3d0;
        }
        .status-badge-active .status-dot {
          background-color: #10b981;
        }
        .status-badge-inactive {
          background-color: #fef2f2;
          color: #991b1b;
          border: 1px solid #fecaca;
        }
        .status-badge-inactive .status-dot {
          background-color: #ef4444;
        }
        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          display: inline-block;
        }
      `}</style>
    </>
  );
};

export default B2BManagement;

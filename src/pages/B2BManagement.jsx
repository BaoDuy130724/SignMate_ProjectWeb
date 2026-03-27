import React, { useState, useEffect } from 'react';
import { Users, Activity, BarChart3, Building2, Plus, X, Loader2, Mail, Phone, UserCheck, Shield, ChevronRight, LayoutDashboard, Search, Filter } from 'lucide-react';
import { centersApi } from '../services/api';

const B2BManagement = () => {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adminFormCenterId, setAdminFormCenterId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [newAdmin, setNewAdmin] = useState({ fullName: '', email: '', password: '' });
  const [newCenter, setNewCenter] = useState({
    name: '', contactPerson: '', email: '', phone: '', maxSeats: 50
  });

  const fetchCenters = async () => {
    setLoading(true);
    try {
      const data = await centersApi.getAll();
      setCenters(data);
    } catch (error) {
      console.error('Failed to fetch centers', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCenters();
  }, []);

  const handleCreateCenter = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await centersApi.create({
        ...newCenter,
        maxSeats: parseInt(newCenter.maxSeats, 10) || 50
      });
      setShowForm(false);
      setNewCenter({ name: '', contactPerson: '', email: '', phone: '', maxSeats: 50 });
      fetchCenters();
    } catch (error) {
      alert('Lỗi tạo trung tâm: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await centersApi.createAdmin(adminFormCenterId, newAdmin);
      alert('Tạo Quản lý Trung tâm thành công!');
      setAdminFormCenterId(null);
      setNewAdmin({ fullName: '', email: '', password: '' });
    } catch (error) {
      alert('Lỗi tạo admin: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCenters = centers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && centers.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '120px', color: 'var(--primary)' }}>
        <Loader2 className="spinning" size={36} />
      </div>
    );
  }

  return (
    <>
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

      {/* Stats QuickView */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '32px' }}>
        <div className="stat-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <div className="stat-label">Tổng số Trung tâm</div>
              <div className="stat-value">{centers.length}</div>
            </div>
            <div className="stat-icon card-icon-purple"><Building2 size={24} /></div>
          </div>
          <div style={{ marginTop: '12px', fontSize: '13px', color: 'var(--green)', fontWeight: 700 }}>↑ +2 đối tác mới tháng này</div>
        </div>
        <div className="stat-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <div className="stat-label">Tổng Seats cấp phát</div>
              <div className="stat-value">{centers.reduce((acc, c) => acc + (c.maxSeats || 0), 0)}</div>
            </div>
            <div className="stat-icon card-icon-blue"><Users size={24} /></div>
          </div>
          <div style={{ marginTop: '12px', fontSize: '13px', color: 'var(--gray-400)' }}>Dự kiến tăng +15% quý tới</div>
        </div>
        <div className="stat-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <div className="stat-label">Tỷ lệ Active</div>
              <div className="stat-value">{centers.filter(c => c.isActive).length / centers.length * 100 || 0}%</div>
            </div>
            <div className="stat-icon card-icon-green"><Activity size={24} /></div>
          </div>
          <div style={{ marginTop: '12px', fontSize: '13px', color: 'var(--green)', fontWeight: 700 }}>Tất cả đều hoạt động ổn định</div>
        </div>
      </div>

      {/* Forms Section */}
      {showForm && (
        <div className="card" style={{ marginBottom: '32px', borderColor: 'var(--primary)', animation: 'slideDown 0.3s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building2 size={20} color="var(--primary)" /> Đăng ký Trung tâm mới
            </h3>
            <button className="btn btn-white btn-sm" onClick={() => setShowForm(false)}><X size={16} /> Đóng</button>
          </div>
          <form className="contact-form" style={{ margin: 0, maxWidth: '100%' }} onSubmit={handleCreateCenter}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Tên trung tâm</label>
                <input type="text" className="form-input" required 
                       value={newCenter.name} onChange={e => setNewCenter({...newCenter, name: e.target.value})} 
                       placeholder="VD: Trung tâm Ngôn ngữ ABC" />
              </div>
              <div className="form-group">
                <label className="form-label">Người đại diện</label>
                <input type="text" className="form-input" required 
                       value={newCenter.contactPerson} onChange={e => setNewCenter({...newCenter, contactPerson: e.target.value})} 
                       placeholder="Nguyễn Văn A" />
              </div>
              <div className="form-group">
                <label className="form-label">Email pháp lý</label>
                <input type="email" className="form-input" required 
                       value={newCenter.email} onChange={e => setNewCenter({...newCenter, email: e.target.value})} 
                       placeholder="contact@abc.vn" />
              </div>
              <div className="form-group">
                <label className="form-label">Số điện thoại</label>
                <input type="tel" className="form-input" required 
                       value={newCenter.phone} onChange={e => setNewCenter({...newCenter, phone: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Giới hạn Seats (User)</label>
                <input type="number" className="form-input" required min="1"
                       value={newCenter.maxSeats} onChange={e => setNewCenter({...newCenter, maxSeats: e.target.value})} />
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
          <form className="contact-form" style={{ margin: 0, maxWidth: '100%' }} onSubmit={handleCreateAdmin}>
            <div className="grid-3">
              <div className="form-group">
                <label className="form-label">Họ và tên</label>
                <input type="text" className="form-input" required 
                       value={newAdmin.fullName} onChange={e => setNewAdmin({...newAdmin, fullName: e.target.value})} 
                       placeholder="Admin Name" />
              </div>
              <div className="form-group">
                <label className="form-label">Email đăng nhập</label>
                <input type="email" className="form-input" required 
                       value={newAdmin.email} onChange={e => setNewAdmin({...newAdmin, email: e.target.value})} 
                       placeholder="admin@center.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Mật khẩu khởi tạo</label>
                <input type="password" className="form-input" required 
                       value={newAdmin.password} onChange={e => setNewAdmin({...newAdmin, password: e.target.value})} 
                       placeholder="••••••••" />
              </div>
            </div>
            <button type="submit" className="btn btn-blue" disabled={isSubmitting}>
              {isSubmitting ? 'Đang tạo...' : 'Xác nhận cấp quyền'}
            </button>
          </form>
        </div>
      )}

      {/* Main Centers Table */}
      <div className="table-wrapper">
        <div className="table-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div className="table-title">Hệ thống Trung tâm đối tác</div>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
              <input 
                type="text" 
                placeholder="Tìm trung tâm..." 
                className="form-input" 
                style={{ paddingLeft: '36px', height: '36px', margin: 0, width: '240px', fontSize: '14px' }}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-white btn-sm"><Filter size={14} /> Lọc</button>
            <button className="btn btn-white btn-sm">Export CSV</button>
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
              <tr key={c.id} style={{ transition: 'all 0.2s' }}>
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
                  {c.isActive 
                    ? <span className="badge badge-green">Hoạt động</span> 
                    : <span className="badge badge-yellow">Vô hiệu</span>}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button 
                    className="btn btn-blue btn-sm" 
                    style={{ fontSize: '12px', padding: '6px 12px' }}
                    onClick={() => setAdminFormCenterId(c.id)}
                  >
                    <UserCheck size={14} /> Thêm Admin
                  </button>
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

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .spinning { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </>
  );
};

export default B2BManagement;

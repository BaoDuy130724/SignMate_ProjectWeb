import React, { useState, useEffect, useMemo } from 'react';
import { Users, Search, Filter, Loader2, Mail, Shield, Building2, Calendar, MoreVertical, Ban, CheckCircle2, AlertCircle } from 'lucide-react';
import { usersApi, centersApi } from '../services/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersData, centersData] = await Promise.all([
          usersApi.getAll(roleFilter),
          centersApi.getAll()
        ]);
        setUsers(usersData);
        setCenters(centersData);
      } catch (err) {
        setError(err.message || 'Lỗi lấy dữ liệu người dùng');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [roleFilter]);

  const getCenterName = (centerId) => {
    if (!centerId) return 'B2C (Cá nhân)';
    const center = centers.find(c => c.id === centerId);
    return center ? center.name : 'Đang tải...';
  };

  const filteredUsers = useMemo(() => {
    return users.filter(user => 
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

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

  if (loading && users.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '120px', color: 'var(--primary)' }}>
        <Loader2 size={36} className="spin-icon" style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Quản lý Người dùng</h1>
        <p className="page-subtitle">Quản lý tài khoản hệ thống B2C (Cá nhân) và B2B (Doanh nghiệp)</p>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {/* Search */}
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

        {/* Filter */}
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
          <div style={{ fontSize: '14px', color: 'var(--gray-400)' }}>
            Cập nhật lần cuối: {new Date().toLocaleTimeString()}
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style={{ width: '50px' }}>#</th>
              <th>Họ và Tên</th>
              <th>Email / Liên hệ</th>
              <th>Vai trò</th>
              <th>Trung tâm</th>
              <th>Ngày tham gia</th>
              <th style={{ width: '80px' }}></th>
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
                      <div style={{ fontSize: '12px', color: 'var(--gray-400)' }}>ID: {user.id.substring(0, 8)}...</div>
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
                    <Calendar size={14} /> {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                  </div>
                </td>
                <td>
                  <button className="btn btn-white btn-sm" style={{ padding: '8px', border: 'none', background: 'transparent' }}>
                    <MoreVertical size={18} color="var(--gray-400)" />
                  </button>
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

      <style>{`
        .spin-icon { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .badge-gray { background: var(--gray-100); color: var(--gray-500); }
      `}</style>
    </>
  );
};

export default UserManagement;

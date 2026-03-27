import React, { useState, useEffect } from 'react';
import { CreditCard, TrendingUp, Users, Calendar, Search, Filter, Loader2, ArrowUpRight, DollarSign, ExternalLink, ShieldCheck, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { subscriptionApi } from '../services/api';

const SubscriptionManagement = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    const fetchSubs = async () => {
      try {
        const data = await subscriptionApi.getAll();
        setSubscriptions(data);
      } catch (err) {
        setError(err.message || 'Lỗi lấy dữ liệu đăng ký');
      } finally {
        setLoading(false);
      }
    };
    fetchSubs();
  }, []);

  const stats = {
    totalRevenue: subscriptions.reduce((acc, s) => acc + (s.priceVnd || 0), 0),
    activeSubs: subscriptions.filter(s => s.isActive).length,
    mrr: subscriptions.filter(s => s.isActive).reduce((acc, s) => acc + (s.priceVnd || 0), 0),
    avgTicket: subscriptions.length > 0 ? (subscriptions.reduce((acc, s) => acc + (s.priceVnd || 0), 0) / subscriptions.length) : 0
  };

  const filteredSubs = subscriptions.filter(s => {
    const matchesSearch = s.userFullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (s.centerName && s.centerName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = activeFilter === 'all' || 
                         (activeFilter === 'active' && s.isActive) || 
                         (activeFilter === 'expired' && !s.isActive);
    return matchesSearch && matchesStatus;
  });

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '120px' }}><Loader2 className="spinning" size={32} color="var(--primary)" /></div>;

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Quản lý Gói dịch vụ & Doanh thu</h1>
        <p className="page-subtitle">Theo dõi các giao dịch nâng cấp, gia hạn và tình trạng thuê bao</p>
      </div>

      {/* Financial Overview */}
      <div className="stat-grid" style={{ marginBottom: '32px' }}>
        <div className="stat-card" style={{ borderLeft: '4px solid var(--green)' }}>
          <div className="stat-label">Tổng doanh thu (Lifetime)</div>
          <div className="stat-value">{stats.totalRevenue.toLocaleString()} VNĐ</div>
          <div style={{ fontSize: '12px', color: 'var(--green)', fontWeight: 700, marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TrendingUp size={14} /> +15.4% so với kpi
          </div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid var(--blue)' }}>
          <div className="stat-label">Doanh thu định kỳ (MRR)</div>
          <div className="stat-value">{stats.mrr.toLocaleString()} VNĐ</div>
          <div style={{ fontSize: '12px', color: 'var(--gray-400)', marginTop: '8px' }}>Dựa trên {stats.activeSubs} thuê bao active</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid var(--purple)' }}>
          <div className="stat-label">Thuê bao đang hoạt động</div>
          <div className="stat-value">{stats.activeSubs}</div>
          <div style={{ fontSize: '12px', color: 'var(--purple)', fontWeight: 700, marginTop: '8px' }}>Tỷ lệ churn: 2.1%</div>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="table-wrapper">
        <div className="table-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div className="table-title">Lịch sử đăng ký & Giao dịch</div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
              <input 
                type="text" 
                placeholder="Tìm khách hàng..." 
                className="form-input" 
                style={{ paddingLeft: '36px', height: '36px', margin: 0, width: '240px' }}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="form-input" 
              style={{ height: '36px', margin: 0, width: '140px' }}
              value={activeFilter}
              onChange={e => setActiveFilter(e.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hiệu lực</option>
              <option value="expired">Hết hạn</option>
            </select>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Khách hàng / Trung tâm</th>
              <th>Gói dịch vụ</th>
              <th>Giá tiền</th>
              <th>Thời hạn</th>
              <th>Trạng thái</th>
              <th style={{ textAlign: 'right' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubs.map(s => (
              <tr key={s.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--blue-50)', color: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                      {s.userFullName[0]}
                    </div>
                    <div>
                      <div style={{ fontWeight: 800 }}>{s.userFullName}</div>
                      <div style={{ fontSize: '12px', color: 'var(--gray-400)' }}>{s.centerName || 'Cá nhân (B2C)'}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span style={{ fontWeight: 700, color: 'var(--text-dark)' }}>{s.planName}</span>
                </td>
                <td>
                  <div style={{ fontWeight: 800 }}>{s.priceVnd.toLocaleString()} <span style={{ fontSize: '10px', color: 'var(--gray-400)' }}>VNĐ</span></div>
                </td>
                <td>
                  <div style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={14} color="var(--gray-300)" />
                    {new Date(s.startDate).toLocaleDateString('vi-VN')}
                    <span style={{ color: 'var(--gray-300)' }}>→</span>
                    {new Date(s.endDate).toLocaleDateString('vi-VN')}
                  </div>
                </td>
                <td>
                  {s.isActive ? (
                    <span className="badge badge-green" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={12} /> Active
                    </span>
                  ) : (
                    <span className="badge badge-gray" style={{ background: '#f1f1f1', color: '#999', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <XCircle size={12} /> Expired
                    </span>
                  )}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button className="btn btn-white btn-sm" style={{ padding: '8px' }}>
                    <ExternalLink size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {filteredSubs.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '64px', color: 'var(--gray-400)' }}>
                  Chưa có giao dịch hay gói dịch vụ nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '32px', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ margin: 0 }}>Giao dịch gần đây</h3>
            <button className="btn btn-blue btn-sm" style={{ padding: '4px 12px', fontSize: '12px' }}>Xem tất cả</button>
          </div>
          <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray-300)', border: '2px dashed var(--gray-50)', borderRadius: '12px' }}>
            <div style={{ textAlign: 'center' }}>
              <Clock size={32} style={{ marginBottom: '8px', opacity: 0.5 }} />
              <div>Lịch sử chi tiết đang đồng bộ...</div>
            </div>
          </div>
        </div>

        <div className="card" style={{ background: 'var(--primary)', color: 'white' }}>
          <h3 style={{ margin: '0 0 16px', color: 'white' }}>Upgrade & Retention</h3>
          <p style={{ fontSize: '14px', opacity: 0.9, lineHeight: 1.6 }}>Cần tập trung vào việc chuyển đổi học viên cá nhân (B2C) sang gói Yearly để tối ưu hóa MRR.</p>
          <div style={{ marginTop: '24px', background: 'rgba(255,255,255,0.1)', padding: '16px', borderRadius: '12px' }}>
            <div style={{ fontSize: '13px', marginBottom: '8px' }}>Conversion Rate (B2C → Pro)</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.2)', borderRadius: '4px' }}>
                <div style={{ width: '12%', height: '100%', background: 'white', borderRadius: '4px' }}></div>
              </div>
              <span style={{ fontWeight: 800 }}>12%</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SubscriptionManagement;

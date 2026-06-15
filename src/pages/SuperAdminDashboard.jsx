import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Users, Activity, Building2, CreditCard, ArrowUpRight, ArrowDownRight, Globe, DollarSign } from 'lucide-react';
import { centersApi, usersApi, subscriptionApi, adminApi } from '../services/api';

// Tách ra ngoài để tránh re-define mỗi render (S6478)
const StatCard = ({ title, value, subValue, icon: Icon, colorClass, trend, clickable }) => (
  <div className={`stat-card ${clickable ? 'clickable' : ''}`} style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
      <div>
        <div className="stat-label" style={{ fontSize: '14px', fontWeight: 700, opacity: 0.8 }}>{title}</div>
        <div className="stat-value" style={{ margin: '8px 0', fontSize: '28px' }}>{value}</div>
        {subValue && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 600, color: trend === 'up' ? 'var(--green)' : 'var(--red)' }}>
            {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {subValue}
          </div>
        )}
      </div>
      <div className={`stat-icon ${colorClass}`} style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--white)' }}>
        <Icon size={24} />
      </div>
    </div>
    <div style={{ position: 'absolute', bottom: '-20px', right: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: 'var(--primary)', opacity: 0.03 }} />
  </div>
);
StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  subValue: PropTypes.string,
  icon: PropTypes.elementType.isRequired,
  colorClass: PropTypes.string.isRequired,
  trend: PropTypes.oneOf(['up', 'down']),
};

// Bars trong biểu đồ phân bổ — tách riêng để giảm nesting depth (S2004)
const DistBar = ({ count, total, color }) => {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div style={{ height: '120px', width: '40px', background: 'var(--gray-100)', borderRadius: '20px', margin: '0 auto', display: 'flex', alignItems: 'flex-end', overflow: 'hidden' }}>
      <div style={{ height: `${pct}%`, width: '100%', background: color }} />
    </div>
  );
};
DistBar.propTypes = {
  count: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
};

const INITIAL_STATS = {
  totalUsers: 0, totalCenters: 0,
  b2bUsers: 0, b2cUsers: 0,
  premiumUsers: 0, basicUsers: 0, freeUsers: 0,
  conversionRate: 0, retentionRate: 0, revenue: 0,
};

// Module-level để tránh nesting quá 4 cấp (S2004)
const loadGlobalStats = async (setStats, setLoading) => {
  try {
    const [dash, centers] = await Promise.all([
      adminApi.getDashboard().catch(() => null),
      centersApi.getAll().catch(() => []),
    ]);
    const safeCenters = Array.isArray(centers) ? centers : [];

    if (dash) {
      setStats({
        totalUsers: dash.totalUsers ?? 0,
        totalCenters: dash.activeCenters ?? safeCenters.length,
        // BE trả sẵn b2bUsers (chỉ đếm student B2B); tự suy totalUsers - b2cUsers
        // sẽ tính nhầm cả admin/teacher vào B2B.
        b2bUsers: dash.b2bUsers ?? 0,
        b2cUsers: dash.b2cUsers ?? 0,
        premiumUsers: dash.premiumUsers ?? 0,
        basicUsers: dash.basicUsers ?? 0,
        freeUsers: dash.freeUsers ?? 0,
        conversionRate: dash.conversionRate ?? 0,
        retentionRate: dash.retentionRate ?? 0,
        revenue: dash.totalRevenue ?? 0,
      });
      return;
    }

    // Fallback: derive từ raw lists
    const [users, subs] = await Promise.all([
      usersApi.getAll().catch(() => []),
      subscriptionApi.getAll().catch(() => []),
    ]);
    const safeUsers = Array.isArray(users) ? users : [];
    const safeSubs = Array.isArray(subs) ? subs : [];
    const students = safeUsers.filter(u => u?.role === 'Student');
    const b2bCount = students.filter(u => u?.centerId).length;
    const revenue = safeSubs.reduce((acc, s) => acc + (s.priceVnd || 0), 0);
    setStats(prev => ({
      ...prev,
      totalUsers: safeUsers.length,
      totalCenters: safeCenters.length,
      b2bUsers: b2bCount,
      b2cUsers: students.length - b2bCount,
      revenue,
    }));
  } catch (err) {
    console.error('Failed to fetch global stats', err);
  } finally {
    setLoading(false);
  }
};

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState(INITIAL_STATS);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadGlobalStats(setStats, setLoading); }, []);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}><div className="spinning">Loading...</div></div>;
  }

  const planRows = [
    { label: 'Gói Premium (Nâng cao)', count: stats.premiumUsers, color: 'var(--yellow)' },
    { label: 'Gói Basic (Cơ bản)',     count: stats.basicUsers,   color: 'var(--blue)'   },
    { label: 'Gói Free (Miễn phí)',    count: stats.freeUsers,    color: 'var(--gray-300)' },
  ];

  const distCols = [
    { label: 'B2B (Hợp tác)', count: stats.b2bUsers,    color: 'linear-gradient(to top, var(--primary), var(--purple))' },
    { label: 'B2C (Cá nhân)', count: stats.b2cUsers,    color: 'linear-gradient(to top, var(--blue), var(--green))'     },
    { label: 'Premium',       count: stats.premiumUsers, color: 'linear-gradient(to top, var(--yellow), var(--orange))'  },
    { label: 'Free',          count: stats.freeUsers,    color: 'var(--gray-300)'                                        },
  ];

  return (
    <>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">CEO Management Center</h1>
          <p className="page-subtitle">Theo dõi các chỉ số tăng trưởng, tài chính và quan hệ đối tác B2B</p>
        </div>
        <button className="btn btn-primary" onClick={() => globalThis.location.href = '/admin/revenue'}>
          <CreditCard size={18} style={{ marginRight: '8px' }} /> Báo Cáo Tài Chính
        </button>
      </div>

      <div className="stat-grid" style={{ marginBottom: '32px' }}>
        <StatCard title="Tổng người dùng" value={stats.totalUsers.toLocaleString()} subValue={`${stats.premiumUsers} Premium · ${stats.freeUsers} Free`} trend="up" icon={Users} colorClass="card-icon-blue" />
        <StatCard title="Đối tác B2B (Trung tâm)" value={stats.totalCenters} subValue={`${stats.b2bUsers} B2B · ${stats.b2cUsers} B2C`} trend="up" icon={Building2} colorClass="card-icon-purple" />
        <button style={{ all: 'unset', display: 'block', cursor: 'pointer', width: '100%' }} onClick={() => globalThis.location.href = '/admin/revenue'}>
          <StatCard title="Doanh thu thực thu" value={stats.revenue > 0 ? `${stats.revenue.toLocaleString('vi-VN')} ₫` : '—'} subValue="Xem chi tiết →" trend="up" icon={DollarSign} colorClass="card-icon-green" clickable />
        </button>
        <StatCard title="Chuyển đổi Free → Paid" value={`${(stats.conversionRate || 0).toFixed(1)}%`} subValue={`Retention: ${(stats.retentionRate || 0).toFixed(1)}%`} trend="up" icon={Activity} colorClass="card-icon-yellow" />
      </div>

      <div className="grid-2" style={{ gap: '24px', marginBottom: '32px' }}>
        {/* Phân bổ người dùng */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ margin: 0 }}>Phân bổ Người dùng</h3>
            <span className="badge badge-blue">Platform-wide</span>
          </div>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center', justifyContent: 'center', height: '180px' }}>
            {distCols.map(({ label, count, color }) => (
              <div key={label} style={{ textAlign: 'center', flex: 1 }}>
                <DistBar count={count} total={stats.totalUsers} color={color} />
                <div style={{ marginTop: '12px', fontWeight: 800 }}>{count}</div>
                <div style={{ fontSize: '12px', color: 'var(--gray-400)' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Thao tác nhanh */}
        <div className="card" style={{ background: 'linear-gradient(135deg, var(--white) 0%, #f4f0ff 100%)' }}>
          <h3 style={{ marginBottom: '16px' }}>Thao tác Nhanh</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[
              { icon: <Users size={24} color="var(--blue)" />,     label: 'Quản lý người dùng', href: '/admin/users' },
              { icon: <Building2 size={24} color="var(--primary)" />, label: 'Cài đặt Trung tâm',  href: '/admin/b2b' },
              { icon: <Globe size={24} color="var(--green)" />,    label: 'Nội dung khoá học',  href: '/admin/content' },
              { icon: <CreditCard size={24} color="var(--yellow)" />, label: 'Báo cáo doanh thu', href: '/admin/revenue' },
            ].map(({ icon, label, href }) => (
              <button
                key={label}
                className="btn btn-white"
                style={{ display: 'flex', flexDirection: 'column', height: '100px', justifyContent: 'center', gap: '8px', border: '1px solid var(--gray-100)' }}
                onClick={() => globalThis.location.href = href}
              >
                {icon}
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Phân bổ gói dịch vụ */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3>Phân bổ Gói dịch vụ</h3>
          <button className="btn btn-outline btn-sm" onClick={() => globalThis.location.href = '/admin/subscriptions'}>
            Quản lý <ArrowUpRight size={14} />
          </button>
        </div>
        {planRows.map(({ label, count, color }) => (
          <div key={label} style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '14px', fontWeight: 700 }}>
              <span>{label}</span>
              <span style={{ color: 'var(--gray-500)' }}>
                {count} user ({stats.totalUsers > 0 ? ((count / stats.totalUsers) * 100).toFixed(0) : 0}%)
              </span>
            </div>
            <div style={{ height: '8px', background: 'var(--gray-100)', borderRadius: '99px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${stats.totalUsers > 0 ? (count / stats.totalUsers) * 100 : 0}%`, background: color, borderRadius: '99px', transition: 'width 0.8s ease' }} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default SuperAdminDashboard;

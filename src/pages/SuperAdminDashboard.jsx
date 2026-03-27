import React, { useState, useEffect } from 'react';
import { Users, Activity, BarChart3, Building2, TrendingUp, CreditCard, PieChart, ArrowUpRight, ArrowDownRight, UserPlus, Globe, LogIn } from 'lucide-react';
import { centersApi, usersApi } from '../services/api';

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCenters: 0,
    b2bUsers: 0,
    b2cUsers: 0,
    activeToday: 0,
    revenue: 125000000, // 125M VND
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGlobalStats = async () => {
      try {
        const [users, centers] = await Promise.all([
          usersApi.getAll(),
          centersApi.getAll()
        ]);
        
        setStats({
          totalUsers: users.length,
          totalCenters: centers.length,
          b2bUsers: users.filter(u => u.centerId).length,
          b2cUsers: users.filter(u => !u.centerId).length,
          activeToday: Math.floor(users.length * 0.3), // Mock 30% active
          revenue: centers.length * 25000000, // Mock 25M per center
        });
      } catch (err) {
        console.error('Failed to fetch global stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGlobalStats();
  }, []);

  const StatCard = ({ title, value, subValue, icon: Icon, colorClass, trend }) => (
    <div className="stat-card" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
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
      {/* Decorative gradient background */}
      <div style={{ 
        position: 'absolute', bottom: '-20px', right: '-20px', 
        width: '100px', height: '100px', borderRadius: '50%',
        background: 'var(--primary)', opacity: 0.03
      }}></div>
    </div>
  );

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}><div className="spinning">Loading...</div></div>;
  }

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Hệ thống Tổng quaan (Platform Admin)</h1>
        <p className="page-subtitle">Thống kê toàn bộ dữ liệu người dùng, đối tác và doanh thu</p>
      </div>

      <div className="stat-grid" style={{ marginBottom: '32px' }}>
        <StatCard title="Tổng người dùng" value={stats.totalUsers.toLocaleString()} subValue="+12% so với tháng trước" trend="up" icon={Users} colorClass="card-icon-blue" />
        <StatCard title="Đối tác B2B (Trung tâm)" value={stats.totalCenters} subValue="+2 đối tác mới" trend="up" icon={Building2} colorClass="card-icon-purple" />
        <StatCard title="Doanh thu dự kiến" value={`${(stats.revenue / 1000000).toFixed(0)}M`} subValue="+8% doanh thu" trend="up" icon={CreditCard} colorClass="card-icon-green" />
        <StatCard title="Hoạt động trong ngày" value={stats.activeToday} subValue="-3% từ tuần trước" trend="down" icon={Activity} colorClass="card-icon-yellow" />
      </div>

      <div className="grid-2" style={{ gap: '24px', marginBottom: '32px' }}>
        {/* User Distribution Chart Placeholder */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ margin: 0 }}>Phân bổ Người dùng</h3>
            <span className="badge badge-blue">Platform-wide</span>
          </div>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center', justifyContent: 'center', height: '180px' }}>
            {/* Visual breakdown bars */}
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ height: '120px', width: '40px', background: 'var(--gray-100)', borderRadius: '20px', margin: '0 auto', display: 'flex', alignItems: 'flex-end', overflow: 'hidden' }}>
                <div style={{ height: `${(stats.b2bUsers / stats.totalUsers) * 100}%`, width: '100%', background: 'linear-gradient(to top, var(--primary), var(--purple))' }}></div>
              </div>
              <div style={{ marginTop: '12px', fontWeight: 800 }}>{stats.b2bUsers}</div>
              <div style={{ fontSize: '12px', color: 'var(--gray-400)' }}>B2B (Hợp tác)</div>
            </div>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ height: '120px', width: '40px', background: 'var(--gray-100)', borderRadius: '20px', margin: '0 auto', display: 'flex', alignItems: 'flex-end', overflow: 'hidden' }}>
                <div style={{ height: `${(stats.b2cUsers / stats.totalUsers) * 100}%`, width: '100%', background: 'linear-gradient(to top, var(--blue), var(--green))' }}></div>
              </div>
              <div style={{ marginTop: '12px', fontWeight: 800 }}>{stats.b2cUsers}</div>
              <div style={{ fontSize: '12px', color: 'var(--gray-400)' }}>B2C (Cá nhân)</div>
            </div>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ height: '120px', width: '40px', background: 'var(--gray-100)', borderRadius: '20px', margin: '0 auto', display: 'flex', alignItems: 'flex-end', overflow: 'hidden' }}>
                <div style={{ height: '15%', width: '100%', background: 'var(--gray-300)' }}></div>
              </div>
              <div style={{ marginTop: '12px', fontWeight: 800 }}>{(stats.totalUsers * 0.05).toFixed(0)}</div>
              <div style={{ fontSize: '12px', color: 'var(--gray-400)' }}>Đang Chờ</div>
            </div>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="card" style={{ background: 'linear-gradient(135deg, var(--white) 0%, #f4f0ff 100%)' }}>
          <h3 style={{ marginBottom: '16px' }}>Thao tác Nhanh</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <button 
              className="btn btn-white" 
              style={{ display: 'flex', flexDirection: 'column', height: '100px', justifyContent: 'center', gap: '8px', border: '1px solid var(--gray-100)' }}
              onClick={() => window.location.href = '/admin/users'}
            >
              <Users size={24} color="var(--blue)" />
              <span>Quản lý người dùng</span>
            </button>
            <button 
              className="btn btn-white" 
              style={{ display: 'flex', flexDirection: 'column', height: '100px', justifyContent: 'center', gap: '8px', border: '1px solid var(--gray-100)' }}
              onClick={() => window.location.href = '/admin/b2b'}
            >
              <Building2 size={24} color="var(--primary)" />
              <span>Cài đặt Trung tâm</span>
            </button>
            <button className="btn btn-white" style={{ display: 'flex', flexDirection: 'column', height: '100px', justifyContent: 'center', gap: '8px', border: '1px solid var(--gray-100)' }}>
              <Globe size={24} color="var(--green)" />
              <span>Cập nhật Landing</span>
            </button>
            <button className="btn btn-white" style={{ display: 'flex', flexDirection: 'column', height: '100px', justifyContent: 'center', gap: '8px', border: '1px solid var(--gray-100)' }}>
              <CreditCard size={24} color="var(--yellow)" />
              <span>Báo cáo doanh thu</span>
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3>Kế hoạch Phát triển Hệ thống</h3>
          <ArrowUpRight size={20} color="var(--primary)" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', borderRadius: '12px', background: 'var(--gray-50)' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--green)' }}></div>
            <div style={{ flex: 1, fontSize: '15px' }}>Tích hợp thanh toán QR Code mới (VNPAY/Momo)</div>
            <div style={{ fontSize: '13px', color: 'var(--gray-400)', fontWeight: 700 }}>Hoàn thành 80%</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', borderRadius: '12px', background: 'var(--gray-50)' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--blue)' }}></div>
            <div style={{ flex: 1, fontSize: '15px' }}>Nâng cấp máy chủ AI cho chức năng Feedback luyện tập</div>
            <div style={{ fontSize: '13px', color: 'var(--gray-400)', fontWeight: 700 }}>Đang triển khai</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SuperAdminDashboard;

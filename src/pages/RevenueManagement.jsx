import React, { useState, useEffect, useCallback } from 'react';
import { 
  DollarSign, TrendingUp, TrendingDown, Calendar, Search, 
  ArrowUpRight, ArrowDownRight, CreditCard, PieChart, 
  FileText, Download, Clock, CheckCircle2, AlertCircle, Loader2, 
  ArrowRight, Landmark, Layers, Users
} from 'lucide-react';
import { subscriptionApi } from '../services/api';

const RevenueManagement = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('30d');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await subscriptionApi.getAll();
      setTransactions(data || []);
    } catch (err) {
      setError(err.message);
      setTransactions([]);
    } finally {
      setLoading(false);
    }

  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Thống kê doanh nghiệp
  const totalRevenue = transactions.reduce((acc, t) => acc + (t.priceVnd || 0), 0);
  const b2bRevenue = transactions.filter(t => t.source === 'B2B' || t.centerName).reduce((acc, t) => acc + (t.priceVnd || 0), 0);
  const b2cRevenue = totalRevenue - b2bRevenue;

  const StatPanel = ({ title, value, icon: Icon, trend, trendValue, color }) => (
    <div className="card" style={{ padding: '24px', border: '1px solid var(--gray-100)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${color}15`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={20} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 800, color: trend === 'up' ? 'var(--green)' : 'var(--red)' }}>
          {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {trendValue}
        </div>
      </div>
      <div style={{ fontSize: '13px', color: 'var(--gray-400)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</div>
      <div style={{ fontSize: '24px', fontWeight: 900, marginTop: '8px' }}>{value}</div>
    </div>
  );

  if (loading) return <div style={{ textAlign: 'center', padding: '120px' }}><Loader2 className="spinning" /></div>;

  return (
    <>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Financial Dashboard (CEO Room)</h1>
          <p className="page-subtitle">Theo dõi dòng tiền, doanh thu B2B/B2C và hiệu quả kinh doanh</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <select className="form-input" style={{ width: '160px', margin: 0 }} value={timeRange} onChange={e => setTimeRange(e.target.value)}>
            <option value="30d">30 ngày qua</option>
            <option value="90d">Quý này</option>
            <option value="ytd">Năm nay</option>
          </select>
          <button className="btn btn-primary"><Download size={16} /> Xuất tài chính</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
        <StatPanel title="Tổng Doanh Thu" value={`${(totalRevenue / 1000000).toFixed(1)}M VNĐ`} icon={Landmark} trend="up" trendValue="+12.5%" color="var(--primary)" />
        <StatPanel title="Doanh thu B2B" value={`${(b2bRevenue / 1000000).toFixed(1)}M VNĐ`} icon={Layers} trend="up" trendValue="+8.2%" color="var(--purple)" />
        <StatPanel title="Doanh thu B2C" value={`${(b2cRevenue / 1000).toFixed(0)}k VNĐ`} icon={Users} trend="down" trendValue="-3.1%" color="var(--blue)" />
        <StatPanel title="Tỷ suất Lợi nhuận" value="68.2%" icon={TrendingUp} trend="up" trendValue="+2.4%" color="var(--green)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '32px', marginBottom: '32px' }}>
        {/* Doanh thu biểu đồ placeholder */}
        <div className="card" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
             <h3 style={{ margin: 0 }}>Xu hướng Dòng tiền</h3>
             <div style={{ display: 'flex', gap: '16px', fontSize: '13px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary)' }}></div> Dự kiến</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--gray-300)' }}></div> Thực thu</div>
             </div>
          </div>
          <div style={{ height: '240px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '12px' }}>
             {[60, 45, 80, 55, 90, 70, 85].map((h, i) => (
               <div key={i} style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                  <div style={{ height: `${h}%`, width: '100%', background: 'linear-gradient(to top, var(--primary), var(--purple))', borderRadius: '4px 4px 0 0', opacity: 0.9 }}></div>
                  <div style={{ height: `${h * 0.7}%`, width: '60%', background: 'var(--gray-200)', borderRadius: '4px 4px 0 0', position: 'absolute', bottom: 0, zIndex: 1 }}></div>
                  <span style={{ fontSize: '11px', color: 'var(--gray-400)', marginTop: '8px' }}>Th {i+1}</span>
               </div>
             ))}
          </div>
        </div>

        {/* Tỷ lệ đóng góp */}
        <div className="card" style={{ padding: '32px' }}>
          <h3 style={{ marginBottom: '24px' }}>Cơ cấu Doanh thu</h3>
          <div style={{ position: 'relative', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '140px', height: '140px', borderRadius: '50%', border: '25px solid var(--primary)', position: 'relative' }}>
               <div style={{ width: '140px', height: '140px', borderRadius: '50%', border: '25px solid var(--blue)', borderTopColor: 'transparent', borderRightColor: 'transparent', position: 'absolute', top: '-25px', left: '-25px' }}></div>
            </div>
            <div style={{ position: 'absolute', textAlign: 'center' }}>
               <div style={{ fontSize: '24px', fontWeight: 900 }}>B2B</div>
               <div style={{ fontSize: '12px', color: 'var(--gray-400)', fontWeight: 700 }}>CHỦ ĐẠO</div>
            </div>
          </div>
          <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ fontWeight: 700, color: 'var(--primary)' }}>Đối tác B2B</span>
                <span style={{ fontWeight: 800 }}>82.5%</span>
             </div>
             <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ fontWeight: 700, color: 'var(--blue)' }}>Cá nhân B2C</span>
                <span style={{ fontWeight: 800 }}>17.5%</span>
             </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '24px', borderBottom: '1.5px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>Giao dịch Gần nhất</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
             <button className="btn btn-outline btn-sm">Thành công</button>
             <button className="btn btn-outline btn-sm">Chờ duyệt</button>
          </div>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th style={{ paddingLeft: '24px' }}>Mã GD</th>
              <th>Khách hàng</th>
              <th>Loại</th>
              <th>Gói đăng ký</th>
              <th>Số tiền</th>
              <th>Trạng thái</th>
              <th style={{ textAlign: 'right', paddingRight: '24px' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {(transactions.length > 0 ? transactions : []).map((t, i) => (
              <tr key={i}>
                <td style={{ paddingLeft: '24px', fontWeight: 700, color: 'var(--gray-400)' }}>#{t.id || `TX${2000+i}`}</td>
                <td style={{ fontWeight: 800 }}>{t.userFullName}</td>
                <td><span className={`badge badge-${t.source === 'B2B' || t.centerName ? 'purple' : 'blue'}`}>{t.source || (t.centerName ? 'B2B' : 'B2C')}</span></td>
                <td style={{ fontWeight: 600 }}>{t.planName}</td>
                <td style={{ fontWeight: 900 }}>{(t.priceVnd || 0).toLocaleString()} <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--gray-300)' }}>đ</span></td>
                <td>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: t.status === 'Pending' ? 'var(--yellow)' : 'var(--green)', fontWeight: 700, fontSize: '13px' }}>
                    {t.status === 'Pending' ? <Clock size={14} /> : <CheckCircle2 size={14} />}
                    {t.status === 'Success' ? 'Thành công' : 'Chờ xử lý'}
                  </span>
                </td>
                <td style={{ textAlign: 'right', paddingRight: '24px' }}><button className="btn btn-white btn-sm"><FileText size={14} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default RevenueManagement;

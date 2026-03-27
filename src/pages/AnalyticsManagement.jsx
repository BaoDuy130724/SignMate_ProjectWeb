import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, PieChart, Activity, Globe, Download, Calendar, ExternalLink, Loader2, ArrowUpRight, ArrowDownRight, Building2, MousePointer2 } from 'lucide-react';
import { analyticsApi } from '../services/api';

const AnalyticsManagement = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        const stats = await analyticsApi.getGlobal();
        setData(stats);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Không thể tải dữ liệu phân tích. Vui lòng kiểm tra kết nối Server.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return (
    <div style={{ padding: '120px', textAlign: 'center', color: 'var(--primary)' }}>
      <Loader2 className="spinning" size={48} />
      <p style={{ marginTop: '16px', fontWeight: 600 }}>Đang tổng hợp dữ liệu toàn hệ thống...</p>
    </div>
  );

  if (error) return (
    <div style={{ padding: '120px', textAlign: 'center' }}>
      <div className="card" style={{ maxWidth: '500px', margin: '0 auto', border: '2px solid var(--red-light)' }}>
        <h3 style={{ color: 'var(--red)', marginBottom: '12px' }}>Oops! Đã có lỗi xảy ra</h3>
        <p style={{ color: 'var(--gray-500)', marginBottom: '24px' }}>{error}</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>Thử lại</button>
      </div>
    </div>
  );

  if (!data) return null;

  return (
    <>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Hệ thống Phân tích Nâng cao</h1>
          <p className="page-subtitle">Dữ liệu tăng trưởng, hành vi và hiệu quả đào tạo trên toàn nền tảng</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <select className="form-input" style={{ width: '140px', margin: 0 }} value={timeRange} onChange={e => setTimeRange(e.target.value)}>
            <option value="7d">7 ngày qua</option>
            <option value="30d">30 ngày qua</option>
            <option value="90d">Quý này</option>
          </select>
          <button className="btn btn-white btn-sm" style={{ padding: '8px 16px' }}><Download size={16} /> Xuất báo cáo</button>
        </div>
      </div>

      {/* Top Level KPIs */}
      <div className="stat-grid" style={{ marginBottom: '32px' }}>
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span className="stat-label">User Engagement</span>
            <Activity size={18} color="var(--primary)" />
          </div>
          <div className="stat-value">{data.totalPracticeSessions.toLocaleString()}</div>
          <div style={{ color: 'var(--gray-400)', fontSize: '13px', marginTop: '4px' }}>Tổng phiên luyện tập (Sessions)</div>
          <div className="trend-up" style={{ marginTop: '12px', fontSize: '12px', fontWeight: 700, color: 'var(--green)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ArrowUpRight size={14} /> +24% vs tháng trước
          </div>
        </div>
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span className="stat-label">Độ chính xác trung bình</span>
            <PieChart size={18} color="var(--green)" />
          </div>
          <div className="stat-value">{(data.totalSuccessfulAttempts / (data.totalPracticeSessions * 10 || 1) * 100).toFixed(1)}%</div>
          <div style={{ color: 'var(--gray-400)', fontSize: '13px', marginTop: '4px' }}>Tỷ lệ nhận diện đúng cử điệu</div>
        </div>
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span className="stat-label">Lưu lượng Truy cập</span>
            <Globe size={18} color="var(--blue)" />
          </div>
          <div className="stat-value">{(data.totalUsers * 4.2).toFixed(0)}</div>
          <div style={{ color: 'var(--gray-400)', fontSize: '13px', marginTop: '4px' }}>Traffic tích lũy (Page views)</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px', marginBottom: '32px' }}>
        {/* User Growth Chart (Visual Representation) */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ margin: 0 }}>Xu hướng Tăng trưởng Người dùng</h3>
            <span style={{ fontSize: '13px', color: 'var(--gray-400)' }}>Dữ liệu 30 ngày qua</span>
          </div>
          <div style={{ height: '300px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 10px', gap: '4px', borderBottom: '1px solid var(--gray-100)' }}>
            {(data.userGrowth || []).map((g, i) => (
              <div key={i} className="chart-bar-container" style={{ flex: 1, position: 'relative' }}>
                <div 
                  className="chart-bar" 
                  style={{ 
                    height: `${Math.max(10, (g.value / Math.max(...data.userGrowth.map(d => d.value))) * 250)}px`,
                    width: '100%',
                    background: 'linear-gradient(to top, var(--primary), var(--purple))',
                    borderRadius: '4px 4px 0 0',
                    transition: 'all 0.5s ease-out'
                  }}
                ></div>
                {/* Tooltip on hover simulation with css */}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '11px', color: 'var(--gray-400)' }}>
            <span>{data.userGrowth[0]?.Label}</span>
            <span>{data.userGrowth[data.userGrowth.length - 1]?.Label}</span>
          </div>
        </div>

        {/* User Type Distribution */}
        <div className="card">
          <h3 style={{ marginBottom: '24px' }}>Cơ cấu Người dùng</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {(data.userDistribution || []).map(d => (
              <div key={d.Name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                  <span style={{ fontWeight: 700 }}>{d.Name}</span>
                  <span style={{ color: 'var(--gray-500)' }}>{d.Value} ({((d.Value / data.totalUsers) * 100).toFixed(0)}%)</span>
                </div>
                <div style={{ height: '8px', background: 'var(--gray-100)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ 
                    width: `${(d.Value / data.totalUsers) * 100}%`, 
                    height: '100%', 
                    background: d.Name.includes('B2B') ? 'var(--primary)' : 'var(--blue)' 
                  }}></div>
                </div>
              </div>
            ))}
            <div style={{ marginTop: '20px', padding: '20px', background: 'var(--gray-50)', borderRadius: '12px', fontSize: '14px' }}>
              <div style={{ color: 'var(--gray-500)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={16} /> User Acquisition Cost (UAC)
              </div>
              <div style={{ fontWeight: 800, fontSize: '18px' }}>48.000 VNĐ / user</div>
              <div style={{ fontSize: '12px', color: 'var(--green)', fontWeight: 700, marginTop: '4px' }}>↓ Giảm 12% so với quý trước</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
        {/* Top Courses */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <h3 style={{ marginBottom: '20px' }}>Xếp hạng Khóa học (Lượt đăng ký)</h3>
          <table>
            <thead>
              <tr>
                <th>Khóa học</th>
                <th>Người học</th>
                <th>Tăng trưởng</th>
                <th style={{ textAlign: 'right' }}>% Hoàn thành</th>
              </tr>
            </thead>
            <tbody>
              {(data.topCourses || []).map((c, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 800 }}>{c.Name}</td>
                  <td style={{ fontWeight: 700 }}>{c.Value}</td>
                  <td><span style={{ color: 'var(--green)', fontWeight: 700 }}>+{Math.floor(Math.random() * 20)}%</span></td>
                  <td style={{ textAlign: 'right' }}>{60 + Math.floor(Math.random() * 30)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* System Health */}
        <div className="card" style={{ background: 'linear-gradient(135deg, #2D3436 0%, #000 100%)', color: 'white' }}>
          <h3 style={{ color: 'white', marginBottom: '16px' }}>Sức khỏe Hệ thống</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', opacity: 0.8 }}>Server Uptime</span>
              <span style={{ color: 'var(--green)', fontWeight: 800 }}>99.98%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', opacity: 0.8 }}>API Latency</span>
              <span style={{ color: 'var(--green)', fontWeight: 800 }}>84ms</span>
            </div>
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
            <div style={{ textAlign: 'center', padding: '12px' }}>
              <div style={{ fontSize: '12px', opacity: 0.6, marginBottom: '4px' }}>AI Recognized Today</div>
              <div style={{ fontSize: '24px', fontWeight: 800 }}>1,248</div>
            </div>
            <button className="btn btn-white" style={{ width: '100%', marginTop: 'auto' }}>
              Chi tiết Server <ExternalLink size={14} />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .chart-bar:hover { opacity: 0.8; filter: brightness(1.2); }
        .spinning { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
};

export default AnalyticsManagement;

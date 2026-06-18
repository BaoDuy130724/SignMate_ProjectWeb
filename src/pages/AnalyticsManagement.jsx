import React, { useState, useEffect } from 'react';
import { PieChart, Activity, Download, Loader2, ArrowUpRight, ArrowDownRight, Building2 } from 'lucide-react';
import { analyticsApi } from '../services/api';
import { exportReportPdf } from '../utils/exportPdf';

const AnalyticsManagement = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('30d');
  const [activeBarIndex, setActiveBarIndex] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        // Đảm bảo API trả về đúng format hoặc xử lý an toàn
        const stats = await analyticsApi.getGlobal();
        setData(stats || {
          totalPracticeSessions: 0,
          totalUsers: 0,
          totalSuccessfulAttempts: 0,
          userGrowth: [],
          userDistribution: [],
          topCourses: []
        });
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu phân tích:", err);
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

  // Mặc định hóa data để tránh null access
  const safeData = {
    totalPracticeSessions: data?.totalPracticeSessions || 0,
    totalUsers: data?.totalUsers || 0,
    totalCenters: data?.totalCenters || 0,
    totalSuccessfulAttempts: data?.totalSuccessfulAttempts || 0,
    averageAccuracy: data?.averageAccuracy || 0,
    b2bUsers: data?.b2bUsers || data?.b2BUsers || 0,
    activeUsersLast30Days: data?.activeUsersLast30Days || 0,
    sessionGrowthPercent: data?.sessionGrowthPercent ?? 0,
    sessionsToday: data?.sessionsToday || 0,
    attemptsToday: data?.attemptsToday || 0,
    activeUsersToday: data?.activeUsersToday || 0,
    userGrowth: Array.isArray(data?.userGrowth) ? data.userGrowth : [],
    userDistribution: Array.isArray(data?.userDistribution) ? data.userDistribution : [],
    topCourses: Array.isArray(data?.topCourses) ? data.topCourses : []
  };

  const growthPositive = safeData.sessionGrowthPercent >= 0;

  const handleExportPdf = async () => {
    setExporting(true);
    try {
      await exportReportPdf({
        title: 'Báo cáo Phân tích Hệ thống',
        subtitle: 'Dữ liệu tăng trưởng và hiệu quả đào tạo toàn nền tảng',
        fileName: 'bao-cao-phan-tich.pdf',
        summary: [
          { label: 'Tổng người dùng', value: safeData.totalUsers },
          { label: 'Người dùng B2B', value: safeData.b2bUsers },
          { label: 'Tổng trung tâm', value: safeData.totalCenters },
          { label: 'Tổng phiên luyện tập', value: safeData.totalPracticeSessions },
          { label: 'Lượt chấm thành công', value: safeData.totalSuccessfulAttempts },
          { label: 'Độ chính xác trung bình', value: `${safeData.averageAccuracy.toFixed(1)}%` },
          { label: 'Người hoạt động (30 ngày)', value: safeData.activeUsersLast30Days },
          { label: 'Tăng trưởng phiên', value: `${safeData.sessionGrowthPercent.toFixed(1)}%` },
          { label: 'Hôm nay (phiên / lượt chấm / HV)', value: `${safeData.sessionsToday} / ${safeData.attemptsToday} / ${safeData.activeUsersToday}` },
        ],
        tables: safeData.topCourses.length > 0 ? [{
          heading: 'Khóa học nổi bật',
          columns: ['Khóa học', 'Lượt đăng ký', 'Mới (30 ngày)', 'Tỷ lệ hoàn thành'],
          rows: safeData.topCourses.map(c => [
            c.name || c.Name || '',
            c.enrollments ?? c.Enrollments ?? 0,
            c.newEnrollmentsLast30Days ?? c.NewEnrollmentsLast30Days ?? 0,
            `${c.completionRate ?? c.CompletionRate ?? 0}%`,
          ]),
        }] : [],
      });
    } catch (err) {
      setError(err.message || 'Lỗi xuất báo cáo.');
    } finally {
      setExporting(false);
    }
  };

  // Tính max value cho biểu đồ
  const maxGrowthValue = safeData.userGrowth.length > 0 
    ? Math.max(...safeData.userGrowth.map(d => d.Value || d.value || 0)) 
    : 1;

  const n = safeData.userGrowth.length;
  const getX = (i) => n > 1 ? (i / (n - 1)) * 600 : 300;
  const polylinePoints = safeData.userGrowth.map((g, i) => {
    const x = getX(i);
    const val = g.Value || g.value || 0;
    const y = 210 - (val / Math.max(1, maxGrowthValue)) * 180;
    return `${x},${y}`;
  }).join(' ');
  const polygonPoints = n > 1 ? `0,210 ${polylinePoints} 600,210` : `300,210 ${polylinePoints} 300,210`;

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
          <button className="btn btn-white btn-sm" style={{ padding: '8px 16px' }} onClick={handleExportPdf} disabled={exporting}>
            {exporting ? <Loader2 size={16} className="spinning" /> : <><Download size={16} /> Xuất báo cáo</>}
          </button>
        </div>
      </div>

      {/* Top Level KPIs */}
      <div className="stat-grid" style={{ marginBottom: '32px' }}>
        <div className="stat-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '8px', padding: '24px', minHeight: '142px', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label" style={{ margin: 0, fontWeight: 700 }}>User Engagement</span>
            <Activity size={18} color="var(--primary)" />
          </div>
          <div className="stat-value" style={{ margin: '4px 0 0', lineHeight: 1.2 }}>{(safeData.totalPracticeSessions || 0).toLocaleString()}</div>
          <div style={{ color: 'var(--gray-400)', fontSize: '13px', marginTop: '2px' }}>Tổng phiên luyện tập (Sessions)</div>
          <div style={{ marginTop: 'auto', paddingTop: '8px', fontSize: '12px', fontWeight: 700, color: growthPositive ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
            {growthPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {growthPositive ? '+' : ''}{safeData.sessionGrowthPercent}% vs 30 ngày trước
          </div>
        </div>
        <div className="stat-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '8px', padding: '24px', minHeight: '142px', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label" style={{ margin: 0, fontWeight: 700 }}>Độ chính xác trung bình</span>
            <PieChart size={18} color="#10b981" />
          </div>
          <div className="stat-value" style={{ margin: '4px 0 0', lineHeight: 1.2 }}>
            {safeData.averageAccuracy.toFixed(1)}%
          </div>
          <div style={{ color: 'var(--gray-400)', fontSize: '13px', marginTop: '2px' }}>Điểm trung bình mọi lượt chấm</div>
          <div style={{ marginTop: 'auto', paddingTop: '8px', fontSize: '12px', color: 'var(--gray-400)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            • {safeData.totalSuccessfulAttempts.toLocaleString()} lượt đạt chuẩn (≥80%)
          </div>
        </div>
        <div className="stat-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '8px', padding: '24px', minHeight: '142px', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label" style={{ margin: 0, fontWeight: 700 }}>Người dùng hoạt động</span>
            <Activity size={18} color="var(--blue)" />
          </div>
          <div className="stat-value" style={{ margin: '4px 0 0', lineHeight: 1.2 }}>{safeData.activeUsersLast30Days.toLocaleString()}</div>
          <div style={{ color: 'var(--gray-400)', fontSize: '13px', marginTop: '2px' }}>Có luyện tập trong 30 ngày</div>
          <div style={{ marginTop: 'auto', paddingTop: '8px', fontSize: '12px', color: 'var(--gray-400)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            • {safeData.totalUsers > 0 ? ((safeData.activeUsersLast30Days / safeData.totalUsers) * 100).toFixed(0) : 0}% trên tổng người dùng
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px', marginBottom: '32px' }}>
        {/* User Growth Chart (Visual Representation) */}
        <div className="card" style={{ position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h3 style={{ margin: 0 }}>Xu hướng Tăng trưởng Người dùng</h3>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--gray-400)' }}>Biểu đồ đường thể hiện lượng tài khoản mới đăng ký hàng ngày</p>
            </div>
            <span style={{ fontSize: '13px', color: 'var(--gray-400)', fontWeight: 600, background: 'var(--gray-50)', padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--gray-100)' }}>30 ngày gần nhất</span>
          </div>
          
          <div style={{ height: '300px', position: 'relative', padding: '0 10px', borderBottom: '1px solid var(--gray-200)', zIndex: 1 }}>
            {safeData.userGrowth.length > 0 ? (
              <div style={{ width: '100%', height: '240px', position: 'relative', marginTop: '30px' }}>
                <svg viewBox="0 0 600 240" width="100%" height="100%" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                  <defs>
                    <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Grid Lines */}
                  <line x1="0" y1="30" x2="600" y2="30" stroke="var(--gray-100)" strokeDasharray="4 4" />
                  <line x1="0" y1="90" x2="600" y2="90" stroke="var(--gray-100)" strokeDasharray="4 4" />
                  <line x1="0" y1="150" x2="600" y2="150" stroke="var(--gray-100)" strokeDasharray="4 4" />
                  <line x1="0" y1="210" x2="600" y2="210" stroke="var(--gray-200)" strokeWidth="1" />

                  {/* Shaded Area under Line */}
                  <polygon
                    points={polygonPoints}
                    fill="url(#growthGrad)"
                  />

                  {/* Line Chart */}
                  <polyline
                    points={polylinePoints}
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Active Crosshair & Circle */}
                  {activeBarIndex !== null && (
                    <>
                      {/* Vertical line (crosshair) */}
                      <line
                        x1={getX(activeBarIndex)}
                        y1="10"
                        x2={getX(activeBarIndex)}
                        y2="210"
                        stroke="var(--primary)"
                        strokeOpacity="0.3"
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                      />
                      {/* Circle on the line */}
                      <circle
                        cx={getX(activeBarIndex)}
                        cy={210 - ((safeData.userGrowth[activeBarIndex].Value || safeData.userGrowth[activeBarIndex].value || 0) / Math.max(1, maxGrowthValue)) * 180}
                        r="6"
                        fill="var(--primary)"
                        stroke="#fff"
                        strokeWidth="2"
                      />
                    </>
                  )}

                  {/* Invisible rects for hover detection */}
                  {safeData.userGrowth.map((g, i) => {
                    const step = n > 1 ? 600 / (n - 1) : 600;
                    const rectX = n > 1 
                      ? (i === 0 ? 0 : i === n - 1 ? 600 - step / 2 : (i * step) - step / 2)
                      : 0;
                    const rectWidth = n > 1
                      ? (i === 0 || i === n - 1 ? step / 2 : step)
                      : 600;
                    return (
                      <rect
                        key={i}
                        x={rectX}
                        y="0"
                        width={rectWidth}
                        height="240"
                        fill="transparent"
                        style={{ cursor: 'pointer' }}
                        onMouseEnter={() => setActiveBarIndex(i)}
                        onMouseLeave={() => setActiveBarIndex(null)}
                      />
                    );
                  })}
                </svg>

                {/* Tooltip Popup */}
                {activeBarIndex !== null && (
                  (() => {
                    const g = safeData.userGrowth[activeBarIndex];
                    const val = g.Value || g.value || 0;
                    const xPercent = n > 1 ? (activeBarIndex / (n - 1)) * 100 : 50;
                    const yVal = (val / Math.max(1, maxGrowthValue)) * 180;
                    const isNearLeft = activeBarIndex < 2;
                    const isNearRight = activeBarIndex > n - 3;
                    
                    let tooltipLeft = `calc(${xPercent}% - 70px)`;
                    if (isNearLeft) tooltipLeft = '10px';
                    if (isNearRight) tooltipLeft = 'auto';

                    return (
                      <div style={{
                        position: 'absolute',
                        bottom: `${yVal + 40}px`,
                        left: tooltipLeft,
                        right: isNearRight ? '10px' : 'auto',
                        background: 'rgba(26, 18, 37, 0.95)',
                        color: '#fff',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                        pointerEvents: 'none',
                        zIndex: 10,
                        whiteSpace: 'nowrap',
                        textAlign: 'center',
                        border: '1px solid rgba(255,255,255,0.1)',
                        transition: 'bottom 0.1s ease, left 0.1s ease'
                      }}>
                        <div style={{ fontWeight: 700, color: 'var(--purple-dark)' }}>{g.Label || g.label}</div>
                        <div style={{ fontWeight: 800, marginTop: '2px' }}>+{val} học viên mới</div>
                      </div>
                    );
                  })()
                )}
              </div>
            ) : (
              <div style={{ width: '100%', textAlign: 'center', paddingBottom: '100px', color: 'var(--gray-300)', zIndex: 1 }}>Không có dữ liệu tăng trưởng</div>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '11px', color: 'var(--gray-400)', fontWeight: 600 }}>
            <span>{safeData.userGrowth[0]?.Label || safeData.userGrowth[0]?.label || 'Bắt đầu'}</span>
            <span>{safeData.userGrowth[safeData.userGrowth.length - 1]?.Label || safeData.userGrowth[safeData.userGrowth.length - 1]?.label || 'Hiện tại'}</span>
          </div>
        </div>

        {/* User Type Distribution */}
        <div className="card">
          <h3 style={{ marginBottom: '24px' }}>Cơ cấu Người dùng</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {safeData.userDistribution.length > 0 ? (
              safeData.userDistribution.map((d, index) => (
                <div key={index}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                    <span style={{ fontWeight: 700 }}>{d.Name || d.name}</span>
                    <span style={{ color: 'var(--gray-500)' }}>
                      {d.Value || d.value || 0} ({safeData.totalUsers > 0 ? (((d.Value || d.value || 0) / safeData.totalUsers) * 100).toFixed(0) : 0}%)
                    </span>
                  </div>
                  <div style={{ height: '8px', background: 'var(--gray-100)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${safeData.totalUsers > 0 ? (((d.Value || d.value || 0) / safeData.totalUsers) * 100) : 0}%`, 
                      height: '100%', 
                      background: (d.Name || d.name || '').includes('B2B') ? 'var(--primary)' : 'var(--blue)' 
                    }}></div>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--gray-300)' }}>Không có dữ liệu phân bổ</p>
            )}
            <div style={{ marginTop: '20px', padding: '20px', background: 'var(--gray-50)', borderRadius: '12px', fontSize: '14px' }}>
              <div style={{ color: 'var(--gray-500)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 size={16} /> Mạng lưới Đối tác
              </div>
              <div style={{ fontWeight: 800, fontSize: '18px' }}>{safeData.totalCenters.toLocaleString()} trung tâm</div>
              <div style={{ fontSize: '12px', color: 'var(--gray-500)', fontWeight: 700, marginTop: '4px' }}>{safeData.b2bUsers.toLocaleString()} học viên B2B đang theo học</div>
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
                <th>HV mới (30 ngày)</th>
                <th style={{ textAlign: 'right' }}>% Hoàn thành</th>
              </tr>
            </thead>
            <tbody>
              {safeData.topCourses.length > 0 ? (
                safeData.topCourses.map((c, i) => {
                  const enrollments = c.enrollments ?? c.Enrollments ?? 0;
                  const newEnroll = c.newEnrollmentsLast30Days ?? c.NewEnrollmentsLast30Days ?? 0;
                  const completion = c.completionRate ?? c.CompletionRate ?? 0;
                  return (
                  <tr key={i}>
                    <td style={{ fontWeight: 800 }}>{c.name || c.Name}</td>
                    <td style={{ fontWeight: 700 }}>{enrollments}</td>
                    <td><span style={{ color: newEnroll > 0 ? 'var(--green)' : 'var(--gray-400)', fontWeight: 700 }}>{newEnroll > 0 ? `+${newEnroll}` : '0'}</span></td>
                    <td style={{ textAlign: 'right' }}>{completion}%</td>
                  </tr>
                  );
                })
              ) : (
                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: 'var(--gray-300)' }}>Chưa có dữ liệu khóa học</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Hoạt động hôm nay (số liệu thật trong ngày, giờ VN) */}
        <div className="card" style={{ background: 'linear-gradient(135deg, #2D3436 0%, #000 100%)', color: 'white' }}>
          <h3 style={{ color: 'white', marginBottom: '16px' }}>Hoạt động Hôm nay</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', opacity: 0.8 }}>Phiên luyện tập</span>
              <span style={{ color: 'var(--green)', fontWeight: 800 }}>{safeData.sessionsToday.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', opacity: 0.8 }}>Học viên hoạt động</span>
              <span style={{ color: 'var(--green)', fontWeight: 800 }}>{safeData.activeUsersToday.toLocaleString()}</span>
            </div>
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
            <div style={{ textAlign: 'center', padding: '12px' }}>
              <div style={{ fontSize: '12px', opacity: 0.6, marginBottom: '4px' }}>Lượt AI chấm điểm hôm nay</div>
              <div style={{ fontSize: '24px', fontWeight: 800 }}>{safeData.attemptsToday.toLocaleString()}</div>
            </div>
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

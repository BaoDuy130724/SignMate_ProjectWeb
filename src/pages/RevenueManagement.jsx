import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp, ArrowUpRight, ArrowDownRight, Download,
  Clock, CheckCircle2, Loader2, Landmark, Layers, Users
} from 'lucide-react';
import { subscriptionApi, analyticsApi } from '../services/api';
import { exportReportPdf } from '../utils/exportPdf';
import AiInsightCard from '../components/AiInsightCard';

const RevenueManagement = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('30d');
  const [activeBarIndex, setActiveBarIndex] = useState(null);
  const [txFilter, setTxFilter] = useState('all'); // all | active | expired
  const [exporting, setExporting] = useState(false);

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

  // ── Thống kê doanh thu — tính 100% từ danh sách giao dịch thật ──
  const isB2B = (t) => !!(t.centerName || t.CenterName); // B2B = học viên gắn trung tâm
  const txAmount = (t) => t.priceVnd || 0;

  const totalRevenue = transactions.reduce((acc, t) => acc + txAmount(t), 0);
  const b2bRevenue = transactions.filter(isB2B).reduce((acc, t) => acc + txAmount(t), 0);
  const b2cRevenue = totalRevenue - b2bRevenue;

  const b2bPercent = totalRevenue > 0 ? Math.round((b2bRevenue / totalRevenue) * 100) : 0;
  const b2cPercent = totalRevenue > 0 ? 100 - b2bPercent : 0;

  // 6 tháng gần nhất: gộp doanh thu theo tháng StartDate của gói (số thật).
  const monthBuckets = [];
  {
    const base = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(base.getFullYear(), base.getMonth() - i, 1);
      monthBuckets.push({ year: d.getFullYear(), month: d.getMonth(), label: `Th ${d.getMonth() + 1}` });
    }
  }
  const inMonth = (t, year, month) => {
    const raw = t.startDate || t.StartDate;
    if (!raw) return false;
    const d = new Date(raw);
    return d.getFullYear() === year && d.getMonth() === month;
  };
  const sumIn = (year, month, pred) => transactions.reduce(
    (acc, t) => (inMonth(t, year, month) && (!pred || pred(t)) ? acc + txAmount(t) : acc), 0);
  const countIn = (year, month) => transactions.filter(t => inMonth(t, year, month)).length;

  const monthlySeries = monthBuckets.map(m => {
    const total = sumIn(m.year, m.month);
    const b2b = sumIn(m.year, m.month, isB2B);
    return { label: m.label, total, b2b, b2c: total - b2b };
  });
  const maxMonthVal = Math.max(1, ...monthlySeries.map(m => Math.max(m.b2b, m.b2c)));

  const nRev = monthlySeries.length;
  const getXRev = (i) => nRev > 1 ? (i / (nRev - 1)) * 600 : 300;
  const polyPointsB2b = monthlySeries.map((d, i) => {
    const x = getXRev(i);
    const y = 170 - (d.b2b / Math.max(1, maxMonthVal)) * 150;
    return `${x},${y}`;
  }).join(' ');
  const polyPointsB2c = monthlySeries.map((d, i) => {
    const x = getXRev(i);
    const y = 170 - (d.b2c / Math.max(1, maxMonthVal)) * 150;
    return `${x},${y}`;
  }).join(' ');
  const polyGradB2b = nRev > 1 ? `0,170 ${polyPointsB2b} 600,170` : `300,170 ${polyPointsB2b} 300,170`;
  const polyGradB2c = nRev > 1 ? `0,170 ${polyPointsB2c} 600,170` : `300,170 ${polyPointsB2c} 300,170`;

  // Tăng trưởng tháng này so với tháng trước (số thật, không hardcode).
  const curMb = monthBuckets[monthBuckets.length - 1];
  const prevMb = monthBuckets[monthBuckets.length - 2];
  const cur = monthlySeries[monthlySeries.length - 1] || { total: 0, b2b: 0, b2c: 0 };
  const prev = monthlySeries[monthlySeries.length - 2] || { total: 0, b2b: 0, b2c: 0 };
  const pctChange = (c, p) => (p > 0 ? ((c - p) / p) * 100 : (c > 0 ? 100 : 0));
  const fmtTrend = (v) => `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`;
  const totalTrend = pctChange(cur.total, prev.total);
  const b2bTrend = pctChange(cur.b2b, prev.b2b);
  const b2cTrend = pctChange(cur.b2c, prev.b2c);

  // ARPU thật thay cho "tỷ suất lợi nhuận" — hệ thống không có dữ liệu chi phí để tính margin.
  const arpu = transactions.length > 0 ? Math.round(totalRevenue / transactions.length) : 0;
  const curArpu = countIn(curMb.year, curMb.month) > 0 ? cur.total / countIn(curMb.year, curMb.month) : 0;
  const prevArpu = countIn(prevMb.year, prevMb.month) > 0 ? prev.total / countIn(prevMb.year, prevMb.month) : 0;
  const arpuTrend = pctChange(curArpu, prevArpu);

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

  if (error) return (
    <div style={{ padding: '120px', textAlign: 'center' }}>
      <div className="card" style={{ maxWidth: '500px', margin: '0 auto', border: '2px solid var(--red-light)' }}>
        <h3 style={{ color: 'var(--red)', marginBottom: '12px' }}>Không tải được dữ liệu tài chính</h3>
        <p style={{ color: 'var(--gray-500)', marginBottom: '24px' }}>{error}</p>
        <button className="btn btn-primary" onClick={loadData}>Thử lại</button>
      </div>
    </div>
  );

  const filteredTx = transactions.filter(t =>
    txFilter === 'all' ? true : txFilter === 'active' ? t.isActive : !t.isActive
  );

  const handleExportPdf = async () => {
    setExporting(true);
    try {
      const vnd = (n) => `${(n || 0).toLocaleString('vi-VN')}đ`;
      // Nhúng tóm tắt AI doanh thu (dùng lại cache BE) vào đầu báo cáo.
      let aiSummary = null;
      try {
        const ins = await analyticsApi.getRevenueInsight(false);
        if (ins && (ins.aiAvailable ?? ins.AiAvailable)) {
          aiSummary = {
            summary: ins.summary ?? ins.Summary,
            positives: ins.positives ?? ins.Positives,
            concerns: ins.concerns ?? ins.Concerns,
            recommendations: ins.recommendations ?? ins.Recommendations,
          };
        }
      } catch { /* không có AI thì xuất báo cáo thường */ }

      await exportReportPdf({
        title: 'Báo cáo Tài chính',
        subtitle: 'Doanh thu B2B/B2C và giao dịch gói đăng ký',
        fileName: 'bao-cao-tai-chinh.pdf',
        aiSummary,
        summary: [
          { label: 'Tổng doanh thu (MRR ước tính)', value: vnd(totalRevenue) },
          { label: `Doanh thu B2B (${b2bPercent}%)`, value: vnd(b2bRevenue) },
          { label: `Doanh thu B2C (${b2cPercent}%)`, value: vnd(b2cRevenue) },
          { label: 'Doanh thu TB / khách (ARPU)', value: vnd(arpu) },
          { label: 'Số giao dịch', value: transactions.length },
          { label: 'Tăng trưởng tháng này', value: fmtTrend(totalTrend) },
        ],
        tables: [
          {
            heading: 'Doanh thu 6 tháng gần nhất',
            columns: ['Tháng', 'Tổng', 'B2B', 'B2C'],
            rows: monthlySeries.map(m => [m.label, vnd(m.total), vnd(m.b2b), vnd(m.b2c)]),
          },
          {
            heading: 'Giao dịch',
            columns: ['Khách hàng', 'Loại', 'Gói', 'Số tiền', 'Trạng thái'],
            rows: filteredTx.map(t => [
              t.userFullName || '',
              isB2B(t) ? 'B2B' : 'B2C',
              t.planName || '',
              vnd(t.priceVnd),
              t.isActive ? 'Hoạt động' : 'Hết hạn',
            ]),
          },
        ],
      });
    } catch (err) {
      setError(err.message || 'Lỗi xuất báo cáo.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Báo cáo & Phân tích Tài chính</h1>
          <p className="page-subtitle">Theo dõi xu hướng dòng tiền, cơ cấu doanh thu B2B/B2C và nhận định tài chính từ AI</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <select className="form-input" style={{ width: '160px', margin: 0 }} value={timeRange} onChange={e => setTimeRange(e.target.value)}>
            <option value="30d">30 ngày qua</option>
            <option value="90d">Quý này</option>
            <option value="ytd">Năm nay</option>
          </select>
          <button className="btn btn-primary" onClick={handleExportPdf} disabled={exporting}>
            {exporting ? <Loader2 size={16} className="spinning" /> : <><Download size={16} /> Xuất tài chính</>}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
        <StatPanel title="Tổng Doanh Thu" value={`${totalRevenue.toLocaleString('vi-VN')}đ`} icon={Landmark} trend={totalTrend >= 0 ? 'up' : 'down'} trendValue={fmtTrend(totalTrend)} color="var(--primary)" />
        <StatPanel title="Doanh thu B2B" value={`${b2bRevenue.toLocaleString('vi-VN')}đ`} icon={Layers} trend={b2bTrend >= 0 ? 'up' : 'down'} trendValue={fmtTrend(b2bTrend)} color="var(--purple)" />
        <StatPanel title="Doanh thu B2C" value={`${b2cRevenue.toLocaleString('vi-VN')}đ`} icon={Users} trend={b2cTrend >= 0 ? 'up' : 'down'} trendValue={fmtTrend(b2cTrend)} color="var(--blue)" />
        <StatPanel title="Doanh thu TB / Khách" value={`${arpu.toLocaleString('vi-VN')}đ`} icon={TrendingUp} trend={arpuTrend >= 0 ? 'up' : 'down'} trendValue={fmtTrend(arpuTrend)} color="var(--green)" />
      </div>

      <div style={{ marginBottom: '32px' }}>
        <AiInsightCard
          title="AI phân tích doanh thu"
          subtitle="Gemini đánh giá sức khỏe doanh thu, B2B/B2C, xu hướng theo tháng và rủi ro"
          fetchInsight={(force) => analyticsApi.getRevenueInsight(force)}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '32px', marginBottom: '32px' }}>
        <div className="card" style={{ padding: '32px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
             <div>
                <h3 style={{ margin: 0 }}>Doanh thu theo tháng</h3>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--gray-400)' }}>Doanh thu B2B và B2C 6 tháng gần nhất (theo ngày bắt đầu gói)</p>
             </div>
             <div style={{ display: 'flex', gap: '16px', fontSize: '13px', fontWeight: 600 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary)' }}></div> B2B</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--blue)' }}></div> B2C</div>
             </div>
          </div>
          
          <div style={{ height: '200px', position: 'relative', borderBottom: '1px solid var(--gray-100)', paddingBottom: '8px', zIndex: 1 }}>
            <svg viewBox="0 0 600 200" width="100%" height="100%" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
              <defs>
                <linearGradient id="b2bGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="b2cGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--blue)" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="var(--blue)" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="20" x2="600" y2="20" stroke="var(--gray-50)" strokeDasharray="4 4" />
              <line x1="0" y1="70" x2="600" y2="70" stroke="var(--gray-50)" strokeDasharray="4 4" />
              <line x1="0" y1="120" x2="600" y2="120" stroke="var(--gray-50)" strokeDasharray="4 4" />
              <line x1="0" y1="170" x2="600" y2="170" stroke="var(--gray-200)" strokeWidth="1" />

              {/* Shaded Areas */}
              <polygon points={polyGradB2b} fill="url(#b2bGrad)" />
              <polygon points={polyGradB2c} fill="url(#b2cGrad)" />

              {/* Polylines */}
              <polyline
                points={polyPointsB2b}
                fill="none"
                stroke="var(--primary)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <polyline
                points={polyPointsB2c}
                fill="none"
                stroke="var(--blue)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Hover highlight line & circles */}
              {activeBarIndex !== null && (
                <>
                  <line
                    x1={getXRev(activeBarIndex)}
                    y1="10"
                    x2={getXRev(activeBarIndex)}
                    y2="170"
                    stroke="var(--gray-200)"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                  <circle
                    cx={getXRev(activeBarIndex)}
                    cy={170 - (monthlySeries[activeBarIndex].b2b / Math.max(1, maxMonthVal)) * 150}
                    r="5.5"
                    fill="var(--primary)"
                    stroke="#fff"
                    strokeWidth="2"
                  />
                  <circle
                    cx={getXRev(activeBarIndex)}
                    cy={170 - (monthlySeries[activeBarIndex].b2c / Math.max(1, maxMonthVal)) * 150}
                    r="5.5"
                    fill="var(--blue)"
                    stroke="#fff"
                    strokeWidth="2"
                  />
                </>
              )}

              {/* Transparent hover rects */}
              {monthlySeries.map((d, i) => {
                const step = 600 / (nRev - 1);
                const rectX = i === 0 ? 0 : i === nRev - 1 ? 600 - step / 2 : (i * step) - step / 2;
                const rectWidth = i === 0 || i === nRev - 1 ? step / 2 : step;
                return (
                  <rect
                    key={i}
                    x={rectX}
                    y="0"
                    width={rectWidth}
                    height="200"
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
                const d = monthlySeries[activeBarIndex];
                const xPercent = (activeBarIndex / (nRev - 1)) * 100;
                
                let tooltipLeft = `calc(${xPercent}% - 85px)`;
                if (activeBarIndex === 0) tooltipLeft = '10px';
                if (activeBarIndex === nRev - 1) tooltipLeft = 'auto';

                return (
                  <div style={{
                    position: 'absolute',
                    bottom: '120px',
                    left: tooltipLeft,
                    right: activeBarIndex === nRev - 1 ? '10px' : 'auto',
                    background: 'rgba(26, 18, 37, 0.95)',
                    color: '#fff',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                    pointerEvents: 'none',
                    zIndex: 10,
                    whiteSpace: 'nowrap',
                    border: '1px solid rgba(255,255,255,0.1)',
                    transition: 'left 0.1s ease'
                  }}>
                    <div style={{ fontWeight: 700, color: 'var(--purple-dark)', marginBottom: '4px', textAlign: 'center' }}>{d.label}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <div>• B2B: <strong style={{ color: 'var(--purple)' }}>{d.b2b.toLocaleString('vi-VN')}đ</strong></div>
                      <div>• B2C: <strong style={{ color: 'var(--blue)' }}>{d.b2c.toLocaleString('vi-VN')}đ</strong></div>
                    </div>
                  </div>
                );
              })()
            )}
          </div>
          
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', padding: '0 10px' }}>
            {monthlySeries.map((m, i) => (
              <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: '11px', color: 'var(--gray-400)', fontWeight: 600 }}>
                {m.label}
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ marginBottom: '4px' }}>Cơ cấu Doanh thu</h3>
            <p style={{ fontSize: '12px', color: 'var(--gray-400)', marginBottom: '24px' }}>Tỷ lệ đóng góp doanh thu của B2B và B2C</p>
          </div>
          
          <div style={{ position: 'relative', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{
              width: '150px',
              height: '150px',
              borderRadius: '50%',
              background: `conic-gradient(var(--primary) 0% ${b2bPercent}%, var(--blue) ${b2bPercent}% 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-sm)',
              position: 'relative'
            }}>
              <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: 'white',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'inset var(--shadow-sm)'
              }}>
                <span style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-dark)' }}>{b2bPercent}%</span>
                <span style={{ fontSize: '11px', color: 'var(--gray-400)', fontWeight: 700, textTransform: 'uppercase' }}>B2B</span>
              </div>
            </div>
          </div>
          
          <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }}></span>
                  Đối tác B2B
                </span>
                <span style={{ fontWeight: 800, color: 'var(--text-dark)' }}>{b2bPercent}%</span>
             </div>
             <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: 'var(--blue)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--blue)' }}></span>
                  Cá nhân B2C
                </span>
                <span style={{ fontWeight: 800, color: 'var(--text-dark)' }}>{b2cPercent}%</span>
             </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '24px', borderBottom: '1.5px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>Giao dịch Gần nhất</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
             {[
               { key: 'all', label: 'Tất cả' },
               { key: 'active', label: 'Đang hoạt động' },
               { key: 'expired', label: 'Hết hạn' },
             ].map(f => (
               <button
                 key={f.key}
                 className={`btn btn-sm ${txFilter === f.key ? 'btn-primary' : 'btn-outline'}`}
                 onClick={() => setTxFilter(f.key)}
               >
                 {f.label}
               </button>
             ))}
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
              <th style={{ paddingRight: '24px' }}>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {filteredTx.map((t, i) => (
              <tr key={i}>
                <td style={{ paddingLeft: '24px', fontWeight: 700, color: 'var(--gray-400)' }}>#{t.id || `TX${2000+i}`}</td>
                <td style={{ fontWeight: 800 }}>{t.userFullName}</td>
                <td><span className={`badge badge-${t.source === 'B2B' || t.centerName ? 'purple' : 'blue'}`} style={{ whiteSpace: 'nowrap' }}>{t.source || (t.centerName ? 'B2B' : 'B2C')}</span></td>
                <td style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{t.planName}</td>
                <td style={{ fontWeight: 900, whiteSpace: 'nowrap' }}>{(t.priceVnd || 0).toLocaleString()} <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--gray-300)' }}>đ</span></td>
                <td>
                  {t.isActive ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#059669', fontWeight: 700, fontSize: '13px', whiteSpace: 'nowrap' }}>
                      <CheckCircle2 size={14} /> Hoạt động
                    </span>
                  ) : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#ef4444', fontWeight: 700, fontSize: '13px', whiteSpace: 'nowrap' }}>
                      <Clock size={14} /> Hết hạn
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style>{`
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
      `}</style>
    </>
  );
};

export default RevenueManagement;

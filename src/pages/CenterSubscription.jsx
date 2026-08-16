import React, { useState, useEffect, useCallback } from 'react';
import {
  CreditCard,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Calendar,
  Users,
  Star,
  ArrowUpRight,
  Loader2,
  AlertCircle,
  Clock,
  XCircle,
  Sparkles,
  Search,
  RefreshCw,
  FileText,
  X,
  Printer,
  Receipt
} from 'lucide-react';
import { centersApi, subscriptionApi } from '../services/api';

const CenterSubscription = () => {
  const [subscription, setSubscription] = useState(null);
  const [stats, setStats] = useState(null);
  const [b2bPlan, setB2bPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [subscribing, setSubscribing] = useState(false);

  // Transaction history state for Center Admin
  const [transactions, setTransactions] = useState([]);
  const [txLoading, setTxLoading] = useState(false);
  const [timePreset, setTimePreset] = useState('30');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTx, setSelectedTx] = useState(null);

  const centerId = localStorage.getItem('centerId');

  // Mua thêm/gia hạn = thanh toán gói B2B qua PayOS (cùng luồng PricingPage).
  const handleBuySeats = async () => {
    if (!b2bPlan) return;
    try {
      setSubscribing(true);
      const returnUrl = `${window.location.origin}/payment-callback`;
      const res = await subscriptionApi.upgrade(b2bPlan.id, returnUrl);
      if (res.paymentUrl) {
        localStorage.setItem('pendingPlanId', String(b2bPlan.id));
        window.location.href = res.paymentUrl;
      } else if (res.success) {
        await loadData();
      }
    } catch (err) {
      setError(err.message || 'Không thể khởi tạo thanh toán');
    } finally {
      setSubscribing(false);
    }
  };

  const loadTransactions = useCallback(async () => {
    setTxLoading(true);
    try {
      const now = new Date();
      const days = parseInt(timePreset, 10) || 30;
      const from = new Date();
      from.setDate(now.getDate() - days);

      const params = {
        fromDate: from.toISOString(),
        toDate: now.toISOString(),
        status: statusFilter !== 'all' ? statusFilter : undefined
      };
      const data = await subscriptionApi.getAdminTransactions(params);
      setTransactions(Array.isArray(data) ? data : []);
    } catch {
      // Fallback silently if no transactions
      setTransactions([]);
    } finally {
      setTxLoading(false);
    }
  }, [timePreset, statusFilter]);

  const loadData = useCallback(async () => {
    try {
      if (!centerId) throw new Error('Không tìm thấy thông tin trung tâm.');
      const [subData, dashboardData, plansData] = await Promise.all([
        subscriptionApi.getMyPlan().catch(() => null),
        centersApi.getDashboard(centerId),
        subscriptionApi.getPlans()
      ]);
      setSubscription(subData);
      setStats(dashboardData);
      setB2bPlan((plansData || []).find(p => p.type === 'B2B') || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [centerId]);

  useEffect(() => {
    loadData();
    loadTransactions();
  }, [loadData, loadTransactions]);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}><Loader2 className="spinning" /></div>;

  if (error) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '24px', color: 'var(--red, #dc2626)' }}>
      <AlertCircle size={20} /> {error}
    </div>
  );

  // Giá và tính năng lấy theo gói B2B trong hệ thống; fallback khớp dữ liệu seed.
  const seatPrice = b2bPlan?.priceVnd ?? 79000;
  let features = [
    "Trang quản trị cho giáo viên",
    "Quản lý danh sách lớp học",
    "Theo dõi tiến độ học viên",
    "Báo cáo kết quả học tập",
    "Yêu cầu tối thiểu 20 học viên"
  ];
  try {
    const parsed = JSON.parse(b2bPlan?.featuresJson || 'null');
    if (Array.isArray(parsed) && parsed.length > 0) features = parsed;
  } catch { /* giữ fallback */ }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="badge" style={{ background: '#e8f5e9', color: '#2e7d32', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
            <CheckCircle2 size={13} /> Thành công
          </span>
        );
      case 'PENDING':
        return (
          <span className="badge" style={{ background: '#fff3e0', color: '#e65100', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
            <Clock size={13} /> Chờ xử lý
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="badge" style={{ background: '#f5f5f5', color: '#757575', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
            <XCircle size={13} /> Hết hạn
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="badge" style={{ background: '#ffebee', color: '#c62828', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
            <XCircle size={13} /> Đã hủy
          </span>
        );
      case 'FREE':
        return (
          <span className="badge" style={{ background: '#e0f2fe', color: '#0369a1', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
            <Sparkles size={13} /> Miễn phí
          </span>
        );
      default:
        return <span className="badge badge-gray">{status}</span>;
    }
  };

  const filteredTxList = transactions.filter(t => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (t.userFullName || '').toLowerCase().includes(term) ||
      (t.email || '').toLowerCase().includes(term) ||
      (t.orderCode ? String(t.orderCode) : '').includes(term) ||
      (t.planName || '').toLowerCase().includes(term)
    );
  });

  return (
    <>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title">Gói dịch vụ & Giao dịch Trung tâm</h1>
          <p className="page-subtitle">Quản lý các giới hạn, thời hạn gói B2B và tra cứu lịch sử thanh toán</p>
        </div>
        <div className="badge badge-purple" style={{ padding: '8px 16px', fontSize: '14px', fontWeight: 800 }}>
          {subscription?.planName || b2bPlan?.name || 'Gói Trung tâm (B2B)'}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '32px', marginBottom: '36px' }}>
        <div>
          <div className="card" style={{ background: 'linear-gradient(135deg, var(--white) 0%, #f4f0ff 100%)', border: 'none', marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldCheck size={24} color="var(--primary)" /> Thông tin Gói hiện tại
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
              <div>
                <div style={{ color: 'var(--gray-400)', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>Tình trạng</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ 
                    width: '12px', 
                    height: '12px', 
                    borderRadius: '50%', 
                    background: subscription ? (subscription.isActive ? 'var(--green, #10b981)' : 'var(--red, #dc2626)') : '#999' 
                  }}></div>
                  <span style={{ fontWeight: 800, fontSize: '18px' }}>
                    {subscription ? (subscription.isActive ? 'Đang hoạt động' : 'Hết hạn') : 'Chưa kích hoạt'}
                  </span>
                </div>
              </div>
              
              <div>
                <div style={{ color: 'var(--gray-400)', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>Ngày hết hạn</div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Calendar size={20} color="var(--gray-400)" />
                  <span style={{ fontWeight: 800, fontSize: '18px' }}>
                    {subscription?.endDate ? new Date(subscription.endDate).toLocaleDateString('vi-VN') : '—'}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '40px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
                    <Users size={18} color="var(--primary)" /> Giới hạn Học viên (Seats)
                 </div>
                 <div style={{ fontWeight: 800 }}>{stats?.studentCount || 0} / {stats?.maxSeats || 50} seats</div>
              </div>
              <div style={{ height: '16px', background: 'var(--gray-100)', borderRadius: '20px', overflow: 'hidden' }}>
                <div style={{ 
                  width: `${Math.min(100, ((stats?.studentCount || 0) / (stats?.maxSeats || 50)) * 100)}%`, 
                  height: '100%', 
                  background: 'linear-gradient(90deg, var(--primary), var(--purple))',
                  borderRadius: '20px'
                }}></div>
              </div>
              <p style={{ marginTop: '12px', fontSize: '13px', color: 'var(--gray-400)' }}>
                Bạn đã sử dụng {Math.round(((stats?.studentCount || 0) / (stats?.maxSeats || 50)) * 100)}% dung lượng cho phép của gói hiện tại.
              </p>
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: '20px' }}>Tính năng được bật</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {features.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderRadius: '12px', background: 'var(--gray-50)' }}>
                  <div style={{ color: 'var(--green, #10b981)', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle2 size={18} />
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gray-500)' }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
           <div className="card" style={{ background: 'var(--text-dark)', color: '#fff', border: 'none', position: 'relative', overflow: 'hidden', padding: '32px' }}>
              <Star size={80} style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.1, transform: 'rotate(15deg)' }} />
              <div className="badge badge-yellow" style={{ position: 'relative', marginBottom: '16px' }}>GÓI B2B</div>
              <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>{b2bPlan?.name || 'Gói Trung tâm (B2B)'}</h2>
              <p style={{ opacity: 0.7, fontSize: '14px', marginBottom: '24px' }}>Tính phí theo từng học viên, linh hoạt mở rộng quy mô lớp học của trung tâm.</p>

              <div style={{ fontSize: '32px', fontWeight: 800, marginBottom: '32px' }}>
                {seatPrice.toLocaleString('vi-VN')}đ <span style={{ fontSize: '15px', fontWeight: 600, opacity: 0.6 }}>/ học viên / tháng</span>
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                 {features.slice(0, 3).map((f, i) => (
                   <li key={i} style={{ display: 'flex', gap: '10px' }}><CheckCircle2 size={16} color="var(--yellow)" /> {f}</li>
                 ))}
              </ul>

              <button
                className="btn btn-primary"
                style={{ width: '100%', background: 'var(--yellow)', color: 'var(--text-dark)', fontWeight: 800, border: 'none' }}
                onClick={handleBuySeats}
                disabled={subscribing || !b2bPlan}
              >
                {subscribing
                  ? <><Loader2 size={18} className="spinning" /> Đang chuyển tới thanh toán...</>
                  : <>Mua thêm seats <ArrowUpRight size={18} /></>}
              </button>
           </div>

           <div style={{ marginTop: '24px', padding: '24px', borderRadius: '16px', border: '2px dashed var(--gray-200)', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ color: 'var(--primary)' }}><Zap size={24} /></div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '15px' }}>Cần thêm lượt seats?</div>
                <div style={{ fontSize: '13px', color: 'var(--gray-400)' }}>Bạn có thể mua lẻ thêm seat với {seatPrice.toLocaleString('vi-VN')}đ/học viên/tháng mà không cần nâng cấp gói.</div>
              </div>
           </div>
        </div>
      </div>

      {/* Center Admin Transaction History Section */}
      <div className="card" style={{ padding: '24px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dark)' }}>
              <Receipt size={22} color="var(--primary)" /> Lịch sử Giao dịch & Gói cước của Trung tâm
            </h3>
            <p style={{ color: 'var(--gray-400)', fontSize: '13px', marginTop: '4px' }}>
              Theo dõi và kiểm soát toàn bộ giao dịch đăng ký gói trong phạm vi trung tâm
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Time Presets (Limit 1 month) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {[
                { id: '7', label: '7 ngày' },
                { id: '14', label: '14 ngày' },
                { id: '30', label: '30 ngày (1 tháng)' }
              ].map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setTimePreset(p.id)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 'var(--radius-full)',
                    border: timePreset === p.id ? '2px solid var(--primary)' : '1px solid var(--gray-200)',
                    background: timePreset === p.id ? 'var(--primary-light)' : 'white',
                    color: timePreset === p.id ? 'var(--primary-dark)' : 'var(--text)',
                    fontSize: '12px',
                    fontWeight: timePreset === p.id ? 700 : 500,
                    cursor: 'pointer'
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-input"
              style={{ padding: '5px 10px', fontSize: '12px', minWidth: '130px' }}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="PAID">Đã thanh toán (PAID)</option>
              <option value="PENDING">Chờ xử lý (PENDING)</option>
              <option value="EXPIRED">Đã hết hạn (EXPIRED)</option>
              <option value="CANCELLED">Đã hủy (CANCELLED)</option>
              <option value="FREE">Miễn phí (FREE)</option>
            </select>

            {/* Search */}
            <div style={{ position: 'relative', minWidth: '180px' }}>
              <input
                type="text"
                placeholder="Tìm học viên, mã đơn..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '30px', paddingRight: '10px', paddingY: '4px', fontSize: '12px' }}
              />
              <Search size={14} color="var(--gray-400)" style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>

            <button
              type="button"
              className="btn btn-outline"
              onClick={loadTransactions}
              style={{ padding: '5px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
              title="Làm mới"
            >
              <RefreshCw size={13} />
            </button>
          </div>
        </div>

        {txLoading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Loader2 className="spinning" size={28} color="var(--primary)" />
          </div>
        ) : filteredTxList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--gray-400)', border: '1px dashed var(--gray-200)', borderRadius: 'var(--radius-md)' }}>
            <FileText size={36} style={{ opacity: 0.3, marginBottom: '8px' }} />
            <div style={{ fontSize: '14px', fontWeight: 600 }}>Không có dữ liệu giao dịch trong khoảng thời gian này</div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--gray-50)', borderBottom: '1px solid var(--gray-100)' }}>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 800, color: 'var(--gray-500)', textTransform: 'uppercase' }}>Mã đơn / ID</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 800, color: 'var(--gray-500)', textTransform: 'uppercase' }}>Học viên / User</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 800, color: 'var(--gray-500)', textTransform: 'uppercase' }}>Gói dịch vụ</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 800, color: 'var(--gray-500)', textTransform: 'uppercase' }}>Số tiền</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 800, color: 'var(--gray-500)', textTransform: 'uppercase' }}>Ngày kích hoạt</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 800, color: 'var(--gray-500)', textTransform: 'uppercase' }}>Trạng thái</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 800, color: 'var(--gray-500)', textTransform: 'uppercase', textAlign: 'right' }}>Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {filteredTxList.map(tx => (
                  <tr key={tx.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 700, fontSize: '13px' }}>
                      {tx.orderCode ? `#${tx.orderCode}` : `#SUB-${tx.id}`}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-dark)' }}>{tx.userFullName || '—'}</div>
                      <div style={{ fontSize: '11px', color: 'var(--gray-400)' }}>{tx.email}</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, fontSize: '13px' }}>{tx.planName}</div>
                      <span className={`badge ${tx.planType === 'Pro' ? 'badge-purple' : 'badge-gray'}`} style={{ fontSize: '10px' }}>
                        {tx.planType}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 800, fontSize: '13px', color: tx.priceVnd > 0 ? 'var(--primary-dark)' : 'var(--gray-500)' }}>
                      {tx.priceVnd > 0 ? `${tx.priceVnd.toLocaleString('vi-VN')}đ` : '0đ'}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '12px' }}>
                      {tx.startDate ? new Date(tx.startDate).toLocaleDateString('vi-VN') : '—'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {getStatusBadge(tx.status)}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => setSelectedTx(tx)}
                        style={{ padding: '4px 10px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <FileText size={12} /> Xem
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transaction Detail Modal */}
      {selectedTx && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div className="card" style={{
            maxWidth: '520px',
            width: '100%',
            padding: '32px',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-lg)',
            position: 'relative'
          }}>
            <button
              type="button"
              onClick={() => setSelectedTx(null)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)' }}
            >
              <X size={20} />
            </button>

            <div style={{ textAlign: 'center', paddingBottom: '16px', borderBottom: '2px dashed var(--gray-200)' }}>
              <div style={{ fontSize: '18px', fontWeight: 900, color: 'var(--primary-dark)' }}>
                CHI TIẾT GIAO DỊCH TRUNG TÂM
              </div>
              <div style={{ marginTop: '12px' }}>
                {getStatusBadge(selectedTx.status)}
              </div>
            </div>

            <div style={{ padding: '20px 0', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--gray-400)' }}>Mã đơn hàng:</span>
                <span style={{ fontWeight: 700 }}>{selectedTx.orderCode ? `#${selectedTx.orderCode}` : `#SUB-${selectedTx.id}`}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--gray-400)' }}>Học viên / Thành viên:</span>
                <span style={{ fontWeight: 700 }}>{selectedTx.userFullName} ({selectedTx.email})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--gray-400)' }}>Gói dịch vụ:</span>
                <span style={{ fontWeight: 700, color: 'var(--primary-dark)' }}>{selectedTx.planName} ({selectedTx.planType})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--gray-400)' }}>Thời gian hiệu lực:</span>
                <span>
                  {selectedTx.startDate ? new Date(selectedTx.startDate).toLocaleDateString('vi-VN') : '—'} - {selectedTx.endDate ? new Date(selectedTx.endDate).toLocaleDateString('vi-VN') : '—'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--gray-100)', paddingTop: '12px', marginTop: '4px' }}>
                <span style={{ fontSize: '15px', fontWeight: 800 }}>Số tiền:</span>
                <span style={{ fontSize: '18px', fontWeight: 900, color: 'var(--primary-dark)' }}>
                  {selectedTx.priceVnd > 0 ? `${selectedTx.priceVnd.toLocaleString('vi-VN')}đ` : '0đ (Miễn phí)'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => window.print()}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Printer size={15} /> In
              </button>
              <button type="button" className="btn btn-primary" onClick={() => setSelectedTx(null)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CenterSubscription;


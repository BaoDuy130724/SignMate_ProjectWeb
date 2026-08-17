import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Calendar,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Loader2,
  FileText,
  RefreshCw,
  Sparkles,
  Printer,
  X,
  Info,
  Building2,
  Crown,
  ShieldCheck,
  Zap,
  TrendingUp,
  Receipt,
  Copy,
  Check
} from 'lucide-react';
import { subscriptionApi, authApi } from '../services/api';

const getStatusBadge = (status) => {
  const st = (status || '').toUpperCase();
  switch (st) {
    case 'PAID':
      return (
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '5px',
          padding: '4px 10px', borderRadius: '20px',
          fontSize: '12px', fontWeight: 700,
          background: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0'
        }}>
          <CheckCircle2 size={13} /> Thành công
        </span>
      );
    case 'PENDING':
      return (
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '5px',
          padding: '4px 10px', borderRadius: '20px',
          fontSize: '12px', fontWeight: 700,
          background: '#FFFBEB', color: '#B45309', border: '1px solid #FDE68A'
        }}>
          <Clock size={13} /> Chờ thanh toán
        </span>
      );
    case 'EXPIRED':
    case 'INACTIVE':
      return (
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '5px',
          padding: '4px 10px', borderRadius: '20px',
          fontSize: '12px', fontWeight: 700,
          background: '#F3F4F6', color: '#4B5563', border: '1px solid #E5E7EB'
        }}>
          <Clock size={13} /> Đã hết hạn
        </span>
      );
    case 'CANCELLED':
      return (
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '5px',
          padding: '4px 10px', borderRadius: '20px',
          fontSize: '12px', fontWeight: 700,
          background: '#FEF2F2', color: '#B91C1C', border: '1px solid #FECACA'
        }}>
          <XCircle size={13} /> Đã hủy
        </span>
      );
    case 'FREE':
      return (
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '5px',
          padding: '4px 10px', borderRadius: '20px',
          fontSize: '12px', fontWeight: 700,
          background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE'
        }}>
          <Sparkles size={13} /> Miễn phí
        </span>
      );
    default:
      return (
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '5px',
          padding: '4px 10px', borderRadius: '20px',
          fontSize: '12px', fontWeight: 700,
          background: 'var(--gray-100)', color: 'var(--gray-600)'
        }}>
          {status}
        </span>
      );
  }
};

const formatOrderCode = (tx) => {
  if (tx.orderCode) return `#ORD-${tx.orderCode}`;
  const dt = tx.startDate ? new Date(tx.startDate) : new Date();
  const ymd = `${dt.getFullYear()}${String(dt.getMonth() + 1).padStart(2, '0')}${String(dt.getDate()).padStart(2, '0')}`;
  return `#SM-${ymd}-${String(tx.id || '1').padStart(3, '0')}`;
};

// Receipt Modal Subcomponent
const StudentReceiptModal = ({ tx, currentUser, onClose }) => {
  if (!tx) return null;
  const price = Number(tx.priceVnd) || 0;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        maxWidth: '560px',
        width: '100%',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-xl)',
        animation: 'fadeIn 0.2s ease-out'
      }}>
        {/* Modal Header */}
        <div style={{
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
          color: 'white',
          padding: '22px 28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Receipt size={24} />
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'white' }}>BIÊN LAI ĐIỆN TỬ</h3>
              <div style={{ fontSize: '12px', opacity: 0.85, marginTop: '2px' }}>SignMate Education Platform</div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--gray-100)' }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--gray-400)', fontWeight: 700, textTransform: 'uppercase' }}>MÃ ĐƠN HÀNG</div>
              <div style={{ fontSize: '16px', fontWeight: 900, color: 'var(--primary-dark)', marginTop: '2px' }}>
                {formatOrderCode(tx)}
              </div>
            </div>
            <div>{getStatusBadge(tx.status)}</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--gray-400)', fontWeight: 700 }}>KHÁCH HÀNG</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-dark)', marginTop: '2px' }}>
                {currentUser?.fullName || 'Học viên'}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>{currentUser?.email}</div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: 'var(--gray-400)', fontWeight: 700 }}>PHƯƠNG THỨC</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-dark)', marginTop: '2px' }}>
                PayOS (VietQR / Chuyển khoản)
              </div>
            </div>
          </div>

          {/* Items Breakdown */}
          <div style={{ background: 'var(--gray-50)', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
              <span style={{ fontWeight: 700, color: 'var(--text-dark)' }}>{tx.planName} ({tx.planType})</span>
              <span style={{ fontWeight: 800, color: 'var(--text-dark)' }}>{price.toLocaleString('vi-VN')} đ</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--gray-500)', marginBottom: '4px' }}>
              <span>Ngày kích hoạt:</span>
              <span>{tx.startDate ? new Date(tx.startDate).toLocaleDateString('vi-VN') : '—'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--gray-500)' }}>
              <span>Thời hạn đến:</span>
              <span>{tx.endDate ? new Date(tx.endDate).toLocaleDateString('vi-VN') : '—'}</span>
            </div>

            <div style={{ borderTop: '1px dashed var(--gray-200)', marginTop: '12px', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 800, fontSize: '14px', color: 'var(--text-dark)' }}>TỔNG THANH TOÁN:</span>
              <span style={{ fontWeight: 900, fontSize: '18px', color: 'var(--primary-dark)' }}>
                {price.toLocaleString('vi-VN')} đ
              </span>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => window.print()}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Printer size={15} /> In biên lai
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={onClose}
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const StudentTransactions = () => {
  const navigate = useNavigate();
  const rawCenterId = localStorage.getItem('centerId');
  const isB2B = Boolean(rawCenterId && rawCenterId !== 'null' && rawCenterId !== 'undefined' && rawCenterId !== '' && rawCenterId !== '0');

  const [transactions, setTransactions] = useState([]);
  const [currentPlanInfo, setCurrentPlanInfo] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timePreset, setTimePreset] = useState('30'); // '7', '14', '30', 'custom'
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTx, setSelectedTx] = useState(null);
  const [verifyingCode, setVerifyingCode] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);

  const handleCopyCode = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(String(code));
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Compute date range based on preset (strictly clamped to <= 31 days)
  const getDateRange = useCallback(() => {
    const now = new Date();
    if (timePreset === 'custom') {
      return {
        fromDate: customFrom ? new Date(customFrom).toISOString() : null,
        toDate: customTo ? new Date(customTo + 'T23:59:59').toISOString() : null
      };
    }
    const days = Number.parseInt(timePreset, 10) || 30;
    const from = new Date();
    from.setDate(now.getDate() - days);
    from.setHours(0, 0, 0, 0);
    return {
      fromDate: from.toISOString(),
      toDate: now.toISOString()
    };
  }, [timePreset, customFrom, customTo]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { fromDate, toDate } = getDateRange();
      const params = {
        fromDate,
        toDate,
        status: statusFilter !== 'all' ? statusFilter : undefined
      };

      const [txList, planData, userData] = await Promise.all([
        subscriptionApi.getMyTransactions(params).catch(() => []),
        subscriptionApi.getMyPlan().catch(() => null),
        authApi.me().catch(() => null)
      ]);

      setTransactions(Array.isArray(txList) ? txList : []);
      setCurrentPlanInfo(planData);
      setCurrentUser(userData);
    } catch (err) {
      setError(err.message || 'Không thể tải lịch sử giao dịch.');
    } finally {
      setLoading(false);
    }
  }, [getDateRange, statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Verify Payment for Pending Transactions
  const handleVerify = async (orderCode) => {
    if (!orderCode) return;
    try {
      setVerifyingCode(orderCode);
      const res = await subscriptionApi.verifyPayment(orderCode);
      setToastMsg({ type: 'success', text: res.message || 'Đã kiểm tra và kích hoạt gói thành công!' });
      await loadData();
    } catch (err) {
      setToastMsg({ type: 'error', text: err.message || 'Chưa ghi nhận thanh toán từ cổng giao dịch PayOS.' });
    } finally {
      setVerifyingCode(null);
    }
  };

  // Filter transactions by search term
  const filteredList = useMemo(() => {
    if (!searchTerm.trim()) return transactions;
    const query = searchTerm.toLowerCase();
    return transactions.filter(t => {
      const orderCodeStr = t.orderCode ? String(t.orderCode).toLowerCase() : '';
      const planNameStr = (t.planName || '').toLowerCase();
      const planTypeStr = (t.planType || '').toLowerCase();
      return orderCodeStr.includes(query) || planNameStr.includes(query) || planTypeStr.includes(query);
    });
  }, [transactions, searchTerm]);

  // Calculate Overview Stats
  const statsOverview = useMemo(() => {
    const totalSpent = transactions
      .filter(t => (t.status || '').toUpperCase() === 'PAID')
      .reduce((sum, t) => sum + (Number(t.priceVnd) || 0), 0);

    const paidCount = transactions.filter(t => (t.status || '').toUpperCase() === 'PAID').length;
    const pendingCount = transactions.filter(t => (t.status || '').toUpperCase() === 'PENDING').length;
    const latestTx = transactions.length > 0 ? transactions[0] : null;

    return { totalSpent, paidCount, pendingCount, latestTx };
  }, [transactions]);

  const activePlanName = currentPlanInfo?.planName || currentPlanInfo?.plan?.name || (currentUser?.plan || 'Free');
  const isPlanActive = Boolean(currentPlanInfo?.isActive);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Toast Notification */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 9999,
          padding: '14px 20px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: 'var(--shadow-lg)',
          background: toastMsg.type === 'success' ? '#065f46' : '#991b1b',
          color: 'white',
          fontWeight: 600,
          fontSize: '14px',
          animation: 'fadeIn 0.3s ease'
        }}>
          {toastMsg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toastMsg.text}</span>
          <button
            type="button"
            onClick={() => setToastMsg(null)}
            style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', marginLeft: '8px' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '28px'
      }}>
        <div>
            <span style={{
              fontSize: '11px', fontWeight: 800, textTransform: 'uppercase',
              letterSpacing: '1px', color: 'var(--primary)', background: 'var(--primary-light)',
              padding: '3px 12px', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '5px'
            }}>
              {currentUser?.centerName ? (
                <>
                  <Building2 size={12} /> {currentUser.centerName}
                </>
              ) : (
                'Tài khoản Học viên (B2C)'
              )}
            </span>
          <h1 style={{ fontSize: '28px', fontWeight: 900, color: 'var(--text-dark)', margin: 0 }}>
            Quản lý Gói cước & Lịch sử Giao dịch
          </h1>
          <p style={{ color: 'var(--gray-500)', fontSize: '14px', marginTop: '6px', margin: 0 }}>
            Theo dõi tình trạng gói học, chi phí đăng ký và kiểm tra biên lai điện tử của bạn.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={loadData}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 16px', fontSize: '13px', fontWeight: 700 }}
          >
            <RefreshCw size={15} /> Làm mới
          </button>
          <Link
            to="/pricing"
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 18px', fontSize: '13px', fontWeight: 700 }}
          >
            <Zap size={15} /> Nâng cấp Gói
          </Link>
        </div>
      </div>

      {/* Top 2 Financial / Plan Overview Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px',
        marginBottom: '28px'
      }}>
        {/* Card 1: Active Subscription Plan */}
        <div className="card" style={{
          background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)',
          color: 'white',
          border: 'none',
          padding: '22px 24px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '1px', opacity: 0.8, textTransform: 'uppercase' }}>
                GÓI HIỆN TẠI
              </span>
              <span style={{
                background: isPlanActive ? '#10B981' : 'rgba(255,255,255,0.2)',
                color: 'white',
                fontSize: '11px',
                fontWeight: 800,
                padding: '3px 10px',
                borderRadius: '12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                {isPlanActive ? <CheckCircle2 size={12} /> : null}
                {isPlanActive ? 'Đang hoạt động' : 'Gói Cơ bản'}
              </span>
            </div>

            <div style={{ fontSize: '24px', fontWeight: 900, marginBottom: '6px' }}>
              {activePlanName.toUpperCase()}
            </div>

            <p style={{ fontSize: '13px', opacity: 0.85, margin: 0 }}>
              {currentPlanInfo?.endDate
                ? `Hạn dùng đến: ${new Date(currentPlanInfo.endDate).toLocaleDateString('vi-VN')}`
                : 'Trải nghiệm lộ trình học tập SignMate'}
            </p>
          </div>
          <Crown size={96} style={{ position: 'absolute', right: '-12px', bottom: '-12px', opacity: 0.08 }} />
        </div>

        {/* Card 2: Total Spent in Period */}
        <div className="card" style={{ padding: '22px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              TỔNG CHI TIÊU ({timePreset === 'custom' ? 'TÙY CHỌN' : `${timePreset} NGÀY`})
            </span>
            <div style={{
              width: '38px', height: '38px', borderRadius: '10px',
              background: '#ECFDF5', color: '#059669',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <TrendingUp size={20} />
            </div>
          </div>

          <div style={{ fontSize: '26px', fontWeight: 900, color: '#047857', marginBottom: '4px' }}>
            {statsOverview.totalSpent.toLocaleString('vi-VN')} đ
          </div>
          <div style={{ fontSize: '13px', color: 'var(--gray-500)' }}>
            Ghi nhận từ <strong>{statsOverview.paidCount}</strong> giao dịch thành công
          </div>
        </div>
      </div>

      {/* Filter Toolbar (Time Range, Status, Search) */}
      <div className="card" style={{ padding: '18px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          {/* Time Preset Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--gray-600)', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Calendar size={15} /> Khoảng thời gian:
            </span>
            {[
              { id: '7', label: '7 ngày' },
              { id: '14', label: '14 ngày' },
              { id: '30', label: '30 ngày (1 tháng)' },
              { id: 'custom', label: 'Tùy chỉnh' }
            ].map(p => {
              const isSelected = timePreset === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setTimePreset(p.id)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    border: isSelected ? '2px solid var(--primary)' : '1px solid var(--gray-200)',
                    background: isSelected ? 'var(--primary-light)' : 'white',
                    color: isSelected ? 'var(--primary-dark)' : 'var(--text)',
                    fontSize: '12px',
                    fontWeight: isSelected ? 800 : 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* Status Select & Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--gray-600)' }}>Trạng thái:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-input"
                style={{ padding: '6px 12px', fontSize: '13px', minWidth: '130px', height: '36px' }}
              >
                <option value="all">Tất cả</option>
                <option value="PAID">Thành công</option>
                <option value="PENDING">Chờ xử lý</option>
                <option value="EXPIRED">Hết hạn</option>
                <option value="CANCELLED">Đã hủy</option>
              </select>
            </div>

            <div style={{ position: 'relative', minWidth: '190px' }}>
              <input
                type="text"
                placeholder="Tìm mã đơn, tên gói..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '32px', paddingRight: '12px', height: '36px', fontSize: '13px' }}
              />
              <Search size={15} color="var(--gray-400)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>
        </div>

        {/* Custom date range picker if selected */}
        {timePreset === 'custom' && (
          <div style={{
            marginTop: '14px',
            paddingTop: '14px',
            borderTop: '1px dashed var(--gray-200)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gray-600)' }}>Từ ngày:</span>
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="form-input"
                style={{ padding: '4px 10px', fontSize: '13px', height: '34px' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gray-600)' }}>Đến ngày:</span>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="form-input"
                style={{ padding: '4px 10px', fontSize: '13px', height: '34px' }}
              />
            </div>
            <span style={{ fontSize: '12px', color: 'var(--gray-400)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Info size={14} /> Giới hạn tra cứu trong khoảng 1 tháng gần nhất
            </span>
          </div>
        )}
      </div>

      {/* Main Transactions Table Container */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {(() => {
          if (loading) {
            return (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', gap: '14px' }}>
                <Loader2 className="spinning" size={36} color="var(--primary)" />
                <span style={{ color: 'var(--gray-500)', fontSize: '14px', fontWeight: 600 }}>Đang tổng hợp dữ liệu giao dịch...</span>
              </div>
            );
          }
          if (error) {
            return (
              <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--red)' }}>
                <AlertCircle size={36} style={{ marginBottom: '12px' }} />
                <p style={{ fontWeight: 600, marginBottom: '16px' }}>{error}</p>
                <button type="button" className="btn btn-outline" onClick={loadData}>Thử lại</button>
              </div>
            );
          }
          if (filteredList.length === 0) {
            return (
              <div style={{ padding: '70px 20px', textAlign: 'center' }}>
                <Receipt size={48} style={{ marginBottom: '16px', color: 'var(--gray-300)' }} />
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '6px' }}>
                  Chưa có giao dịch trong khoảng thời gian này
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--gray-500)', maxWidth: '420px', margin: '0 auto 20px' }}>
                  Bạn có thể mở rộng bộ lọc thời gian hoặc khám phá các gói học để nhận ưu đãi đặc biệt từ SignMate.
                </p>
                <Link to="/pricing" className="btn btn-primary" style={{ padding: '10px 22px', fontSize: '13px' }}>
                  Xem bảng giá gói cước
                </Link>
              </div>
            );
          }
          return (
            <div className="table-responsive">
              <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'var(--gray-50)', borderBottom: '2px solid var(--gray-100)' }}>
                    <th style={{ padding: '14px 20px', fontSize: '11px', fontWeight: 800, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Mã đơn hàng
                    </th>
                    <th style={{ padding: '14px 20px', fontSize: '11px', fontWeight: 800, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Gói dịch vụ
                    </th>
                    <th style={{ padding: '14px 20px', fontSize: '11px', fontWeight: 800, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Số tiền
                    </th>
                    <th style={{ padding: '14px 20px', fontSize: '11px', fontWeight: 800, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Thời gian giao dịch
                    </th>
                    <th style={{ padding: '14px 20px', fontSize: '11px', fontWeight: 800, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Trạng thái
                    </th>
                    <th style={{ padding: '14px 20px', fontSize: '11px', fontWeight: 800, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredList.map((tx) => {
                    const isPending = (tx.status || '').toUpperCase() === 'PENDING';
                    const orderCodeDisplay = formatOrderCode(tx);
                    const codeToCopy = tx.orderCode ? String(tx.orderCode) : orderCodeDisplay;
                    const isCopied = copiedCode === codeToCopy;
                    const price = Number(tx.priceVnd) || 0;
                    const rowKey = tx.orderCode ? `tx-${tx.orderCode}` : `tx-sub-${tx.id || tx.startDate}`;

                    return (
                      <tr
                        key={rowKey}
                        style={{
                          borderBottom: '1px solid var(--gray-100)',
                          transition: 'background 0.15s ease'
                        }}
                      >
                        {/* Mã đơn hàng (Clean, NO DB ID) */}
                        <td style={{ padding: '14px 20px' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontWeight: 800, color: 'var(--primary-dark)', fontSize: '14px' }}>
                              {orderCodeDisplay}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyCode(codeToCopy)}
                              title={`Sao chép mã: ${codeToCopy}`}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '2px',
                                color: isCopied ? '#10B981' : 'var(--gray-400)',
                                display: 'inline-flex',
                                alignItems: 'center'
                              }}
                            >
                              {isCopied ? <Check size={13} /> : <Copy size={13} />}
                            </button>
                          </div>
                        </td>

                        {/* Gói dịch vụ */}
                        <td style={{ padding: '14px 20px' }}>
                          <div style={{ fontWeight: 800, fontSize: '14px', color: 'var(--text-dark)' }}>
                            {tx.planName || 'Gói học tập'}
                          </div>
                          <span className={`badge ${tx.planType === 'Pro' ? 'badge-yellow' : 'badge-gray'}`} style={{ fontSize: '10px', marginTop: '3px' }}>
                            {tx.planType || 'Standard'}
                          </span>
                        </td>

                        {/* Số tiền */}
                        <td style={{ padding: '14px 20px', fontWeight: 800, fontSize: '15px', color: price > 0 ? 'var(--text-dark)' : 'var(--gray-500)' }}>
                          {price > 0 ? `${price.toLocaleString('vi-VN')} đ` : '0 đ (Miễn phí)'}
                        </td>

                        {/* Thời gian */}
                        <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--gray-600)' }}>
                          <div>
                            {tx.startDate
                              ? new Date(tx.startDate).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })
                              : '—'}
                          </div>
                          {tx.endDate && (
                            <div style={{ fontSize: '11px', color: 'var(--gray-400)', marginTop: '2px' }}>
                              Đến: {new Date(tx.endDate).toLocaleDateString('vi-VN')}
                            </div>
                          )}
                        </td>

                        {/* Trạng thái */}
                        <td style={{ padding: '14px 20px' }}>
                          {getStatusBadge(tx.status)}
                        </td>

                        {/* Thao tác */}
                        <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                            {isPending && tx.orderCode && (
                              <button
                                type="button"
                                className="btn btn-primary"
                                disabled={verifyingCode === tx.orderCode}
                                onClick={() => handleVerify(tx.orderCode)}
                                style={{ padding: '6px 12px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                title="Kiểm tra thanh toán từ PayOS"
                              >
                                {verifyingCode === tx.orderCode ? (
                                  <>
                                    <Loader2 size={12} className="spinning" /> Kiểm tra...
                                  </>
                                ) : (
                                  <>
                                    <RefreshCw size={12} /> Kiểm tra TT
                                  </>
                                )}
                              </button>
                            )}

                            <button
                              type="button"
                              className="btn btn-outline"
                              onClick={() => setSelectedTx(tx)}
                              style={{ padding: '6px 12px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            >
                              <FileText size={13} /> Biên lai
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })()}
      </div>

      {/* Electronic Receipt / Invoice Modal */}
      {selectedTx && (
        <StudentReceiptModal tx={selectedTx} currentUser={currentUser} onClose={() => setSelectedTx(null)} />
      )}
    </div>
  );
};

export default StudentTransactions;

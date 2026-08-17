import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Building2,
  CreditCard,
  TrendingUp,
  Receipt,
  Download,
  Copy,
  Check,
  DollarSign,
  Users,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { subscriptionApi } from '../services/api';
import { exportReportPdf } from '../utils/exportPdf';

// Format status badge
const getStatusBadge = (status) => {
  const st = (status || '').toUpperCase();
  switch (st) {
    case 'PAID':
      return (
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '4px',
          padding: '3px 8px', borderRadius: '12px',
          fontSize: '11px', fontWeight: 700,
          background: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0',
          whiteSpace: 'nowrap'
        }}>
          <CheckCircle2 size={12} /> Thành công
        </span>
      );
    case 'PENDING':
      return (
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '4px',
          padding: '3px 8px', borderRadius: '12px',
          fontSize: '11px', fontWeight: 700,
          background: '#FFFBEB', color: '#B45309', border: '1px solid #FDE68A',
          whiteSpace: 'nowrap'
        }}>
          <Clock size={12} /> Chờ thanh toán
        </span>
      );
    case 'EXPIRED':
      return (
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '4px',
          padding: '3px 8px', borderRadius: '12px',
          fontSize: '11px', fontWeight: 700,
          background: '#F3F4F6', color: '#4B5563', border: '1px solid #E5E7EB',
          whiteSpace: 'nowrap'
        }}>
          <XCircle size={12} /> Hết hạn
        </span>
      );
    case 'CANCELLED':
      return (
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '4px',
          padding: '3px 8px', borderRadius: '12px',
          fontSize: '11px', fontWeight: 700,
          background: '#FEF2F2', color: '#B91C1C', border: '1px solid #FECACA',
          whiteSpace: 'nowrap'
        }}>
          <XCircle size={12} /> Đã hủy
        </span>
      );
    case 'FREE':
      return (
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '4px',
          padding: '3px 8px', borderRadius: '12px',
          fontSize: '11px', fontWeight: 700,
          background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE',
          whiteSpace: 'nowrap'
        }}>
          <Sparkles size={12} /> Miễn phí
        </span>
      );
    default:
      return (
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '4px',
          padding: '3px 8px', borderRadius: '12px',
          fontSize: '11px', fontWeight: 700,
          background: 'var(--gray-100)', color: 'var(--gray-600)',
          whiteSpace: 'nowrap'
        }}>
          {status}
        </span>
      );
  }
};

// Format clean order code
const formatOrderCode = (tx) => {
  if (tx.orderCode) return `#ORD-${tx.orderCode}`;
  const dt = tx.startDate ? new Date(tx.startDate) : new Date();
  const ymd = `${dt.getFullYear()}${String(dt.getMonth() + 1).padStart(2, '0')}${String(dt.getDate()).padStart(2, '0')}`;
  return `#SM-${ymd}-${tx.id || '0'}`;
};

// Receipt Modal Subcomponent
const AdminReceiptModal = ({ tx, onClose }) => {
  if (!tx) return null;
  const price = Number(tx.priceVnd) || 0;
  const isB2B = Boolean(tx.centerName);

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
      padding: '20px',
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        maxWidth: '520px',
        width: '100%',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-xl)',
        animation: 'fadeIn 0.2s ease-out'
      }}>
        {/* Modal Header */}
        <div style={{
          background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)',
          color: 'white',
          padding: '18px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Receipt size={22} color="var(--yellow)" />
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'white' }}>BIÊN LAI ĐIỆN TỬ</h3>
              <div style={{ fontSize: '11px', opacity: 0.85, marginTop: '2px' }}>SignMate Education • PayOS Gateway</div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              color: 'white',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'var(--transition)'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '22px 24px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            paddingBottom: '12px',
            borderBottom: '1px solid var(--gray-100)'
          }}>
            <div>
              <div style={{ fontSize: '10px', color: 'var(--gray-400)', fontWeight: 700, textTransform: 'uppercase' }}>
                MÃ GIAO DỊCH
              </div>
              <div style={{ fontSize: '15px', fontWeight: 900, color: 'var(--primary-dark)', marginTop: '2px' }}>
                {formatOrderCode(tx)}
              </div>
            </div>
            <div>{getStatusBadge(tx.status)}</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '10px', color: 'var(--gray-400)', fontWeight: 700 }}>KHÁCH HÀNG / TÀI KHOẢN</div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-dark)', marginTop: '2px' }}>
                {tx.userFullName || 'Khách hàng'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--gray-500)' }}>{tx.email}</div>
            </div>

            <div>
              <div style={{ fontSize: '10px', color: 'var(--gray-400)', fontWeight: 700 }}>PHÂN LOẠI / ĐƠN VỊ</div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-dark)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {isB2B ? <Building2 size={13} color="var(--primary)" /> : null}
                {tx.centerName || 'Cá nhân (B2C)'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--gray-500)' }}>Cổng: PayOS (VietQR)</div>
            </div>
          </div>

          {/* Breakdown Box */}
          <div style={{ background: 'var(--gray-50)', borderRadius: '10px', padding: '14px 16px', marginBottom: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
              <span style={{ fontWeight: 800, color: 'var(--text-dark)' }}>{tx.planName} ({tx.planType})</span>
              <span style={{ fontWeight: 900, color: 'var(--text-dark)' }}>{price.toLocaleString('vi-VN')} đ</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--gray-500)', marginBottom: '3px' }}>
              <span>Ngày kích hoạt:</span>
              <span>{tx.startDate ? new Date(tx.startDate).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--gray-500)' }}>
              <span>Hạn dùng đến:</span>
              <span>{tx.endDate ? new Date(tx.endDate).toLocaleDateString('vi-VN') : '—'}</span>
            </div>

            <div style={{
              borderTop: '1px dashed var(--gray-200)',
              marginTop: '10px',
              paddingTop: '10px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontWeight: 800, fontSize: '13px', color: 'var(--text-dark)' }}>TỔNG THANH TOÁN:</span>
              <span style={{ fontWeight: 900, fontSize: '18px', color: 'var(--primary-dark)' }}>
                {price.toLocaleString('vi-VN')} đ
              </span>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => window.print()}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', padding: '8px 14px' }}
            >
              <Printer size={14} /> In biên lai
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={onClose}
              style={{ fontSize: '12px', padding: '8px 18px' }}
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SubscriptionManagement = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timePreset, setTimePreset] = useState('30'); // '7', '14', '30', 'all', 'custom'
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all'); // 'all', 'b2b', 'b2c'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTx, setSelectedTx] = useState(null);
  const [verifyingCode, setVerifyingCode] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const [exporting, setExporting] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Load Transactions from backend API
  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;

      if (timePreset === 'custom') {
        if (customFrom) params.fromDate = new Date(customFrom).toISOString();
        if (customTo) params.toDate = new Date(customTo + 'T23:59:59').toISOString();
      } else if (timePreset !== 'all') {
        const days = Number.parseInt(timePreset, 10) || 30;
        const from = new Date();
        from.setDate(from.getDate() - days);
        from.setHours(0, 0, 0, 0);
        params.fromDate = from.toISOString();
        params.toDate = new Date().toISOString();
      }

      const data = await subscriptionApi.getAdminTransactions(params);
      setTransactions(Array.isArray(data) ? data : []);
      setCurrentPage(1);
    } catch (err) {
      setError(err.message || 'Không thể tải lịch sử giao dịch từ máy chủ.');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, timePreset, customFrom, customTo]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Verify Payment for SuperAdmin
  const handleVerify = async (orderCode) => {
    if (!orderCode) return;
    try {
      setVerifyingCode(orderCode);
      const res = await subscriptionApi.verifyPayment(orderCode);
      setToastMsg({ type: 'success', text: res.message || 'Đã kiểm tra và kích hoạt gói thành công!' });
      await loadData();
    } catch (err) {
      setToastMsg({ type: 'error', text: err.message || 'Chưa ghi nhận thanh toán từ cổng PayOS.' });
    } finally {
      setVerifyingCode(null);
    }
  };

  // Copy order code helper
  const handleCopyCode = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(String(code));
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Filter list by Type and Search Term
  const filteredList = useMemo(() => {
    return transactions.filter(t => {
      const isB2B = Boolean(t.centerName);
      if (typeFilter === 'b2b' && !isB2B) return false;
      if (typeFilter === 'b2c' && isB2B) return false;

      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const orderCodeStr = t.orderCode ? String(t.orderCode).toLowerCase() : '';
        const nameStr = (t.userFullName || '').toLowerCase();
        const emailStr = (t.email || '').toLowerCase();
        const planNameStr = (t.planName || '').toLowerCase();
        const centerStr = (t.centerName || '').toLowerCase();
        const match = orderCodeStr.includes(query) ||
                      nameStr.includes(query) ||
                      emailStr.includes(query) ||
                      planNameStr.includes(query) ||
                      centerStr.includes(query);
        if (!match) return false;
      }

      return true;
    });
  }, [transactions, typeFilter, searchTerm]);

  // Paginated list
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredList.slice(start, start + pageSize);
  }, [filteredList, currentPage]);

  const totalPages = Math.ceil(filteredList.length / pageSize) || 1;

  // 4 Clean Financial KPIs (No success/pending cards per user request)
  const stats = useMemo(() => {
    const paidTxs = filteredList.filter(t => (t.status || '').toUpperCase() === 'PAID');
    const totalRevenue = paidTxs.reduce((sum, t) => sum + (Number(t.priceVnd) || 0), 0);
    const activeSubs = filteredList.filter(t => t.isActive);
    const mrr = activeSubs.reduce((sum, t) => sum + (Number(t.priceVnd) || 0), 0);
    const aov = paidTxs.length > 0 ? Math.round(totalRevenue / paidTxs.length) : 0;

    return {
      totalRevenue,
      mrr,
      activeCount: activeSubs.length,
      aov,
      totalCount: filteredList.length
    };
  }, [filteredList]);

  // Export PDF Handler
  const handleExportPdf = async () => {
    setExporting(true);
    try {
      const vnd = (n) => `${(n || 0).toLocaleString('vi-VN')} đ`;
      await exportReportPdf({
        title: 'Báo cáo Lịch sử Giao dịch & Thuê bao',
        subtitle: `Danh sách giao dịch hệ thống SignMate (${timePreset === 'custom' ? 'Tùy chọn' : timePreset === 'all' ? 'Toàn bộ' : `${timePreset} ngày gần nhất`})`,
        fileName: 'bao-cao-lich-su-giao-dich.pdf',
        summary: [
          { label: 'Tổng doanh thu thực tế', value: vnd(stats.totalRevenue) },
          { label: 'Doanh thu định kỳ (MRR)', value: vnd(stats.mrr) },
          { label: 'Số thuê bao đang hiệu lực', value: stats.activeCount },
          { label: 'Giá trị trung bình đơn (AOV)', value: vnd(stats.aov) },
          { label: 'Tổng số bản ghi giao dịch', value: stats.totalCount }
        ],
        tables: [
          {
            heading: 'Chi tiết các giao dịch',
            columns: ['Mã đơn', 'Khách hàng', 'Đơn vị', 'Gói', 'Số tiền', 'Thời gian', 'Trạng thái'],
            rows: filteredList.map(t => [
              formatOrderCode(t),
              t.userFullName || '—',
              t.centerName || 'Cá nhân (B2C)',
              t.planName || '—',
              vnd(t.priceVnd),
              t.startDate ? new Date(t.startDate).toLocaleDateString('vi-VN') : '—',
              t.status || '—'
            ])
          }
        ]
      });
      setToastMsg({ type: 'success', text: 'Xuất file PDF báo cáo giao dịch thành công!' });
    } catch (err) {
      setToastMsg({ type: 'error', text: err.message || 'Lỗi xuất báo cáo PDF.' });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', paddingBottom: '40px' }}>
      {/* Toast Notification */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          padding: '12px 18px',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: 'var(--shadow-lg)',
          background: toastMsg.type === 'success' ? '#065F46' : '#991B1B',
          color: 'white',
          fontWeight: 600,
          fontSize: '13px',
          animation: 'fadeIn 0.2s ease'
        }}>
          {toastMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{toastMsg.text}</span>
          <button
            type="button"
            onClick={() => setToastMsg(null)}
            style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', marginLeft: '6px' }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '20px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontSize: '10px', fontWeight: 800, textTransform: 'uppercase',
              letterSpacing: '0.8px', color: 'var(--primary)', background: 'var(--primary-light)',
              padding: '2px 8px', borderRadius: '12px'
            }}>
              Super Admin
            </span>
            <h1 style={{ fontSize: '22px', fontWeight: 900, color: 'var(--text-dark)', margin: 0 }}>
              Quản lý Giao dịch & Gói dịch vụ
            </h1>
          </div>
          <p style={{ color: 'var(--gray-500)', fontSize: '13px', marginTop: '2px', margin: 0 }}>
            Đối soát dòng tiền toàn hệ thống, xác minh thanh toán PayOS và quản lý quyền truy cập gói cước.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={loadData}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '8px 14px', fontSize: '12px', fontWeight: 700 }}
          >
            <RefreshCw size={13} /> Làm mới
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleExportPdf}
            disabled={exporting || filteredList.length === 0}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '8px 16px', fontSize: '12px', fontWeight: 700 }}
          >
            {exporting ? <Loader2 size={13} className="spinning" /> : <Download size={13} />}
            Xuất PDF
          </button>
        </div>
      </div>

      {/* Compact Financial KPI Bar (4 metrics in 1 neat row) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '14px',
        marginBottom: '18px'
      }}>
        {/* KPI 1 */}
        <div className="card" style={{ padding: '14px 18px', borderLeft: '3px solid #059669' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--gray-500)', textTransform: 'uppercase' }}>
              TỔNG DOANH THU
            </span>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={16} />
            </div>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 900, color: '#047857' }}>
            {stats.totalRevenue.toLocaleString('vi-VN')} <span style={{ fontSize: '12px', fontWeight: 700 }}>đ</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="card" style={{ padding: '14px 18px', borderLeft: '3px solid var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--gray-500)', textTransform: 'uppercase' }}>
              DOANH THU ĐỊNH KỲ (MRR)
            </span>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={16} />
            </div>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-dark)' }}>
            {stats.mrr.toLocaleString('vi-VN')} <span style={{ fontSize: '12px', fontWeight: 700 }}>đ</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="card" style={{ padding: '14px 18px', borderLeft: '3px solid #7C3AED' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--gray-500)', textTransform: 'uppercase' }}>
              THUÊ BAO ACTIVE
            </span>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#F3E8FF', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={16} />
            </div>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 900, color: '#7C3AED' }}>
            {stats.activeCount} <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--gray-400)' }}>/ {stats.totalCount} bản ghi</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="card" style={{ padding: '14px 18px', borderLeft: '3px solid #2563EB' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--gray-500)', textTransform: 'uppercase' }}>
              GIÁ TRỊ TB ĐƠN (AOV)
            </span>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CreditCard size={16} />
            </div>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 900, color: '#1D4ED8' }}>
            {stats.aov.toLocaleString('vi-VN')} <span style={{ fontSize: '12px', fontWeight: 700 }}>đ</span>
          </div>
        </div>
      </div>

      {/* Streamlined Filter Toolbar */}
      <div className="card" style={{ padding: '14px 16px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          {/* Time Presets */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: '4px', marginRight: '4px' }}>
              <Calendar size={14} /> Thời gian:
            </span>
            {[
              { id: '7', label: '7 ngày' },
              { id: '14', label: '14 ngày' },
              { id: '30', label: '30 ngày' },
              { id: 'all', label: 'Tất cả' },
              { id: 'custom', label: 'Tùy chỉnh' }
            ].map(p => {
              const isSelected = timePreset === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setTimePreset(p.id)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '16px',
                    border: isSelected ? '1.5px solid var(--primary)' : '1px solid var(--gray-200)',
                    background: isSelected ? 'var(--primary-light)' : 'white',
                    color: isSelected ? 'var(--primary-dark)' : 'var(--text)',
                    fontSize: '11px',
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

          {/* Filters & Search Box */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-input"
              style={{ padding: '4px 8px', fontSize: '12px', minWidth: '125px', height: '32px' }}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="PAID">Thành công (PAID)</option>
              <option value="PENDING">Chờ xử lý (PENDING)</option>
              <option value="EXPIRED">Hết hạn (EXPIRED)</option>
              <option value="CANCELLED">Đã hủy (CANCELLED)</option>
              <option value="FREE">Miễn phí (FREE)</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="form-input"
              style={{ padding: '4px 8px', fontSize: '12px', minWidth: '125px', height: '32px' }}
            >
              <option value="all">Tất cả đối tượng</option>
              <option value="b2b">B2B (Trung tâm)</option>
              <option value="b2c">B2C (Cá nhân)</option>
            </select>

            <div style={{ position: 'relative', minWidth: '210px' }}>
              <input
                type="text"
                placeholder="Tìm mã đơn, khách hàng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '28px', paddingRight: '10px', height: '32px', fontSize: '12px' }}
              />
              <Search size={14} color="var(--gray-400)" style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>
        </div>

        {/* Custom Date Pickers */}
        {timePreset === 'custom' && (
          <div style={{
            marginTop: '12px',
            paddingTop: '12px',
            borderTop: '1px dashed var(--gray-200)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--gray-600)' }}>Từ:</span>
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="form-input"
                style={{ padding: '3px 8px', fontSize: '12px', height: '30px' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--gray-600)' }}>Đến:</span>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="form-input"
                style={{ padding: '3px 8px', fontSize: '12px', height: '30px' }}
              />
            </div>
            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={loadData}
              style={{ padding: '5px 12px', fontSize: '11px' }}
            >
              Áp dụng
            </button>
          </div>
        )}
      </div>

      {/* Main Modern High-Density Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {(() => {
          if (loading) {
            return (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: '10px' }}>
                <Loader2 className="spinning" size={32} color="var(--primary)" />
                <span style={{ color: 'var(--gray-500)', fontSize: '13px', fontWeight: 600 }}>Đang tải danh sách giao dịch...</span>
              </div>
            );
          }

          if (error) {
            return (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--red)' }}>
                <AlertCircle size={32} style={{ marginBottom: '10px' }} />
                <p style={{ fontWeight: 600, marginBottom: '14px', fontSize: '14px' }}>{error}</p>
                <button type="button" className="btn btn-outline" onClick={loadData} style={{ fontSize: '12px', padding: '6px 14px' }}>
                  Thử lại
                </button>
              </div>
            );
          }

          if (filteredList.length === 0) {
            return (
              <div style={{ padding: '50px 20px', textAlign: 'center' }}>
                <Receipt size={40} style={{ marginBottom: '12px', color: 'var(--gray-300)' }} />
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '4px' }}>
                  Không tìm thấy giao dịch nào
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--gray-500)', maxWidth: '380px', margin: '0 auto 16px' }}>
                  Không có dữ liệu phù hợp với bộ lọc thời gian hoặc từ khóa tìm kiếm.
                </p>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ fontSize: '12px', padding: '6px 14px' }}
                  onClick={() => {
                    setTimePreset('all');
                    setStatusFilter('all');
                    setTypeFilter('all');
                    setSearchTerm('');
                  }}
                >
                  Đặt lại bộ lọc
                </button>
              </div>
            );
          }

          return (
            <>
              <div className="table-responsive">
                <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'var(--gray-50)', borderBottom: '1.5px solid var(--gray-200)' }}>
                      <th style={{ padding: '10px 14px', fontSize: '11px', fontWeight: 800, color: 'var(--gray-500)', textTransform: 'uppercase', width: '170px' }}>
                        Mã đơn hàng
                      </th>
                      <th style={{ padding: '10px 14px', fontSize: '11px', fontWeight: 800, color: 'var(--gray-500)', textTransform: 'uppercase' }}>
                        Khách hàng / Tài khoản
                      </th>
                      <th style={{ padding: '10px 14px', fontSize: '11px', fontWeight: 800, color: 'var(--gray-500)', textTransform: 'uppercase', width: '140px' }}>
                        Đơn vị
                      </th>
                      <th style={{ padding: '10px 14px', fontSize: '11px', fontWeight: 800, color: 'var(--gray-500)', textTransform: 'uppercase', width: '150px' }}>
                        Gói dịch vụ
                      </th>
                      <th style={{ padding: '10px 14px', fontSize: '11px', fontWeight: 800, color: 'var(--gray-500)', textTransform: 'uppercase', width: '130px' }}>
                        Số tiền
                      </th>
                      <th style={{ padding: '10px 14px', fontSize: '11px', fontWeight: 800, color: 'var(--gray-500)', textTransform: 'uppercase', width: '140px' }}>
                        Thời hạn
                      </th>
                      <th style={{ padding: '10px 14px', fontSize: '11px', fontWeight: 800, color: 'var(--gray-500)', textTransform: 'uppercase', width: '130px' }}>
                        Trạng thái
                      </th>
                      <th style={{ padding: '10px 14px', fontSize: '11px', fontWeight: 800, color: 'var(--gray-500)', textTransform: 'uppercase', textAlign: 'right', width: '170px' }}>
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedList.map((tx) => {
                      const isPending = (tx.status || '').toUpperCase() === 'PENDING';
                      const orderCodeDisplay = formatOrderCode(tx);
                      const codeToCopy = tx.orderCode ? String(tx.orderCode) : orderCodeDisplay;
                      const isCopied = copiedCode === codeToCopy;
                      const price = Number(tx.priceVnd) || 0;
                      const isB2B = Boolean(tx.centerName);
                      const rowKey = tx.orderCode ? `row-${tx.orderCode}` : `row-sub-${tx.id || tx.startDate}`;

                      return (
                        <tr
                          key={rowKey}
                          style={{
                            borderBottom: '1px solid var(--gray-100)',
                            background: isPending ? '#FFFDF5' : 'transparent',
                            transition: 'background 0.15s ease'
                          }}
                        >
                          {/* Mã đơn hàng */}
                          <td style={{ padding: '10px 14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span style={{ fontWeight: 800, color: 'var(--primary-dark)', fontSize: '13px' }}>
                                {orderCodeDisplay}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyCode(codeToCopy)}
                                title={`Sao chép mã: ${codeToCopy}`}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: isCopied ? '#10B981' : 'var(--gray-400)',
                                  cursor: 'pointer',
                                  padding: '2px',
                                  display: 'inline-flex',
                                  alignItems: 'center'
                                }}
                              >
                                {isCopied ? <Check size={12} /> : <Copy size={12} />}
                              </button>
                            </div>
                            <div style={{ fontSize: '10px', color: 'var(--gray-400)', marginTop: '1px' }}>
                              {tx.orderCode ? 'Cổng PayOS' : 'Hệ thống'}
                            </div>
                          </td>

                          {/* Khách hàng */}
                          <td style={{ padding: '10px 14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                background: isB2B ? '#F3E8FF' : 'var(--primary-light)',
                                color: isB2B ? '#7C3AED' : 'var(--primary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 800,
                                fontSize: '12px',
                                flexShrink: 0
                              }}>
                                {(tx.userFullName || 'U')[0]}
                              </div>
                              <div style={{ overflow: 'hidden' }}>
                                <div style={{ fontWeight: 800, fontSize: '13px', color: 'var(--text-dark)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {tx.userFullName || 'Khách hàng'}
                                </div>
                                <div style={{ fontSize: '11px', color: 'var(--gray-400)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {tx.email}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Đơn vị */}
                          <td style={{ padding: '10px 14px' }}>
                            {isB2B ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#7C3AED', fontWeight: 700, fontSize: '12px' }}>
                                <Building2 size={13} />
                                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {tx.centerName}
                                </span>
                              </div>
                            ) : (
                              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--gray-500)' }}>
                                Cá nhân (B2C)
                              </span>
                            )}
                          </td>

                          {/* Gói dịch vụ */}
                          <td style={{ padding: '10px 14px' }}>
                            <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-dark)' }}>
                              {tx.planName}
                            </div>
                            <span className={`badge ${tx.planType === 'Pro' ? 'badge-yellow' : 'badge-gray'}`} style={{ fontSize: '9px', padding: '1px 6px' }}>
                              {tx.planType || 'Standard'}
                            </span>
                          </td>

                          {/* Số tiền */}
                          <td style={{ padding: '10px 14px', fontWeight: 800, fontSize: '13px', color: price > 0 ? 'var(--text-dark)' : 'var(--gray-500)' }}>
                            {price > 0 ? `${price.toLocaleString('vi-VN')} đ` : '0 đ'}
                          </td>

                          {/* Thời hạn */}
                          <td style={{ padding: '10px 14px', fontSize: '11px', color: 'var(--gray-600)' }}>
                            <div>{tx.startDate ? new Date(tx.startDate).toLocaleDateString('vi-VN') : '—'}</div>
                            {tx.endDate && (
                              <div style={{ color: 'var(--gray-400)' }}>
                                Đến: {new Date(tx.endDate).toLocaleDateString('vi-VN')}
                              </div>
                            )}
                          </td>

                          {/* Trạng thái */}
                          <td style={{ padding: '10px 14px' }}>
                            {getStatusBadge(tx.status)}
                          </td>

                          {/* Thao tác */}
                          <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                              {isPending && tx.orderCode && (
                                <button
                                  type="button"
                                  className="btn btn-primary"
                                  disabled={verifyingCode === tx.orderCode}
                                  onClick={() => handleVerify(tx.orderCode)}
                                  style={{ padding: '4px 8px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                  title="Kiểm tra trực tiếp với cổng PayOS"
                                >
                                  {verifyingCode === tx.orderCode ? (
                                    <Loader2 size={11} className="spinning" />
                                  ) : (
                                    <RefreshCw size={11} />
                                  )}
                                  Kiểm tra TT
                                </button>
                              )}

                              <button
                                type="button"
                                className="btn btn-outline"
                                onClick={() => setSelectedTx(tx)}
                                style={{ padding: '4px 8px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                              >
                                <FileText size={11} /> Biên lai
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination Bar */}
              {totalPages > 1 && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 18px',
                  borderTop: '1px solid var(--gray-100)',
                  background: 'var(--gray-50)',
                  fontSize: '12px'
                }}>
                  <div style={{ color: 'var(--gray-500)', fontWeight: 600 }}>
                    Hiển thị {(currentPage - 1) * pageSize + 1} – {Math.min(currentPage * pageSize, filteredList.length)} trong tổng số <strong>{filteredList.length}</strong> giao dịch
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      type="button"
                      className="btn btn-outline"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      style={{ padding: '4px 8px', fontSize: '11px', display: 'flex', alignItems: 'center' }}
                    >
                      <ChevronLeft size={14} /> Trước
                    </button>

                    <span style={{ fontWeight: 800, padding: '0 8px', color: 'var(--primary-dark)' }}>
                      {currentPage} / {totalPages}
                    </span>

                    <button
                      type="button"
                      className="btn btn-outline"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      style={{ padding: '4px 8px', fontSize: '11px', display: 'flex', alignItems: 'center' }}
                    >
                      Sau <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </>
          );
        })()}
      </div>

      {/* Electronic Receipt Modal */}
      {selectedTx && (
        <AdminReceiptModal tx={selectedTx} onClose={() => setSelectedTx(null)} />
      )}
    </div>
  );
};

export default SubscriptionManagement;

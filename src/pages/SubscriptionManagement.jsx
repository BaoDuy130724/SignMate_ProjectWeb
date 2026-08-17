import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  RefreshCw,
  Download,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';
import { subscriptionApi } from '../services/api';
import { exportReportPdf } from '../utils/exportPdf';
import { formatOrderCode, formatVnd } from '../utils/transactionUtils';
import {
  FinancialKpis,
  TransactionFilters,
  TransactionTable,
  ReceiptModal
} from '../components/subscription';
import usePaymentVerify from '../hooks/usePaymentVerify';

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

  // Payment Verification with Cooldown Protection
  const { verifyPayment, verifyingCode, getCooldownSeconds } = usePaymentVerify(async () => {
    await loadData();
  });

  const handleVerify = async (orderCode) => {
    const res = await verifyPayment(orderCode);
    setToastMsg({
      type: res.success ? 'success' : 'error',
      text: res.message
    });
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

  // 4 Clean Financial KPIs
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

  // Reset all filters
  const handleResetFilters = () => {
    setTimePreset('all');
    setStatusFilter('all');
    setTypeFilter('all');
    setSearchTerm('');
    setCustomFrom('');
    setCustomTo('');
  };

  // Export PDF Handler
  const handleExportPdf = async () => {
    setExporting(true);
    try {
      await exportReportPdf({
        title: 'Báo cáo Lịch sử Giao dịch & Thuê bao',
        subtitle: `Danh sách giao dịch hệ thống SignMate (${timePreset === 'custom' ? 'Tùy chọn' : timePreset === 'all' ? 'Toàn bộ' : `${timePreset} ngày gần nhất`})`,
        fileName: 'bao-cao-lich-su-giao-dich.pdf',
        summary: [
          { label: 'Tổng doanh thu thực tế', value: formatVnd(stats.totalRevenue) },
          { label: 'Doanh thu định kỳ (MRR)', value: formatVnd(stats.mrr) },
          { label: 'Số thuê bao đang hiệu lực', value: stats.activeCount },
          { label: 'Giá trị trung bình đơn (AOV)', value: formatVnd(stats.aov) },
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
              formatVnd(t.priceVnd),
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
              Quản lý Giao dịch & Đối soát thanh toán
            </h1>
          </div>
          <p style={{ color: 'var(--gray-500)', fontSize: '13px', marginTop: '2px', margin: 0 }}>
            Đối soát dòng tiền hệ thống, tra cứu hóa đơn/biên lai và xác minh thanh toán trực tiếp qua PayOS.
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

      {/* Compact Financial KPI Bar */}
      <FinancialKpis stats={stats} />

      {/* Streamlined Filter Toolbar */}
      <TransactionFilters
        timePreset={timePreset}
        setTimePreset={setTimePreset}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        customFrom={customFrom}
        customTo={customTo}
        setCustomFrom={setCustomFrom}
        setCustomTo={setCustomTo}
        onApplyCustom={loadData}
        showTypeFilter={true}
      />

      {/* Main Modern High-Density Table */}
      <TransactionTable
        loading={loading}
        error={error}
        filteredList={filteredList}
        paginatedList={paginatedList}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        copiedCode={copiedCode}
        onCopyCode={handleCopyCode}
        onVerify={handleVerify}
        verifyingCode={verifyingCode}
        getCooldownSeconds={getCooldownSeconds}
        onSelectTx={setSelectedTx}
        onRefresh={loadData}
        onResetFilters={handleResetFilters}
      />

      {/* Electronic Receipt Modal */}
      {selectedTx && (
        <ReceiptModal
          tx={selectedTx}
          portalType="admin"
          onClose={() => setSelectedTx(null)}
        />
      )}
    </div>
  );
};

export default SubscriptionManagement;

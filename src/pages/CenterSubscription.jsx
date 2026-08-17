import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  CheckCircle2,
  ShieldCheck,
  Calendar,
  Users,
  Star,
  ArrowUpRight,
  Loader2,
  AlertCircle,
  Clock,
  Search,
  RefreshCw,
  FileText,
  Copy,
  Check
} from 'lucide-react';
import { centersApi, subscriptionApi } from '../services/api';
import { formatOrderCode, formatVnd, formatDate } from '../utils/transactionUtils';
import { StatusBadge, ReceiptModal } from '../components/subscription';
import usePaymentVerify from '../hooks/usePaymentVerify';

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
  const [copiedCode, setCopiedCode] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  const centerId = localStorage.getItem('centerId');

  const handleCopyOrderCode = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(String(code));
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [sub, allPlans, centerStats] = await Promise.all([
        subscriptionApi.getMyPlan().catch(() => null),
        subscriptionApi.getPlans().catch(() => []),
        centerId ? centersApi.getStats(centerId).catch(() => null) : Promise.resolve(null)
      ]);

      setSubscription(sub);
      const b2b = Array.isArray(allPlans) ? allPlans.find(p => p.type === 'B2B') : null;
      setB2bPlan(b2b);
      setStats(centerStats);
    } catch (err) {
      setError(err.message || 'Không thể tải thông tin gói cước.');
    } finally {
      setLoading(false);
    }
  }, [centerId]);

  const loadTransactions = useCallback(async () => {
    setTxLoading(true);
    try {
      const now = new Date();
      const days = Number.parseInt(timePreset, 10) || 30;
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
      setTransactions([]);
    } finally {
      setTxLoading(false);
    }
  }, [timePreset, statusFilter]);

  useEffect(() => {
    loadData();
    loadTransactions();
  }, [loadData, loadTransactions]);

  // Payment Verification with Cooldown
  const { verifyPayment, verifyingCode, getCooldownSeconds } = usePaymentVerify(async () => {
    await Promise.all([loadData(), loadTransactions()]);
  });

  const handleVerify = async (orderCode) => {
    const res = await verifyPayment(orderCode);
    setActionMessage({
      type: res.success ? 'success' : 'error',
      text: res.message
    });
    setTimeout(() => setActionMessage(null), 5000);
  };

  // Mua thêm/gia hạn = thanh toán gói B2B qua PayOS
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

  const filteredTxList = useMemo(() => {
    if (!searchTerm.trim()) return transactions;
    const query = searchTerm.toLowerCase();
    return transactions.filter(t => {
      const orderCodeStr = t.orderCode ? String(t.orderCode).toLowerCase() : '';
      const nameStr = (t.userFullName || '').toLowerCase();
      const emailStr = (t.email || '').toLowerCase();
      const planNameStr = (t.planName || '').toLowerCase();
      return orderCodeStr.includes(query) || nameStr.includes(query) || emailStr.includes(query) || planNameStr.includes(query);
    });
  }, [transactions, searchTerm]);

  let features = [];
  if (b2bPlan?.featuresJson) {
    try {
      features = JSON.parse(b2bPlan.featuresJson);
    } catch {
      features = ['Quản lý lớp học', 'Báo cáo học viên', 'Hỗ trợ AI Feedback'];
    }
  }

  const seatPrice = b2bPlan?.priceVnd || 79000;

  const getSubscriptionStatusColor = () => {
    if (!subscription) return '#999';
    return subscription.isActive ? 'var(--green, #10b981)' : 'var(--red, #dc2626)';
  };

  const getSubscriptionStatusLabel = () => {
    if (!subscription) return 'Chưa kích hoạt';
    return subscription.isActive ? 'Đang hoạt động' : 'Hết hạn';
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Loader2 className="spinning" size={40} color="var(--primary)" />
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Quản lý Gói & Bản quyền Trung tâm</h1>
        <p className="page-subtitle">Xem thông tin gói B2B, quản lý giới hạn học viên (seats) và lịch sử giao dịch</p>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px 16px', borderRadius: '12px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Main Overview Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '32px', marginBottom: '32px' }}>
        <div>
          <div className="card" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <span className="badge badge-purple" style={{ marginBottom: '8px' }}>GÓI HIỆN TẠI</span>
                <h2 style={{ fontSize: '24px', fontWeight: 800 }}>{subscription?.planName || 'Gói Trung tâm (B2B)'}</h2>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '13px', color: 'var(--gray-400)', fontWeight: 600 }}>Chi phí gói</span>
                <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary)' }}>
                  {formatVnd(subscription?.priceVnd || seatPrice)} / học viên
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', padding: '20px', background: 'var(--gray-50)', borderRadius: '16px' }}>
              <div>
                <div style={{ color: 'var(--gray-400)', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>Tình trạng</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: getSubscriptionStatusColor()
                  }}></div>
                  <span style={{ fontWeight: 800, fontSize: '18px' }}>
                    {getSubscriptionStatusLabel()}
                  </span>
                </div>
              </div>

              <div>
                <div style={{ color: 'var(--gray-400)', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>Ngày hết hạn</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Calendar size={20} color="var(--gray-400)" />
                  <span style={{ fontWeight: 800, fontSize: '18px' }}>
                    {subscription?.endDate ? formatDate(subscription.endDate) : '—'}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '40px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
                  <Users size={18} color="var(--primary)" /> Giới hạn Học viên (Seats)
                </div>
                <div style={{ fontWeight: 800 }}>{stats?.totalStudents ?? stats?.studentCount ?? 0} / {stats?.maxSeats || 50} seats</div>
              </div>
              <div style={{ height: '16px', background: 'var(--gray-100)', borderRadius: '20px', overflow: 'hidden' }}>
                <div style={{
                  width: `${Math.min(100, (((stats?.totalStudents ?? stats?.studentCount ?? 0)) / (stats?.maxSeats || 50)) * 100)}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, var(--primary), var(--purple))',
                  borderRadius: '20px'
                }}></div>
              </div>
              <p style={{ marginTop: '12px', fontSize: '13px', color: 'var(--gray-400)' }}>
                Bạn đã sử dụng {Math.round((((stats?.totalStudents ?? stats?.studentCount ?? 0)) / (stats?.maxSeats || 50)) * 100)}% dung lượng cho phép của gói hiện tại.
              </p>
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: '20px' }}>Tính năng được bật</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {features.map((f) => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderRadius: '12px', background: 'var(--gray-50)' }}>
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
              {formatVnd(seatPrice)} <span style={{ fontSize: '15px', fontWeight: 600, opacity: 0.6 }}>/ học viên / tháng</span>
            </div>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {features.slice(0, 3).map((f) => (
                <li key={f} style={{ display: 'flex', gap: '10px' }}><CheckCircle2 size={16} color="var(--yellow)" /> {f}</li>
              ))}
            </ul>

            <button
              type="button"
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
            <div style={{ background: 'var(--primary-light)', padding: '12px', borderRadius: '12px', color: 'var(--primary)' }}>
              <ShieldCheck size={28} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '15px' }}>Bảo mật & Hợp đồng Doanh nghiệp</div>
              <div style={{ fontSize: '13px', color: 'var(--gray-400)', marginTop: '4px' }}>Cần hóa đơn VAT đỏ hoặc thanh toán chuyển khoản doanh nghiệp? Liên hệ đội ngũ SignMate B2B.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History Section */}
      <div className="card" style={{ marginTop: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0 }}>Lịch sử Giao dịch & Đăng ký Gói Trung tâm</h2>
            <p style={{ color: 'var(--gray-400)', fontSize: '13px', marginTop: '4px', margin: 0 }}>
              Tra cứu các giao dịch mua gói và gia hạn dịch vụ của trung tâm
            </p>
          </div>

          {/* Filter Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[
                { id: '7', label: '7 ngày' },
                { id: '14', label: '14 ngày' },
                { id: '30', label: '30 ngày' }
              ].map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setTimePreset(p.id)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '20px',
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

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-input"
              style={{ padding: '5px 10px', fontSize: '12px', height: '32px' }}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="PAID">Đã thanh toán (PAID)</option>
              <option value="PENDING">Chờ xử lý (PENDING)</option>
              <option value="EXPIRED">Đã hết hạn (EXPIRED)</option>
            </select>

            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Tìm mã đơn, tên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '28px', paddingRight: '8px', height: '32px', fontSize: '12px', width: '160px' }}
              />
              <Search size={13} color="var(--gray-400)" style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)' }} />
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

        {/* Action message banner */}
        {actionMessage && (
          <div style={{
            padding: '10px 16px',
            borderRadius: '10px',
            marginBottom: '16px',
            fontSize: '13px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: actionMessage.type === 'success' ? '#d1fae5' : actionMessage.type === 'error' ? '#fee2e2' : '#e0f2fe',
            color: actionMessage.type === 'success' ? '#047857' : actionMessage.type === 'error' ? '#b91c1c' : '#0369a1',
            border: `1px solid ${actionMessage.type === 'success' ? '#6ee7b7' : actionMessage.type === 'error' ? '#fca5a5' : '#7dd3fc'}`
          }}>
            {actionMessage.type === 'success' ? <CheckCircle2 size={16} /> : actionMessage.type === 'error' ? <AlertCircle size={16} /> : <Clock size={16} />}
            {actionMessage.text}
          </div>
        )}

        {/* Render Transaction Table Content */}
        {(() => {
          if (txLoading) {
            return (
              <div style={{ textAlign: 'center', padding: '50px' }}>
                <Loader2 className="spinning" size={28} color="var(--primary)" />
              </div>
            );
          }
          if (filteredTxList.length === 0) {
            return (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--gray-400)', border: '1px dashed var(--gray-200)', borderRadius: 'var(--radius-md)' }}>
                <FileText size={36} style={{ opacity: 0.3, marginBottom: '8px' }} />
                <div style={{ fontSize: '14px', fontWeight: 600 }}>Không có dữ liệu giao dịch trong khoảng thời gian này</div>
              </div>
            );
          }
          return (
            <div className="table-responsive">
              <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'var(--gray-50)', borderBottom: '1px solid var(--gray-100)' }}>
                    <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 800, color: 'var(--gray-500)', textTransform: 'uppercase' }}>Mã đơn hàng</th>
                    <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 800, color: 'var(--gray-500)', textTransform: 'uppercase' }}>Gói dịch vụ</th>
                    <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 800, color: 'var(--gray-500)', textTransform: 'uppercase' }}>Số tiền</th>
                    <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 800, color: 'var(--gray-500)', textTransform: 'uppercase' }}>Ngày kích hoạt</th>
                    <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 800, color: 'var(--gray-500)', textTransform: 'uppercase' }}>Trạng thái</th>
                    <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 800, color: 'var(--gray-500)', textTransform: 'uppercase', textAlign: 'right' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTxList.map((tx) => {
                    const txKey = tx.orderCode ? `tx-${tx.orderCode}` : `tx-sub-${tx.id || tx.startDate}`;
                    const isPending = (tx.status || '').toUpperCase() === 'PENDING';
                    const orderCodeDisplay = formatOrderCode(tx);
                    const codeToCopy = tx.orderCode ? String(tx.orderCode) : orderCodeDisplay;
                    const isCopied = copiedCode === codeToCopy;
                    const cooldown = tx.orderCode ? getCooldownSeconds(tx.orderCode) : 0;
                    const isVerifyingCurrent = verifyingCode === tx.orderCode;

                    return (
                      <tr key={txKey} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontWeight: 800, fontSize: '13px', color: 'var(--primary-dark)' }}>
                              {orderCodeDisplay}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyOrderCode(codeToCopy)}
                              title={`Sao chép mã: ${codeToCopy}`}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '2px',
                                color: isCopied ? '#10b981' : 'var(--gray-400)',
                                display: 'inline-flex',
                                alignItems: 'center'
                              }}
                            >
                              {isCopied ? <Check size={13} /> : <Copy size={13} />}
                            </button>
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--gray-400)' }}>{tx.orderCode ? 'Cổng PayOS' : 'Hệ thống'}</div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-dark)' }}>{tx.planName || 'Gói Trung tâm'}</div>
                          <span className="badge badge-purple" style={{ fontSize: '10px', marginTop: '2px' }}>
                            {tx.planType || 'B2B'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: 800, fontSize: '13px', color: tx.priceVnd > 0 ? 'var(--primary-dark)' : 'var(--gray-500)' }}>
                          {formatVnd(tx.priceVnd)}
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '12px' }}>
                          <div>{formatDate(tx.startDate)}</div>
                          {tx.endDate && (
                            <div style={{ fontSize: '10px', color: 'var(--gray-400)' }}>
                              Hạn: {formatDate(tx.endDate)}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <StatusBadge status={tx.status} />
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
                            {isPending && tx.orderCode && (
                              <button
                                type="button"
                                className="btn btn-primary"
                                disabled={isVerifyingCurrent || cooldown > 0}
                                onClick={() => handleVerify(tx.orderCode)}
                                style={{ padding: '4px 8px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                title={cooldown > 0 ? `Vui lòng chờ ${cooldown}s` : "Kiểm tra trạng thái từ PayOS"}
                              >
                                {isVerifyingCurrent ? (
                                  <Loader2 size={11} className="spinning" />
                                ) : (
                                  <RefreshCw size={11} />
                                )}
                                {cooldown > 0 ? `${cooldown}s` : 'Kiểm tra'}
                              </button>
                            )}
                            <button
                              type="button"
                              className="btn btn-outline"
                              onClick={() => setSelectedTx(tx)}
                              style={{ padding: '4px 10px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            >
                              <FileText size={12} /> Hóa đơn
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

      {/* Transaction Detail Modal */}
      {selectedTx && (
        <ReceiptModal
          tx={selectedTx}
          portalType="center"
          onClose={() => setSelectedTx(null)}
        />
      )}
    </div>
  );
};

export default CenterSubscription;

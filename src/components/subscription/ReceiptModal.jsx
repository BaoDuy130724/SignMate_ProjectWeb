import React, { useEffect } from 'react';
import { Receipt, X, Printer, Building2, Check, Copy } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { formatOrderCode, formatVnd, formatDate } from '../../utils/transactionUtils';

export const ReceiptModal = ({ tx, currentUser, onClose, portalType = 'admin' }) => {
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!tx) return null;

  const price = Number(tx.priceVnd) || 0;
  const isB2B = Boolean(tx.centerName || (portalType === 'center'));
  const orderCodeDisplay = formatOrderCode(tx);
  const codeToCopy = tx.orderCode ? String(tx.orderCode) : orderCodeDisplay;

  const handleCopy = () => {
    navigator.clipboard.writeText(codeToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const customerName = tx.userFullName || currentUser?.fullName || (portalType === 'center' ? 'Quản trị Trung tâm' : 'Khách hàng');
  const customerEmail = tx.email || currentUser?.email || '—';

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
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
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'white',
          borderRadius: '18px',
          maxWidth: '520px',
          width: '100%',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-xl)',
          animation: 'fadeIn 0.2s ease-out'
        }}
      >
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
            aria-label="Đóng"
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
          {/* Order Code & Status */}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                <span style={{ fontSize: '15px', fontWeight: 900, color: 'var(--primary-dark)' }}>
                  {orderCodeDisplay}
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  title="Sao chép mã"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: copied ? '#10B981' : 'var(--gray-400)',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                </button>
              </div>
            </div>
            <div>
              <StatusBadge status={tx.status} />
            </div>
          </div>

          {/* Customer & Classification */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '10px', color: 'var(--gray-400)', fontWeight: 700, textTransform: 'uppercase' }}>
                KHÁCH HÀNG / TÀI KHOẢN
              </div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-dark)', marginTop: '2px' }}>
                {customerName}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--gray-500)' }}>{customerEmail}</div>
            </div>

            <div>
              <div style={{ fontSize: '10px', color: 'var(--gray-400)', fontWeight: 700, textTransform: 'uppercase' }}>
                PHÂN LOẠI / ĐƠN VỊ
              </div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-dark)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {isB2B ? <Building2 size={13} color="var(--primary)" /> : null}
                {tx.centerName || (portalType === 'center' ? 'Trung tâm Đối tác' : 'Cá nhân (B2C)')}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--gray-500)' }}>Cổng: PayOS (VietQR)</div>
            </div>
          </div>

          {/* Breakdown Box */}
          <div style={{ background: 'var(--gray-50)', borderRadius: '10px', padding: '14px 16px', marginBottom: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
              <span style={{ fontWeight: 800, color: 'var(--text-dark)' }}>
                {tx.planName || 'Gói dịch vụ'} ({tx.planType || 'Standard'})
              </span>
              <span style={{ fontWeight: 900, color: 'var(--text-dark)' }}>
                {formatVnd(price)}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--gray-500)', marginBottom: '3px' }}>
              <span>Ngày kích hoạt:</span>
              <span>{formatDate(tx.startDate, true)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--gray-500)' }}>
              <span>Hạn dùng đến:</span>
              <span>{formatDate(tx.endDate)}</span>
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
                {formatVnd(price)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
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

export default ReceiptModal;

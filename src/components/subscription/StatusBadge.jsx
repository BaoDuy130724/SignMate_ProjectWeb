import React from 'react';
import { CheckCircle2, Clock, XCircle, Sparkles } from 'lucide-react';

export const StatusBadge = ({ status, size = 'md' }) => {
  const st = (status || '').toUpperCase();
  const isSmall = size === 'sm';

  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: isSmall ? '3px' : '4px',
    padding: isSmall ? '2px 6px' : '3px 8px',
    borderRadius: '12px',
    fontSize: isSmall ? '10px' : '11px',
    fontWeight: 700,
    whiteSpace: 'nowrap'
  };

  const iconSize = isSmall ? 10 : 12;

  switch (st) {
    case 'PAID':
      return (
        <span style={{
          ...baseStyle,
          background: '#ECFDF5',
          color: '#047857',
          border: '1px solid #A7F3D0'
        }}>
          <CheckCircle2 size={iconSize} /> Thành công
        </span>
      );
    case 'PENDING':
      return (
        <span style={{
          ...baseStyle,
          background: '#FFFBEB',
          color: '#B45309',
          border: '1px solid #FDE68A'
        }}>
          <Clock size={iconSize} /> Chờ thanh toán
        </span>
      );
    case 'EXPIRED':
    case 'INACTIVE':
      return (
        <span style={{
          ...baseStyle,
          background: '#F3F4F6',
          color: '#4B5563',
          border: '1px solid #E5E7EB'
        }}>
          <XCircle size={iconSize} /> Hết hạn
        </span>
      );
    case 'CANCELLED':
      return (
        <span style={{
          ...baseStyle,
          background: '#FEF2F2',
          color: '#B91C1C',
          border: '1px solid #FECACA'
        }}>
          <XCircle size={iconSize} /> Đã hủy
        </span>
      );
    case 'FREE':
      return (
        <span style={{
          ...baseStyle,
          background: '#EFF6FF',
          color: '#1D4ED8',
          border: '1px solid #BFDBFE'
        }}>
          <Sparkles size={iconSize} /> Miễn phí
        </span>
      );
    default:
      return (
        <span style={{
          ...baseStyle,
          background: 'var(--gray-100)',
          color: 'var(--gray-600)',
          border: '1px solid var(--gray-200)'
        }}>
          {status || '—'}
        </span>
      );
  }
};

export default StatusBadge;

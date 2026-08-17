/**
 * Utilities for Transaction and Subscription formatting
 */

export const formatOrderCode = (tx) => {
  if (!tx) return '—';
  if (tx.orderCode) return `#ORD-${tx.orderCode}`;
  const dt = tx.startDate ? new Date(tx.startDate) : new Date();
  const ymd = `${dt.getFullYear()}${String(dt.getMonth() + 1).padStart(2, '0')}${String(dt.getDate()).padStart(2, '0')}`;
  return `#SM-${ymd}-${tx.id || '1'}`;
};

export const formatVnd = (amount) => {
  const val = Number(amount) || 0;
  return `${val.toLocaleString('vi-VN')} đ`;
};

export const formatDate = (dateStr, includeTime = false) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '—';
  if (includeTime) {
    return d.toLocaleDateString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
  return d.toLocaleDateString('vi-VN');
};

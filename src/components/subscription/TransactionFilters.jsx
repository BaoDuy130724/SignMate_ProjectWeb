import React from 'react';
import { Calendar, Search } from 'lucide-react';

export const TransactionFilters = ({
  timePreset,
  setTimePreset,
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter,
  searchTerm,
  setSearchTerm,
  customFrom,
  customTo,
  setCustomFrom,
  setCustomTo,
  onApplyCustom,
  showTypeFilter = true
}) => {
  const timeOptions = [
    { id: '7', label: '7 ngày' },
    { id: '14', label: '14 ngày' },
    { id: '30', label: '30 ngày' },
    { id: 'all', label: 'Tất cả' },
    { id: 'custom', label: 'Tùy chỉnh' }
  ];

  return (
    <div className="card" style={{ padding: '14px 16px', marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        {/* Time Preset Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: '4px', marginRight: '4px' }}>
            <Calendar size={14} /> Thời gian:
          </span>
          {timeOptions.map((p) => {
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

        {/* Dropdowns & Search Input */}
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

          {showTypeFilter && setTypeFilter && (
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
          )}

          <div style={{ position: 'relative', minWidth: '200px' }}>
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
          {onApplyCustom && (
            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={onApplyCustom}
              style={{ padding: '5px 12px', fontSize: '11px' }}
            >
              Áp dụng
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TransactionFilters;

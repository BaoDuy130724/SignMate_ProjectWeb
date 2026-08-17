import React from 'react';
import {
  Loader2,
  AlertCircle,
  Receipt,
  FileText,
  RefreshCw,
  Building2,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import { formatOrderCode } from '../../utils/transactionUtils';

export const TransactionTable = ({
  loading,
  error,
  filteredList = [],
  paginatedList = [],
  currentPage,
  setCurrentPage,
  totalPages,
  pageSize,
  copiedCode,
  onCopyCode,
  onVerify,
  verifyingCode,
  getCooldownSeconds = () => 0,
  onSelectTx,
  onRefresh,
  onResetFilters
}) => {
  if (loading) {
    return (
      <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: '10px' }}>
        <Loader2 className="spinning" size={32} color="var(--primary)" />
        <span style={{ color: 'var(--gray-500)', fontSize: '13px', fontWeight: 600 }}>Đang tải danh sách giao dịch...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--red)' }}>
        <AlertCircle size={32} style={{ marginBottom: '10px' }} />
        <p style={{ fontWeight: 600, marginBottom: '14px', fontSize: '14px' }}>{error}</p>
        <button type="button" className="btn btn-outline" onClick={onRefresh} style={{ fontSize: '12px', padding: '6px 14px' }}>
          Thử lại
        </button>
      </div>
    );
  }

  if (filteredList.length === 0) {
    return (
      <div className="card" style={{ padding: '50px 20px', textAlign: 'center' }}>
        <Receipt size={40} style={{ marginBottom: '12px', color: 'var(--gray-300)' }} />
        <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '4px' }}>
          Không tìm thấy giao dịch nào
        </h3>
        <p style={{ fontSize: '12px', color: 'var(--gray-500)', maxWidth: '380px', margin: '0 auto 16px' }}>
          Không có dữ liệu phù hợp với bộ lọc thời gian hoặc từ khóa tìm kiếm.
        </p>
        {onResetFilters && (
          <button
            type="button"
            className="btn btn-outline"
            style={{ fontSize: '12px', padding: '6px 14px' }}
            onClick={onResetFilters}
          >
            Đặt lại bộ lọc
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
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
              const cooldown = tx.orderCode ? getCooldownSeconds(tx.orderCode) : 0;
              const isVerifyingCurrent = verifyingCode === tx.orderCode;

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
                        onClick={() => onCopyCode(codeToCopy)}
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
                      {tx.planName || 'Gói dịch vụ'}
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
                    <StatusBadge status={tx.status} />
                  </td>

                  {/* Thao tác */}
                  <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                      {isPending && tx.orderCode && (
                        <button
                          type="button"
                          className="btn btn-primary"
                          disabled={isVerifyingCurrent || cooldown > 0}
                          onClick={() => onVerify(tx.orderCode)}
                          style={{ padding: '4px 8px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          title={cooldown > 0 ? `Vui lòng chờ ${cooldown}s` : "Kiểm tra trực tiếp với cổng PayOS"}
                        >
                          {isVerifyingCurrent ? (
                            <Loader2 size={11} className="spinning" />
                          ) : (
                            <RefreshCw size={11} />
                          )}
                          {cooldown > 0 ? `${cooldown}s` : 'Kiểm tra TT'}
                        </button>
                      )}

                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => onSelectTx(tx)}
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
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
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
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              style={{ padding: '4px 8px', fontSize: '11px', display: 'flex', alignItems: 'center' }}
            >
              Sau <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionTable;

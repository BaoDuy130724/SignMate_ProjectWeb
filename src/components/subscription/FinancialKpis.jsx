import React from 'react';
import { DollarSign, TrendingUp, Users, CreditCard } from 'lucide-react';
import { formatVnd } from '../../utils/transactionUtils';

export const FinancialKpis = ({ stats }) => {
  const {
    totalRevenue = 0,
    mrr = 0,
    activeCount = 0,
    aov = 0,
    totalCount = 0
  } = stats || {};

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: '14px',
      marginBottom: '18px'
    }}>
      {/* KPI 1: Total Revenue */}
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
          {totalRevenue.toLocaleString('vi-VN')} <span style={{ fontSize: '12px', fontWeight: 700 }}>đ</span>
        </div>
      </div>

      {/* KPI 2: MRR */}
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
          {mrr.toLocaleString('vi-VN')} <span style={{ fontSize: '12px', fontWeight: 700 }}>đ</span>
        </div>
      </div>

      {/* KPI 3: Active Subscriptions */}
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
          {activeCount} <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--gray-400)' }}>/ {totalCount} bản ghi</span>
        </div>
      </div>

      {/* KPI 4: AOV */}
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
          {aov.toLocaleString('vi-VN')} <span style={{ fontSize: '12px', fontWeight: 700 }}>đ</span>
        </div>
      </div>
    </div>
  );
};

export default FinancialKpis;

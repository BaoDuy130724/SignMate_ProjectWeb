import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FileText, ArrowLeft, Loader2, Calendar, CheckCircle2, AlertCircle, Download } from 'lucide-react';
import { trackingApi } from '../services/api';

const CenterReports = () => {
  const centerId = localStorage.getItem('centerId');
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!centerId) {
      setError('Lỗi: Không tìm thấy ID trung tâm.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    setReport(null);

    try {
      const from = new Date(fromDate).toISOString();
      const to = new Date(toDate).toISOString();
      const res = await trackingApi.getCenterReports(centerId, from, to);
      setReport(res);
      setSuccess('Tạo báo cáo trung tâm thành công! 🎉');
    } catch (err) {
      setError(err.message || 'Lỗi khi xuất báo cáo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '0 20px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link to="/center" style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          color: 'var(--gray-400)', fontWeight: 700, fontSize: '14px',
          textDecoration: 'none'
        }}>
          <ArrowLeft size={16} /> Về Dashboard
        </Link>
      </div>

      <div className="page-header" style={{ marginBottom: '32px' }}>
        <h1 className="page-title">Báo cáo Trung tâm</h1>
        <p className="page-subtitle">Xuất báo cáo tổng hợp tiến độ và hoạt động luyện tập của học viên toàn trung tâm</p>
      </div>

      <div className="card" style={{ padding: '32px' }}>
        {error && (
          <div style={{
            background: '#ffebee', border: '2px solid var(--red)', borderRadius: 'var(--radius-md)',
            padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px',
            fontSize: '14px', color: 'var(--red-dark)', fontWeight: 600
          }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {success && (
          <div style={{
            background: '#e8f5e9', border: '2px solid var(--green)', borderRadius: 'var(--radius-md)',
            padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px',
            fontSize: '14px', color: 'var(--green-dark)', fontWeight: 600
          }}>
            <CheckCircle2 size={18} style={{ color: 'var(--green)' }} /> {success}
          </div>
        )}

        <form onSubmit={handleGenerate}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '28px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={14} /> Từ ngày
              </label>
              <input
                type="date"
                className="form-input"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                required
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={14} /> Đến ngày
              </label>
              <input
                type="date"
                className="form-input"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? (
              <Loader2 className="spinning" size={18} />
            ) : (
              <><FileText size={18} /> Kết xuất báo cáo</>
            )}
          </button>
        </form>

        {report && (
          <div style={{ marginTop: '32px', borderTop: '2px solid var(--gray-100)', paddingTop: '24px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '12px' }}>Thông tin báo cáo đã tạo</h3>
            <div style={{ fontSize: '14px', color: 'var(--text-dark)', background: 'var(--gray-50)', padding: '16px', borderRadius: '12px' }}>
              <div style={{ marginBottom: '8px' }}>Ngày tạo: <strong>{new Date(report.generatedAt).toLocaleString('vi-VN')}</strong></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gray-400)', fontSize: '13px' }}>
                <CheckCircle2 size={16} color="var(--green)" />
                <span>Báo cáo của trung tâm đã được lưu trên hệ thống.</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CenterReports;

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Sparkles, Search, Loader2, Plus, X, CheckCircle2, AlertCircle, Edit, Trash2, Calendar, Award } from 'lucide-react';
import { subscriptionApi } from '../services/api';

const PlansManagement = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState(null);

  // Create
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newPlan, setNewPlan] = useState({
    name: '',
    priceVnd: 0,
    durationDays: 30,
    type: 'Basic',
    featuresText: ''
  });

  // Edit
  const [editingPlan, setEditingPlan] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const loadData = useCallback(async () => {
    try {
      const data = await subscriptionApi.getPlans();
      setPlans(data || []);
    } catch (err) {
      setError(err.message || 'Lỗi lấy dữ liệu gói cước');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filteredPlans = useMemo(() => plans.filter(p =>
    (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.type || '').toLowerCase().includes(searchTerm.toLowerCase())
  ), [plans, searchTerm]);

  const getPlanTypeBadgeClass = (type) => {
    switch (type) {
      case 'Free': return 'badge-gray';
      case 'Basic': return 'badge-blue';
      case 'Pro': return 'badge-purple';
      case 'B2B': return 'badge-green';
      default: return 'badge-gray';
    }
  };

  const parseFeatures = (featuresJson) => {
    if (!featuresJson) return [];
    try {
      const parsed = JSON.parse(featuresJson);
      if (Array.isArray(parsed)) return parsed;
    } catch (_) {}
    return featuresJson.split(',').map(f => f.trim()).filter(Boolean);
  };

  const buildFeaturesJson = (text) => {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    return lines.length > 0 ? JSON.stringify(lines) : null;
  };

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data = {
        name: newPlan.name,
        priceVnd: Number(newPlan.priceVnd),
        durationDays: Number(newPlan.durationDays),
        type: newPlan.type,
        featuresJson: buildFeaturesJson(newPlan.featuresText)
      };
      await subscriptionApi.createPlan(data);
      setNewPlan({ name: '', priceVnd: 0, durationDays: 30, type: 'Basic', featuresText: '' });
      setShowCreateForm(false);
      showToast('Tạo gói cước thành công! 🎉');
      await loadData();
    } catch (err) {
      showToast('Lỗi: ' + err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePlan = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data = {
        name: editingPlan.name,
        priceVnd: Number(editingPlan.priceVnd),
        durationDays: Number(editingPlan.durationDays),
        featuresJson: buildFeaturesJson(editingPlan.featuresText)
      };
      await subscriptionApi.updatePlan(editingPlan.id, data);
      setEditingPlan(null);
      showToast('Cập nhật gói cước thành công! 🎉');
      await loadData();
    } catch (err) {
      showToast('Lỗi cập nhật: ' + err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePlan = async (planId, name) => {
    if (!globalThis.confirm(`Bạn có chắc chắn muốn xóa gói "${name}"?`)) return;
    try {
      await subscriptionApi.deletePlan(planId);
      showToast('Đã xóa gói cước thành công! 🗑️');
      await loadData();
    } catch (err) {
      showToast('Lỗi xóa gói cước: ' + err.message, 'error');
    }
  };

  if (loading && plans.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '120px', color: 'var(--primary)' }}>
        <Loader2 size={36} className="spinning" />
      </div>
    );
  }

  return (
    <>
      {toast && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
          padding: '16px 24px', borderRadius: '12px',
          background: toast.type === 'success' ? 'linear-gradient(135deg, #6ee7b7, #34d399)' : 'linear-gradient(135deg, #fca5a5, #f87171)',
          color: '#fff', fontWeight: 700, boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center', gap: '10px'
        }}>
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {toast.message}
        </div>
      )}

      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Quản lý Gói cước (Plans)</h1>
          <p className="page-subtitle">Cấu hình các gói dịch vụ B2C (Cá nhân) và B2B (Trung tâm)</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? <><X size={18} /> Hủy</> : <><Plus size={18} /> Thêm gói cước</>}
        </button>
      </div>

      {showCreateForm && (
        <div className="card" style={{ marginBottom: '24px', border: '1.5px solid var(--primary-light)', background: 'var(--gray-50)' }}>
          <h3 style={{ marginBottom: '20px' }}>Tạo gói cước mới</h3>
          <form onSubmit={handleCreatePlan} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label htmlFor="cp-name" className="form-label">Tên gói cước</label>
              <input id="cp-name" type="text" className="form-input" placeholder="VD: Gói VIP Pro" required
                value={newPlan.name} onChange={e => setNewPlan({ ...newPlan, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label htmlFor="cp-type" className="form-label">Loại gói</label>
              <select id="cp-type" className="form-input" value={newPlan.type} onChange={e => setNewPlan({ ...newPlan, type: e.target.value })}>
                <option value="Free">Free</option>
                <option value="Basic">Basic</option>
                <option value="Pro">Pro</option>
                <option value="B2B">B2B (Trung tâm)</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="cp-price" className="form-label">Giá tiền (VNĐ)</label>
              <input id="cp-price" type="number" min={0} className="form-input" placeholder="VD: 99000" required
                value={newPlan.priceVnd} onChange={e => setNewPlan({ ...newPlan, priceVnd: e.target.value })} />
            </div>
            <div className="form-group">
              <label htmlFor="cp-duration" className="form-label">Thời hạn (ngày)</label>
              <input id="cp-duration" type="number" min={1} className="form-input" placeholder="VD: 30" required
                value={newPlan.durationDays} onChange={e => setNewPlan({ ...newPlan, durationDays: e.target.value })} />
            </div>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label htmlFor="cp-features" className="form-label">Tính năng (mỗi dòng một tính năng)</label>
              <textarea id="cp-features" className="form-input" rows={4} placeholder="VD:&#10;Học không giới hạn bài&#10;Hỗ trợ AI Feedback"
                value={newPlan.featuresText} onChange={e => setNewPlan({ ...newPlan, featuresText: e.target.value })} style={{ height: 'auto', resize: 'vertical' }} />
            </div>
            <div style={{ gridColumn: 'span 2', display: 'flex', gap: '12px', marginTop: '10px' }}>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="spinning" size={16} /> : <CheckCircle2 size={16} />}
                {isSubmitting ? ' Đang tạo...' : ' Xác nhận tạo'}
              </button>
              <button type="button" className="btn btn-white" onClick={() => setShowCreateForm(false)}>Hủy</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Tìm kiếm theo tên gói cước..."
            style={{ paddingLeft: '48px' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="card" style={{ color: 'var(--red)', borderColor: 'var(--red)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <AlertCircle size={20} /> {error}
        </div>
      )}

      <div className="table-wrapper">
        <div className="table-header">
          <div className="table-title">Danh sách Gói cước ({filteredPlans.length})</div>
        </div>

        <table>
          <thead>
            <tr>
              <th style={{ width: '50px' }}>#</th>
              <th style={{ whiteSpace: 'nowrap' }}>Tên gói</th>
              <th style={{ whiteSpace: 'nowrap' }}>Giá tiền</th>
              <th style={{ whiteSpace: 'nowrap' }}>Thời hạn</th>
              <th style={{ whiteSpace: 'nowrap' }}>Phân loại</th>
              <th>Tính năng nổi bật</th>
              <th style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredPlans.map((plan, index) => (
              <tr key={plan.id}>
                <td style={{ color: 'var(--gray-300)', fontWeight: 700 }}>{index + 1}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--primary), var(--purple))',
                      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: '16px', flexShrink: 0
                    }}>
                      {(plan.name || '?')[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, color: 'var(--text-dark)' }}>{plan.name}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div style={{ fontWeight: 800, color: 'var(--text-dark)', whiteSpace: 'nowrap' }}>
                    {plan.priceVnd?.toLocaleString('vi-VN')}đ
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--gray-600)', whiteSpace: 'nowrap', fontWeight: 600 }}>
                    <Calendar size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                    <span>{plan.durationDays} ngày</span>
                  </div>
                </td>
                <td>
                  <span className={`badge ${getPlanTypeBadgeClass(plan.type)}`} style={{ minWidth: '70px', textAlign: 'center', fontWeight: 800, whiteSpace: 'nowrap' }}>
                    {plan.type}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxWidth: '300px' }}>
                    {parseFeatures(plan.featuresJson).slice(0, 3).map((f, idx) => (
                      <span key={idx} className="badge badge-purple" style={{ fontSize: '11px', whiteSpace: 'nowrap' }}>
                        {f}
                      </span>
                    ))}
                    {parseFeatures(plan.featuresJson).length > 3 && (
                      <span className="badge badge-gray" style={{ fontSize: '11px', whiteSpace: 'nowrap' }}>
                        +{parseFeatures(plan.featuresJson).length - 3}
                      </span>
                    )}
                  </div>
                </td>
                <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <button className="action-btn" onClick={() => {
                      const feats = parseFeatures(plan.featuresJson).join('\n');
                      setEditingPlan({ ...plan, featuresText: feats });
                    }} title="Chỉnh sửa">
                      <Edit size={14} />
                    </button>
                    <button className="action-btn action-btn-danger"
                      onClick={() => handleDeletePlan(plan.id, plan.name)} title="Xóa gói">
                      <Trash2 size={14} style={{ color: 'var(--red)' }} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && filteredPlans.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '60px', color: 'var(--gray-400)' }}>
                  <Award size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                  <div style={{ fontWeight: 700 }}>Không tìm thấy gói cước nào</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editingPlan && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,18,37,0.5)', backdropFilter: 'blur(4px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '540px', boxShadow: '0 32px 64px rgba(0,0,0,0.2)', background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0 }}>Chỉnh sửa gói cước</h3>
              <button onClick={() => setEditingPlan(null)} style={{ background: 'var(--gray-50)', border: 'none', cursor: 'pointer', borderRadius: '50%', width: '32px', height: '32px' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleUpdatePlan} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label htmlFor="ep-name" className="form-label">Tên gói cước</label>
                <input id="ep-name" type="text" className="form-input" required
                  value={editingPlan.name} onChange={e => setEditingPlan({ ...editingPlan, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label htmlFor="ep-type" className="form-label">Loại gói (Không thể thay đổi)</label>
                <input id="ep-type" type="text" className="form-input" disabled value={editingPlan.type}
                  style={{ background: 'var(--gray-50)', color: 'var(--gray-400)' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label htmlFor="ep-price" className="form-label">Giá tiền (VNĐ)</label>
                  <input id="ep-price" type="number" min={0} className="form-input" required
                    value={editingPlan.priceVnd} onChange={e => setEditingPlan({ ...editingPlan, priceVnd: e.target.value })} />
                </div>
                <div className="form-group">
                  <label htmlFor="ep-duration" className="form-label">Thời hạn (ngày)</label>
                  <input id="ep-duration" type="number" min={1} className="form-input" required
                    value={editingPlan.durationDays} onChange={e => setEditingPlan({ ...editingPlan, durationDays: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="ep-features" className="form-label">Tính năng (mỗi dòng một tính năng)</label>
                <textarea id="ep-features" className="form-input" rows={4}
                  value={editingPlan.featuresText} onChange={e => setEditingPlan({ ...editingPlan, featuresText: e.target.value })} style={{ height: 'auto', resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" className="btn btn-white" onClick={() => setEditingPlan(null)}>Hủy</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="spinning" size={16} /> : <CheckCircle2 size={16} />}
                  {isSubmitting ? ' Đang lưu...' : ' Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .badge-gray { background: var(--gray-100); color: var(--gray-500); }
        .badge-blue { background: #e3f2fd; color: #1565c0; }
        .badge-purple { background: #f3e5f5; color: #6a1b9a; }
        .badge-green { background: #e8f5e9; color: #2e7d32; }

        /* Premium Table Action Buttons styling */
        .action-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: 1px solid var(--gray-100);
          background: white;
          color: var(--gray-600);
          cursor: pointer;
          transition: var(--transition);
          box-shadow: none;
        }
        .action-btn:hover {
          background: var(--gray-50);
          color: var(--primary);
          border-color: var(--primary-light);
        }
        .action-btn-danger:hover {
          background: #fee2e2;
          color: var(--red);
          border-color: #fca5a5;
        }
      `}</style>
    </>
  );
};

export default PlansManagement;

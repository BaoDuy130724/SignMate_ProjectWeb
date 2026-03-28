import React, { useState, useEffect, useCallback } from 'react';
import { CreditCard, CheckCircle2, ShieldCheck, Zap, TrendingUp, Calendar, Users, Star, ArrowUpRight, Loader2, AlertCircle } from 'lucide-react';
import { centersApi, subscriptionApi } from '../services/api';

const CenterSubscription = () => {
  const [subscription, setSubscription] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const centerId = localStorage.getItem('centerId');

  const loadData = useCallback(async () => {
    try {
      if (!centerId) throw new Error('Không tìm thấy thông tin trung tâm.');
      const [subData, dashboardData] = await Promise.all([
        subscriptionApi.getMyPlan(),
        centersApi.getDashboard(centerId)
      ]);
      setSubscription(subData);
      setStats(dashboardData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [centerId]);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}><Loader2 className="spinning" /></div>;

  const features = [
    "Quản lý sĩ số lớp học linh hoạt",
    "Báo cáo tiến độ học viên chuyên sâu",
    "Thanh toán một lần theo năm",
    "Hỗ trợ kỹ thuật 24/7",
    "API kết nối hệ thống CRM",
    "Xuất báo cáo PDF/Excel không giới hạn"
  ];

  return (
    <>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Gói dịch vụ Trung tâm</h1>
          <p className="page-subtitle">Quản lý các giới hạn, thời hạn và tính năng của gói dịch vụ B2B</p>
        </div>
        <div className="badge badge-purple" style={{ padding: '8px 16px', fontSize: '14px', fontWeight: 800 }}>
          {subscription?.planName || 'Enterprise Plan'}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '32px' }}>
        <div>
          <div className="card" style={{ background: 'linear-gradient(135deg, var(--white) 0%, #f4f0ff 100%)', border: 'none', marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldCheck size={24} color="var(--primary)" /> Thông tin Gói hiện tại
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
              <div>
                <div style={{ color: 'var(--gray-400)', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>Tình trạng</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--green)' }}></div>
                  <span style={{ fontWeight: 800, fontSize: '18px' }}>Đang hoạt động</span>
                </div>
              </div>
              
              <div>
                <div style={{ color: 'var(--gray-400)', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>Ngày hết hạn</div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Calendar size={20} color="var(--gray-400)" />
                  <span style={{ fontWeight: 800, fontSize: '18px' }}>
                    {subscription?.expiryDate ? new Date(subscription.expiryDate).toLocaleDateString('vi-VN') : '—'}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '40px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
                    <Users size={18} color="var(--primary)" /> Giới hạn Học viên (Seats)
                 </div>
                 <div style={{ fontWeight: 800 }}>{stats?.studentCount || 0} / {stats?.maxSeats || 50} seats</div>
              </div>
              <div style={{ height: '16px', background: 'var(--gray-100)', borderRadius: '20px', overflow: 'hidden' }}>
                <div style={{ 
                  width: `${Math.min(100, ((stats?.studentCount || 0) / (stats?.maxSeats || 50)) * 100)}%`, 
                  height: '100%', 
                  background: 'linear-gradient(90deg, var(--primary), var(--purple))',
                  borderRadius: '20px'
                }}></div>
              </div>
              <p style={{ marginTop: '12px', fontSize: '13px', color: 'var(--gray-400)' }}>
                Bạn đã sử dụng {Math.round(((stats?.studentCount || 0) / (stats?.maxSeats || 50)) * 100)}% dung lượng cho phép của gói hiện tại.
              </p>
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: '20px' }}>Tính năng được bật</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {features.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderRadius: '12px', background: 'var(--gray-50)' }}>
                  <div style={{ color: 'var(--green)', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
              <div className="badge badge-yellow" style={{ position: 'relative', marginBottom: '16px' }}>ĐỀ XUẤT</div>
              <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>Unlimited <br/> Education</h2>
              <p style={{ opacity: 0.7, fontSize: '14px', marginBottom: '24px' }}>Mở rộng quy mô không giới hạn học viên và tính năng AI feedback nâng cao.</p>
              
              <div style={{ fontSize: '32px', fontWeight: 800, marginBottom: '32px' }}>
                9.500.000 <span style={{ fontSize: '15px', fontWeight: 600, opacity: 0.6 }}>/ năm</span>
              </div>
              
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                 <li style={{ display: 'flex', gap: '10px' }}><CheckCircle2 size={16} color="var(--yellow)" /> Không giới hạn sĩ số</li>
                 <li style={{ display: 'flex', gap: '10px' }}><CheckCircle2 size={16} color="var(--yellow)" /> Ưu tiên update module AI</li>
                 <li style={{ display: 'flex', gap: '10px' }}><CheckCircle2 size={16} color="var(--yellow)" /> Support Support VIP</li>
              </ul>
              
              <button className="btn btn-primary" style={{ width: '100%', background: 'var(--yellow)', color: 'var(--text-dark)', fontWeight: 800, border: 'none' }}>
                Nâng cấp Gói ngay <ArrowUpRight size={18} />
              </button>
           </div>

           <div style={{ marginTop: '24px', padding: '24px', borderRadius: '16px', border: '2px dashed var(--gray-200)', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ color: 'var(--primary)' }}><Zap size={24} /></div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '15px' }}>Cần thêm lượt seats?</div>
                <div style={{ fontSize: '13px', color: 'var(--gray-400)' }}>Bạn có thể mua lẻ thêm $48k/seat/năm mà không cần nâng cấp gói.</div>
              </div>
           </div>
        </div>
      </div>
    </>
  );
};

export default CenterSubscription;

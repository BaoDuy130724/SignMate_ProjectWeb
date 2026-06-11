import React, { useState, useEffect, useCallback } from 'react';
import { 
  TrendingUp, Award, CheckCircle2, Flame, Loader2, 
  Target, AlertCircle, Sparkles, Crown, Zap, Lock
} from 'lucide-react';
import { dashboardApi, subscriptionApi, authApi } from '../services/api';

const StudentProgress = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    overallAccuracy: 0,
    totalLessonsCompleted: 0,
    totalSignsMastered: 0,
    weakTopics: [],
    accuracyByTopic: {},
    streak: 0
  });
  const [currentPlan, setCurrentPlan] = useState(null); // null = Free, 'Basic', 'Pro'

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [overviewData, progressData, userData] = await Promise.all([
        dashboardApi.getOverview().catch(() => null),
        dashboardApi.getProgressStats().catch(() => null),
        authApi.me().catch(() => null)
      ]);

      setStats({
        overallAccuracy: progressData?.overallAccuracy || Math.round(overviewData?.averageAccuracy || 0),
        totalLessonsCompleted: progressData?.totalLessonsCompleted || 0,
        totalSignsMastered: progressData?.totalSignsMastered || 0,
        weakTopics: progressData?.weakTopics || [],
        accuracyByTopic: progressData?.accuracyByTopic || {},
        streak: overviewData?.currentStreak || 0
      });

      // Fetch current subscription
      try {
        const sub = await subscriptionApi.getMyPlan();
        if (sub && sub.isActive) {
          const planName = (sub.planName || sub.plan?.name || '').toLowerCase();
          const planType = (sub.planType || sub.plan?.type || '').toLowerCase();
          if (planType === 'pro' || planName.includes('nâng cao') || planName.includes('pro')) {
            setCurrentPlan('Pro');
          } else if (planType === 'basic' || planName.includes('cơ bản') || planName.includes('basic')) {
            setCurrentPlan('Basic');
          } else {
            setCurrentPlan('Free');
          }
        }
      } catch {
        setCurrentPlan(null);
      }
    } catch (err) {
      console.error('Failed to load progress stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', gap: '16px' }}>
        <Loader2 className="spinning" size={48} color="var(--primary)" />
        <p style={{ fontWeight: 600, color: 'var(--gray-400)' }}>Đang chuẩn bị bảng điểm của bạn...</p>
      </div>
    );
  }

  const isPremium = currentPlan === 'Pro' || currentPlan === 'Basic';

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px' }}>
      <div className="page-header" style={{ marginBottom: '32px' }}>
        <h1 className="page-title" style={{ fontSize: '32px', fontWeight: 900, marginBottom: '8px' }}>Kết quả Luyện tập</h1>
        <p className="page-subtitle" style={{ fontSize: '16px', color: 'var(--gray-500)', fontWeight: 600 }}>Thống kê chi tiết năng lực và lịch sử điểm số của bạn</p>
      </div>

      {/* Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', marginBottom: '32px' }}>
        <div className="card" style={{ background: 'linear-gradient(135deg, #FF9B44 0%, #FF512F 100%)', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', gap: '16px', padding: '24px' }}>
          <div style={{ background: 'rgba(255,255,255,0.2)', width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Flame size={32} />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, opacity: 0.8 }}>CHUỖI NGÀY</div>
            <div style={{ fontSize: '28px', fontWeight: 900 }}>{stats.streak} Ngày</div>
          </div>
        </div>

        <div className="card" style={{ background: 'linear-gradient(135deg, #1D976C 0%, #93F9B9 100%)', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', gap: '16px', padding: '24px' }}>
          <div style={{ background: 'rgba(255,255,255,0.2)', width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Target size={30} />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, opacity: 0.8 }}>ĐỘ CHÍNH XÁC</div>
            <div style={{ fontSize: '28px', fontWeight: 900 }}>{stats.overallAccuracy}%</div>
          </div>
        </div>

        <div className="card" style={{ background: 'linear-gradient(135deg, #7F00FF 0%, #E100FF 100%)', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', gap: '16px', padding: '24px' }}>
          <div style={{ background: 'rgba(255,255,255,0.2)', width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Award size={30} />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, opacity: 0.8 }}>ĐÃ THUỘC</div>
            <div style={{ fontSize: '28px', fontWeight: 900 }}>{stats.totalSignsMastered} ký hiệu</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '32px' }}>
        {/* Overall Accuracy circular chart */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
          <h3 style={{ marginBottom: '24px', width: '100%', textAlign: 'left' }}>Độ chính xác tổng thể</h3>
          <div style={{ position: 'relative', width: '160px', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="transparent"
                stroke="var(--gray-100)"
                strokeWidth="12"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="transparent"
                stroke={stats.overallAccuracy >= 70 ? 'var(--primary)' : 'var(--orange)'}
                strokeWidth="12"
                strokeDasharray={440}
                strokeDashoffset={440 - (440 * stats.overallAccuracy) / 100}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1s ease' }}
              />
            </svg>
            <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '32px', fontWeight: 900, color: 'var(--text-dark)' }}>{stats.overallAccuracy}%</span>
              <span style={{ fontSize: '12px', color: 'var(--gray-400)', fontWeight: 600 }}>TỐT</span>
            </div>
          </div>
          <p style={{ color: 'var(--gray-400)', fontSize: '14px', textAlign: 'center', margin: 0 }}>
            {stats.overallAccuracy >= 70 
              ? 'Tỷ lệ chính xác rất tốt. Tiếp tục phát huy bạn nhé!' 
              : 'Hãy luyện tập thêm để cải thiện độ chính xác trên 70%.'}
          </p>
        </div>

        {/* Level & Lesson completions */}
        <div className="card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ marginBottom: '8px' }}>Bài học đã hoàn thành</h3>
            <p style={{ color: 'var(--gray-400)', fontSize: '14px', marginBottom: '24px' }}>Tổng quan số bài học bạn đã hoàn thành trên lộ trình</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <CheckCircle2 size={40} color="var(--primary)" />
              <div>
                <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-dark)' }}>{stats.totalLessonsCompleted} Bài</div>
                <div style={{ fontSize: '13px', color: 'var(--gray-400)', fontWeight: 600 }}>ĐÃ HOÀN THÀNH</div>
              </div>
            </div>
          </div>
          <div style={{ borderTop: '2px solid var(--gray-100)', paddingTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontWeight: 700, fontSize: '14px' }}>Trạng thái tài khoản</span>
              <span className={`badge ${currentPlan === 'Pro' ? 'badge-yellow' : 'badge-primary'}`}>
                {currentPlan === 'Pro' ? 'Gói Pro' : currentPlan === 'Basic' ? 'Gói Cơ bản' : 'Gói Miễn phí'}
              </span>
            </div>
            {currentPlan !== 'Pro' && (
              <p style={{ color: 'var(--gray-400)', fontSize: '12px', margin: 0 }}>
                Nâng cấp lên Pro để mở khóa toàn bộ phân tích AI chi tiết.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Premium features content - Subject Accuracy & Weak Topics */}
      {isPremium ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '32px' }}>
          {/* Subject Accuracy */}
          <div className="card" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>Độ chính xác theo chủ đề</h3>
              {currentPlan === 'Pro' && <span style={{ background: 'var(--yellow-light)', color: 'var(--orange-dark)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 800 }}>PRO</span>}
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: '180px', paddingTop: '20px' }}>
              {Object.keys(stats.accuracyByTopic).length > 0 ? (
                Object.entries(stats.accuracyByTopic).slice(0, 5).map(([topic, score]) => (
                  <div key={topic} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '8px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--gray-500)' }}>{score}%</div>
                    <div style={{ width: '28px', height: '100px', background: 'var(--gray-100)', borderRadius: '6px', overflow: 'hidden', position: 'relative' }}>
                      <div style={{ 
                        position: 'absolute', 
                        bottom: 0, 
                        left: 0, 
                        width: '100%', 
                        height: `${score}%`, 
                        background: score >= 70 ? 'var(--primary)' : 'var(--orange)', 
                        borderRadius: '0 0 6px 6px' 
                      }} />
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--gray-400)', width: '60px', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={topic}>{topic}</div>
                  </div>
                ))
              ) : (
                <div style={{ color: 'var(--gray-300)', alignSelf: 'center' }}>Chưa có dữ liệu luyện tập theo chủ đề.</div>
              )}
            </div>
          </div>

          {/* Weak Topics */}
          <div className="card" style={{ padding: '32px' }}>
            <h3 style={{ marginBottom: '20px' }}>Chủ đề cần cải thiện</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {stats.weakTopics.length > 0 ? (
                stats.weakTopics.map(topic => {
                  const score = stats.accuracyByTopic[topic] || 50;
                  return (
                    <div key={topic}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 700, fontSize: '14px' }}>{topic}</span>
                        <span style={{ fontWeight: 800, color: 'var(--red)', fontSize: '14px' }}>{score}%</span>
                      </div>
                      <div style={{ height: '8px', background: 'var(--gray-100)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${score}%`, height: '100%', background: 'var(--red)', borderRadius: '4px' }} />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 0', color: 'var(--gray-300)', textAlign: 'center' }}>
                  <Sparkles size={40} style={{ marginBottom: '12px', color: 'var(--yellow-dark)' }} />
                  <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-dark)' }}>Tuyệt vời!</p>
                  <p style={{ margin: 0, fontSize: '13px' }}>Không có chủ đề nào dưới mức trung bình 70%.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Free Locked State */
        <div className="card" style={{ 
          background: 'linear-gradient(135deg, var(--gray-50) 0%, var(--white) 100%)',
          border: '2px dashed var(--gray-200)',
          padding: '48px',
          textAlign: 'center',
          marginBottom: '32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Lock size={48} style={{ color: 'var(--primary)', marginBottom: '16px' }} />
          <h3 style={{ marginBottom: '8px' }}>Mở khóa Thống kê Phân tích Chi tiết</h3>
          <p style={{ color: 'var(--gray-400)', maxWidth: '480px', margin: '0 auto 24px', fontSize: '14px' }}>
            Nâng cấp tài khoản Premium để xem biểu đồ độ chính xác theo chủ đề, các nội dung còn yếu và nhận phân tích sửa lỗi trực quan nhất.
          </p>
          <button className="btn btn-primary" onClick={() => window.location.href = '/pricing'}>
            Nâng cấp ngay <Zap size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default StudentProgress;

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Smartphone, Download, LogOut, Flame, Target, Trophy, 
  Map, Calendar, ArrowRight, Zap, CheckCircle2, Loader2, 
  TrendingUp, Award, PlayCircle, Star, QrCode, Crown, Sparkles
} from 'lucide-react';
import { dashboardApi, subscriptionApi } from '../services/api';

const StudentDashboard = () => {
  const [stats, setStats] = useState({
    fullName: localStorage.getItem('fullName') || localStorage.getItem('userEmail')?.split('@')[0] || 'Bạn',
    streak: 0,
    accuracy: 0,
    lessonsCompleted: 0,
    totalLessons: 0,
    points: 0,
    recentSessions: [],
    deadlines: []
  });
  const [loading, setLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState(null); // null = Free, 'Basic', 'Pro'

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await dashboardApi.getOverview();
      if (data) {
        setStats(prev => ({
          streak: data.streak || data.currentStreak || 0,
          accuracy: data.accuracy || data.averageAccuracy || 0,
          lessonsCompleted: data.lessonsCompleted || 0,
          totalLessons: data.totalLessons || 0,
          points: data.points || 0,
          recentSessions: data.recentSessions || [],
          deadlines: data.deadlines || data.assignments || [],
          fullName: data.fullName || prev.fullName
        }));
      }

      // Fetch current subscription
      try {
        const sub = await subscriptionApi.getMyPlan();
        if (sub && sub.isActive) {
          // Determine plan type from plan name or type
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
        // No subscription found = Free user
        setCurrentPlan(null);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', gap: '16px' }}>
      <Loader2 className="spinning" size={48} color="var(--primary)" />
      <p style={{ fontWeight: 600, color: 'var(--gray-400)' }}>Đang chuẩn bị lộ trình học cho bạn...</p>
    </div>
  );

  const displayName = stats?.fullName && stats.fullName !== '' ? stats.fullName : 'Bạn';

  // Determine which banner to show
  const renderBanner = () => {
    if (currentPlan === 'Pro') {
      // Pro user — congratulations banner, no upgrade button
      return (
        <div className="card" style={{ 
          background: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 50%, #8B5CF6 100%)', 
          color: 'white', border: 'none', padding: '24px 32px', marginBottom: '32px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <Crown size={28} />
              <h2 style={{ color: 'white', fontSize: '22px', margin: 0 }}>Pro Member</h2>
            </div>
            <p style={{ opacity: 0.9, fontSize: '14px', maxWidth: '450px', margin: 0 }}>
              Bạn đang sử dụng gói Nâng cao. Tận hưởng AI sửa lỗi chi tiết và phân tích chuyên sâu không giới hạn!
            </p>
          </div>
          <div style={{ 
            background: 'rgba(255,255,255,0.2)', padding: '10px 20px', borderRadius: 'var(--radius-full)',
            fontWeight: 800, fontSize: '14px', zIndex: 2, display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <Sparkles size={16} /> PREMIUM ACTIVE
          </div>
          <Crown size={120} style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.1, transform: 'rotate(15deg)' }} />
        </div>
      );
    }

    if (currentPlan === 'Basic') {
      // Basic user — show upgrade to Pro
      return (
        <div className="card" style={{ 
          background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)', 
          color: 'white', border: 'none', padding: '24px 32px', marginBottom: '32px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ background: 'rgba(255,255,255,0.25)', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '11px', fontWeight: 800 }}>GÓI CƠ BẢN</span>
            </div>
            <h2 style={{ color: 'white', fontSize: '20px', marginBottom: '6px' }}>Nâng cấp lên Pro — AI sửa lỗi chi tiết</h2>
            <p style={{ opacity: 0.85, fontSize: '14px', maxWidth: '450px', margin: 0 }}>Phân tích góc độ, hình dáng tay và phát hiện điểm yếu cần cải thiện.</p>
          </div>
          <button 
            className="btn" 
            onClick={() => window.location.href = '/pricing'}
            style={{ background: 'white', color: '#7C3AED', fontWeight: 800, padding: '12px 24px', border: 'none', zIndex: 2 }}
          >
            Nâng cấp Pro <Zap size={18} style={{ marginLeft: '8px' }} />
          </button>
          <Zap size={120} style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.1, transform: 'rotate(15deg)' }} />
        </div>
      );
    }

    // Free or no subscription — show full upgrade CTA
    return (
      <div className="card" style={{ 
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--purple) 100%)', 
        color: 'white', border: 'none', padding: '24px 32px', marginBottom: '32px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h2 style={{ color: 'white', fontSize: '22px', marginBottom: '8px' }}>Mở khóa toàn bộ lộ trình với Premium</h2>
          <p style={{ opacity: 0.9, fontSize: '14px', maxWidth: '450px' }}>Học không giới hạn bài học, nhận phản hồi AI chi tiết và lộ trình cá nhân hóa 24/7.</p>
        </div>
        <button 
          className="btn" 
          onClick={() => window.location.href = '/pricing'}
          style={{ background: 'var(--yellow)', color: 'var(--text-dark)', fontWeight: 800, padding: '12px 24px', border: 'none', zIndex: 2 }}
        >
          Nâng cấp ngay <Zap size={18} style={{ marginLeft: '8px' }} />
        </button>
        <Zap size={120} style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.1, transform: 'rotate(15deg)' }} />
      </div>
    );
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '8px' }}>Rất vui được gặp lại, {displayName}! 👋</h1>
        <p style={{ fontSize: '16px', color: 'var(--gray-500)', fontWeight: 600 }}>Hôm nay là một ngày tuyệt vời để tiếp tục hành trình Sign Language.</p>
      </div>

      {/* Dynamic Subscription Banner */}
      {renderBanner()}

      {/* Primary Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', marginBottom: '32px' }}>
         <div className="card" style={{ background: 'linear-gradient(135deg, #FF9B44 0%, #FF512F 100%)', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', gap: '16px', padding: '24px' }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <Flame size={32} />
            </div>
            <div>
               <div style={{ fontSize: '14px', fontWeight: 700, opacity: 0.8 }}>STREAK</div>
               <div style={{ fontSize: '28px', fontWeight: 900 }}>{stats?.streak || 0} Ngày</div>
            </div>
         </div>
         
         <div className="card" style={{ background: 'linear-gradient(135deg, #1D976C 0%, #93F9B9 100%)', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', gap: '16px', padding: '24px' }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <Target size={30} />
            </div>
            <div>
               <div style={{ fontSize: '14px', fontWeight: 700, opacity: 0.8 }}>ACCURACY</div>
               <div style={{ fontSize: '28px', fontWeight: 900 }}>{stats?.accuracy || 0}%</div>
            </div>
         </div>

         <div className="card" style={{ background: 'linear-gradient(135deg, #7F00FF 0%, #E100FF 100%)', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', gap: '16px', padding: '24px' }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <Award size={30} />
            </div>
            <div>
               <div style={{ fontSize: '14px', fontWeight: 700, opacity: 0.8 }}>LEVEL</div>
               <div style={{ fontSize: '28px', fontWeight: 900 }}>Bạc III</div>
            </div>
         </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
        {/* Learning Progress Card */}
        <div className="card" style={{ padding: '32px' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '20px' }}>Lộ trình hiện tại (Mastery)</h3>
              <span className="badge badge-yellow">G-Level Basic</span>
           </div>
           <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '12px' }}>
              <div style={{ flex: 1, height: '18px', background: 'var(--gray-100)', borderRadius: '20px', overflow: 'hidden' }}>
                 <div style={{ width: `${(stats?.lessonsCompleted / (stats?.totalLessons || 1)) * 100 || 0}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--purple))', transition: 'all 1s ease-out' }}></div>
              </div>
              <div style={{ fontWeight: 800, fontSize: '18px' }}>{stats?.lessonsCompleted || 0}/{stats?.totalLessons || 0} bài</div>
           </div>
           <p style={{ color: 'var(--gray-400)', fontSize: '15px' }}>
             Bạn đang đi đúng hướng! Hoàn thành thêm <strong>{stats?.totalLessons - stats?.lessonsCompleted || 0} bài</strong> nữa để thăng hạng nhé.
           </p>
           <button className="btn btn-primary" style={{ marginTop: '20px', padding: '12px 32px' }}>
             <PlayCircle size={18} style={{ marginRight: '8px' }} /> Tiếp tục bài học cuối
           </button>
        </div>

        {/* Practice History - Full Width */}
        <div className="card" style={{ padding: '24px' }}>
           <h3 style={{ marginBottom: '20px' }}>Hoạt động luyện tập gần đây</h3>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {stats?.recentSessions?.length > 0 ? stats.recentSessions.map(s => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: '12px', background: 'var(--gray-50)', border: '1px solid var(--gray-100)' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                         <CheckCircle2 size={20} />
                      </div>
                      <div>
                         <div style={{ fontWeight: 800, color: 'var(--text-dark)' }}>{s.title}</div>
                         <div style={{ fontSize: '12px', color: 'var(--gray-400)' }}>{s.date}</div>
                      </div>
                   </div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ textAlign: 'right' }}>
                         <div style={{ fontSize: '11px', color: 'var(--gray-400)', fontWeight: 700 }}>ĐỘ CHÍNH XÁC</div>
                         <div style={{ fontSize: '18px', fontWeight: 900, color: s.score >= 90 ? 'var(--green)' : 'var(--primary)' }}>{s.score}%</div>
                      </div>
                      <ArrowRight size={18} color="var(--gray-300)" />
                   </div>
                </div>
              )) : (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-300)', border: '2px dashed var(--gray-100)', borderRadius: '12px' }}>
                  Chưa có hoạt động luyện tập nào gần đây. Hãy bắt đầu bài học đầu tiên!
                </div>
              )}
           </div>
        </div>
      </div>

      <style>{`
        .spinning { animation: spin 2s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default StudentDashboard;

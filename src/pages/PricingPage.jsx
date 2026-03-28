import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight, Loader2, Sparkles, Crown, CheckCircle2 } from 'lucide-react';
import { subscriptionApi } from '../services/api';

// Plan tier ranking for comparison
const PLAN_RANK = { 'free': 0, 'learner': 0, 'basic': 1, 'pro': 2 };

const getPlanRank = (type) => PLAN_RANK[(type || '').toLowerCase()] ?? -1;

const PricingPage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(null);
  const [currentPlanType, setCurrentPlanType] = useState(null); // null = no subscription
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch plans
        const data = await subscriptionApi.getPlans();
        if (data && data.length > 0) {
          setPlans(data);
        } else {
          setPlans([
            {
              id: 'sample-free', name: 'Free Student', priceVnd: 0, durationDays: 30, type: 'Free',
              featuresJson: '["5 bài học / ngày", "AI Feedback cơ bản", "Theo dõi tiến độ"]'
            },
            {
              id: 'sample-basic', name: 'Gói Cơ bản', priceVnd: 49000, durationDays: 30, type: 'Basic',
              featuresJson: '["Bài học không giới hạn", "Phản hồi lỗi cơ bản", "Theo dõi tiến độ", "Streak"]'
            },
            {
              id: 'sample-pro', name: 'Gói Nâng cao (Pro)', priceVnd: 99000, durationDays: 30, type: 'Pro',
              featuresJson: '["AI sửa lỗi chi tiết", "Phân tích chuyên sâu", "Hỗ trợ 24/7", "Lộ trình cá nhân hóa"]'
            },
            {
              id: 'sample-b2b', name: 'Center Standard', priceVnd: 5000000, durationDays: 365, type: 'B2B',
              featuresJson: '["Quản lý 50 học viên", "Dashboard trung tâm", "Báo cáo tiến độ chi tiết"]'
            }
          ]);
        }

        // Fetch current subscription (if logged in)
        const token = localStorage.getItem('accessToken');
        if (token) {
          try {
            const sub = await subscriptionApi.getMyPlan();
            if (sub && sub.isActive) {
              const pName = (sub.planName || sub.plan?.name || '').toLowerCase();
              const pType = (sub.planType || sub.plan?.type || '').toLowerCase();
              if (pType.includes('pro') || pName.includes('pro') || pName.includes('nâng cao')) {
                setCurrentPlanType('Pro');
              } else if (pType.includes('basic') || pName.includes('basic') || pName.includes('cơ bản')) {
                setCurrentPlanType('Basic');
              } else {
                setCurrentPlanType('Free');
              }
            }
          } catch {
            // No active subscription
          }
        }
      } catch (err) {
        console.error('Failed to fetch plans', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubscribe = async (planId) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login', { state: { from: '/pricing' } });
      return;
    }

    try {
      setSubscribing(planId);
      const returnUrl = `${window.location.origin}/payment-callback`;
      const res = await subscriptionApi.upgrade(planId, returnUrl);
      
      if (res.paymentUrl) {
        window.location.href = res.paymentUrl;
      } else if (res.success) {
        alert('Gói miễn phí đã được kích hoạt!');
        navigate('/student');
      }
    } catch (err) {
      alert('Lỗi: ' + (err.message || 'Không thể khởi tạo thanh toán'));
    } finally {
      setSubscribing(null);
    }
  };

  const userRole = localStorage.getItem('userRole');
  const currentRank = getPlanRank(currentPlanType || 'free');
  
  // Only show plans HIGHER than current plan
  const b2cPlans = plans
    .filter(p => p.type !== 'B2B')
    .filter(p => getPlanRank(p.type) > currentRank);
  
  const b2bPlans = plans.filter(p => p.type === 'B2B');
  const showB2B = userRole === 'CenterAdmin' || userRole === 'SuperAdmin';
  const isMaxPlan = currentPlanType === 'Pro';

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Loader2 className="spinning" color="var(--primary)" size={48} />
    </div>
  );

  return (
    <section className="section" style={{ paddingTop: '140px', background: 'linear-gradient(to bottom, var(--white), var(--gray-50))' }}>
      <div className="container text-center">
        <span className="section-label">🚀 Nâng cấp Trải nghiệm</span>
        <h2 className="section-title">Phá bỏ mọi rào cản ngôn ngữ</h2>
        <p className="section-subtitle mx-auto">
          Chọn gói phù hợp để mở khóa toàn bộ sức mạnh của SignMate AI
        </p>

        {/* B2C Section */}
        <div style={{ marginTop: '60px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '40px' }}>
            <div style={{ height: '2px', width: '60px', background: 'var(--gray-100)' }}></div>
            <h3 style={{ margin: 0, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
               <Sparkles size={24} /> Dành cho Cá nhân
            </h3>
            <div style={{ height: '2px', width: '60px', background: 'var(--gray-100)' }}></div>
          </div>

          {isMaxPlan ? (
            <div style={{ maxWidth: '600px', margin: '0 auto', background: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 50%, #8B5CF6 100%)', borderRadius: '24px', padding: '48px', color: 'white', position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
              <div style={{ position: 'relative', zIndex: 2 }}>
                <Crown size={64} style={{ margin: '0 auto 16px' }} />
                <h3 style={{ fontSize: '28px', color: 'white', marginBottom: '12px' }}>Bạn là Pro Member! 🎉</h3>
                <p style={{ fontSize: '16px', opacity: 0.9, margin: 0 }}>
                  Bạn đã sở hữu gói cao cấp nhất của SignMate. Hãy tận hưởng toàn bộ tính năng phân tích AI nâng cao và tiếp tục hành trình học tập nhé!
                </p>
              </div>
              <Crown size={200} style={{ position: 'absolute', right: '-40px', bottom: '-40px', opacity: 0.1, transform: 'rotate(15deg)' }} />
            </div>
          ) : (
            <div className="pricing-grid">
              {b2cPlans.map(plan => (
                <div key={plan.id} className={`pricing-card ${plan.priceVnd > 50000 ? 'popular' : ''}`}>
                  {plan.priceVnd > 100000 && <div className="pricing-badge">Khuyên dùng</div>}
                  <div className="pricing-name">{plan.name}</div>
                  <div className="pricing-price">
                    {plan.priceVnd === 0 ? '0đ' : `${(plan.priceVnd / 1000).toLocaleString()}k`}
                    <span>/{plan.durationDays} ngày</span>
                  </div>
                  
                  <ul className="pricing-features" style={{ minHeight: '200px' }}>
                    {(JSON.parse(plan.featuresJson || '[]')).map((f, i) => (
                      <li key={i}><Check size={18} className="check" /> {f}</li>
                    ))}
                  </ul>

                  <button 
                    className={`btn ${plan.priceVnd > 50000 ? 'btn-primary' : 'btn-outline'}`}
                    style={{ width: '100%' }}
                    disabled={subscribing === plan.id}
                    onClick={() => handleSubscribe(plan.id)}
                  >
                    {subscribing === plan.id ? <Loader2 size={18} className="spinning" /> : (plan.priceVnd === 0 ? 'Bắt đầu ngay' : 'Thanh toán VNPay')}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* B2B Section — only visible for CenterAdmin / SuperAdmin */}
        {showB2B && b2bPlans.length > 0 && (
          <div style={{ marginTop: '100px', marginBottom: '60px' }}>
             <h3 style={{ marginBottom: '32px', color: 'var(--blue)' }}>🏫 Giải pháp dành cho Tổ chức</h3>
             <div className="grid-2" style={{ maxWidth: '900px', margin: '0 auto' }}>
                {b2bPlans.map(plan => (
                  <div key={plan.id} className="card" style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', border: '2px solid var(--blue-light)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                       <div>
                          <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--blue-dark)' }}>{plan.name}</div>
                          <div style={{ fontSize: '28px', fontWeight: 900, marginTop: '8px' }}>
                             {(plan.priceVnd / 1000).toLocaleString()}k <span style={{ fontSize: '14px', color: 'var(--gray-300)' }}>/tháng</span>
                          </div>
                       </div>
                       <div style={{ padding: '8px 12px', background: 'var(--blue-light)', color: 'var(--blue-dark)', borderRadius: '8px', fontSize: '12px', fontWeight: 800 }}>B2B PARTNER</div>
                    </div>
                    
                    <ul className="pricing-features" style={{ marginBottom: '32px', flex: 1 }}>
                       {(JSON.parse(plan.featuresJson || '[]')).map((f, i) => (
                          <li key={i}><Check size={18} style={{ color: 'var(--blue)' }} /> {f}</li>
                       ))}
                    </ul>

                    <button 
                      className="btn btn-blue" 
                      style={{ width: '100%' }}
                      disabled={subscribing === plan.id}
                      onClick={() => handleSubscribe(plan.id)}
                    >
                      {subscribing === plan.id ? <Loader2 size={18} className="spinning" /> : 'Kích hoạt ngay'}
                    </button>
                  </div>
                ))}
             </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default PricingPage;

import React, { useState, useEffect } from 'react';
import { Layers, Calendar, CheckCircle2, ChevronRight, PlayCircle, Smartphone, BookOpen, Loader2, Sparkles, Clock } from 'lucide-react';
import { dashboardApi } from '../services/api';

const StudentAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [suggestedLesson, setSuggestedLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await dashboardApi.getOverview();
        const list = data?.deadlines || data?.assignments || [];
        setAssignments(list);
        setSuggestedLesson(data?.suggestedLesson || null);
      } catch (err) {
        console.error('Failed to load assignments:', err);
        setAssignments([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', gap: '16px' }}>
      <Loader2 className="spinning" size={48} color="var(--primary)" />
      <p style={{ fontWeight: 600, color: 'var(--gray-400)' }}>Đang tải bài tập...</p>
    </div>
  );

  const pendingCount = assignments.filter(a => a.status !== 'Completed').length;
  const completedCount = assignments.filter(a => a.status === 'Completed').length;

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Bài tập từ Giáo viên</h1>
        <p className="page-subtitle">Hoàn thành các bài tập được giao để cải thiện điểm số và kỹ năng</p>
      </div>

      {/* Stats bar */}
      {assignments.length > 0 && (
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <div style={{ 
            display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 20px',
            background: 'var(--primary-light)', borderRadius: 'var(--radius-lg)', fontWeight: 700, fontSize: '14px', color: 'var(--primary)'
          }}>
            <Layers size={18} /> {pendingCount} chưa hoàn thành
          </div>
          <div style={{ 
            display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 20px',
            background: '#e8f5e9', borderRadius: 'var(--radius-lg)', fontWeight: 700, fontSize: '14px', color: 'var(--green)'
          }}>
            <CheckCircle2 size={18} /> {completedCount} đã hoàn thành
          </div>
        </div>
      )}

      {/* Assignment cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {assignments.map(a => (
          <div key={a.id} className="card" style={{ 
            display: 'flex', gap: '20px', alignItems: 'flex-start',
            border: a.status === 'Completed' ? '1.5px solid #a5d6a7' : '1.5px solid var(--gray-100)',
            background: a.status === 'Completed' ? '#f0fdf4' : '#fff',
            transition: 'all 0.2s ease'
          }}>
            <div style={{ 
              width: '56px', height: '56px', borderRadius: '16px', flexShrink: 0,
              background: a.status === 'Completed' ? 'var(--green)' : 'var(--primary-light)',
              color: a.status === 'Completed' ? '#fff' : 'var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {a.status === 'Completed' ? <CheckCircle2 size={28} /> : <Layers size={28} />}
            </div>
            
            <div style={{ flex: 1 }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                  <span className={`badge badge-${a.status === 'Completed' ? 'green' : 'blue'}`}>
                    {a.status === 'Completed' ? 'Đã hoàn thành' : 'Chưa luyện tập'}
                  </span>
                  <div style={{ fontSize: '13px', color: a.status === 'Completed' ? 'var(--green)' : 'var(--red)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={14} /> Hạn: {a.duedate}
                  </div>
               </div>
               
               <h3 style={{ margin: '0 0 4px 0', fontSize: '16px' }}>{a.title}</h3>
               <p style={{ margin: 0, fontSize: '14px', color: 'var(--gray-400)' }}>Giao bởi: <strong>{a.teacher}</strong></p>
               
               <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 {a.status === 'Completed' ? (
                   <span style={{ fontSize: '13px', color: 'var(--green)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                     <CheckCircle2 size={16} /> Hoàn thành
                   </span>
                 ) : (
                   <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                     <button className="btn btn-primary btn-sm">
                       <PlayCircle size={16} style={{ marginRight: '6px' }} /> Luyện tập
                     </button>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--gray-400)' }}>
                        <Smartphone size={14} /> Di động
                     </div>
                   </div>
                 )}
                 <ChevronRight size={18} color="var(--gray-300)" />
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {assignments.length === 0 && (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div className="card" style={{ textAlign: 'center', padding: '60px 40px' }}>
            <div style={{ 
              width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 20px',
              background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <BookOpen size={36} color="var(--primary)" />
            </div>
            <h3 style={{ color: 'var(--text-dark)', marginBottom: '8px' }}>Chưa có bài tập nào</h3>
            <p style={{ color: 'var(--gray-400)', fontSize: '15px', maxWidth: '400px', margin: '0 auto' }}>
              Giáo viên của bạn chưa giao bài tập nào. Khi có bài tập mới, chúng sẽ xuất hiện tại đây.
            </p>
          </div>
        </div>
      )}

      <style>{`
        .spinning { animation: spin 2s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
};

export default StudentAssignments;

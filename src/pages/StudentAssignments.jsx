import React, { useState, useEffect } from 'react';
import { Layers, Calendar, CheckCircle2, ChevronRight, PlayCircle, Smartphone, BookOpen, Loader2, Sparkles, Clock, Building2, Globe } from 'lucide-react';
import { dashboardApi, coursesApi } from '../services/api';

const StudentAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [data, courseData] = await Promise.all([
          dashboardApi.getOverview(),
          // BE đã lọc theo center: B2C chỉ nhận khóa chung; B2B nhận thêm khóa của trung tâm.
          coursesApi.getAll().catch(() => []),
        ]);
        const list = data?.deadlines || data?.assignments || [];
        setAssignments(list);
        setCourses(Array.isArray(courseData) ? courseData : []);
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

  const courseLevelVi = (lvl) =>
    ({ Beginner: 'Người mới', Intermediate: 'Trung cấp', Advanced: 'Nâng cao' }[lvl] || lvl);

  const renderCourseGroup = (title, IconCmp, list, accent) => (
    <div style={{ marginBottom: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <IconCmp size={18} color={accent} />
        <h2 style={{ margin: 0, fontSize: '18px' }}>{title}</h2>
        <span className="badge badge-gray">{list.length}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {list.map(c => (
          <div key={c.id} className="card" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '14px', flexShrink: 0, background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={24} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{ margin: '0 0 4px', fontSize: '15px' }}>{c.title}</h3>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--gray-400)' }}>
                {c.lessonCount} bài học • {courseLevelVi(c.level)}
              </p>
            </div>
            <button className="btn btn-outline btn-sm" style={{ flexShrink: 0 }} onClick={() => window.location.href = '/student/mobile'}>
              <PlayCircle size={15} style={{ marginRight: '4px' }} /> Học trên app
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Bài học</h1>
        <p className="page-subtitle">Các bài học bạn có thể luyện tập — mở ứng dụng SignMate để học cùng AI.</p>
      </div>

      {/* Bài tập GV — chỉ hiện khi có (học viên B2B có lớp/GV); B2C không thấy phần này */}
      {assignments.length > 0 && (
        <h2 style={{ margin: '0 0 16px', fontSize: '18px' }}>Bài tập được giao</h2>
      )}
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
      {assignments.length > 0 && (
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
                     <button className="btn btn-primary btn-sm" onClick={() => window.location.href = '/student/mobile'}>
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
      )}

      {/* Khóa học có sẵn (BE đã lọc theo center: B2C chỉ khóa chung; B2B + khóa trung tâm) */}
      {courses.length > 0 && (() => {
        const centerCourses = courses.filter(c => c.centerId);
        const generalCourses = courses.filter(c => !c.centerId);
        return (
          <div style={{ marginTop: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Sparkles size={20} color="var(--primary)" />
              <h1 style={{ margin: 0, fontSize: '22px' }}>Khóa học bạn có thể học</h1>
            </div>
            <p style={{ margin: '0 0 24px', color: 'var(--gray-400)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Smartphone size={15} /> Mở ứng dụng di động SignMate để luyện tập cùng AI.
            </p>
            {centerCourses.length > 0 &&
              renderCourseGroup('Khóa học của Trung tâm bạn', Building2, centerCourses, 'var(--primary)')}
            {generalCourses.length > 0 &&
              renderCourseGroup(centerCourses.length > 0 ? 'Khóa học chung' : 'Tất cả khóa học', Globe, generalCourses, 'var(--blue)')}
          </div>
        );
      })()}

      <style>{`
        .spinning { animation: spin 2s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
};

export default StudentAssignments;

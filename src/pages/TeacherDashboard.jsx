import React, { useState, useEffect } from 'react';
import { Users, Target, BookOpen, FileText, Download, Loader2 } from 'lucide-react';
import { classesApi, progressApi } from '../services/api';

const TeacherDashboard = () => {
  const [classes, setClasses] = useState([]);
  const [activeClass, setActiveClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const centerId = localStorage.getItem('centerId');
        if (!centerId) throw new Error('Không tìm thấy thông tin trung tâm. Vui lòng đăng nhập lại.');
        
        const classesData = await classesApi.getAll(centerId);
        setClasses(classesData);
        
        if (classesData.length > 0) {
          const firstClass = classesData[0];
          setActiveClass(firstClass);
          
          const trackingData = await progressApi.getClassProgress(firstClass.id);
          setStudents(trackingData);
        }
      } catch (err) {
        setError(err.message || 'Lỗi lấy dữ liệu');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleClassChange = async (classId) => {
    const cls = classes.find(c => c.id === classId);
    if (!cls) return;
    setActiveClass(cls);
    setLoading(true);
    try {
      const trackingData = await progressApi.getClassProgress(cls.id);
      setStudents(trackingData);
    } catch (err) {
        console.error(err);
    }
    setLoading(false);
  };

  const getStatusBadge = (accuracy) => {
    if (accuracy >= 80) return <span className="badge badge-green">Xuất sắc</span>;
    if (accuracy >= 60) return <span className="badge badge-blue">Tốt</span>;
    if (accuracy >= 40) return <span className="badge badge-yellow">Cần cải thiện</span>;
    return <span className="badge badge-red">Yếu</span>;
  };

  if (loading && !activeClass) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '100px', color: 'var(--primary)' }}><Loader2 size={32} /></div>;
  }

  if (error) {
    return <div className="card" style={{ color: 'var(--red)', borderColor: 'var(--red)' }}>{error}</div>;
  }

  if (!activeClass) {
    return <div className="card">Trống! Bạn chưa phụ trách lớp học nào.</div>;
  }

  const avgAccuracy = students.length 
    ? Math.round(students.reduce((acc, s) => acc + s.accuracyPercent, 0) / students.length)
    : 0;

  return (
    <>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">{activeClass.name}</h1>
          <p className="page-subtitle">Giáo viên: {activeClass.teacherName || 'Tôi'} • {activeClass.studentCount} học viên</p>
        </div>
        <select 
          className="form-input" 
          style={{ width: 'auto', background: 'white', fontWeight: 700 }} 
          value={activeClass.id}
          onChange={(e) => handleClassChange(e.target.value)}
        >
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon card-icon-blue" style={{ marginBottom: 0 }}><Users size={24} /></div>
          <div>
            <div className="stat-value">{activeClass.studentCount}</div>
            <div className="stat-label">Học viên</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon card-icon-green" style={{ marginBottom: 0 }}><Target size={24} /></div>
          <div>
            <div className="stat-value">{avgAccuracy}%</div>
            <div className="stat-label">Accuracy trung bình</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon card-icon-yellow" style={{ marginBottom: 0 }}><BookOpen size={24} /></div>
          <div>
            <div className="stat-value">--</div>
            <div className="stat-label">Chuyên đề cần cải thiện</div>
          </div>
        </div>
      </div>

      {/* Student Progress Table */}
      <div className="table-wrapper" style={{ marginBottom: '24px' }}>
        <div className="table-header">
          <div className="table-title">Tiến độ Học viên</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-primary btn-sm">Giao bài mới</button>
            <button className="btn btn-outline btn-sm"><Download size={16} /> Xuất PDF</button>
          </div>
        </div>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--primary)' }}><Loader2 /></div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Học viên</th>
                <th>Accuracy</th>
                <th>Chuỗi ngày</th>
                <th>Chủ đề yếu</th>
                <th>Đánh giá</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.studentId}>
                  <td style={{ fontWeight: 700 }}>{s.fullName}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="progress-bar" style={{ width: '80px', height: '8px', marginBottom: 0 }}>
                        <div className="progress-fill" style={{ 
                          width: `${s.accuracyPercent}%`, 
                          background: s.accuracyPercent >= 80 ? 'var(--primary)' : s.accuracyPercent >= 60 ? 'var(--blue)' : 'var(--orange)' 
                        }}></div>
                      </div>
                      <span style={{ fontWeight: 700, fontSize: '14px' }}>{s.accuracyPercent.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td>🔥 {s.practiceFrequencyDays} buổi/tuần</td>
                  <td style={{ color: 'var(--gray-400)' }}>{s.weakTopics?.join(', ') || 'Không có'}</td>
                  <td>{getStatusBadge(s.accuracyPercent)}</td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: 'var(--gray-400)' }}>
                    Chưa có dữ liệu theo dõi tiến trình
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Weekly Report */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div className="stat-icon card-icon-blue" style={{ width: '56px', height: '56px', marginBottom: 0 }}>
          <FileText size={24} />
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ marginBottom: '4px' }}>Báo cáo Tuần / Tháng</h3>
          <p style={{ color: 'var(--gray-400)', fontSize: '15px' }}>
            Hệ thống tự động phân tích hành vi và điểm số của {activeClass.studentCount} học viên
          </p>
        </div>
        <button className="btn btn-blue btn-sm"><Download size={16} /> Export PDF</button>
      </div>
    </>
  );
};

export default TeacherDashboard;

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Target, BookOpen, FileText, Download, Loader2, MessageSquare, Plus, Trash2, Edit, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { progressApi, teacherApi } from '../services/api';
import { exportReportPdf } from '../utils/exportPdf';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [activeClass, setActiveClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [comments, setComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [toast, setToast] = useState(null);
  const [exporting, setExporting] = useState(false);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const handleExportPdf = async () => {
    if (!activeClass) return;
    setExporting(true);
    try {
      const avg = students.length
        ? students.reduce((a, s) => a + s.accuracyPercent, 0) / students.length
        : 0;
      await exportReportPdf({
        title: `Tiến độ lớp ${activeClass.name}`,
        subtitle: 'Báo cáo tiến độ và năng lực học viên',
        fileName: `tien-do-${activeClass.name}.pdf`,
        summary: [
          { label: 'Sĩ số', value: activeClass.studentCount },
          { label: 'Độ chính xác trung bình', value: `${avg.toFixed(1)}%` },
        ],
        tables: [{
          heading: 'Chi tiết học viên',
          columns: ['Học viên', 'Accuracy', 'Buổi/tuần', 'Chủ đề yếu'],
          rows: students.map(s => [
            s.fullName,
            `${s.accuracyPercent.toFixed(1)}%`,
            s.practiceFrequencyDays,
            s.weakTopics?.join(', ') || 'Không có',
          ]),
        }],
      });
    } catch (err) {
      showToast(err.message || 'Lỗi xuất báo cáo.', 'error');
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const classesData = await teacherApi.getClasses() || [];
        setClasses(classesData);

        if (classesData.length > 0) {
          const firstClass = classesData[0];
          setActiveClass(firstClass);

          const trackingData = await progressApi.getClassProgress(firstClass.id);
          setStudents(trackingData || []);
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

  const handleOpenComments = async (student) => {
    setSelectedStudent(student);
    setLoadingComments(true);
    try {
      const data = await teacherApi.getComments(student.studentId);
      setComments(data || []);
    } catch (err) {
      showToast('Lỗi tải nhận xét: ' + err.message, 'error');
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    setIsSubmittingComment(true);
    try {
      await teacherApi.addComment({
        studentId: selectedStudent.studentId.toString(),
        content: newCommentText
      });
      setNewCommentText('');
      showToast('Thêm nhận xét thành công! 📝');
      const data = await teacherApi.getComments(selectedStudent.studentId);
      setComments(data || []);
    } catch (err) {
      showToast('Lỗi gửi nhận xét: ' + err.message, 'error');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleUpdateComment = async (e) => {
    e.preventDefault();
    if (!editingCommentText.trim()) return;
    setIsSubmittingComment(true);
    try {
      await teacherApi.updateComment(editingComment.id, editingCommentText);
      setEditingComment(null);
      setEditingCommentText('');
      showToast('Cập nhật nhận xét thành công! 🎉');
      const data = await teacherApi.getComments(selectedStudent.studentId);
      setComments(data || []);
    } catch (err) {
      showToast('Lỗi cập nhật: ' + err.message, 'error');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Bạn có chắc muốn xóa nhận xét này không?')) return;
    try {
      await teacherApi.deleteComment(commentId);
      showToast('Đã xóa nhận xét thành công! 🗑️');
      const data = await teacherApi.getComments(selectedStudent.studentId);
      setComments(data || []);
    } catch (err) {
      showToast('Lỗi xóa nhận xét: ' + err.message, 'error');
    }
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
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/teacher/assign')}>Giao bài mới</button>
            <button className="btn btn-outline btn-sm" onClick={handleExportPdf} disabled={exporting || students.length === 0}>
              {exporting ? <Loader2 size={16} className="spinning" /> : <><Download size={16} /> Xuất PDF</>}
            </button>
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
                <th style={{ width: '120px', textAlign: 'right', paddingRight: '16px' }}>Thao tác</th>
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
                  <td style={{ textAlign: 'right', paddingRight: '16px' }}>
                    <button className="btn btn-blue btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 10px', fontSize: '12px' }} onClick={() => handleOpenComments(s)}>
                      <MessageSquare size={13} /> Nhận xét
                    </button>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--gray-400)' }}>
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
        <button className="btn btn-blue btn-sm" onClick={handleExportPdf} disabled={exporting || students.length === 0}>
          {exporting ? <Loader2 size={16} className="spinning" /> : <><Download size={16} /> Export PDF</>}
        </button>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 10000,
          padding: '16px 24px', borderRadius: '12px', 
          background: toast.type === 'success' ? 'linear-gradient(135deg, #6ee7b7, #34d399)' : 'linear-gradient(135deg, #fca5a5, #f87171)',
          color: '#fff', fontWeight: 700, boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center', gap: '10px'
        }}>
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {toast.message}
        </div>
      )}

      {/* Student Details & Comments Modal */}
      {selectedStudent && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,18,37,0.5)', backdropFilter: 'blur(4px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '580px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 32px 64px rgba(0,0,0,0.2)', background: '#fff' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--gray-100)', paddingBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0 }}>Chi tiết học viên & Nhận xét</h3>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--gray-400)' }}>
                  Học viên: <strong>{selectedStudent.fullName}</strong> • Accuracy: {selectedStudent.accuracyPercent?.toFixed(1)}%
                </p>
              </div>
              <button onClick={() => setSelectedStudent(null)} style={{ background: 'var(--gray-50)', border: 'none', cursor: 'pointer', borderRadius: '50%', width: '32px', height: '32px' }}><X size={18} /></button>
            </div>

            {/* Content Body */}
            <div style={{ flex: 1, overflowY: 'auto', marginBottom: '20px', paddingRight: '8px' }}>
              <div style={{ marginBottom: '20px', padding: '16px', background: 'var(--gray-50)', borderRadius: '12px' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Chỉ số luyện tập</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                  <div>🔥 Chuỗi ngày: <strong>{selectedStudent.practiceFrequencyDays} buổi/tuần</strong></div>
                  <div>🎯 Chủ đề yếu: <strong style={{ color: 'var(--orange)' }}>{selectedStudent.weakTopics?.join(', ') || 'Không có'}</strong></div>
                </div>
              </div>

              <h4 style={{ marginBottom: '12px', fontSize: '15px' }}>Nhật ký nhận xét ({comments.length})</h4>
              
              {loadingComments ? (
                <div style={{ textAlign: 'center', padding: '20px' }}><Loader2 className="spinning" size={24} /></div>
              ) : comments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--gray-300)', fontSize: '14px' }}>
                  <MessageSquare size={32} style={{ opacity: 0.3, marginBottom: '8px' }} />
                  <p>Chưa có nhận xét nào cho học viên này.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {comments.map(c => (
                    <div key={c.id} style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--gray-100)', background: '#fff' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 800, fontSize: '13px', color: 'var(--primary)' }}>{c.teacherName || 'Giáo viên'}</span>
                        <span style={{ fontSize: '11px', color: 'var(--gray-300)' }}>
                          {c.createdAt ? new Date(c.createdAt).toLocaleString('vi-VN') : ''}
                        </span>
                      </div>
                      
                      {editingComment && editingComment.id === c.id ? (
                        <form onSubmit={handleUpdateComment} style={{ marginTop: '8px' }}>
                          <textarea className="form-input" style={{ width: '100%', minHeight: '60px', marginBottom: '8px', fontSize: '13px' }} required
                            value={editingCommentText} onChange={e => setEditingCommentText(e.target.value)} />
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button type="button" className="btn btn-white btn-xs" onClick={() => setEditingComment(null)}>Hủy</button>
                            <button type="submit" className="btn btn-primary btn-xs" disabled={isSubmittingComment}>Lưu</button>
                          </div>
                        </form>
                      ) : (
                        <>
                          <div style={{ fontSize: '14px', color: 'var(--text-dark)', lineHeight: '1.4', whiteSpace: 'pre-line' }}>{c.content}</div>
                          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px', borderTop: '1px solid #f9f9f9', paddingTop: '4px' }}>
                            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '2px' }} 
                              onClick={() => { setEditingComment(c); setEditingCommentText(c.content); }}>
                              <Edit size={12} /> Sửa
                            </button>
                            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)', opacity: 0.8, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '2px' }} 
                              onClick={() => handleDeleteComment(c.id)}>
                              <Trash2 size={12} /> Xóa
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add Comment Form */}
            <form onSubmit={handleAddComment} style={{ borderTop: '1px solid var(--gray-100)', paddingTop: '16px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input type="text" className="form-input" placeholder="Viết nhận xét, đánh giá tiến độ học tập..." required style={{ margin: 0, fontSize: '13px' }}
                  value={newCommentText} onChange={e => setNewCommentText(e.target.value)} />
                <button type="submit" className="btn btn-primary btn-sm" disabled={isSubmittingComment || !newCommentText.trim()}>
                  {isSubmittingComment ? <Loader2 className="spinning" size={14} /> : <Plus size={14} />} Gửi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default TeacherDashboard;

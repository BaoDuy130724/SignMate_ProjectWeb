import React, { useState, useEffect, useCallback } from 'react';
import { BookOpen, Plus, X, Loader2, CheckCircle2, UserPlus, GraduationCap, AlertCircle, UserCheck, Users, Layers, PlayCircle, Clock } from 'lucide-react';
import { centersApi, classesApi, coursesApi, teacherApi } from '../services/api';

const CenterClasses = () => {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showClassForm, setShowClassForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newClass, setNewClass] = useState({ name: '', teacherId: '' });
  const [addStudentModal, setAddStudentModal] = useState({ visible: false, classId: '', className: '' });
  const [assignLessonModal, setAssignLessonModal] = useState({ visible: false, classId: '', className: '' });
  const [toast, setToast] = useState(null);

  const centerId = localStorage.getItem('centerId');

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const loadData = useCallback(async () => {
    try {
      if (!centerId) throw new Error('Không tìm thấy thông tin trung tâm. Vui lòng đăng nhập lại.');
      const [classesData, teachersData] = await Promise.all([
        classesApi.getAll(centerId),
        centersApi.getTeachers(centerId),
      ]);
      setClasses(classesData || []);
      setTeachers(teachersData || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [centerId]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCreateClass = async (e) => {
    e.preventDefault();
    if (!newClass.teacherId) { showToast('Vui lòng chọn 1 giáo viên phụ trách!', 'error'); return; }
    setIsSubmitting(true);
    try {
      await classesApi.create(centerId, newClass);
      setNewClass({ name: '', teacherId: '' });
      setShowClassForm(false);
      showToast('Tạo lớp học thành công! 🎉');
      await loadData();
    } catch (err) {
      showToast('Lỗi tạo lớp học: ' + err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}><Loader2 className="spinning" /></div>;

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

      {addStudentModal.visible && (
        <AddStudentsModal 
          centerId={centerId} 
          classId={addStudentModal.classId} 
          className={addStudentModal.className}
          onClose={() => setAddStudentModal({ visible: false, classId: '', className: '' })}
          onSuccess={loadData}
          showToast={showToast}
        />
      )}

      {assignLessonModal.visible && (
        <AssignLessonModal 
          centerId={centerId}
          classId={assignLessonModal.classId}
          className={assignLessonModal.className}
          onClose={() => setAssignLessonModal({ visible: false, classId: '', className: '' })}
          showToast={showToast}
        />
      )}

      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Quản lý Lớp học</h1>
          <p className="page-subtitle">Tạo lớp, thêm giáo viên và quản lý danh sách học viên</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowClassForm(!showClassForm)}>
          {showClassForm ? <><X size={18} /> Hủy</> : <><Plus size={18} /> Tạo lớp mới</>}
        </button>
      </div>

      {showClassForm && (
        <div className="card" style={{ marginBottom: '24px', background: 'var(--gray-50)', border: '1.5px solid var(--primary-light)' }}>
          <h3 style={{ marginBottom: '20px' }}>Thông tin lớp học mới</h3>
          <form onSubmit={handleCreateClass} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label">Tên lớp học</label>
              <input type="text" className="form-input" placeholder="VD: Ký hiệu Vỡ lòng A1" required
                value={newClass.name} onChange={e => setNewClass({...newClass, name: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Giáo viên phụ trách</label>
              <select className="form-input" required value={newClass.teacherId}
                onChange={e => setNewClass({...newClass, teacherId: e.target.value})}>
                <option value="">-- Chọn Giáo Viên --</option>
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>{t.fullName} ({t.email})</option>
                ))}
              </select>
            </div>
            <div style={{ gridColumn: 'span 2', display: 'flex', gap: '12px', marginTop: '10px' }}>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="spinning" size={16} /> : <CheckCircle2 size={16} />}
                {isSubmitting ? ' Đang xử lý...' : ' Xác nhận tạo Lớp'}
              </button>
              <button type="button" className="btn btn-white" onClick={() => setShowClassForm(false)}>Hủy</button>
            </div>
          </form>
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', background: 'var(--gray-50)', borderBottom: '2px solid var(--gray-100)' }}>
              <th style={{ padding: '16px 24px' }}>Lớp học</th>
              <th style={{ padding: '16px' }}>Giáo viên</th>
              <th style={{ padding: '16px' }}>Sĩ số</th>
              <th style={{ padding: '16px' }}>Ngày tạo</th>
              <th style={{ padding: '16px 24px', textAlign: 'right' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {classes.map(c => (
              <tr key={c.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                <td style={{ padding: '20px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ 
                      width: '42px', height: '42px', background: 'linear-gradient(135deg, var(--primary-light), #e7c0ff44)', 
                      borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' 
                    }}>
                      <BookOpen size={20} />
                    </div>
                    <span style={{ fontWeight: 800, fontSize: '15px' }}>{c.name}</span>
                  </div>
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800 }}>
                      {(c.teacherName || '?')[0].toUpperCase()}
                    </div>
                    {c.teacherName || <span style={{ color: 'var(--gray-300)', fontStyle: 'italic' }}>Chưa phân công</span>}
                  </div>
                </td>
                <td style={{ padding: '16px' }}><span className="badge badge-blue" style={{ fontWeight: 700 }}>{c.studentCount} học viên</span></td>
                <td style={{ padding: '16px', color: 'var(--gray-400)', fontSize: '14px' }}>
                  {c.createdAt ? new Date(c.createdAt).toLocaleDateString('vi-VN') : '—'}
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button className="btn btn-purple btn-sm" onClick={() => setAssignLessonModal({ visible: true, classId: c.id, className: c.name })}>
                      <BookOpen size={14} /> Giao bài
                    </button>
                    <button className="btn btn-blue btn-sm" onClick={() => setAddStudentModal({ visible: true, classId: c.id, className: c.name })}>
                      <UserPlus size={14} /> Thêm HV
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {classes.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '80px 24px', color: 'var(--gray-300)' }}>
                  <BookOpen size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                  <div style={{ fontWeight: 700, fontSize: '18px' }}>Chưa có lớp học nào</div>
                  <div style={{ fontSize: '14px' }}>Nhấn nút "Tạo lớp mới" ở phía trên để bắt đầu</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

// Modal implementation with proper styles
const AddStudentsModal = ({ centerId, classId, className, onClose, onSuccess, showToast }) => {
  const [allStudents, setAllStudents] = useState([]);
  const [classStudents, setClassStudents] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [all, existing] = await Promise.all([
          centersApi.getStudents(centerId),
          classesApi.getStudents(centerId, classId),
        ]);
        setAllStudents(all || []);
        setClassStudents(existing || []);
      } catch (err) {
        showToast('Lỗi tải học viên: ' + err.message, 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [centerId, classId, showToast]);

  const handleAdd = async () => {
    if (selectedIds.length === 0) return;
    setSubmitting(true);
    try {
      await classesApi.addStudents(centerId, classId, selectedIds);
      showToast('Đã thêm học viên vào lớp thành công! 🎉');
      onSuccess();
      onClose();
    } catch (err) {
      showToast('Lỗi: ' + err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const existingIds = new Set(classStudents.map(s => s.studentId));
  const availableStudents = allStudents.filter(s => !existingIds.has(s.id));

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,18,37,0.5)', backdropFilter: 'blur(4px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="card" style={{ width: '100%', maxWidth: '520px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 32px 64px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h3 style={{ margin: 0 }}>Thêm Học viên</h3>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--gray-400)' }}>Lớp: <strong>{className}</strong></p>
          </div>
          <button onClick={onClose} style={{ background: 'var(--gray-50)', border: 'none', cursor: 'pointer', borderRadius: '50%', width: '32px', height: '32px' }}><X size={18} /></button>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto', marginBottom: '24px', paddingRight: '8px' }}>
          {loading ? <div style={{ textAlign: 'center', padding: '40px' }}><Loader2 className="spinning" /></div> : (
            availableStudents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-300)' }}>
                <Users size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
                <p>Không có học viên khả dụng để thêm.</p>
              </div>
            ) :
            availableStudents.map(s => {
              const checked = selectedIds.includes(s.id);
              return (
                <div 
                  key={s.id} 
                  onClick={() => setSelectedIds(prev => checked ? prev.filter(x => x !== s.id) : [...prev, s.id])}
                  style={{ 
                    display: 'flex', alignItems: 'center', gap: '14px', padding: '14px', borderRadius: '12px', cursor: 'pointer',
                    border: checked ? '2px solid var(--primary)' : '2px solid var(--gray-100)',
                    background: checked ? 'var(--primary-light)' : '#fff',
                    marginBottom: '8px', transition: 'all 0.2s'
                  }}
                >
                  <div style={{ width: '20px', height: '20px', borderRadius: '6px', border: '2px solid var(--gray-200)', background: checked ? 'var(--primary)' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {checked && <CheckCircle2 size={12} color="#fff" />}
                  </div>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--blue)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                    {(s.fullName || '?')[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '15px' }}>{s.fullName}</div>
                    <div style={{ fontSize: '12px', color: 'var(--gray-400)' }}>{s.email}</div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid var(--gray-100)' }}>
          <button className="btn btn-white btn-sm" onClick={onClose}>Hủy</button>
          <button className="btn btn-primary btn-sm" onClick={handleAdd} disabled={submitting || selectedIds.length === 0}>
            {submitting ? <Loader2 className="spinning" size={16} /> : <UserPlus size={16} />}
            {submitting ? ' Đang lưu...' : ` Thêm ${selectedIds.length} học viên`}
          </button>
        </div>
      </div>
    </div>
  );
};

const AssignLessonModal = ({ centerId, classId, className, onClose, showToast }) => {
  const [courses, setCourses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedLesson, setSelectedLesson] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await coursesApi.getAll(undefined, undefined, true);
        setCourses(data || []);
      } catch (err) {
        showToast('Lỗi tải khóa học', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [showToast]);

  const handleCourseChange = async (courseId) => {
    setSelectedCourse(courseId);
    setSelectedLesson('');
    if (!courseId) { setLessons([]); return; }
    try {
      const data = await coursesApi.getLessons(courseId);
      setLessons(data || []);
    } catch (err) {
      showToast('Lỗi tải bài học', 'error');
    }
  };

  const handleAssign = async () => {
    if (!selectedLesson) return;
    setSubmitting(true);
    try {
      await teacherApi.assignLesson(centerId, classId, selectedLesson);
      showToast('Đã giao bài tập thành công! 📝');
      onClose();
    } catch (err) {
      showToast('Lỗi: ' + err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,18,37,0.5)', backdropFilter: 'blur(4px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="card" style={{ width: '100%', maxWidth: '480px', boxShadow: '0 32px 64px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h3 style={{ margin: 0 }}>Giao Bài Tập</h3>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--gray-400)' }}>Lớp: <strong>{className}</strong></p>
          </div>
          <button onClick={onClose} className="btn-white" style={{ borderRadius: '50%', width: '32px', height: '32px', padding: 0 }}><X size={18} /></button>
        </div>

        {loading ? <div style={{ textAlign: 'center', padding: '40px' }}><Loader2 className="spinning" /></div> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={16} /> Chọn Khóa học
              </label>
              <select className="form-input" value={selectedCourse} onChange={e => handleCourseChange(e.target.value)}>
                <option value="">-- Chọn Khóa học --</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PlayCircle size={16} /> Chọn Bài học cụ thể
              </label>
              <select className="form-input" value={selectedLesson} onChange={e => setSelectedLesson(e.target.value)} disabled={!selectedCourse}>
                <option value="">-- Chọn bài học --</option>
                {lessons.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button className="btn btn-white" onClick={onClose}>Hủy</button>
              <button className="btn btn-primary" onClick={handleAssign} disabled={!selectedLesson || submitting}>
                {submitting ? <Loader2 className="spinning" size={16} /> : <CheckCircle2 size={16} />}
                {submitting ? ' Đang lưu...' : ' Xác nhận giao bài'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CenterClasses;


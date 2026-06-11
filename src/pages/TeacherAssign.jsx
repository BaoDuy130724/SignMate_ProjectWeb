import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ClipboardList, ArrowLeft, Loader2, CheckCircle2, AlertCircle, Calendar, BookOpen, GraduationCap } from 'lucide-react';
import { teacherApi, coursesApi } from '../services/api';

const TeacherAssign = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [lessons, setLessons] = useState([]);
  
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedLessonId, setSelectedLessonId] = useState('');
  const [dueDate, setDueDate] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        // Fetch classes taught by teacher and all courses
        const [classesData, coursesData] = await Promise.all([
          teacherApi.getClasses().catch(() => []),
          coursesApi.getAll().catch(() => [])
        ]);

        setClasses(classesData);
        setCourses(coursesData);

        if (classesData.length > 0) {
          setSelectedClassId(classesData[0].id.toString());
        }
        if (coursesData.length > 0) {
          setSelectedCourseId(coursesData[0].id.toString());
          loadLessons(coursesData[0].id);
        }
      } catch (err) {
        setError('Không thể lấy thông tin ban đầu: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, []);

  const loadLessons = async (courseId) => {
    try {
      const lessonsData = await coursesApi.getLessons(courseId) || [];
      setLessons(lessonsData);
      if (lessonsData.length > 0) {
        setSelectedLessonId(lessonsData[0].id.toString());
      } else {
        setSelectedLessonId('');
      }
    } catch (err) {
      console.error('Lỗi tải bài học', err);
    }
  };

  const handleCourseChange = (courseId) => {
    setSelectedCourseId(courseId);
    loadLessons(courseId);
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedClassId || !selectedLessonId) {
      setError('Vui lòng chọn đầy đủ Lớp học và Bài học.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    const centerId = localStorage.getItem('centerId');

    try {
      if (!centerId) {
        throw new Error('Không tìm thấy Center ID trong thông tin đăng nhập. Vui lòng đăng nhập lại.');
      }
      
      // Call API to assign lesson
      // Note: backend may take dueDate in request (the DB seeder has AssignedAt/DueDate, 
      // but the assign endpoint in api.js is teacherApi.assignLesson(centerId, classId, lessonId)).
      // Let's call the API client method.
      await teacherApi.assignLesson(centerId, selectedClassId, selectedLessonId);
      
      setSuccess('Giao bài học cho lớp thành công! 🎉');
      setTimeout(() => {
        navigate('/teacher');
      }, 2000);
    } catch (err) {
      setError('Lỗi khi giao bài: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '120px' }}>
      <Loader2 className="spinning" size={32} color="var(--primary)" />
    </div>
  );

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '0 20px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link to="/teacher" style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          color: 'var(--gray-400)', fontWeight: 700, fontSize: '14px',
          textDecoration: 'none'
        }}>
          <ArrowLeft size={16} /> Về Dashboard
        </Link>
      </div>

      <div className="page-header" style={{ marginBottom: '32px' }}>
        <h1 className="page-title" style={{ fontSize: '28px', fontWeight: 900, marginBottom: '8px' }}>Giao Bài học</h1>
        <p className="page-subtitle" style={{ fontSize: '15px', color: 'var(--gray-500)' }}>Giao bài theo từng chủ đề hoặc bài học cho lớp học của bạn</p>
      </div>

      <div className="card" style={{ padding: '32px' }}>
        {error && (
          <div style={{
            background: '#ffebee', border: '2px solid var(--red)', borderRadius: 'var(--radius-md)',
            padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px',
            fontSize: '14px', color: 'var(--red-dark)', fontWeight: 600
          }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {success && (
          <div style={{
            background: '#e8f5e9', border: '2px solid var(--green)', borderRadius: 'var(--radius-md)',
            padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px',
            fontSize: '14px', color: 'var(--green-dark)', fontWeight: 600
          }}>
            <CheckCircle2 size={18} style={{ color: 'var(--green)' }} /> {success}
          </div>
        )}

        <form onSubmit={handleAssign}>
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <GraduationCap size={16} /> Lớp học nhận bài
            </label>
            <select
              className="form-input"
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              required
            >
              <option value="" disabled>-- Chọn Lớp học --</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.studentCount} học viên)</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BookOpen size={16} /> Khóa học chứa bài
            </label>
            <select
              className="form-input"
              value={selectedCourseId}
              onChange={(e) => handleCourseChange(e.target.value)}
              required
            >
              <option value="" disabled>-- Chọn Khóa học --</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ClipboardList size={16} /> Bài học cụ thể
            </label>
            <select
              className="form-input"
              value={selectedLessonId}
              onChange={(e) => setSelectedLessonId(e.target.value)}
              required
              disabled={lessons.length === 0}
            >
              {lessons.length === 0 ? (
                <option value="">-- Khóa học này chưa có bài nào --</option>
              ) : (
                <>
                  <option value="" disabled>-- Chọn Bài học --</option>
                  {lessons.map(l => (
                    <option key={l.id} value={l.id}>{l.title} ({l.topic || 'Chung'})</option>
                  ))}
                </>
              )}
            </select>
          </div>

          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '32px' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={16} /> Hạn hoàn thành (DueDate - Tuỳ chọn)
            </label>
            <input
              type="date"
              className="form-input"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={submitting || !selectedClassId || !selectedLessonId}
          >
            {submitting ? (
              <><Loader2 className="spinning" size={18} /> Đang giao bài...</>
            ) : (
              <>Giao bài học</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TeacherAssign;

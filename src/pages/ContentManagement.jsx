import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Edit2, Trash2, Eye, ChevronDown, ChevronRight, Video, List, FileText, Loader2, Save, X, Search, Filter } from 'lucide-react';
import { coursesApi, lessonsApi } from '../services/api';

const ContentManagement = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [courseLessons, setCourseLessons] = useState({});
  const [loadingLessons, setLoadingLessons] = useState({});
  
  // Modals / Forms
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [editCourse, setEditCourse] = useState(null);
  const [editLesson, setEditLesson] = useState(null);
  const [targetCourseId, setTargetCourseId] = useState(null);

  const [courseForm, setCourseForm] = useState({ title: '', description: '', level: 'Beginner', thumbnailUrl: '' });
  const [lessonForm, setLessonForm] = useState({ title: '', description: '', videoUrl: '', durationSeconds: 0, orderIndex: 0 });

  const fetchCourses = async () => {
    try {
      const data = await coursesApi.getAll(undefined, undefined, true);
      setCourses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const toggleCourse = async (courseId) => {
    if (expandedCourse === courseId) {
      setExpandedCourse(null);
      return;
    }
    setExpandedCourse(courseId);
    if (!courseLessons[courseId]) {
      setLoadingLessons(prev => ({ ...prev, [courseId]: true }));
      try {
        const lessons = await coursesApi.getLessons(courseId);
        setCourseLessons(prev => ({ ...prev, [courseId]: lessons }));
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingLessons(prev => ({ ...prev, [courseId]: false }));
      }
    }
  };

  const handleSaveCourse = async (e) => {
    e.preventDefault();
    try {
      if (editCourse) {
        await coursesApi.update(editCourse.id, courseForm);
      } else {
        await coursesApi.create(courseForm);
      }
      setShowCourseModal(false);
      fetchCourses();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSaveLesson = async (e) => {
    e.preventDefault();
    try {
      if (editLesson) {
        await lessonsApi.update(editLesson.id, lessonForm);
      } else {
        await lessonsApi.create(targetCourseId, lessonForm);
      }
      setShowLessonModal(false);
      // Refresh lessons for this course
      const updatedLessons = await coursesApi.getLessons(targetCourseId);
      setCourseLessons(prev => ({ ...prev, [targetCourseId]: updatedLessons }));
      fetchCourses(); // Update lesson count in course row
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteCourse = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa khóa học này và toàn bộ bài học bên trong?')) {
      await coursesApi.delete(id);
      fetchCourses();
    }
  };

  const handleDeleteLesson = async (lessonId, courseId) => {
    if (window.confirm('Xóa bài học này?')) {
      await lessonsApi.delete(lessonId);
      const updatedLessons = await coursesApi.getLessons(courseId);
      setCourseLessons(prev => ({ ...prev, [courseId]: updatedLessons }));
      fetchCourses();
    }
  };

  if (loading) return <div style={{ padding: '100px', textAlign: 'center' }}><Loader2 className="spinning" /></div>;

  return (
    <>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Quản lý Nội dung Đào tạo</h1>
          <p className="page-subtitle">Thiết kế lộ trình học, bài giảng và tài liệu học liệu</p>
        </div>
        <button className="btn btn-primary" onClick={() => {
          setEditCourse(null);
          setCourseForm({ title: '', description: '', level: 'Beginner', thumbnailUrl: '' });
          setShowCourseModal(true);
        }}>
          <Plus size={18} /> Tạo Khóa học mới
        </button>
      </div>

      <div className="table-wrapper">
        <div className="table-header">
          <div className="table-title">Cấu trúc Khóa học</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-white btn-sm"><Filter size={14} /> Lọc theo Level</button>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style={{ width: '40px' }}></th>
              <th>Khóa học</th>
              <th>Cấp độ</th>
              <th>Số bài học</th>
              <th>Trạng thái</th>
              <th style={{ textAlign: 'right' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {courses.map(course => (
              <React.Fragment key={course.id}>
                <tr className={expandedCourse === course.id ? 'expanded' : ''}>
                  <td>
                    <button className="btn-icon" onClick={() => toggleCourse(course.id)}>
                      {expandedCourse === course.id ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '48px', height: '32px', borderRadius: '4px', background: 'var(--gray-100)', backgroundImage: `url(${course.thumbnailUrl})`, backgroundSize: 'cover' }}></div>
                      <div style={{ fontWeight: 800 }}>{course.title}</div>
                    </div>
                  </td>
                  <td><span className="badge badge-blue">{course.level}</span></td>
                  <td>{course.lessonCount} Bài học</td>
                  <td>
                    {course.isPublished ? <span className="badge badge-green">Public</span> : <span className="badge badge-gray">Draft</span>}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button className="btn btn-white btn-sm" onClick={() => {
                        setEditCourse(course);
                        setCourseForm({ title: course.title, description: course.description, level: course.level, thumbnailUrl: course.thumbnailUrl });
                        setShowCourseModal(true);
                      }}><Edit2 size={14} /></button>
                      <button className="btn btn-white btn-sm" onClick={() => {
                        setTargetCourseId(course.id);
                        setEditLesson(null);
                        setLessonForm({ title: '', description: '', videoUrl: '', durationSeconds: 0, orderIndex: (courseLessons[course.id]?.length || 0) + 1 });
                        setShowLessonModal(true);
                      }}><Plus size={14} /> Bài học</button>
                      <button className="btn btn-white btn-sm" style={{ color: 'var(--red)' }} onClick={() => handleDeleteCourse(course.id)}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
                {expandedCourse === course.id && (
                  <tr>
                    <td colSpan="6" style={{ background: 'var(--gray-50)', padding: '0' }}>
                      <div style={{ padding: '16px 40px 16px 60px' }}>
                        {loadingLessons[course.id] ? (
                          <div style={{ padding: '20px', textAlign: 'center' }}><Loader2 size={24} className="spinning" /></div>
                        ) : (
                          <div style={{ display: 'grid', gap: '8px' }}>
                            {courseLessons[course.id]?.map((lesson, idx) => (
                              <div key={lesson.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--gray-100)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                  <div style={{ color: 'var(--gray-300)', fontWeight: 800 }}>{idx + 1}</div>
                                  <div>
                                    <div style={{ fontWeight: 700, fontSize: '14px' }}>{lesson.title}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--gray-400)', display: 'flex', gap: '12px' }}>
                                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Video size={10} /> {Math.floor(lesson.durationSeconds / 60)} phút</span>
                                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><List size={10} /> {lesson.signCount} cử điệu</span>
                                    </div>
                                  </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <button className="btn btn-white btn-sm" onClick={() => {
                                    setTargetCourseId(course.id);
                                    setEditLesson(lesson);
                                    setLessonForm({ title: lesson.title, description: lesson.description || '', videoUrl: lesson.videoUrl || '', durationSeconds: lesson.durationSeconds, orderIndex: lesson.orderIndex });
                                    setShowLessonModal(true);
                                  }}><Edit2 size={12} /></button>
                                  <button className="btn btn-white btn-sm" style={{ color: 'var(--red)' }} onClick={() => handleDeleteLesson(lesson.id, course.id)}><Trash2 size={12} /></button>
                                </div>
                              </div>
                            ))}
                            {(!courseLessons[course.id] || courseLessons[course.id].length === 0) && (
                              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--gray-300)', fontStyle: 'italic' }}>Chưa có bài học nào trong khóa này.</div>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Course Modal */}
      {showCourseModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '500px', animation: 'slideIn 0.3s ease' }}>
            <h2 style={{ marginBottom: '20px' }}>{editCourse ? 'Cập nhật Khóa học' : 'Tạo Khóa học mới'}</h2>
            <form onSubmit={handleSaveCourse}>
              <div className="form-group">
                <label className="form-label">Tiêu đề</label>
                <input type="text" className="form-input" required value={courseForm.title} onChange={e => setCourseForm({...courseForm, title: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Mô tả</label>
                <textarea className="form-input" style={{ height: '80px' }} value={courseForm.description} onChange={e => setCourseForm({...courseForm, description: e.target.value})} />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Cấp độ</label>
                  <select className="form-input" value={courseForm.level} onChange={e => setCourseForm({...courseForm, level: e.target.value})}>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">URL Ảnh nền</label>
                  <input type="text" className="form-input" value={courseForm.thumbnailUrl} onChange={e => setCourseForm({...courseForm, thumbnailUrl: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Lưu thay đổi</button>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowCourseModal(false)}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lesson Modal */}
      {showLessonModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '500px', animation: 'slideIn 0.3s ease' }}>
            <h2 style={{ marginBottom: '20px' }}>{editLesson ? 'Cửa bài học' : 'Thêm Bài học mới'}</h2>
            <form onSubmit={handleSaveLesson}>
              <div className="form-group">
                <label className="form-label">Tiêu đề bài học</label>
                <input type="text" className="form-input" required value={lessonForm.title} onChange={e => setLessonForm({...lessonForm, title: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">URL Video bài giảng</label>
                <input type="text" className="form-input" value={lessonForm.videoUrl} onChange={e => setLessonForm({...lessonForm, videoUrl: e.target.value})} />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Thời lượng (giây)</label>
                  <input type="number" className="form-input" value={lessonForm.durationSeconds} onChange={e => setLessonForm({...lessonForm, durationSeconds: parseInt(e.target.value)})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Thứ tự hiển thị</label>
                  <input type="number" className="form-input" value={lessonForm.orderIndex} onChange={e => setLessonForm({...lessonForm, orderIndex: parseInt(e.target.value)})} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Xác nhận</button>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowLessonModal(false)}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        tr.expanded { background: var(--gray-50); }
        .btn-icon { background: none; border: none; cursor: pointer; color: var(--gray-400); padding: 4px; border-radius: 4px; }
        .btn-icon:hover { background: var(--gray-100); color: var(--primary); }
        @keyframes slideIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </>
  );
};

export default ContentManagement;

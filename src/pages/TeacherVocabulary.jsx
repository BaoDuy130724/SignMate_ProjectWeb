import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Video, CheckCircle2, AlertTriangle, Upload, Search, BookOpen, ClipboardList } from 'lucide-react';
import { coursesApi, lessonsApi, vocabularyApi } from '../services/api';

const TeacherVocabulary = () => {
  const [courses, setCourses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedLessonId, setSelectedLessonId] = useState('');
  const [selectedLesson, setSelectedLesson] = useState(null);

  const [loading, setLoading] = useState(true);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [loadingSigns, setLoadingSigns] = useState(false);
  const [uploadingSignId, setUploadingSignId] = useState(null);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const data = await coursesApi.getAll() || [];
        setCourses(data);
      } catch (err) {
        setError('Không thể lấy danh sách khóa học: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleCourseChange = async (courseId) => {
    setSelectedCourseId(courseId);
    setSelectedLessonId('');
    setSelectedLesson(null);
    setLessons([]);
    
    if (!courseId) return;

    try {
      setLoadingLessons(true);
      const data = await coursesApi.getLessons(courseId) || [];
      setLessons(data);
    } catch (err) {
      setError('Lỗi tải danh sách bài học: ' + err.message);
    } finally {
      setLoadingLessons(false);
    }
  };

  const handleLessonChange = async (lessonId) => {
    setSelectedLessonId(lessonId);
    setSelectedLesson(null);
    if (!lessonId) return;

    try {
      setLoadingSigns(true);
      const data = await lessonsApi.getById(lessonId);
      setSelectedLesson(data);
    } catch (err) {
      setError('Lỗi tải từ vựng: ' + err.message);
    } finally {
      setLoadingSigns(false);
    }
  };

  const handleUploadVideo = async (signId, signWord, e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingSignId(signId);
    setError('');
    setSuccess('');

    try {
      await vocabularyApi.uploadReference(signId, file);
      setSuccess(`Bơm video thành công cho từ "${signWord}". Hệ thống đang xử lý tách keypoints! 🤖`);
      
      // Reload current lesson to update status
      if (selectedLessonId) {
        const data = await lessonsApi.getById(selectedLessonId);
        setSelectedLesson(data);
      }
      
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(`Lỗi tải lên cho từ "${signWord}": ${err.message}`);
    } finally {
      setUploadingSignId(null);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '120px' }}>
      <Loader2 className="spinning" size={32} color="var(--primary)" />
    </div>
  );

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px' }}>
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
        <h1 className="page-title">Kho Dữ Liệu AI</h1>
        <p className="page-subtitle">Quản lý từ vựng và nạp video mẫu cho mô hình nhận diện AI</p>
      </div>

      {error && (
        <div style={{
          background: '#ffebee', border: '2px solid var(--red)', borderRadius: 'var(--radius-md)',
          padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px',
          fontSize: '14px', color: 'var(--red-dark)', fontWeight: 600
        }}>
          <AlertTriangle size={18} /> {error}
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

      {/* Filter Section */}
      <div className="card" style={{ padding: '24px', marginBottom: '32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BookOpen size={14} /> Khóa học
            </label>
            <select
              className="form-input"
              value={selectedCourseId}
              onChange={(e) => handleCourseChange(e.target.value)}
              style={{ margin: 0 }}
            >
              <option value="">-- Chọn Khóa học --</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ClipboardList size={14} /> Bài học
            </label>
            <select
              className="form-input"
              value={selectedLessonId}
              onChange={(e) => handleLessonChange(e.target.value)}
              disabled={!selectedCourseId || loadingLessons}
              style={{ margin: 0 }}
            >
              <option value="">
                {loadingLessons ? 'Đang tải bài học...' : '-- Chọn Bài học --'}
              </option>
              {lessons.map(l => (
                <option key={l.id} value={l.id}>{l.title}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Signs List */}
      <div className="card" style={{ padding: '24px' }}>
        {loadingSigns ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <Loader2 className="spinning" size={24} color="var(--primary)" />
          </div>
        ) : !selectedLesson ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--gray-300)' }}>
            Vui lòng chọn Khóa học và Bài học để xem danh sách từ vựng.
          </div>
        ) : selectedLesson.signs && selectedLesson.signs.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {selectedLesson.signs.map(sign => {
              const hasReference = sign.referenceKeypointData && sign.referenceKeypointData.length > 0;
              return (
                <div key={sign.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: '12px', background: 'var(--gray-50)', border: '1px solid var(--gray-100)' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', margin: '0 0 8px 0', fontWeight: 800 }}>{sign.word}</h3>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: 700,
                      background: hasReference ? '#e8f5e9' : '#ffebee',
                      color: hasReference ? 'var(--green)' : 'var(--red-dark)'
                    }}>
                      {hasReference ? 'Đã có dữ liệu mẫu AI' : 'Thiếu dữ liệu mẫu AI'}
                    </span>
                  </div>
                  <div>
                    <label style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: uploadingSignId === sign.id ? 'default' : 'pointer',
                      background: 'var(--primary)',
                      color: 'white',
                      padding: '10px 20px',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: 700,
                      transition: 'var(--transition)'
                    }}>
                      {uploadingSignId === sign.id ? (
                        <Loader2 className="spinning" size={16} />
                      ) : (
                        <Upload size={16} />
                      )}
                      <span>{uploadingSignId === sign.id ? 'Đang bơm...' : 'Bơm Video'}</span>
                      <input
                        type="file"
                        accept="video/*"
                        style={{ display: 'none' }}
                        disabled={uploadingSignId === sign.id}
                        onChange={(e) => handleUploadVideo(sign.id, sign.word, e)}
                      />
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--gray-300)' }}>
            Bài học này chưa có từ vựng nào.
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherVocabulary;

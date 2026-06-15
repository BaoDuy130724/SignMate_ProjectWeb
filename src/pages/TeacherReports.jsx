import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Loader2, Users, Target, BookOpen, Download, AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react';
import { teacherApi, trackingApi } from '../services/api';
import { exportReportPdf } from '../utils/exportPdf';

const TeacherReports = () => {
  const [classes, setClasses] = useState([]);
  const [activeClass, setActiveClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);
  const [success, setSuccess] = useState('');

  const loadClasses = useCallback(async () => {
    try {
      setLoading(true);
      const classesData = await teacherApi.getClasses() || [];
      setClasses(classesData);
      
      if (classesData.length > 0) {
        setActiveClass(classesData[0]);
        await loadClassStats(classesData[0].id);
      }
    } catch (err) {
      setError(err.message || 'Lỗi tải danh sách lớp.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadClassStats = async (classId) => {
    try {
      setLoading(true);
      const data = await trackingApi.getClassStudents(classId) || [];
      setStudents(data);
    } catch (err) {
      setError(err.message || 'Lỗi tải thống kê lớp.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  const handleClassChange = async (classId) => {
    const cls = classes.find(c => c.id.toString() === classId.toString());
    if (!cls) return;
    setActiveClass(cls);
    await loadClassStats(cls.id);
  };

  const handleExport = async () => {
    setExporting(true);
    setSuccess('');
    try {
      await exportReportPdf({
        title: `Báo cáo lớp ${activeClass.name}`,
        subtitle: 'Kết quả rèn luyện chi tiết của học viên',
        fileName: `bao-cao-${activeClass.name}.pdf`,
        summary: [
          { label: 'Học viên trong lớp', value: activeClass.studentCount },
          { label: 'Độ chính xác trung bình', value: `${avgAccuracy}%` },
          { label: 'Số chuyên đề còn yếu', value: weakTopicsSorted.length },
        ],
        tables: [
          {
            heading: 'Hiệu năng học viên',
            columns: ['Học viên', 'Độ chính xác', 'Buổi/tuần'],
            rows: students.map(s => [s.fullName, `${s.accuracyPercent.toFixed(1)}%`, s.practiceFrequencyDays]),
          },
          ...(weakTopicsSorted.length > 0 ? [{
            heading: 'Chuyên đề yếu của lớp',
            columns: ['Chuyên đề'],
            rows: weakTopicsSorted.map(t => [t]),
          }] : []),
        ],
      });
      setSuccess('Xuất báo cáo PDF lớp ' + activeClass.name + ' thành công! 📄');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Lỗi xuất báo cáo PDF.');
    } finally {
      setExporting(false);
    }
  };

  if (loading && !activeClass) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '120px' }}>
        <Loader2 className="spinning" size={32} color="var(--primary)" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{ color: 'var(--red)', borderColor: 'var(--red)', margin: '20px' }}>
        <AlertCircle size={20} /> {error}
      </div>
    );
  }

  if (!activeClass) {
    return <div className="card" style={{ margin: '20px' }}>Trống! Bạn chưa phụ trách lớp học nào.</div>;
  }

  const avgAccuracy = students.length 
    ? Math.round(students.reduce((acc, s) => acc + s.accuracyPercent, 0) / students.length)
    : 0;

  // Aggregate weak topics across the class
  const allWeakTopics = students.reduce((acc, s) => {
    if (s.weakTopics) {
      s.weakTopics.forEach(t => {
        acc[t] = (acc[t] || 0) + 1;
      });
    }
    return acc;
  }, {});

  const weakTopicsSorted = Object.entries(allWeakTopics)
    .sort((a, b) => b[1] - a[1])
    .map(entry => entry[0]);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 className="page-title">Báo cáo Học tập</h1>
          <p className="page-subtitle">Thống kê năng lực, chuyên đề yếu và kết quả học viên theo lớp</p>
        </div>
        <select 
          className="form-input" 
          style={{ width: 'auto', background: 'white', fontWeight: 700, margin: 0 }} 
          value={activeClass.id}
          onChange={(e) => handleClassChange(e.target.value)}
        >
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {success && (
        <div style={{
          background: '#e8f5e9', border: '2px solid var(--green)', borderRadius: 'var(--radius-md)',
          padding: '12px 16px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px',
          fontSize: '14px', color: 'var(--green-dark)', fontWeight: 600
        }}>
          <CheckCircle2 size={18} style={{ color: 'var(--green)' }} /> {success}
        </div>
      )}

      <div className="stat-grid" style={{ marginBottom: '32px' }}>
        <div className="stat-card">
          <div className="stat-icon card-icon-blue" style={{ marginBottom: 0 }}><Users size={24} /></div>
          <div>
            <div className="stat-value">{activeClass.studentCount}</div>
            <div className="stat-label">Học viên trong lớp</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon card-icon-green" style={{ marginBottom: 0 }}><Target size={24} /></div>
          <div>
            <div className="stat-value">{avgAccuracy}%</div>
            <div className="stat-label">Độ chính xác TB</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon card-icon-yellow" style={{ marginBottom: 0 }}><BookOpen size={24} /></div>
          <div>
            <div className="stat-value">{weakTopicsSorted.length || '--'}</div>
            <div className="stat-label">Chuyên đề còn yếu</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px', marginBottom: '32px' }}>
        {/* Student performance list */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px' }}>Hiệu năng chi tiết</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {students.length > 0 ? (
              students.map(s => (
                <div key={s.studentId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: '12px', background: 'var(--gray-50)', border: '1px solid var(--gray-100)' }}>
                  <div>
                    <div style={{ fontWeight: 800, color: 'var(--text-dark)' }}>{s.fullName}</div>
                    <div style={{ fontSize: '12px', color: 'var(--gray-400)', marginTop: '4px' }}>
                      Chuỗi luyện tập: {s.practiceFrequencyDays} buổi/tuần
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '11px', color: 'var(--gray-400)', fontWeight: 700 }}>ACCURACY</div>
                      <div style={{ fontSize: '16px', fontWeight: 900, color: s.accuracyPercent >= 70 ? 'var(--primary)' : 'var(--orange)' }}>
                        {s.accuracyPercent.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-300)' }}>
                Chưa có dữ liệu học viên của lớp này.
              </div>
            )}
          </div>
        </div>

        {/* Right side: weak topics list & export banner */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '16px' }}>Chuyên đề yếu của lớp</h3>
            <p style={{ color: 'var(--gray-400)', fontSize: '13px', marginBottom: '20px' }}>Các chủ đề có độ chính xác trung bình dưới 70%</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {weakTopicsSorted.length > 0 ? (
                weakTopicsSorted.map(topic => (
                  <div key={topic} style={{ background: '#fff0ee', border: '1px solid #ffdcd6', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', fontWeight: 700, color: 'var(--red-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertCircle size={16} /> {topic}
                  </div>
                ))
              ) : (
                <div style={{ color: 'var(--gray-300)', textAlign: 'center', fontSize: '13px', padding: '20px 0' }}>
                  Lớp học có phong độ rất tốt, không có chủ đề yếu.
                </div>
              )}
            </div>
          </div>

          <div className="card" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--purple) 100%)', color: 'white', border: 'none', padding: '24px' }}>
            <FileText size={40} style={{ marginBottom: '16px', color: 'white' }} />
            <h3 style={{ color: 'white', marginBottom: '8px' }}>Xuất báo cáo lớp học</h3>
            <p style={{ opacity: 0.9, fontSize: '13px', marginBottom: '24px' }}>
              Tải file PDF báo cáo kết quả rèn luyện chi tiết của học viên lớp {activeClass.name}.
            </p>
            <button className="btn btn-white btn-sm" style={{ width: '100%' }} onClick={handleExport} disabled={exporting}>
              {exporting ? (
                <Loader2 className="spinning" size={16} />
              ) : (
                <><Download size={16} /> Tải báo cáo PDF</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherReports;

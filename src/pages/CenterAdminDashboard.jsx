import React, { useState, useEffect, useCallback } from 'react';
import { Users, Activity, Target, GraduationCap, CreditCard, Loader2, Plus, X, BookOpen, UserPlus, CheckCircle2, AlertCircle, Eye, EyeOff, UserCheck } from 'lucide-react';
import { centersApi, classesApi } from '../services/api';

// ===== Toast Notification =====
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div style={{
      position: 'fixed', bottom: '28px', right: '28px', zIndex: 9999,
      display: 'flex', alignItems: 'center', gap: '12px',
      padding: '16px 24px', borderRadius: 'var(--radius-md)',
      background: type === 'success' ? 'linear-gradient(135deg, #6ee7b7, #34d399)' : 'linear-gradient(135deg, #fca5a5, #f87171)',
      color: '#fff', fontWeight: 700, fontSize: '15px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
      animation: 'slideInRight 0.4s ease',
    }}>
      {type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
      {message}
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', marginLeft: '8px' }}><X size={16} /></button>
    </div>
  );
};

// ===== Tab Button =====
const TabButton = ({ active, icon: Icon, label, count, onClick }) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      padding: '14px 24px', border: 'none', cursor: 'pointer',
      borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
      fontWeight: 800, fontSize: '15px', textTransform: 'uppercase',
      letterSpacing: '0.5px', transition: 'all 0.2s ease',
      background: active ? 'white' : 'transparent',
      color: active ? 'var(--primary)' : 'var(--gray-400)',
      borderBottom: active ? '3px solid var(--primary)' : '3px solid transparent',
      fontFamily: "'Outfit', sans-serif",
    }}
  >
    <Icon size={18} />
    {label}
    {count !== undefined && (
      <span style={{
        background: active ? 'var(--primary)' : 'var(--gray-200)',
        color: active ? '#fff' : 'var(--gray-500)',
        padding: '2px 10px', borderRadius: 'var(--radius-full)',
        fontSize: '12px', fontWeight: 800, minWidth: '24px', textAlign: 'center',
      }}>{count}</span>
    )}
  </button>
);

// ===== Add Students Modal =====
const AddStudentsModal = ({ visible, onClose, centerId, classId, className: clsName, onSuccess, showToast }) => {
  const [allStudents, setAllStudents] = useState([]);
  const [classStudents, setClassStudents] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!visible) return;
    const load = async () => {
      setLoading(true);
      try {
        const [all, existing] = await Promise.all([
          centersApi.getStudents(centerId),
          classesApi.getStudents(centerId, classId),
        ]);
        setAllStudents(all);
        setClassStudents(existing);
        setSelectedIds([]);
      } catch (err) {
        showToast('Lỗi tải danh sách: ' + err.message, 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [visible, centerId, classId, showToast]);

  if (!visible) return null;

  const existingIds = new Set(classStudents.map(s => s.studentId));
  const availableStudents = allStudents.filter(s => !existingIds.has(s.id));

  const toggleStudent = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSubmit = async () => {
    if (selectedIds.length === 0) { showToast('Vui lòng chọn ít nhất 1 học viên!', 'error'); return; }
    setSubmitting(true);
    try {
      await classesApi.addStudents(centerId, classId, selectedIds);
      showToast(`Đã thêm ${selectedIds.length} học viên vào lớp ${clsName}! 🎉`);
      onSuccess();
      onClose();
    } catch (err) {
      showToast('Lỗi: ' + err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(26,18,37,0.5)', backdropFilter: 'blur(4px)', animation: 'fadeIn 0.2s ease',
    }} onClick={onClose}>
      <div style={{
        background: '#fff', borderRadius: 'var(--radius-xl)', maxWidth: '560px', width: '95%',
        maxHeight: '80vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 64px rgba(0,0,0,0.2)', animation: 'scaleIn 0.3s ease',
      }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '24px', borderBottom: '2px solid var(--gray-100)',
        }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '18px', color: 'var(--text-dark)' }}>Thêm Học viên vào lớp</div>
            <div style={{ fontSize: '14px', color: 'var(--gray-400)' }}>{clsName}</div>
          </div>
          <button onClick={onClose} style={{
            background: 'var(--gray-50)', border: 'none', cursor: 'pointer', borderRadius: '50%',
            width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><X size={18} /></button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-400)' }}>
              <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 8px' }} />
              <div>Đang tải...</div>
            </div>
          ) : availableStudents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-300)' }}>
              <Users size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
              <div style={{ fontWeight: 700, marginBottom: '4px' }}>
                {allStudents.length === 0 ? 'Chưa có học viên nào trong trung tâm' : 'Tất cả học viên đã được thêm vào lớp này'}
              </div>
              {allStudents.length === 0 && (
                <div style={{ fontSize: '14px' }}>Hãy tạo học viên ở tab "Học viên" trước</div>
              )}
            </div>
          ) : (
            <>
              <div style={{ fontSize: '13px', color: 'var(--gray-400)', marginBottom: '12px', fontWeight: 600 }}>
                {selectedIds.length > 0 ? `Đã chọn ${selectedIds.length} học viên` : `${availableStudents.length} học viên có thể thêm`}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {availableStudents.map(s => {
                  const isSelected = selectedIds.includes(s.id);
                  return (
                    <div
                      key={s.id}
                      onClick={() => toggleStudent(s.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                        borderRadius: 'var(--radius-md)', cursor: 'pointer',
                        border: isSelected ? '2px solid var(--primary)' : '2px solid var(--gray-100)',
                        background: isSelected ? 'var(--primary-light)' : '#fff',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{
                        width: '22px', height: '22px', borderRadius: '6px',
                        border: isSelected ? '2px solid var(--primary)' : '2px solid var(--gray-200)',
                        background: isSelected ? 'var(--primary)' : '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.15s ease', flexShrink: 0,
                      }}>
                        {isSelected && <CheckCircle2 size={14} color="#fff" />}
                      </div>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--primary), var(--purple))',
                        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: '14px', flexShrink: 0,
                      }}>
                        {(s.fullName || '?')[0].toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-dark)' }}>{s.fullName}</div>
                        <div style={{ fontSize: '13px', color: 'var(--gray-400)' }}>{s.email}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Already in class */}
          {!loading && classStudents.length > 0 && (
            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--gray-100)' }}>
              <div style={{ fontSize: '13px', color: 'var(--gray-300)', marginBottom: '8px', fontWeight: 600 }}>
                Đã có trong lớp ({classStudents.length})
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {classStudents.map(s => (
                  <span key={s.studentId} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '6px 12px', borderRadius: 'var(--radius-full)',
                    background: 'var(--gray-50)', border: '1px solid var(--gray-100)',
                    fontSize: '13px', color: 'var(--gray-500)',
                  }}>
                    <UserCheck size={14} /> {s.fullName}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '20px 24px', borderTop: '2px solid var(--gray-100)',
          display: 'flex', justifyContent: 'flex-end', gap: '12px',
        }}>
          <button className="btn btn-outline btn-sm" onClick={onClose}>Hủy</button>
          <button className="btn btn-primary btn-sm" onClick={handleSubmit}
            disabled={submitting || selectedIds.length === 0}>
            {submitting
              ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Đang thêm...</>
              : <><UserPlus size={16} /> Thêm {selectedIds.length > 0 ? `(${selectedIds.length})` : ''}</>
            }
          </button>
        </div>
      </div>
    </div>
  );
};

const CenterAdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [activeTab, setActiveTab] = useState('classes');

  // Class creation
  const [showClassForm, setShowClassForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newClass, setNewClass] = useState({ name: '', teacherId: '' });

  // Teacher creation
  const [showTeacherForm, setShowTeacherForm] = useState(false);
  const [isSubmittingTeacher, setIsSubmittingTeacher] = useState(false);
  const [newTeacher, setNewTeacher] = useState({ fullName: '', email: '', password: '' });
  const [showTeacherPw, setShowTeacherPw] = useState(false);

  // Student creation
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [isSubmittingStudent, setIsSubmittingStudent] = useState(false);
  const [newStudent, setNewStudent] = useState({ fullName: '', email: '', password: '' });
  const [showStudentPw, setShowStudentPw] = useState(false);

  // Add students modal
  const [addStudentModal, setAddStudentModal] = useState({ visible: false, classId: '', className: '' });

  // Toast
  const [toast, setToast] = useState(null);

  const centerId = localStorage.getItem('centerId');
  const showToast = useCallback((message, type = 'success') => setToast({ message, type }), []);

  const loadData = useCallback(async () => {
    try {
      if (!centerId) throw new Error('Không tìm thấy thông tin trung tâm. Vui lòng đăng nhập lại.');
      const [statsData, classesData, teachersData, studentsData] = await Promise.all([
        centersApi.getDashboard(centerId),
        classesApi.getAll(centerId),
        centersApi.getTeachers(centerId),
        centersApi.getStudents(centerId),
      ]);
      setStats(statsData);
      setClasses(classesData);
      setTeachers(teachersData);
      setStudents(studentsData);
    } catch (err) {
      setError(err.message || 'Lỗi lấy dữ liệu');
    } finally {
      setLoading(false);
    }
  }, [centerId]);

  useEffect(() => { loadData(); }, [loadData]);

  // ===== Handlers =====
  const handleCreateClass = async (e) => {
    e.preventDefault();
    if (!newClass.teacherId) { showToast('Vui lòng chọn 1 giáo viên phụ trách!', 'error'); return; }
    setIsSubmitting(true);
    try {
      await classesApi.create(centerId, newClass);
      setNewClass({ name: '', teacherId: '' });
      setShowClassForm(false);
      showToast('Tạo lớp học thành công! 🎉');
      const updated = await classesApi.getAll(centerId);
      setClasses(updated);
    } catch (err) {
      showToast('Lỗi tạo lớp học: ' + err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateTeacher = async (e) => {
    e.preventDefault();
    setIsSubmittingTeacher(true);
    try {
      await centersApi.createTeacher(centerId, newTeacher);
      setNewTeacher({ fullName: '', email: '', password: '' });
      setShowTeacherForm(false);
      showToast('Tạo giáo viên thành công! 🎉');
      setTeachers(await centersApi.getTeachers(centerId));
    } catch (err) {
      showToast('Lỗi: ' + (err.message || 'Không thể tạo giáo viên'), 'error');
    } finally {
      setIsSubmittingTeacher(false);
    }
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    setIsSubmittingStudent(true);
    try {
      await centersApi.createStudent(centerId, newStudent);
      setNewStudent({ fullName: '', email: '', password: '' });
      setShowStudentForm(false);
      showToast('Tạo học viên thành công! 🎉');
      setStudents(await centersApi.getStudents(centerId));
    } catch (err) {
      showToast('Lỗi: ' + (err.message || 'Không thể tạo học viên'), 'error');
    } finally {
      setIsSubmittingStudent(false);
    }
  };

  // ===== Loading / Error =====
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '120px', color: 'var(--primary)' }}>
        <Loader2 size={36} style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }
  if (error) {
    return <div className="card" style={{ color: 'var(--red)', borderColor: 'var(--red)', margin: '40px auto', maxWidth: '600px', textAlign: 'center' }}>{error}</div>;
  }

  // ===== Reusable Create User Form =====
  const renderUserForm = ({ title, subtitle, icon: FormIcon, fields, onSubmit, isSubmittingState, onCancel, showPw, setShowPw }) => (
    <div style={{
      padding: '24px', borderBottom: '2px solid var(--gray-100)',
      background: 'linear-gradient(135deg, #faf8ff 0%, #f2e1ff22 100%)',
      animation: 'fadeSlideDown 0.3s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: 'var(--radius-md)',
          background: 'var(--primary)', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}><FormIcon size={18} /></div>
        <div>
          <div style={{ fontWeight: 800, fontSize: '16px', color: 'var(--text-dark)' }}>{title}</div>
          <div style={{ fontSize: '13px', color: 'var(--gray-400)' }}>{subtitle}</div>
        </div>
      </div>
      <form onSubmit={onSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Họ và tên</label>
            <input type="text" className="form-input" placeholder="VD: Nguyễn Văn A"
              required value={fields.fullName} onChange={e => fields.setFullName(e.target.value)} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Email đăng nhập</label>
            <input type="email" className="form-input" placeholder="user@example.com"
              required value={fields.email} onChange={e => fields.setEmail(e.target.value)} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Mật khẩu</label>
            <div style={{ position: 'relative' }}>
              <input type={showPw ? 'text' : 'password'} className="form-input" placeholder="Mật khẩu ban đầu"
                required minLength={6} value={fields.password} onChange={e => fields.setPassword(e.target.value)}
                style={{ paddingRight: '44px' }} />
              <button type="button" onClick={() => setShowPw(!showPw)} style={{
                position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)',
              }}>
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="submit" className="btn btn-primary btn-sm" disabled={isSubmittingState}>
            {isSubmittingState ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Đang tạo...</> : <><CheckCircle2 size={16} /> Xác nhận</>}
          </button>
          <button type="button" className="btn btn-outline btn-sm" onClick={onCancel}>Hủy bỏ</button>
        </div>
      </form>
    </div>
  );

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Add Students Modal */}
      <AddStudentsModal
        visible={addStudentModal.visible}
        centerId={centerId}
        classId={addStudentModal.classId}
        className={addStudentModal.className}
        onClose={() => setAddStudentModal({ visible: false, classId: '', className: '' })}
        onSuccess={async () => {
          setClasses(await classesApi.getAll(centerId));
        }}
        showToast={showToast}
      />

      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Quản trị Trung tâm</h1>
        <p className="page-subtitle">{stats?.centerName || 'Đang tải...'} • Tổng quan hoạt động</p>
      </div>

      {/* Stat Cards */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon card-icon-blue" style={{ marginBottom: 0 }}><Users size={24} /></div>
          <div>
            <div className="stat-value">{students.length}</div>
            <div className="stat-label">Tổng số Học viên</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon card-icon-green" style={{ marginBottom: 0 }}><Activity size={24} /></div>
          <div>
            <div className="stat-value">{stats?.activeLearners || 0}</div>
            <div className="stat-label">Học viên Active</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon card-icon-yellow" style={{ marginBottom: 0 }}><Target size={24} /></div>
          <div>
            <div className="stat-value">{stats?.averageAccuracy?.toFixed(1) || 0}%</div>
            <div className="stat-label">Accuracy Giao tiếp</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon card-icon-purple" style={{ marginBottom: 0 }}><GraduationCap size={24} /></div>
          <div>
            <div className="stat-value">{teachers.length}</div>
            <div className="stat-label">Giáo viên</div>
          </div>
        </div>
      </div>

      {/* ===== Tabbed Section ===== */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{
          display: 'flex', gap: '4px',
          background: 'var(--gray-50)', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
          padding: '4px 4px 0', borderBottom: '2px solid var(--gray-100)',
        }}>
          <TabButton active={activeTab === 'classes'} icon={BookOpen} label="Lớp học" count={classes.length} onClick={() => setActiveTab('classes')} />
          <TabButton active={activeTab === 'students'} icon={Users} label="Học viên" count={students.length} onClick={() => setActiveTab('students')} />
          <TabButton active={activeTab === 'teachers'} icon={GraduationCap} label="Giáo viên" count={teachers.length} onClick={() => setActiveTab('teachers')} />
        </div>

        <div className="table-wrapper" style={{ borderRadius: '0 0 var(--radius-lg) var(--radius-lg)', borderTop: 'none' }}>

          {/* ===================== CLASSES TAB ===================== */}
          {activeTab === 'classes' && (
            <>
              <div className="table-header">
                <div className="table-title">Danh sách Lớp học ({classes.length})</div>
                <button className="btn btn-primary btn-sm" onClick={() => setShowClassForm(!showClassForm)}>
                  {showClassForm ? <><X size={16} /> Hủy</> : <><Plus size={16} /> Tạo lớp mới</>}
                </button>
              </div>

              {showClassForm && (
                <div style={{
                  padding: '24px', borderBottom: '2px solid var(--gray-100)',
                  background: 'linear-gradient(135deg, #faf8ff 0%, #f2e1ff22 100%)',
                  animation: 'fadeSlideDown 0.3s ease',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: 'var(--radius-md)',
                      background: 'var(--primary)', color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}><Plus size={18} /></div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '16px', color: 'var(--text-dark)' }}>Tạo lớp học mới</div>
                      <div style={{ fontSize: '13px', color: 'var(--gray-400)' }}>Điền thông tin và chọn giáo viên phụ trách</div>
                    </div>
                  </div>
                  <form onSubmit={handleCreateClass}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Tên lớp học</label>
                        <input type="text" className="form-input" placeholder="VD: Ký hiệu Vỡ lòng A1"
                          required value={newClass.name} onChange={e => setNewClass({ ...newClass, name: e.target.value })} />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Giáo viên phụ trách</label>
                        <select className="form-input" required value={newClass.teacherId}
                          onChange={e => setNewClass({ ...newClass, teacherId: e.target.value })}>
                          <option value="">-- Chọn Giáo Viên --</option>
                          {teachers.map(t => (
                            <option key={t.id} value={t.id}>{t.fullName} ({t.email})</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    {teachers.length === 0 && (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '12px 16px', borderRadius: 'var(--radius-md)',
                        background: '#fff3e0', color: 'var(--orange)', fontSize: '14px', marginBottom: '16px',
                        border: '1px solid #ffe0b2',
                      }}>
                        <AlertCircle size={18} />
                        <span>Bạn chưa có Giáo viên nào. Hãy chuyển qua tab <strong>"Giáo viên"</strong> để tạo trước.</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button type="submit" className="btn btn-primary btn-sm" disabled={isSubmitting || teachers.length === 0}>
                        {isSubmitting ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Đang tạo...</> : <><CheckCircle2 size={16} /> Xác nhận tạo Lớp</>}
                      </button>
                      <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowClassForm(false)}>Hủy bỏ</button>
                    </div>
                  </form>
                </div>
              )}

              <table>
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>#</th>
                    <th>Lớp học</th>
                    <th>Giáo viên phụ trách</th>
                    <th>Số học viên</th>
                    <th>Trạng thái</th>
                    <th style={{ width: '160px' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {classes.map((c, index) => (
                    <tr key={c.id}>
                      <td style={{ color: 'var(--gray-300)', fontWeight: 700 }}>{index + 1}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '40px', height: '40px', borderRadius: 'var(--radius-md)',
                            background: 'linear-gradient(135deg, var(--primary-light), #e7c0ff44)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'var(--primary)', flexShrink: 0,
                          }}><BookOpen size={18} /></div>
                          <div style={{ fontWeight: 700, color: 'var(--text-dark)' }}>{c.name}</div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '28px', height: '28px', borderRadius: '50%',
                            background: 'var(--primary)', color: '#fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '12px', fontWeight: 800,
                          }}>
                            {(c.teacherName || '?')[0].toUpperCase()}
                          </div>
                          {c.teacherName || <span style={{ color: 'var(--gray-300)', fontStyle: 'italic' }}>Chưa phân công</span>}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: 'var(--text-dark)' }}>{c.studentCount}</span>
                        <span style={{ color: 'var(--gray-300)', marginLeft: '4px' }}>học viên</span>
                      </td>
                      <td><span className="badge badge-green">Đang hoạt động</span></td>
                      <td>
                        <button className="btn btn-blue btn-sm" style={{ padding: '8px 14px', fontSize: '13px' }}
                          onClick={() => setAddStudentModal({ visible: true, classId: c.id, className: c.name })}>
                          <UserPlus size={14} /> Thêm HV
                        </button>
                      </td>
                    </tr>
                  ))}
                  {classes.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--gray-300)' }}>
                        <BookOpen size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                        <div style={{ fontWeight: 700, marginBottom: '4px' }}>Chưa có lớp học nào</div>
                        <div style={{ fontSize: '14px' }}>Nhấn "Tạo lớp mới" để bắt đầu</div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </>
          )}

          {/* ===================== STUDENTS TAB ===================== */}
          {activeTab === 'students' && (
            <>
              <div className="table-header">
                <div className="table-title">Danh sách Học viên ({students.length})</div>
                <button className="btn btn-primary btn-sm" onClick={() => setShowStudentForm(!showStudentForm)}>
                  {showStudentForm ? <><X size={16} /> Hủy</> : <><UserPlus size={16} /> Thêm Học viên</>}
                </button>
              </div>

              {showStudentForm && renderUserForm({
                title: 'Cấp tài khoản Học viên',
                subtitle: 'Học viên sẽ dùng email và mật khẩu này để đăng nhập vào ứng dụng',
                icon: UserPlus,
                fields: {
                  fullName: newStudent.fullName,
                  setFullName: (v) => setNewStudent({ ...newStudent, fullName: v }),
                  email: newStudent.email,
                  setEmail: (v) => setNewStudent({ ...newStudent, email: v }),
                  password: newStudent.password,
                  setPassword: (v) => setNewStudent({ ...newStudent, password: v }),
                },
                onSubmit: handleCreateStudent,
                isSubmittingState: isSubmittingStudent,
                onCancel: () => setShowStudentForm(false),
                showPw: showStudentPw,
                setShowPw: setShowStudentPw,
              })}

              <table>
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>#</th>
                    <th>Học viên</th>
                    <th>Email</th>
                    <th>Ngày tạo</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, index) => (
                    <tr key={s.id}>
                      <td style={{ color: 'var(--gray-300)', fontWeight: 700 }}>{index + 1}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '40px', height: '40px', borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--blue), var(--primary))',
                            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 800, fontSize: '16px', flexShrink: 0,
                          }}>
                            {(s.fullName || '?')[0].toUpperCase()}
                          </div>
                          <div style={{ fontWeight: 700, color: 'var(--text-dark)' }}>{s.fullName}</div>
                        </div>
                      </td>
                      <td style={{ color: 'var(--gray-500)' }}>{s.email}</td>
                      <td style={{ color: 'var(--gray-400)', fontSize: '14px' }}>
                        {s.createdAt ? new Date(s.createdAt).toLocaleDateString('vi-VN') : '—'}
                      </td>
                      <td><span className="badge badge-green">Hoạt động</span></td>
                    </tr>
                  ))}
                  {students.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--gray-300)' }}>
                        <Users size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                        <div style={{ fontWeight: 700, marginBottom: '4px' }}>Chưa có học viên nào</div>
                        <div style={{ fontSize: '14px' }}>Nhấn "Thêm Học viên" để cấp tài khoản</div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </>
          )}

          {/* ===================== TEACHERS TAB ===================== */}
          {activeTab === 'teachers' && (
            <>
              <div className="table-header">
                <div className="table-title">Danh sách Giáo viên ({teachers.length})</div>
                <button className="btn btn-primary btn-sm" onClick={() => setShowTeacherForm(!showTeacherForm)}>
                  {showTeacherForm ? <><X size={16} /> Hủy</> : <><UserPlus size={16} /> Thêm Giáo viên</>}
                </button>
              </div>

              {showTeacherForm && renderUserForm({
                title: 'Cấp tài khoản Giáo viên',
                subtitle: 'Giáo viên sẽ dùng email và mật khẩu này để đăng nhập',
                icon: UserPlus,
                fields: {
                  fullName: newTeacher.fullName,
                  setFullName: (v) => setNewTeacher({ ...newTeacher, fullName: v }),
                  email: newTeacher.email,
                  setEmail: (v) => setNewTeacher({ ...newTeacher, email: v }),
                  password: newTeacher.password,
                  setPassword: (v) => setNewTeacher({ ...newTeacher, password: v }),
                },
                onSubmit: handleCreateTeacher,
                isSubmittingState: isSubmittingTeacher,
                onCancel: () => setShowTeacherForm(false),
                showPw: showTeacherPw,
                setShowPw: setShowTeacherPw,
              })}

              <table>
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>#</th>
                    <th>Giáo viên</th>
                    <th>Email</th>
                    <th>Ngày tạo</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {teachers.map((t, index) => (
                    <tr key={t.id}>
                      <td style={{ color: 'var(--gray-300)', fontWeight: 700 }}>{index + 1}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '40px', height: '40px', borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--primary), var(--purple))',
                            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 800, fontSize: '16px', flexShrink: 0,
                          }}>
                            {(t.fullName || '?')[0].toUpperCase()}
                          </div>
                          <div style={{ fontWeight: 700, color: 'var(--text-dark)' }}>{t.fullName}</div>
                        </div>
                      </td>
                      <td style={{ color: 'var(--gray-500)' }}>{t.email}</td>
                      <td style={{ color: 'var(--gray-400)', fontSize: '14px' }}>
                        {t.createdAt ? new Date(t.createdAt).toLocaleDateString('vi-VN') : '—'}
                      </td>
                      <td><span className="badge badge-green">Hoạt động</span></td>
                    </tr>
                  ))}
                  {teachers.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--gray-300)' }}>
                        <Users size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                        <div style={{ fontWeight: 700, marginBottom: '4px' }}>Chưa có giáo viên nào</div>
                        <div style={{ fontSize: '14px' }}>Nhấn "Thêm Giáo viên" để cấp tài khoản</div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>

      {/* Subscription Card */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '24px', padding: '28px' }}>
        <div className="stat-icon card-icon-purple" style={{ width: '56px', height: '56px', marginBottom: 0 }}>
          <CreditCard size={24} />
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ marginBottom: '4px' }}>Tình trạng Dịch vụ B2B (Gói Enterprise)</h3>
          <p style={{ color: 'var(--gray-400)', fontSize: '15px' }}>
            Đang sử dụng <strong>{students.length} / {stats?.maxSeats || 50} seats</strong>
          </p>
          <div className="progress-bar" style={{ marginTop: '12px', height: '12px' }}>
            <div className="progress-fill" style={{
              width: `${Math.min(100, (students.length / (stats?.maxSeats || 50)) * 100)}%`,
              background: 'linear-gradient(90deg, var(--blue), var(--purple))'
            }}></div>
          </div>
        </div>
        <button className="btn btn-blue btn-sm">Gia hạn / Nâng cấp gói</button>
      </div>

      {/* Inline CSS for animations */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes slideInRight {
          from { transform: translateX(60px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </>
  );
};

export default CenterAdminDashboard;

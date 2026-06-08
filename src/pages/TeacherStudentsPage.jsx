import React, { useState, useEffect } from 'react';
import { Users, GraduationCap, Loader2, Mail, Search } from 'lucide-react';
import { teacherApi } from '../services/api';

const TeacherStudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [dashboard, setDashboard] = useState({ totalClasses: 0, totalStudents: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [dash, list] = await Promise.all([
          teacherApi.getDashboard().catch(() => ({ totalClasses: 0, totalStudents: 0 })),
          teacherApi.getStudents().catch(() => []),
        ]);
        setDashboard(dash || { totalClasses: 0, totalStudents: 0 });
        setStudents(Array.isArray(list) ? list : []);
      } catch (err) {
        setError(err.message || 'Không thể tải dữ liệu học viên.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = students.filter((s) =>
    (s.fullName || '').toLowerCase().includes(query.toLowerCase()) ||
    (s.email || '').toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Tiến độ Học viên</h1>
        <p className="page-subtitle">Toàn bộ học viên thuộc các lớp bạn phụ trách</p>
      </div>

      <div className="stat-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-icon card-icon-blue" style={{ marginBottom: 0 }}><GraduationCap size={24} /></div>
          <div>
            <div className="stat-value">{dashboard.totalClasses}</div>
            <div className="stat-label">Lớp phụ trách</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon card-icon-green" style={{ marginBottom: 0 }}><Users size={24} /></div>
          <div>
            <div className="stat-value">{dashboard.totalStudents}</div>
            <div className="stat-label">Tổng học viên</div>
          </div>
        </div>
      </div>

      {error && (
        <div className="card" style={{ color: 'var(--red)', borderColor: 'var(--red)', marginBottom: '16px' }}>{error}</div>
      )}

      <div className="table-wrapper">
        <div className="table-header">
          <div className="table-title">Danh sách học viên ({filtered.length})</div>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-300)' }} />
            <input
              className="form-input"
              placeholder="Tìm theo tên hoặc email..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ margin: 0, paddingLeft: '36px', width: '260px' }}
            />
          </div>
        </div>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--primary)' }}><Loader2 className="spinning" /></div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Học viên</th>
                <th>Email</th>
                <th style={{ textAlign: 'right', paddingRight: '16px' }}>Mã HV</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.studentId}>
                  <td style={{ fontWeight: 700 }}>{s.fullName}</td>
                  <td style={{ color: 'var(--gray-400)' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <Mail size={14} /> {s.email}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', paddingRight: '16px', color: 'var(--gray-300)' }}>#{s.studentId}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: '32px', color: 'var(--gray-400)' }}>
                    Không có học viên nào khớp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
};

export default TeacherStudentsPage;

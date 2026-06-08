import React, { useState, useEffect, useCallback } from 'react';
import { Bell, CheckCheck, Loader2, Inbox } from 'lucide-react';
import { notificationsApi } from '../services/api';

const PAGE_SIZE = 20;

const NotificationsPage = () => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async (p) => {
    try {
      setLoading(true);
      const res = await notificationsApi.getAll(p, PAGE_SIZE);
      // Backend returns NotificationPagedResponse { items, totalCount, page, pageSize }
      const list = res?.items ?? (Array.isArray(res) ? res : []);
      setItems(list);
      setTotalCount(res?.totalCount ?? list.length);
      setPage(p);
    } catch (err) {
      setError(err.message || 'Không thể tải thông báo.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(1); }, [load]);

  const handleMarkAsRead = async (id) => {
    // optimistic update
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    try {
      await notificationsApi.markAsRead(id);
    } catch (err) {
      // rollback on failure
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: false } : n)));
    }
  };

  const handleMarkAllRead = async () => {
    const unread = items.filter((n) => !n.isRead);
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    await Promise.allSettled(unread.map((n) => notificationsApi.markAsRead(n.id)));
  };

  const unreadCount = items.filter((n) => !n.isRead).length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Thông báo</h1>
          <p className="page-subtitle">
            {totalCount} thông báo {unreadCount > 0 && `• ${unreadCount} chưa đọc`}
          </p>
        </div>
        {unreadCount > 0 && (
          <button className="btn btn-outline btn-sm" onClick={handleMarkAllRead}>
            <CheckCheck size={16} /> Đánh dấu tất cả đã đọc
          </button>
        )}
      </div>

      {error && (
        <div className="card" style={{ color: 'var(--red)', borderColor: 'var(--red)', marginBottom: '16px' }}>{error}</div>
      )}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px', color: 'var(--primary)' }}>
            <Loader2 className="spinning" size={28} />
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--gray-300)' }}>
            <Inbox size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
            <div>Bạn chưa có thông báo nào.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {items.map((n) => (
              <div
                key={n.id}
                onClick={() => !n.isRead && handleMarkAsRead(n.id)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '14px',
                  padding: '16px 20px', borderBottom: '1px solid var(--gray-100)',
                  cursor: n.isRead ? 'default' : 'pointer',
                  background: n.isRead ? '#fff' : 'rgba(124, 58, 237, 0.04)',
                }}
              >
                <div className="stat-icon card-icon-purple" style={{ width: '40px', height: '40px', marginBottom: 0, flexShrink: 0 }}>
                  <Bell size={18} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                    <span style={{ fontWeight: n.isRead ? 600 : 800, color: 'var(--text-dark)' }}>{n.title}</span>
                    <span style={{ fontSize: '12px', color: 'var(--gray-300)', whiteSpace: 'nowrap' }}>
                      {n.createdAt ? new Date(n.createdAt).toLocaleString('vi-VN') : ''}
                    </span>
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--gray-400)', marginTop: '4px', lineHeight: 1.5 }}>{n.body}</div>
                  {n.type && <span className="badge badge-blue" style={{ marginTop: '8px' }}>{n.type}</span>}
                </div>
                {!n.isRead && (
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary)', flexShrink: 0, marginTop: '6px' }} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
          <button className="btn btn-outline btn-sm" disabled={page <= 1 || loading} onClick={() => load(page - 1)}>Trước</button>
          <span style={{ alignSelf: 'center', fontWeight: 700, color: 'var(--gray-400)' }}>Trang {page}/{totalPages}</span>
          <button className="btn btn-outline btn-sm" disabled={page >= totalPages || loading} onClick={() => load(page + 1)}>Sau</button>
        </div>
      )}
    </>
  );
};

export default NotificationsPage;

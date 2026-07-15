'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/StatusBadge';
import Badge from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import UserAvatar from '@/components/social/UserAvatar';

type UserRow = {
  id: string;
  name: string;
  username: string | null;
  email: string;
  role: string;
  statusLevel: number;
  isBanned: boolean;
  isVerified: boolean;
  frameType: string;
  avatar: string | null;
  timeoutUntil: string | null;
  createdAt: string;
  _count: { comments: number; flags: number };
};

type ActionModal = {
  userId: string;
  userName: string;
  action: 'ban' | 'timeout' | 'flag';
} | null;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionModal, setActionModal] = useState<ActionModal>(null);
  const [reason, setReason] = useState('');
  const [timeoutHours, setTimeoutHours] = useState(24);
  const [actioning, setActioning] = useState(false);
  const [search, setSearch] = useState('');

  const fetchUsers = () => {
    fetch('/api/admin/users')
      .then((r) => r.json())
      .then((j) => j.success && setUsers(j.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const runAction = async () => {
    if (!actionModal) return;
    setActioning(true);
    try {
      const body: Record<string, unknown> = {
        action: actionModal.action,
        reason,
      };
      if (actionModal.action === 'timeout') body.timeoutHours = timeoutHours;

      const res = await fetch(`/api/admin/users/${actionModal.userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.success) {
        fetchUsers();
        setActionModal(null);
        setReason('');
      }
    } finally {
      setActioning(false);
    }
  };

  const unban = async (userId: string) => {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'unban' }),
    });
    const json = await res.json();
    if (json.success) {
      fetchUsers();
    }
  };

  const toggleVerify = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_verify' }),
      });
      if (res.ok) fetchUsers();
    } catch (e) {
      console.error(e);
    }
  };

  const setFrame = async (userId: string, frame: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_frame', frameType: frame }),
      });
      if (res.ok) fetchUsers();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      (u.username && u.username.toLowerCase().includes(search.toLowerCase())) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '6rem 0' }}>
        <span style={{ display: 'inline-block', width: '2rem', height: '2rem', border: '3px solid rgba(255,255,255,0.2)', borderTopColor: '#8B0000', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const actionLabels = {
    ban: { title: 'حظر العضو', color: 'bg-red-700', desc: 'سيتم حظر المستخدم نهائياً ومنعه من دخول الموقع.' },
    timeout: { title: 'كتم العضو مؤقتاً', color: 'bg-yellow-700', desc: 'سيتم تقييد المستخدم من التعليق ونشر البوستات مؤقتاً.' },
    flag: { title: 'تحذير العضو', color: 'bg-orange-700', desc: 'سيتم إرسال تحذير وتدوينه في سجل المستخدم.' },
  };

  return (
    <div style={{ direction: 'rtl', fontFamily: 'var(--font-tajawal), sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#e5e7eb', margin: '0 0 0.25rem' }}>
            قائمة الأعضاء
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '0.85rem', margin: 0 }}>إجمالي الأعضاء المسجلين: {users.length} عضو</p>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث بالاسم أو البريد أو المعرف..."
          style={{
            backgroundColor: '#161616', border: '1px solid rgba(255,255,255,0.08)',
            color: '#e5e7eb', borderRadius: '0.75rem', padding: '0.625rem 1.25rem',
            fontSize: '0.875rem', outline: 'none', width: '260px',
            fontFamily: 'var(--font-tajawal), sans-serif', textAlign: 'right', direction: 'rtl',
          }}
        />
      </div>

      <div className="glass-card" style={{ overflow: 'hidden', borderRadius: '1.25rem', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', color: '#d1d5db', textAlign: 'right' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                {['العضو', 'الحالة', 'الرتبة', 'التعليقات', 'التحذيرات', 'التوثيق والديكور', 'الإجراءات الإدارية'].map((h) => (
                  <th key={h} style={{ padding: '0.875rem 1.25rem', fontSize: '0.8rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                const inTimeout = user.timeoutUntil && new Date(user.timeoutUntil) > new Date();
                return (
                  <motion.tr
                    key={user.id}
                    layout
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'transparent' }}
                  >
                    <td style={{ padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <UserAvatar user={user} size={36} clickable={true} />
                      <div>
                        <p style={{ color: '#e5e7eb', fontWeight: 700, margin: 0 }}>{user.name}</p>
                        <p style={{ color: '#6b7280', fontSize: '0.75rem', margin: 0 }}>@{user.username || user.id}</p>
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 1.25rem' }}>
                      {user.isBanned ? (
                        <Badge variant="red">محظور</Badge>
                      ) : inTimeout ? (
                        <Badge variant="yellow">مكتوم</Badge>
                      ) : user.role === 'ADMIN' ? (
                        <Badge variant="crimson">أدمن</Badge>
                      ) : (
                        <Badge variant="green">نشط</Badge>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem 1.25rem' }}>
                      <StatusBadge statusLevel={user.statusLevel} size="sm" showLevel />
                    </td>
                    <td style={{ padding: '0.75rem 1.25rem', color: '#9ca3af' }}>{user._count.comments}</td>
                    <td style={{ padding: '0.75rem 1.25rem' }}>
                      <span style={{ color: user._count.flags > 0 ? '#ef4444' : '#6b7280', fontWeight: user._count.flags > 0 ? 700 : 400 }}>
                        {user._count.flags}
                      </span>
                    </td>

                    {/* Verification and Frame controls */}
                    <td style={{ padding: '0.75rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {/* Verify toggle */}
                        <button
                          onClick={() => toggleVerify(user.id)}
                          style={{
                            backgroundColor: user.isVerified ? 'rgba(59,130,246,0.15)' : '#1e1e1e',
                            border: `1px solid ${user.isVerified ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.08)'}`,
                            color: user.isVerified ? '#3b82f6' : '#9ca3af',
                            borderRadius: '0.5rem',
                            padding: '0.25rem 0.5rem',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            fontWeight: 700,
                            fontFamily: 'var(--font-tajawal), sans-serif',
                          }}
                        >
                          {user.isVerified ? '✓ موثق' : 'توثيق'}
                        </button>

                        {/* Frame dropdown */}
                        <select
                          value={user.frameType}
                          onChange={(e) => setFrame(user.id, e.target.value)}
                          style={{
                            backgroundColor: '#111',
                            border: '1px solid rgba(255,255,255,0.08)',
                            color: '#e5e7eb',
                            borderRadius: '0.5rem',
                            padding: '0.25rem 0.5rem',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            fontFamily: 'var(--font-tajawal), sans-serif',
                            outline: 'none',
                          }}
                        >
                          <option value="none">بدون إطار</option>
                          <option value="gold">🥇 ذهبي</option>
                          <option value="red">🔥 أحمر ناري</option>
                          <option value="neon">⚡ نيون</option>
                          <option value="rainbow">🌈 قوس قزح</option>
                          <option value="diamond">💎 ماسي</option>
                        </select>
                      </div>
                    </td>

                    {/* Mod controls */}
                    <td style={{ padding: '0.75rem 1.25rem' }}>
                      {user.role !== 'ADMIN' && (
                        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                          {user.isBanned ? (
                            <Button size="sm" variant="outline" onClick={() => unban(user.id)}>
                              فك الحظر
                            </Button>
                          ) : (
                            <>
                              <Button size="sm" variant="ghost" onClick={() => setActionModal({ userId: user.id, userName: user.name, action: 'flag' })}>
                                تحذير
                              </Button>
                              <Button size="sm" variant="secondary" onClick={() => setActionModal({ userId: user.id, userName: user.name, action: 'timeout' })}>
                                كتم مؤقت
                              </Button>
                              <Button size="sm" variant="danger" onClick={() => setActionModal({ userId: user.id, userName: user.name, action: 'ban' })}>
                                حظر دائم
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action confirmation modal */}
      <AnimatePresence>
        {actionModal && (
          <motion.div
            style={{
              position: 'fixed', inset: 0, zIndex: 50,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '1rem', backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              style={{
                backgroundColor: '#1a1a1a', border: '1px solid #3a0000',
                borderRadius: '1.25rem', padding: '1.5rem', width: '100%', maxWidth: '400px',
              }}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9 }}
            >
              <h3 style={{ color: '#e5e7eb', fontSize: '1.1rem', fontWeight: 900, marginBottom: '0.5rem', fontFamily: 'var(--font-tajawal), sans-serif' }}>
                {actionLabels[actionModal.action].title}
              </h3>
              <p style={{ color: '#9ca3af', fontSize: '0.8rem', margin: '0 0 0.5rem' }}>
                العضو المستهدف: <strong style={{ color: '#ef4444' }}>{actionModal.userName}</strong>
              </p>
              <p style={{ color: '#6b7280', fontSize: '0.75rem', marginBottom: '1.25rem' }}>
                {actionLabels[actionModal.action].desc}
              </p>

              {actionModal.action === 'timeout' && (
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', color: '#9ca3af', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.35rem' }}>مدة الكتم (بالساعات)</label>
                  <input
                    type="number"
                    value={timeoutHours}
                    onChange={(e) => setTimeoutHours(Number(e.target.value))}
                    min={1}
                    max={720}
                    style={{
                      width: '100%', backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '0.5rem', padding: '0.5rem 0.75rem', color: '#e5e7eb', fontSize: '0.875rem',
                      outline: 'none',
                    }}
                  />
                </div>
              )}

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', color: '#9ca3af', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.35rem' }}>السبب</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="اكتب سبب هذا الإجراء..."
                  rows={3}
                  style={{
                    width: '100%', backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '0.5rem', padding: '0.5rem 0.75rem', color: '#e5e7eb', fontSize: '0.875rem',
                    outline: 'none', resize: 'none', fontFamily: 'var(--font-tajawal), sans-serif',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Button variant="danger" style={{ flex: 1 }} onClick={runAction} loading={actioning}>
                  تأكيد الإجراء
                </Button>
                <Button variant="ghost" style={{ flex: 1 }} onClick={() => setActionModal(null)}>
                  إلغاء
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

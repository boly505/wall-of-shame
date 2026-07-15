'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import UserAvatar from '@/components/social/UserAvatar';
import FeedPost from '@/components/social/FeedPost';

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, update: updateSession } = useSession();
  const username = params.username as string;

  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [fileUploading, setFileUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isMe = session?.user?.username === username || session?.user?.id === username;

  const fetchProfile = async () => {
    try {
      const res = await fetch(`/api/users/${username}`);
      if (!res.ok) {
        setError('تعذر العثور على المستخدم.');
        setLoading(false);
        return;
      }
      const data = await res.json();
      setUser(data);
      setName(data.name);
      setBio(data.bio || '');
      setAvatar(data.avatar || '');

      // Load user posts
      const postsRes = await fetch(`/api/posts?limit=50`);
      if (postsRes.ok) {
        const postsData = await postsRes.json();
        // Filter posts by author id
        const userPosts = postsData.data.filter((p: any) => p.author?.id === data.id);
        setPosts(userPosts);
      }
    } catch {
      setError('خطأ في الاتصال بالخادم.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [username]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileUploading(true);
    setError('');
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      if (!res.ok) throw new Error('فشل رفع الصورة');
      const data = await res.json();
      setAvatar(data.url);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء الرفع');
    } finally {
      setFileUploading(false);
    }
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, bio, avatar }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'فشل التحديث');
      }
      const updated = await res.json();
      setUser((prev: any) => ({ ...prev, ...updated }));
      setEditing(false);
      setSuccess('تم تحديث الملف الشخصي بنجاح!');
      // Update session storage
      await updateSession({
        ...session,
        user: {
          ...session?.user,
          name: updated.name,
          avatar: updated.avatar,
        }
      });
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '60vh', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ display: 'inline-block', width: '2rem', height: '2rem', border: '3px solid rgba(255,255,255,0.2)', borderTopColor: '#8B0000', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#fca5a5', fontFamily: 'var(--font-tajawal), sans-serif', direction: 'rtl' }}>
        <h2>⚠️ {error}</h2>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '38rem', margin: '0 auto', direction: 'rtl', fontFamily: 'var(--font-tajawal), sans-serif' }}>
      {/* Profile Header Card */}
      <div
        className="glass-card"
        style={{
          padding: '2rem',
          borderRadius: '1.5rem',
          marginBottom: '2rem',
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.06)',
          background: 'linear-gradient(135deg, rgba(26,26,26,0.95) 0%, rgba(18,18,18,0.98) 100%)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ position: 'relative', marginBottom: '1rem' }}>
            <UserAvatar user={user} size={100} clickable={false} />
            {editing && (
              <label
                style={{
                  position: 'absolute', bottom: 0, right: 0, width: 30, height: 30,
                  borderRadius: '50%', backgroundColor: '#8B0000', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.8rem', cursor: 'pointer', border: '2px solid #111',
                }}
                title="تغيير الصورة"
              >
                📷
                <input type="file" accept="image/*" hidden onChange={handleAvatarUpload} />
              </label>
            )}
          </div>

          {!editing ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', justifyContent: 'center' }}>
                <h1 style={{ color: '#e5e7eb', fontSize: '1.5rem', fontWeight: 900, margin: '0 0 0.25rem' }}>{user.name}</h1>
                {user.isVerified && <span style={{ color: '#3b82f6', fontSize: '1.1rem' }} title="موثق">✓</span>}
              </div>
              <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: '0 0 1rem' }}>@{user.username}</p>
              <p style={{ color: '#d1d5db', fontSize: '0.95rem', lineHeight: 1.6, margin: '0 0 1.5rem', maxWidth: '85%' }}>
                {user.bio || 'لا يوجد نبذة شخصية حتى الآن.'}
              </p>

              {/* Action buttons */}
              {isMe ? (
                <button
                  onClick={() => setEditing(true)}
                  style={{
                    backgroundColor: '#1e1e1e', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '0.75rem', padding: '0.5rem 1.5rem', color: '#e5e7eb',
                    fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#1e1e1e')}
                >
                  تعديل الملف الشخصي
                </button>
              ) : (
                session && (
                  <button
                    onClick={() => router.push(`/chat/${user.id}`)}
                    style={{
                      background: 'linear-gradient(135deg, #8B0000, #c0392b)',
                      border: 'none', borderRadius: '0.75rem', padding: '0.5rem 2rem',
                      color: '#fff', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer',
                      transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(139,0,0,0.3)',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                  >
                    إرسال رسالة 💬
                  </button>
                )
              )}
            </>
          ) : (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div>
                <label style={{ display: 'block', color: '#9ca3af', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.35rem', textAlign: 'right' }}>الاسم</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%', backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '0.75rem', padding: '0.625rem 1rem', color: '#e5e7eb', fontSize: '0.9rem',
                    outline: 'none', textAlign: 'right', fontFamily: 'var(--font-tajawal), sans-serif',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: '#9ca3af', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.35rem', textAlign: 'right' }}>النبذة الشخصية (Bio)</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={160}
                  rows={3}
                  placeholder="اكتب نبذة قصيرة عنك..."
                  style={{
                    width: '100%', backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '0.75rem', padding: '0.625rem 1rem', color: '#e5e7eb', fontSize: '0.9rem',
                    outline: 'none', resize: 'none', textAlign: 'right', fontFamily: 'var(--font-tajawal), sans-serif',
                  }}
                />
              </div>

              {error && <p style={{ color: '#fca5a5', fontSize: '0.8rem', margin: 0 }}>⚠️ {error}</p>}
              {fileUploading && <p style={{ color: '#9ca3af', fontSize: '0.8rem', margin: 0 }}>جاري رفع الصورة الشخصية...</p>}

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '0.5rem' }}>
                <button
                  onClick={handleSave}
                  disabled={fileUploading || !name.trim()}
                  style={{
                    backgroundColor: '#8B0000', color: '#fff', border: 'none',
                    borderRadius: '0.5rem', padding: '0.5rem 1.5rem', cursor: 'pointer',
                    fontWeight: 700, fontFamily: 'var(--font-tajawal), sans-serif',
                  }}
                >
                  حفظ
                </button>
                <button
                  onClick={() => { setEditing(false); setName(user.name); setBio(user.bio || ''); setAvatar(user.avatar || ''); }}
                  style={{
                    backgroundColor: '#333', color: '#e5e7eb', border: 'none',
                    borderRadius: '0.5rem', padding: '0.5rem 1.5rem', cursor: 'pointer',
                    fontWeight: 700, fontFamily: 'var(--font-tajawal), sans-serif',
                  }}
                >
                  إلغاء
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {success && (
        <div style={{ backgroundColor: '#022c22', border: '1px solid #064e3b', color: '#6ee7b7', padding: '0.75rem 1rem', borderRadius: '0.75rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          ✓ {success}
        </div>
      )}

      {/* User Posts Heading */}
      <h2 style={{ color: '#e5e7eb', fontSize: '1.1rem', fontWeight: 900, marginBottom: '1rem', borderRight: '3px solid #8B0000', paddingRight: '0.5rem' }}>
        منشورات {user.name} ({posts.length})
      </h2>

      {/* User Feed */}
      {posts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#6b7280' }}>
          <p>لا توجد منشورات لهذا المستخدم حتى الآن.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {posts.map((post) => (
            <FeedPost
              key={post.id}
              post={post}
              onDelete={(id) => setPosts((prev) => prev.filter((p) => p.id !== id))}
            />
          ))}
        </div>
      )}
    </div>
  );
}

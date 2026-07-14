'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import PostCard from '@/components/gallery/PostCard';
import PostModal from '@/components/gallery/PostModal';
import { PostWithCommentCount } from '@/lib/types';

interface MasonryGridProps {
  isAdmin?: boolean;
}

type LoadState = 'loading' | 'error' | 'db-offline' | 'done';

export default function MasonryGrid({ isAdmin: propIsAdmin }: MasonryGridProps) {
  const { data: session } = useSession();
  const isAdmin = propIsAdmin || session?.user?.role === 'ADMIN';

  const [posts, setPosts] = useState<PostWithCommentCount[]>([]);
  const [state, setState] = useState<LoadState>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [activePost, setActivePost] = useState<PostWithCommentCount | null>(null);

  const fetchPosts = useCallback(async () => {
    setState('loading');
    setErrorMsg('');

    const controller = new AbortController();
    // 10s timeout (generous for mobile + Supabase EU latency)
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const res = await fetch('/api/posts?limit=50', {
        signal: controller.signal,
        cache: 'no-store',
      });
      clearTimeout(timeout);

      const json = await res.json();
      if (json.success) {
        setPosts(json.data);
        setState('done');
      } else {
        const msg: string = json.error || '';
        if (msg.includes('reach database') || msg.includes('connect') || !res.ok) {
          setState('db-offline');
        } else {
          setErrorMsg(msg || 'Failed to load.');
          setState('error');
        }
      }
    } catch (err: any) {
      clearTimeout(timeout);
      if (err.name === 'AbortError') {
        setState('db-offline');
      } else {
        setErrorMsg('Network error.');
        setState('error');
      }
    }
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this exhibit permanently?')) return;
    try {
      const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) setPosts(prev => prev.filter(p => p.id !== id));
    } catch { alert('Delete failed.'); }
  };

  const handleCommentAdded = (postId: string) => {
    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, _count: { ...p._count, comments: p._count.comments + 1 } } : p
    ));
  };

  /* ── Loading ── */
  if (state === 'loading') return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: '1.25rem', direction: 'rtl' }}>
      <div style={{ position: 'relative', width: '3.5rem', height: '3.5rem' }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid #1a1a1a' }} />
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid #8B0000', borderTopColor: 'transparent', animation: 'spin 0.9s linear infinite' }} />
        <div style={{ position: 'absolute', inset: '0.5rem', borderRadius: '50%', border: '1px solid #4a0000', borderBottomColor: 'transparent', animation: 'spin 1.4s linear infinite reverse' }} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0, fontFamily: 'var(--font-tajawal), sans-serif' }}>جاري تحميل الأرشيف…</p>
        <p style={{ color: '#333', fontSize: '0.7rem', marginTop: '0.25rem' }}>جاري الاتصال بـ Supabase</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  /* ── DB Offline ── */
  if (state === 'db-offline') return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      style={{ maxWidth: '32rem', margin: '3rem auto', padding: '2rem', backgroundColor: '#111111', border: '1px solid #2d0000', borderRadius: '1rem', boxShadow: '0 0 40px rgba(139,0,0,0.12)', textAlign: 'center', direction: 'rtl' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '0.875rem' }}>🔌</div>
      <h2 style={{ fontFamily: 'var(--font-tajawal), sans-serif', color: '#e5e7eb', fontSize: '1.125rem', margin: '0 0 0.5rem' }}>تعذّر الوصول لقاعدة البيانات</h2>
      <p style={{ color: '#9ca3af', fontSize: '0.8rem', lineHeight: 1.6, margin: '0 0 1.5rem' }}>
        لا يمكن الاتصال بـ Supabase. تحقّق من <code style={{ backgroundColor: '#1a1a1a', padding: '0 0.3em', borderRadius: '0.25rem', color: '#e57368' }}>DATABASE_URL</code> في ملف <code style={{ backgroundColor: '#1a1a1a', padding: '0 0.3em', borderRadius: '0.25rem', color: '#e57368' }}>.env</code>.
      </p>
      <button onClick={fetchPosts} style={{ backgroundColor: '#8B0000', color: '#fff', border: '1px solid #6b0000', borderRadius: '0.75rem', padding: '0.625rem 1.5rem', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-tajawal), sans-serif' }}>
        ↺ إعادة المحاولة
      </button>
    </motion.div>
  );

  /* ── Error ── */
  if (state === 'error') return (
    <div style={{ textAlign: 'center', padding: '6rem 0', direction: 'rtl' }}>
      <p style={{ color: '#f87171', marginBottom: '0.75rem', fontFamily: 'var(--font-tajawal), sans-serif' }}>⚠ {errorMsg}</p>
      <button onClick={fetchPosts} style={{ color: '#e57368', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.875rem', fontFamily: 'var(--font-tajawal), sans-serif' }}>حاول مرة أخرى</button>
    </div>
  );

  /* ── Empty ── */
  if (posts.length === 0) return (
    <div style={{ textAlign: 'center', padding: '7rem 0', direction: 'rtl' }}>
      <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>📜</div>
      <h2 style={{ fontFamily: 'var(--font-tajawal), sans-serif', color: '#c9d1d9', fontSize: '1.125rem', margin: '0 0 0.375rem' }}>الأرشيف فارغ</h2>
      <p style={{ color: '#6b7280', fontSize: '0.8rem', fontFamily: 'var(--font-tajawal), sans-serif' }}>
        {isAdmin ? 'ارفع أول عرض من لوحة التحكم.' : 'لم يتم إضافة أي عروض حتى الآن.'}
      </p>
    </div>
  );

  /* ── Masonry Grid ── */
  return (
    <>
      <div className="masonry-grid">
        <AnimatePresence>
          {posts.map((post, i) => (
            <PostCard
              key={post.id}
              post={post}
              isAdmin={isAdmin}
              onDelete={handleDelete}
              onOpen={setActivePost}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Lightbox modal */}
      <PostModal
        post={activePost}
        isAdmin={isAdmin}
        onClose={() => setActivePost(null)}
        onCommentAdded={() => activePost && handleCommentAdded(activePost.id)}
        onDelete={(id) => { handleDelete(id); setActivePost(null); }}
      />

      <style>{`
        .masonry-grid {
          column-count: 1;
          column-gap: 0.75rem;
        }
        @media (min-width: 480px)  { .masonry-grid { column-count: 2; } }
        @media (min-width: 768px)  { .masonry-grid { column-count: 3; } }
        @media (min-width: 1024px) { .masonry-grid { column-count: 4; } }
        @media (min-width: 1280px) { .masonry-grid { column-count: 5; } }
      `}</style>
    </>
  );
}

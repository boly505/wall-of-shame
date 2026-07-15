'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import PostComposer from '@/components/social/PostComposer';
import FeedPost from '@/components/social/FeedPost';

export default function HomePage() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch('/api/posts?limit=50');
      if (!res.ok) throw new Error('تعذر جلب المنشورات');
      const json = await res.json();
      if (json.success) {
        setPosts(json.data);
      } else {
        setError(json.error || 'حدث خطأ ما');
      }
    } catch (err: any) {
      setError(err.message || 'خطأ في الاتصال بالشبكة');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handlePostAdded = (newPost: any) => {
    // Add the current session user info to the local post state so it displays correctly immediately
    const authorInfo = {
      id: session?.user?.id || '',
      name: session?.user?.name || '',
      username: session?.user?.username || '',
      avatar: session?.user?.avatar || null,
      isVerified: session?.user?.isVerified || false,
      frameType: session?.user?.frameType || 'none',
      role: session?.user?.role || 'USER',
    };
    const enrichedPost = {
      ...newPost,
      author: authorInfo,
      _count: { likes: 0, comments: 0 }
    };
    setPosts((prev) => [enrichedPost, ...prev]);
  };

  const handlePostDeleted = (id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div style={{ maxWidth: '38rem', margin: '0 auto', padding: '2rem 1rem' }}>
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div style={{ height: '1px', width: '4rem', background: 'linear-gradient(to right, transparent, #8B0000)' }} />
          <span style={{ color: '#8B0000', fontSize: '1.25rem' }}>🛡️</span>
          <div style={{ height: '1px', width: '4rem', background: 'linear-gradient(to left, transparent, #8B0000)' }} />
        </div>
        <h1 style={{ fontFamily: 'var(--font-tajawal), sans-serif', fontSize: '2.25rem', fontWeight: 900, color: '#e5e7eb', margin: '0 0 0.25rem' }}>الأرشيف الاجتماعي</h1>
        <p style={{ color: '#9ca3af', fontSize: '0.85rem', fontFamily: 'var(--font-tajawal), sans-serif', margin: 0 }}>مساحة حرة لمشاركة المنشورات والتواصل الخاص في سرية تامة.</p>
      </div>

      {/* Composer */}
      {session && <PostComposer onPost={handlePostAdded} />}

      {/* Loading state */}
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
          <span style={{ display: 'inline-block', width: '1.75rem', height: '1.75rem', border: '3px solid rgba(255,255,255,0.2)', borderTopColor: '#8B0000', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      )}

      {/* Error state */}
      {error && (
        <div style={{ textAlign: 'center', padding: '2rem 0', color: '#fca5a5', fontFamily: 'var(--font-tajawal), sans-serif' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Empty feed */}
      {!loading && !error && posts.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: '#6b7280', fontFamily: 'var(--font-tajawal), sans-serif' }}>
          <p style={{ fontSize: '1.1rem', margin: 0 }}>لا توجد منشورات في الأرشيف بعد.</p>
          <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>اكتب أول منشور وشاركه الآن!</p>
        </div>
      )}

      {/* Feed list */}
      {!loading && posts.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {posts.map((post) => (
            <FeedPost
              key={post.id}
              post={post}
              onDelete={handlePostDeleted}
            />
          ))}
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

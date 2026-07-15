'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import UserAvatar from './UserAvatar';

interface PostAuthor {
  id: string;
  name: string;
  username: string | null;
  avatar: string | null;
  isVerified: boolean;
  frameType: string;
  role: string;
}

interface FeedPostProps {
  post: {
    id: string;
    content: string | null;
    imageUrl: string | null;
    caption: string | null;
    createdAt: string;
    author: PostAuthor | null;
    _count?: { likes: number; comments: number };
    isLiked?: boolean;
  };
  onDelete?: (id: string) => void;
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return 'الآن';
  if (diff < 3600) return `منذ ${Math.floor(diff / 60)} د`;
  if (diff < 86400) return `منذ ${Math.floor(diff / 3600)} س`;
  return `منذ ${Math.floor(diff / 86400)} يوم`;
}

export default function FeedPost({ post, onDelete }: FeedPostProps) {
  const { data: session } = useSession();
  const [liked, setLiked] = useState(post.isLiked || false);
  const [likeCount, setLikeCount] = useState(post._count?.likes || 0);
  const [likeLoading, setLikeLoading] = useState(false);
  const [imgOpen, setImgOpen] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const isAdmin = session?.user?.role === 'ADMIN';
  const isOwner = session?.user?.id === post.author?.id;
  const canDelete = isAdmin || isOwner;

  const handleLike = async () => {
    if (!session || likeLoading) return;
    setLikeLoading(true);
    const prev = liked;
    setLiked(!liked);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
    try {
      const res = await fetch(`/api/posts/${post.id}/like`, { method: 'POST' });
      if (!res.ok) {
        setLiked(prev);
        setLikeCount((c) => (prev ? c + 1 : c - 1));
      }
    } catch {
      setLiked(prev);
      setLikeCount((c) => (prev ? c + 1 : c - 1));
    }
    setLikeLoading(false);
  };

  const handleDelete = async () => {
    if (!canDelete) return;
    try {
      await fetch(`/api/posts/${post.id}`, { method: 'DELETE' });
      onDelete?.(post.id);
    } catch {}
    setShowDelete(false);
  };

  return (
    <>
      <article
        style={{
          background: 'linear-gradient(135deg, rgba(26,26,26,0.95) 0%, rgba(20,20,20,0.98) 100%)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '1.25rem',
          overflow: 'hidden',
          transition: 'border-color 0.2s, transform 0.2s',
          position: 'relative',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = 'rgba(139,0,0,0.4)';
          (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)';
          (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.25rem 0.75rem', direction: 'rtl' }}>
          <UserAvatar user={post.author || { name: 'مجهول' }} size={44} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
              {post.author ? (
                <Link
                  href={`/profile/${post.author.username || post.author.id}`}
                  style={{ color: '#e5e7eb', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none', fontFamily: 'var(--font-tajawal), sans-serif' }}
                >
                  {post.author.name}
                </Link>
              ) : (
                <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}>مجهول</span>
              )}
              {post.author?.isVerified && (
                <span title="موثق" style={{ color: '#3b82f6', fontSize: '0.85rem' }}>✓</span>
              )}
              {post.author?.role === 'ADMIN' && (
                <span
                  style={{
                    background: 'linear-gradient(135deg, #8B0000, #ff4444)',
                    color: '#fff',
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: '999px',
                    letterSpacing: '0.05em',
                    fontFamily: 'var(--font-tajawal), sans-serif',
                  }}
                >
                  أدمن
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {post.author?.username && (
                <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>@{post.author.username}</span>
              )}
              <span style={{ color: '#4b5563', fontSize: '0.7rem' }}>·</span>
              <span style={{ color: '#4b5563', fontSize: '0.75rem' }}>{timeAgo(post.createdAt)}</span>
            </div>
          </div>

          {/* Delete button */}
          {canDelete && (
            <button
              onClick={() => setShowDelete(true)}
              style={{ background: 'none', border: 'none', color: '#4b5563', cursor: 'pointer', fontSize: '1.1rem', padding: '0.25rem', borderRadius: '50%', transition: 'color 0.15s' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#4b5563')}
              title="حذف"
            >
              ×
            </button>
          )}
        </div>

        {/* Content */}
        {post.content && (
          <div style={{ padding: '0 1.25rem 0.875rem', direction: 'rtl' }}>
            <p style={{ color: '#d1d5db', fontSize: '0.95rem', lineHeight: 1.65, margin: 0, fontFamily: 'var(--font-tajawal), sans-serif', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {post.content}
            </p>
          </div>
        )}

        {/* Image */}
        {post.imageUrl && (
          <div
            style={{ cursor: 'zoom-in', overflow: 'hidden', maxHeight: '520px' }}
            onClick={() => setImgOpen(true)}
          >
            <img
              src={post.imageUrl}
              alt={post.caption || 'صورة'}
              style={{ width: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.3s' }}
              onMouseEnter={(e) => ((e.target as HTMLImageElement).style.transform = 'scale(1.02)')}
              onMouseLeave={(e) => ((e.target as HTMLImageElement).style.transform = 'scale(1)')}
            />
            {post.caption && (
              <div style={{ padding: '0.625rem 1.25rem', color: '#9ca3af', fontSize: '0.8rem', direction: 'rtl', fontFamily: 'var(--font-tajawal), sans-serif' }}>
                {post.caption}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
            padding: '0.625rem 1.25rem 0.875rem',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            direction: 'rtl',
          }}
        >
          {/* Like */}
          <button
            onClick={handleLike}
            disabled={!session}
            style={{
              background: 'none',
              border: 'none',
              cursor: session ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: liked ? '#ef4444' : '#6b7280',
              fontSize: '0.85rem',
              padding: '0.25rem 0.5rem',
              borderRadius: '0.5rem',
              transition: 'all 0.15s',
              fontFamily: 'var(--font-tajawal), sans-serif',
            }}
            onMouseEnter={(e) => session && ((e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(239,68,68,0.1)')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = 'transparent')}
          >
            <span style={{ fontSize: '1.05rem' }}>{liked ? '❤️' : '🤍'}</span>
            <span>{likeCount}</span>
          </button>

          {/* Comments */}
          <Link
            href={`/posts/${post.id}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: '#6b7280',
              fontSize: '0.85rem',
              textDecoration: 'none',
              padding: '0.25rem 0.5rem',
              borderRadius: '0.5rem',
              transition: 'all 0.15s',
              fontFamily: 'var(--font-tajawal), sans-serif',
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(59,130,246,0.1)')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = 'transparent')}
          >
            <span style={{ fontSize: '1.05rem' }}>💬</span>
            <span>{post._count?.comments || 0}</span>
          </Link>
        </div>
      </article>

      {/* Image lightbox */}
      {imgOpen && post.imageUrl && (
        <div
          onClick={() => setImgOpen(false)}
          style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.92)',
            zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'zoom-out', padding: '1rem',
          }}
        >
          <img src={post.imageUrl} alt="" style={{ maxWidth: '95vw', maxHeight: '95vh', objectFit: 'contain', borderRadius: '0.75rem' }} />
        </div>
      )}

      {/* Delete confirm modal */}
      {showDelete && (
        <div
          style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)',
            zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={() => setShowDelete(false)}
        >
          <div
            style={{ background: '#1a1a1a', border: '1px solid #3a0000', borderRadius: '1rem', padding: '1.5rem', width: 320, textAlign: 'center' }}
            onClick={(e) => e.stopPropagation()}
          >
            <p style={{ color: '#e5e7eb', marginBottom: '1rem', fontFamily: 'var(--font-tajawal), sans-serif' }}>هل أنت متأكد من حذف هذا البوست؟</p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                onClick={handleDelete}
                style={{ background: '#8B0000', color: '#fff', border: 'none', borderRadius: '0.5rem', padding: '0.5rem 1.25rem', cursor: 'pointer', fontFamily: 'var(--font-tajawal), sans-serif' }}
              >
                حذف
              </button>
              <button
                onClick={() => setShowDelete(false)}
                style={{ background: '#333', color: '#e5e7eb', border: 'none', borderRadius: '0.5rem', padding: '0.5rem 1.25rem', cursor: 'pointer', fontFamily: 'var(--font-tajawal), sans-serif' }}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

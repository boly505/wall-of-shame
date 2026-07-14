'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { PostWithCommentCount } from '@/lib/types';
import { timeAgo } from '@/lib/utils';

interface PostCardProps {
  post: PostWithCommentCount;
  isAdmin?: boolean;
  onDelete?: (id: string) => void;
  onOpen: (post: PostWithCommentCount) => void;
}

export default function PostCard({ post, isAdmin, onDelete, onOpen }: PostCardProps) {
  const [commentCount, setCommentCount] = useState(post._count.comments);
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      style={{
        position: 'relative',
        marginBottom: '0.75rem',
        borderRadius: '1rem',
        overflow: 'hidden',
        backgroundColor: '#111111',
        border: '1px solid #222222',
        boxShadow: '0 4px 24px rgba(0,0,0,0.6)',
        cursor: 'pointer',
        breakInside: 'avoid',
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = '#4a0000';
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(139,0,0,0.2)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = '#222222';
        e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.6)';
      }}
      onClick={() => onOpen(post)}
    >
      {/* ── Image ── */}
      <div style={{ position: 'relative', overflow: 'hidden', backgroundColor: '#0a0a0a' }}>
        {imgError ? (
          <div style={{
            height: '12rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#4a4a4a',
            fontSize: '0.75rem',
          }}>
            Image unavailable
          </div>
        ) : (
          <img
            src={post.imageUrl}
            alt={post.caption || 'Gallery exhibit'}
            loading="lazy"
            onError={() => setImgError(true)}
            style={{
              width: '100%',
              display: 'block',
              objectFit: 'cover',
              transition: 'transform 0.4s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.04)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          />
        )}

        {/* Tap hint overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%)',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'flex-end',
          padding: '0.625rem',
          opacity: 0,
          transition: 'opacity 0.2s',
        }}
          className="card-overlay"
        >
          <span style={{ fontSize: '0.65rem', padding: '0.25rem 0.5rem', borderRadius: '0.5rem', letterSpacing: '0.02em', backgroundColor: 'rgba(139,0,0,0.8)', color: 'white', fontFamily: 'var(--font-tajawal), sans-serif' }}>
            اضغط للفتح
          </span>
        </div>

        {/* Admin delete */}
        {isAdmin && (
          <button
            onClick={e => { e.stopPropagation(); onDelete?.(post.id); }}
            style={{
              position: 'absolute',
              top: '0.5rem',
              right: '0.5rem',
              width: '2rem',
              height: '2rem',
              backgroundColor: 'rgba(45,0,0,0.9)',
              border: '1px solid #6b0000',
              borderRadius: '50%',
              color: '#fca5a5',
              fontSize: '0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            🗑
          </button>
        )}
      </div>

      {/* ── Card footer ── */}
      <div style={{
        padding: '0.625rem 0.875rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.5rem',
      }}>
        {/* Caption preview */}
        <p style={{
          color: '#9ca3af',
          fontSize: '0.75rem',
          margin: 0,
          flex: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          fontFamily: 'var(--font-tajawal), sans-serif'
        }}>
          {post.caption || <span style={{ color: '#333', fontStyle: 'italic' }}>بدون وصف</span>}
        </p>

        {/* Comments badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          color: '#6b7280',
          fontSize: '0.75rem',
          flexShrink: 0,
        }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span>{commentCount}</span>
        </div>
      </div>

      <style>{`
        .post-card:hover .card-overlay { opacity: 1 !important; }
        @media (hover: none) {
          .card-overlay { opacity: 1 !important; }
        }
      `}</style>
    </motion.div>
  );
}

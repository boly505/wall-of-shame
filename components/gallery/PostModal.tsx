'use client';

import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CommentSection from '@/components/comments/CommentSection';
import { PostWithCommentCount } from '@/lib/types';
import { timeAgo } from '@/lib/utils';

interface PostModalProps {
  post: PostWithCommentCount | null;
  isAdmin?: boolean;
  onClose: () => void;
  onCommentAdded?: () => void;
  onDelete?: (id: string) => void;
}

export default function PostModal({ post, isAdmin, onClose, onCommentAdded, onDelete }: PostModalProps) {
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (!post) return;
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [post, handleKey]);

  return (
    <AnimatePresence>
      {post && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            backgroundColor: 'rgba(0,0,0,0.94)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'flex-end',          /* Mobile: sheet from bottom */
            justifyContent: 'center',
          }}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 340 }}
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '100vw',
              height: '92dvh',
              backgroundColor: '#111111',
              borderRadius: '1.25rem 1.25rem 0 0',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 -8px 60px rgba(139,0,0,0.3)',
            }}
          >
            {/* ── Drag handle (mobile UX) ── */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '0.625rem 0 0', flexShrink: 0 }}>
              <div style={{ width: '2.5rem', height: '0.25rem', backgroundColor: '#333', borderRadius: '9999px' }} />
            </div>

            {/* ── Top bar ── */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.5rem 1rem 0.625rem',
              flexShrink: 0,
              borderBottom: '1px solid #1a1a1a',
            }}>
              <span style={{ color: '#6b7280', fontSize: '0.7rem', letterSpacing: '0.05em' }}>
                {timeAgo(post.createdAt)}
              </span>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {isAdmin && (
                  <button
                    onClick={() => { onDelete?.(post.id); onClose(); }}
                    style={{
                      backgroundColor: '#2d0000',
                      border: '1px solid #6b0000',
                      color: '#fca5a5',
                      borderRadius: '0.5rem',
                      padding: '0.3rem 0.625rem',
                      fontSize: '0.7rem',
                      cursor: 'pointer',
                      fontWeight: 500,
                      fontFamily: 'var(--font-tajawal), sans-serif',
                    }}
                  >
                    🗑 حذف
                  </button>
                )}
                <button
                  onClick={onClose}
                  style={{
                    width: '2rem',
                    height: '2rem',
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #2a2a2a',
                    borderRadius: '50%',
                    color: '#9ca3af',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1rem',
                    flexShrink: 0,
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* ── Image ── */}
            <div style={{
              backgroundColor: '#000',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              maxHeight: '42vh',
              overflow: 'hidden',
            }}>
              <img
                src={post.imageUrl}
                alt={post.caption || 'Exhibit'}
                style={{
                  maxWidth: '100%',
                  maxHeight: '42vh',
                  objectFit: 'contain',
                  display: 'block',
                }}
              />
            </div>

            {/* ── Caption ── */}
            {post.caption && (
              <div style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#0d0d0d',
                borderBottom: '1px solid #1a1a1a',
                flexShrink: 0,
              }}>
                <p style={{ color: '#b0b8c1', fontSize: '0.8rem', margin: 0, lineHeight: 1.5 }}>
                  {post.caption}
                </p>
              </div>
            )}

            {/* ── Comments (scrollable) ── */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              overflowX: 'hidden',
              backgroundColor: '#0a0a0a',
              WebkitOverflowScrolling: 'touch',
              /* Smooth scrolling on iOS */
            }}>
              <CommentSection
                postId={post.id}
                isAdmin={isAdmin}
                onCommentAdded={onCommentAdded}
              />
            </div>
          </motion.div>

          {/* Desktop: center card layout */}
          <style>{`
            @media (min-width: 768px) {
              .modal-sheet {
                border-radius: 1.25rem !important;
                max-width: 56rem !important;
                height: 88dvh !important;
                margin-bottom: 3rem !important;
              }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

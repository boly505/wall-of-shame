'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import CommentItem from './CommentItem';
import Button from '@/components/ui/Button';
import { CommentWithDetails } from '@/lib/types';

interface CommentSectionProps {
  postId: string;
  isAdmin?: boolean;
  onCommentAdded?: () => void;
}

export default function CommentSection({ postId, isAdmin, onCommentAdded }: CommentSectionProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<CommentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/comments?postId=${postId}`);
      const json = await res.json();
      if (json.success) setComments(json.data);
    } catch {
      /* silently fail */
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) { setError('Sign in to comment.'); return; }
    if (!content.trim()) { setError('Comment cannot be empty.'); return; }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, content: content.trim() }),
      });
      const json = await res.json();

      if (json.success) {
        setComments((prev) => [...prev, json.data]);
        setContent('');
        onCommentAdded?.();
      } else {
        setError(json.error || 'Failed to post comment.');
      }
    } catch {
      setError('Network error. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = (commentId: string) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  const handleReplyAdded = (commentId: string, reply: any) => {
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId ? { ...c, replies: [...c.replies, reply] } : c
      )
    );
  };

  return (
    <div className="p-4 bg-obsidian-900">
      {/* Comment form */}
      {session ? (
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="flex gap-2">
            {/* Avatar */}
            <div className="w-7 h-7 rounded-full bg-crimson-900 border border-crimson-700 flex items-center justify-center flex-shrink-0">
              <span className="text-crimson-300 text-xs font-bold">
                {session.user.name?.[0]?.toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Add your testimony to the record…"
                rows={2}
                className="w-full bg-obsidian-700 border border-obsidian-500 focus:border-crimson-700 text-silver-700 text-sm rounded-lg px-3 py-2 resize-none outline-none transition-colors placeholder:text-obsidian-500"
                maxLength={500}
              />
              {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
              <div className="flex items-center justify-between mt-2">
                <span className="text-obsidian-500 text-xs">{content.length}/500</span>
                <Button type="submit" size="sm" loading={submitting} disabled={!content.trim()}>
                  Post
                </Button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-4 p-3 rounded-lg bg-obsidian-800 border border-obsidian-600 text-center">
          <p className="text-silver-900 text-xs">
            <a href="/auth/signin" className="text-crimson-400 hover:underline">Sign in</a>{' '}
            to join the discussion.
          </p>
        </div>
      )}

      {/* Comments list */}
      {loading ? (
        <div className="flex justify-center py-4">
          <div className="w-5 h-5 border-2 border-crimson-700 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-obsidian-500 text-xs text-center py-4 italic">
          No testimonies yet. Be the first to speak.
        </p>
      ) : (
        <div className="space-y-1">
          <AnimatePresence>
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                isAdmin={isAdmin}
                currentUserId={session?.user.id}
                onDeleted={handleDeleteComment}
                onReplyAdded={handleReplyAdded}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

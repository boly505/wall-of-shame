'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StatusBadge from '@/components/StatusBadge';
import ReplyItem from './ReplyItem';
import Button from '@/components/ui/Button';
import { CommentWithDetails } from '@/lib/types';
import { timeAgo } from '@/lib/utils';

interface CommentItemProps {
  comment: CommentWithDetails;
  isAdmin?: boolean;
  currentUserId?: string;
  onDeleted: (id: string) => void;
  onReplyAdded: (commentId: string, reply: any) => void;
}

export default function CommentItem({
  comment,
  isAdmin,
  currentUserId,
  onDeleted,
  onReplyAdded,
}: CommentItemProps) {
  const [liked, setLiked] = useState(
    currentUserId ? comment.likes.some((l) => l.userId === currentUserId) : false
  );
  const [likeCount, setLikeCount] = useState(comment._count.likes);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [flagReason, setFlagReason] = useState('');
  const [flagging, setFlagging] = useState(false);

  const handleLike = async () => {
    if (!currentUserId) return;
    const prevLiked = liked;
    const prevCount = likeCount;
    setLiked(!prevLiked);
    setLikeCount(prevLiked ? likeCount - 1 : likeCount + 1);

    try {
      const res = await fetch(`/api/comments/${comment.id}/like`, { method: 'POST' });
      const json = await res.json();
      if (!json.success) {
        setLiked(prevLiked);
        setLikeCount(prevCount);
      }
    } catch {
      setLiked(prevLiked);
      setLikeCount(prevCount);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this comment?')) return;
    try {
      const res = await fetch(`/api/comments/${comment.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) onDeleted(comment.id);
    } catch {
      alert('Delete failed.');
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    setReplySubmitting(true);
    try {
      const res = await fetch(`/api/comments/${comment.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyContent.trim() }),
      });
      const json = await res.json();
      if (json.success) {
        onReplyAdded(comment.id, json.data);
        setReplyContent('');
        setShowReplyForm(false);
        setShowReplies(true);
      }
    } catch {
      /* silently fail */
    } finally {
      setReplySubmitting(false);
    }
  };

  const handleFlag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flagReason.trim()) return;
    setFlagging(true);
    try {
      await fetch(`/api/admin/users/${comment.userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'flag', reason: flagReason }),
      });
      setShowFlagModal(false);
      setFlagReason('');
    } catch {
      /* silently */
    } finally {
      setFlagging(false);
    }
  };

  const isAdminUser = comment.user.role === 'ADMIN';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className="py-2"
    >
      <div className="flex gap-2.5">
        {/* Avatar */}
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${
            isAdminUser
              ? 'bg-crimson-800 border border-crimson-600 text-crimson-200'
              : 'bg-obsidian-600 border border-obsidian-500 text-silver-900'
          }`}
        >
          {comment.user.name[0]?.toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-xs font-semibold ${
                isAdminUser ? 'text-crimson-400' : 'text-silver-700'
              }`}
            >
              {comment.user.name}
            </span>
            <StatusBadge statusLevel={comment.user.statusLevel} size="sm" />
            <span className="text-obsidian-500 text-[10px]">{timeAgo(comment.timestamp)}</span>
          </div>

          {/* Content */}
          <p className="text-silver-900 text-xs leading-relaxed mt-1 break-words">
            {comment.content}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-1.5">
            {/* Like */}
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 text-[10px] transition-colors ${
                liked ? 'text-crimson-400' : 'text-obsidian-500 hover:text-silver-900'
              }`}
            >
              <svg className="w-3 h-3" fill={liked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {likeCount > 0 && <span>{likeCount}</span>}
            </button>

            {/* Reply */}
            {currentUserId && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="text-[10px] text-obsidian-500 hover:text-silver-900 transition-colors"
              >
                Reply
              </button>
            )}

            {/* Show replies */}
            {comment.replies.length > 0 && (
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="text-[10px] text-crimson-700 hover:text-crimson-400 transition-colors"
              >
                {showReplies ? 'Hide' : `${comment.replies.length} repl${comment.replies.length === 1 ? 'y' : 'ies'}`}
              </button>
            )}

            {/* Admin actions */}
            {isAdmin && (
              <>
                <button
                  onClick={() => setShowFlagModal(true)}
                  className="text-[10px] text-yellow-700 hover:text-yellow-500 transition-colors"
                >
                  Flag User
                </button>
                <button
                  onClick={handleDelete}
                  className="text-[10px] text-red-800 hover:text-red-500 transition-colors"
                >
                  Delete
                </button>
              </>
            )}
          </div>

          {/* Reply form */}
          <AnimatePresence>
            {showReplyForm && (
              <motion.form
                onSubmit={handleReply}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-2 overflow-hidden"
              >
                <div className="flex gap-2">
                  <input
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Your reply…"
                    className="flex-1 bg-obsidian-700 border border-obsidian-500 focus:border-crimson-700 text-silver-700 text-xs rounded-lg px-2 py-1.5 outline-none transition-colors placeholder:text-obsidian-500"
                    maxLength={300}
                  />
                  <Button type="submit" size="sm" loading={replySubmitting} disabled={!replyContent.trim()}>
                    Reply
                  </Button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Replies */}
          <AnimatePresence>
            {showReplies && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-2 pl-3 border-l border-crimson-900 space-y-1 overflow-hidden"
              >
                {comment.replies.map((reply) => (
                  <ReplyItem key={reply.id} reply={reply} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Flag User Modal */}
      <AnimatePresence>
        {showFlagModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-obsidian-800 border border-crimson-800 rounded-2xl p-6 w-full max-w-sm shadow-crimson-lg"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <h3 className="text-silver-500 font-semibold mb-1">Flag User</h3>
              <p className="text-silver-900 text-xs mb-4">Flagging: <strong>{comment.user.name}</strong></p>
              <form onSubmit={handleFlag}>
                <textarea
                  value={flagReason}
                  onChange={(e) => setFlagReason(e.target.value)}
                  placeholder="Reason for flagging…"
                  rows={3}
                  className="w-full bg-obsidian-700 border border-obsidian-500 focus:border-crimson-700 text-silver-700 text-sm rounded-lg px-3 py-2 resize-none outline-none mb-3"
                />
                <div className="flex gap-2">
                  <Button type="submit" variant="danger" size="sm" loading={flagging} className="flex-1">
                    Flag
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setShowFlagModal(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

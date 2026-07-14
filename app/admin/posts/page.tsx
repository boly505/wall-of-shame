'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import { PostWithCommentCount } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<PostWithCommentCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCaption, setEditCaption] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/posts?limit=100')
      .then((r) => r.json())
      .then((j) => j.success && setPosts(j.data))
      .finally(() => setLoading(false));
  }, []);

  const startEdit = (post: PostWithCommentCount) => {
    setEditingId(post.id);
    setEditCaption(post.caption || '');
  };

  const saveCaption = async (id: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caption: editCaption }),
      });
      const json = await res.json();
      if (json.success) {
        setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, caption: editCaption } : p)));
        setEditingId(null);
      }
    } finally {
      setSaving(false);
    }
  };

  const deletePost = async (id: string) => {
    if (!confirm('Delete this post permanently?')) return;
    const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (json.success) setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-crimson-700 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-silver-500 tracking-wider mb-1">
          Posts Manager
        </h1>
        <p className="text-silver-900 text-sm">{posts.length} exhibits in the Archive</p>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-20 text-silver-900">No posts yet.</div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <motion.div
              key={post.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card flex gap-4 p-4"
            >
              {/* Thumbnail */}
              <img
                src={post.imageUrl}
                alt=""
                className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
              />

              {/* Content */}
              <div className="flex-1 min-w-0">
                {editingId === post.id ? (
                  <div className="flex gap-2">
                    <input
                      value={editCaption}
                      onChange={(e) => setEditCaption(e.target.value)}
                      className="flex-1 bg-obsidian-700 border border-obsidian-500 focus:border-crimson-700 text-silver-700 rounded-lg px-3 py-1.5 text-sm outline-none"
                      autoFocus
                    />
                    <Button size="sm" onClick={() => saveCaption(post.id)} loading={saving}>Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                  </div>
                ) : (
                  <p className="text-silver-800 text-sm truncate">{post.caption || <span className="text-obsidian-500 italic">No caption</span>}</p>
                )}
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-obsidian-500 text-xs">{formatDate(post.createdAt)}</span>
                  <span className="text-obsidian-500 text-xs">💬 {post._count.comments}</span>
                  <span className="text-obsidian-500 text-[10px] font-mono">{post.id.slice(0, 8)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-1 flex-shrink-0">
                <Button size="sm" variant="outline" onClick={() => startEdit(post)}>Edit</Button>
                <Button size="sm" variant="danger" onClick={() => deletePost(post.id)}>Delete</Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

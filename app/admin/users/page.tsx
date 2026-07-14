'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/StatusBadge';
import Badge from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  statusLevel: number;
  isBanned: boolean;
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

  useEffect(() => {
    fetch('/api/admin/users')
      .then((r) => r.json())
      .then((j) => j.success && setUsers(j.data))
      .finally(() => setLoading(false));
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
        if (actionModal.action === 'ban') {
          setUsers((prev) => prev.map((u) => u.id === actionModal.userId ? { ...u, isBanned: true } : u));
        } else if (actionModal.action === 'timeout') {
          setUsers((prev) =>
            prev.map((u) =>
              u.id === actionModal.userId
                ? { ...u, timeoutUntil: new Date(Date.now() + timeoutHours * 3600000).toISOString() }
                : u
            )
          );
        }
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
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, isBanned: false, timeoutUntil: null } : u));
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-crimson-700 border-t-transparent rounded-full animate-spin" /></div>;
  }

  const actionLabels = {
    ban: { title: 'Ban User', color: 'bg-red-700', desc: 'This will permanently ban the user from the platform.' },
    timeout: { title: 'Timeout User', color: 'bg-yellow-700', desc: 'User will be temporarily restricted from posting.' },
    flag: { title: 'Flag User', color: 'bg-orange-700', desc: 'A warning flag will be added to the moderation log.' },
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-bold text-silver-500 tracking-wider mb-1">
            User Roster
          </h1>
          <p className="text-silver-900 text-sm">{users.length} members in the Archive</p>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users…"
          className="bg-obsidian-700 border border-obsidian-500 focus:border-crimson-700 text-silver-700 rounded-xl px-4 py-2 text-sm outline-none w-64 transition-colors"
        />
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-obsidian-600">
                {['User', 'Status', 'Level', 'Comments', 'Flags', 'Joined', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs text-silver-900 uppercase tracking-wider font-medium">
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
                    className="border-b border-obsidian-700 hover:bg-obsidian-700/40 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-silver-700 font-medium">{user.name}</p>
                        <p className="text-obsidian-500 text-xs">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {user.isBanned ? (
                        <Badge variant="red">Banned</Badge>
                      ) : inTimeout ? (
                        <Badge variant="yellow">Timeout</Badge>
                      ) : user.role === 'ADMIN' ? (
                        <Badge variant="crimson">Admin</Badge>
                      ) : (
                        <Badge variant="green">Active</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge statusLevel={user.statusLevel} size="sm" showLevel />
                    </td>
                    <td className="px-4 py-3 text-silver-900 text-xs">{user._count.comments}</td>
                    <td className="px-4 py-3">
                      <span className={user._count.flags > 0 ? 'text-yellow-400 text-xs font-semibold' : 'text-obsidian-500 text-xs'}>
                        {user._count.flags}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-obsidian-500 text-xs whitespace-nowrap">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      {user.role !== 'ADMIN' && (
                        <div className="flex gap-1 flex-wrap">
                          {user.isBanned ? (
                            <Button size="sm" variant="outline" onClick={() => unban(user.id)}>
                              Unban
                            </Button>
                          ) : (
                            <>
                              <Button size="sm" variant="ghost" onClick={() => setActionModal({ userId: user.id, userName: user.name, action: 'flag' })}>
                                Flag
                              </Button>
                              <Button size="sm" variant="secondary" onClick={() => setActionModal({ userId: user.id, userName: user.name, action: 'timeout' })}>
                                Timeout
                              </Button>
                              <Button size="sm" variant="danger" onClick={() => setActionModal({ userId: user.id, userName: user.name, action: 'ban' })}>
                                Ban
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-obsidian-800 border border-crimson-800 rounded-2xl p-6 w-full max-w-md shadow-crimson-lg"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9 }}
            >
              <h3 className="text-silver-500 font-semibold font-display mb-1">
                {actionLabels[actionModal.action].title}
              </h3>
              <p className="text-silver-900 text-xs mb-1">
                Target: <strong className="text-crimson-400">{actionModal.userName}</strong>
              </p>
              <p className="text-silver-900 text-xs mb-4 italic">
                {actionLabels[actionModal.action].desc}
              </p>

              {actionModal.action === 'timeout' && (
                <div className="mb-4">
                  <label className="block text-silver-900 text-xs uppercase tracking-wider mb-1.5">Duration (hours)</label>
                  <input
                    type="number"
                    value={timeoutHours}
                    onChange={(e) => setTimeoutHours(Number(e.target.value))}
                    min={1}
                    max={720}
                    className="w-full bg-obsidian-700 border border-obsidian-500 text-silver-700 rounded-lg px-3 py-2 text-sm outline-none"
                  />
                </div>
              )}

              <div className="mb-4">
                <label className="block text-silver-900 text-xs uppercase tracking-wider mb-1.5">Reason</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="State your reason…"
                  rows={3}
                  className="w-full bg-obsidian-700 border border-obsidian-500 focus:border-crimson-700 text-silver-700 rounded-lg px-3 py-2 text-sm outline-none resize-none"
                />
              </div>

              <div className="flex gap-2">
                <Button variant="danger" className="flex-1" onClick={runAction} loading={actioning}>
                  Confirm {actionModal.action.charAt(0).toUpperCase() + actionModal.action.slice(1)}
                </Button>
                <Button variant="ghost" className="flex-1" onClick={() => setActionModal(null)}>
                  Cancel
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Badge from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';

type FlagRow = {
  id: string;
  userId: string;
  reason: string;
  flaggedBy: string;
  severity: string;
  createdAt: string;
  user: { id: string; name: string; email: string };
};

const severityVariant: Record<string, 'yellow' | 'red' | 'crimson'> = {
  WARNING: 'yellow',
  TIMEOUT: 'crimson',
  BAN: 'red',
};

export default function AdminModLogPage() {
  const [flags, setFlags] = useState<FlagRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'WARNING' | 'TIMEOUT' | 'BAN'>('ALL');

  useEffect(() => {
    fetch('/api/admin/flags')
      .then((r) => r.json())
      .then((j) => j.success && setFlags(j.data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'ALL' ? flags : flags.filter((f) => f.severity === filter);

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-crimson-700 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-silver-500 tracking-wider mb-1">
          Moderation Log
        </h1>
        <p className="text-silver-900 text-sm">A permanent record of all admin enforcement actions.</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(['ALL', 'WARNING', 'TIMEOUT', 'BAN'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-1.5 rounded-full text-xs border transition-colors ${
              filter === tab
                ? 'bg-crimson-950 border-crimson-700 text-crimson-300'
                : 'bg-obsidian-700 border-obsidian-500 text-silver-900 hover:border-obsidian-400'
            }`}
          >
            {tab}
            <span className="ml-1.5 opacity-60">
              {tab === 'ALL' ? flags.length : flags.filter((f) => f.severity === tab).length}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-silver-900">No records found.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((flag, i) => (
            <motion.div
              key={flag.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="glass-card p-4 flex gap-4 items-start"
            >
              {/* Severity indicator */}
              <div
                className={`w-1 self-stretch rounded-full flex-shrink-0 ${
                  flag.severity === 'BAN'
                    ? 'bg-red-700'
                    : flag.severity === 'TIMEOUT'
                    ? 'bg-yellow-700'
                    : 'bg-orange-800'
                }`}
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <Badge variant={severityVariant[flag.severity] ?? 'gray'}>{flag.severity}</Badge>
                  <span className="text-silver-700 text-sm font-semibold">{flag.user.name}</span>
                  <span className="text-obsidian-500 text-xs">{flag.user.email}</span>
                </div>
                <p className="text-silver-900 text-xs leading-relaxed mb-2">"{flag.reason}"</p>
                <div className="flex items-center gap-3">
                  <span className="text-obsidian-500 text-xs">By Admin ID: {flag.flaggedBy.slice(0, 8)}…</span>
                  <span className="text-obsidian-500 text-xs">{formatDate(flag.createdAt)}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

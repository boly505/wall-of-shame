import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';

export const metadata: Metadata = { title: 'Admin Dashboard — Wall of Shame' };

// Opt out of static generation — this page queries the DB at request time
export const dynamic = 'force-dynamic';

async function getStats() {
  const [totalPosts, totalUsers, totalComments, totalFlags, bannedUsers] = await Promise.all([
    prisma.post.count(),
    prisma.user.count(),
    prisma.comment.count(),
    prisma.flag.count(),
    prisma.user.count({ where: { isBanned: true } }),
  ]);
  return { totalPosts, totalUsers, totalComments, totalFlags, bannedUsers };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  const statCards = [
    { label: 'Total Posts', value: stats.totalPosts, icon: '🖼️', color: 'text-crimson-400' },
    { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: 'text-silver-600' },
    { label: 'Comments', value: stats.totalComments, icon: '💬', color: 'text-blue-400' },
    { label: 'Mod Actions', value: stats.totalFlags, icon: '🚩', color: 'text-yellow-400' },
    { label: 'Banned Users', value: stats.bannedUsers, icon: '🔨', color: 'text-red-400' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-silver-500 tracking-wider mb-1">
          Command Center
        </h1>
        <p className="text-silver-900 text-sm">Monitor and manage the Archive.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
        {statCards.map((card) => (
          <div key={card.label} className="stat-card">
            <span className="text-2xl">{card.icon}</span>
            <p className={`text-3xl font-bold font-display ${card.color}`}>{card.value}</p>
            <p className="text-silver-900 text-xs">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="glass-card p-6">
        <h2 className="text-silver-600 font-semibold mb-4 text-sm uppercase tracking-wider">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { href: '/admin/upload', label: 'Upload New Exhibit', desc: 'Add media to the Archive' },
            { href: '/admin/users', label: 'Manage Users', desc: 'Ban, timeout, or review users' },
            { href: '/admin/modlog', label: 'Moderation Log', desc: 'Review past admin actions' },
          ].map((action) => (
            <a
              key={action.href}
              href={action.href}
              className="p-4 rounded-xl bg-obsidian-700 hover:bg-obsidian-600 border border-obsidian-500 hover:border-crimson-900 transition-all duration-200 group"
            >
              <p className="text-silver-600 font-medium text-sm group-hover:text-crimson-400 transition-colors">
                {action.label}
              </p>
              <p className="text-silver-900 text-xs mt-1">{action.desc}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

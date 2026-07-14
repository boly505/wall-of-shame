import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const metadata: Metadata = { title: 'Admin Dashboard — Wall of Shame' };

// Opt out of static generation — this page queries the DB at request time
export const dynamic = 'force-dynamic';

async function getStats() {
  try {
    const [totalPosts, totalUsers, totalComments, totalFlags, bannedUsers] = await Promise.all([
      prisma.post.count(),
      prisma.user.count(),
      prisma.comment.count(),
      prisma.flag.count(),
      prisma.user.count({ where: { isBanned: true } }),
    ]);
    return { totalPosts, totalUsers, totalComments, totalFlags, bannedUsers, error: null };
  } catch (err: any) {
    console.error('Error fetching admin stats:', err);
    return { totalPosts: 0, totalUsers: 0, totalComments: 0, totalFlags: 0, bannedUsers: 0, error: err.message || 'Database error' };
  }
}

export default async function AdminDashboard() {
  // Server-side auth check — no Edge Runtime issues
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/auth/signin?callbackUrl=/admin');
  }
  if (session.user.role !== 'ADMIN') {
    redirect('/?error=unauthorized');
  }

  const stats = await getStats();

  const statCards = [
    { label: 'إجمالي المنشورات', value: stats.totalPosts, icon: '🖼️', color: 'text-crimson-400' },
    { label: 'إجمالي المستخدمين', value: stats.totalUsers, icon: '👥', color: 'text-silver-600' },
    { label: 'التعليقات', value: stats.totalComments, icon: '💬', color: 'text-blue-400' },
    { label: 'إجراءات الإشراف', value: stats.totalFlags, icon: '🚩', color: 'text-yellow-400' },
    { label: 'المحظورون', value: stats.bannedUsers, icon: '🔨', color: 'text-red-400' },
  ];

  return (
    <div style={{ direction: 'rtl' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-tajawal), sans-serif', fontSize: '1.5rem', fontWeight: 900, color: '#e5e7eb', margin: '0 0 0.25rem' }}>
          مركز التحكم
        </h1>
        <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: 0 }}>مراقبة وإدارة الأرشيف.</p>
      </div>

      {stats.error && (
        <div style={{ backgroundColor: '#2d0000', border: '1px solid #6b0000', color: '#fca5a5', padding: '1rem', borderRadius: '0.75rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          ⚠️ <strong>خطأ في قاعدة البيانات:</strong> {stats.error} (يرجى التحقق من متغيرات البيئة ورابط الاتصال في Vercel).
        </div>
      )}

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
        {statCards.map((card) => (
          <div key={card.label} className="stat-card" style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '1.5rem' }}>{card.icon}</span>
            <p style={{ fontSize: '1.75rem', fontWeight: 900, color: '#e5e7eb', margin: '0.25rem 0' }}>{card.value}</p>
            <p style={{ color: '#9ca3af', fontSize: '0.75rem', margin: 0 }}>{card.label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h2 style={{ color: '#e5e7eb', fontWeight: 700, fontSize: '0.9rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          إجراءات سريعة
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {[
            { href: '/admin/upload', label: 'رفع عرض جديد', desc: 'إضافة وسائط صور وفيديو إلى الأرشيف' },
            { href: '/admin/users', label: 'إدارة المستخدمين', desc: 'حظر، إيقاف مؤقت، أو مراجعة الأعضاء' },
            { href: '/admin/modlog', label: 'سجل الإشراف', desc: 'مراجعة جميع الإجراءات الرقابية السابقة' },
          ].map((action) => (
            <a
              key={action.href}
              href={action.href}
              style={{
                display: 'block',
                padding: '1rem',
                borderRadius: '0.75rem',
                backgroundColor: '#1a1a1a',
                border: '1px solid #2a2a2a',
                textDecoration: 'none',
                transition: 'border-color 0.2s, background-color 0.2s',
              }}
            >
              <p style={{ color: '#e57368', fontWeight: 700, fontSize: '0.875rem', margin: '0 0 0.25rem' }}>
                {action.label}
              </p>
              <p style={{ color: '#9ca3af', fontSize: '0.75rem', margin: 0 }}>{action.desc}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

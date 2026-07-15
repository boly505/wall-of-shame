'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { getStatusTier } from '@/lib/statusLevel';
import UserAvatar from './social/UserAvatar';

export default function Navbar() {
  const { data: session, status } = useSession();
  const tier = session ? getStatusTier(session.user.statusLevel ?? 0) : null;

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 40,
      borderBottom: '1px solid #1a1a1a',
      backgroundColor: 'rgba(8,8,8,0.94)',
      backdropFilter: 'blur(16px)',
    }}>
      <nav style={{
        maxWidth: '80rem', margin: '0 auto',
        padding: '0 1.25rem', height: '3.75rem',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', direction: 'rtl',
      }}>

        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none' }}>
          <img
            src="/logo.png"
            alt="جدار العار"
            width={42}
            height={42}
            style={{
              width: '2.75rem',
              height: '2.75rem',
              objectFit: 'contain',
              borderRadius: '0.5rem',
              flexShrink: 0,
              filter: 'drop-shadow(0 0 8px rgba(200,160,60,0.5))',
            }}
          />
          <span style={{
            fontFamily: 'var(--font-tajawal), sans-serif',
            fontWeight: 900, color: '#e5e7eb',
            fontSize: '1rem', letterSpacing: '0.02em',
          }}>
            جدار العار
          </span>
        </Link>

        {/* Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <Link href="/" style={{ color: '#9ca3af', fontSize: '0.875rem', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#e5e7eb')}
            onMouseLeave={e => (e.currentTarget.style.color = '#9ca3af')}>
            الرئيسية
          </Link>
          {session && (
            <Link href="/chat" style={{ color: '#9ca3af', fontSize: '0.875rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#e5e7eb')}
              onMouseLeave={e => (e.currentTarget.style.color = '#9ca3af')}>
              💬 الرسائل
            </Link>
          )}
          {session?.user.role === 'ADMIN' && (
            <Link href="/admin" style={{ color: '#e57368', fontSize: '0.875rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              ⚙ لوحة التحكم
            </Link>
          )}
        </div>

        {/* Profile / Auth Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          {status === 'loading' ? (
            <div style={{ width: '1.5rem', height: '1.5rem', border: '2px solid #8B0000', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
          ) : session ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link href={`/profile/${session.user.username || session.user.id}`} style={{ textDecoration: 'none' }}>
                <UserAvatar user={session.user} size={36} clickable={false} />
              </Link>
              <div style={{ textAlign: 'right' }}>
                <Link href={`/profile/${session.user.username || session.user.id}`} style={{ color: '#e5e7eb', fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.2, textDecoration: 'none' }}>
                  {session.user.name}
                </Link>
                <div>
                  <div style={{
                    display: 'inline-block',
                    backgroundColor: '#2d0000', border: '1px solid #4a0000',
                    color: tier?.color || '#e57368',
                    fontSize: '0.55rem', padding: '0.05rem 0.4rem',
                    borderRadius: '9999px', fontWeight: 600,
                  }}>
                    {tier?.title}
                  </div>
                </div>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                style={{
                  background: 'none', border: '1px solid #2a2a2a',
                  color: '#9ca3af', padding: '0.375rem 0.75rem',
                  borderRadius: '0.5rem', fontSize: '0.8rem',
                  cursor: 'pointer', transition: 'all 0.2s',
                  fontFamily: 'var(--font-tajawal), sans-serif',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#fca5a5'; e.currentTarget.style.borderColor = '#6b0000'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.borderColor = '#2a2a2a'; }}
              >
                خروج
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link href="/auth/signin" style={{
                color: '#9ca3af', fontSize: '0.875rem', textDecoration: 'none',
                padding: '0.375rem 0.75rem', border: '1px solid transparent', borderRadius: '0.5rem',
              }}>
                دخول
              </Link>
              <Link href="/auth/register" style={{
                backgroundColor: '#8B0000', color: '#ffffff',
                fontSize: '0.875rem', textDecoration: 'none',
                padding: '0.375rem 0.875rem', borderRadius: '0.5rem',
                border: '1px solid #6b0000', fontWeight: 600,
                fontFamily: 'var(--font-tajawal), sans-serif',
              }}>
                انضم
              </Link>
            </div>
          )}
        </div>
      </nav>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </header>
  );
}

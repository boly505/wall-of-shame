'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface UserAvatarProps {
  user: {
    id?: string;
    name?: string | null;
    username?: string | null;
    avatar?: string | null;
    isVerified?: boolean;
    frameType?: string;
    role?: string;
  };
  size?: number; // px
  showBadge?: boolean;
  clickable?: boolean;
}

const FRAMES: Record<string, React.CSSProperties> = {
  none: {
    border: '2px solid rgba(255,255,255,0.15)',
  },
  gold: {
    border: '2.5px solid transparent',
    backgroundImage: 'linear-gradient(#111, #111), linear-gradient(135deg, #FFD700, #FFA500, #FFD700)',
    backgroundOrigin: 'border-box',
    backgroundClip: 'padding-box, border-box',
    boxShadow: '0 0 12px rgba(255, 200, 0, 0.6), 0 0 4px rgba(255, 165, 0, 0.4)',
  },
  red: {
    border: '2.5px solid transparent',
    backgroundImage: 'linear-gradient(#111, #111), linear-gradient(135deg, #ff0000, #8B0000, #ff4444)',
    backgroundOrigin: 'border-box',
    backgroundClip: 'padding-box, border-box',
    boxShadow: '0 0 12px rgba(220, 0, 0, 0.7), 0 0 4px rgba(139, 0, 0, 0.5)',
  },
  neon: {
    border: '2.5px solid transparent',
    backgroundImage: 'linear-gradient(#111, #111), linear-gradient(135deg, #00ff88, #00bfff, #00ff88)',
    backgroundOrigin: 'border-box',
    backgroundClip: 'padding-box, border-box',
    boxShadow: '0 0 14px rgba(0, 255, 136, 0.6), 0 0 4px rgba(0, 191, 255, 0.4)',
  },
  rainbow: {
    border: '2.5px solid transparent',
    backgroundImage: 'linear-gradient(#111, #111), conic-gradient(from 0deg, #ff0000, #ff7700, #ffff00, #00ff00, #0000ff, #8b00ff, #ff0000)',
    backgroundOrigin: 'border-box',
    backgroundClip: 'padding-box, border-box',
    boxShadow: '0 0 14px rgba(255, 100, 255, 0.5)',
    animation: 'spin-border 3s linear infinite',
  },
  diamond: {
    border: '2.5px solid transparent',
    backgroundImage: 'linear-gradient(#111, #111), linear-gradient(135deg, #e0e0e0, #ffffff, #a8c8e8, #ffffff, #e0e0e0)',
    backgroundOrigin: 'border-box',
    backgroundClip: 'padding-box, border-box',
    boxShadow: '0 0 14px rgba(200, 220, 255, 0.6), 0 0 4px rgba(255,255,255,0.3)',
  },
};

export default function UserAvatar({ user, size = 40, showBadge = true, clickable = true }: UserAvatarProps) {
  const frameType = user.frameType || 'none';
  const frameStyle = FRAMES[frameType] || FRAMES.none;
  const isAdmin = user.role === 'ADMIN';
  const badgeSize = Math.max(14, size * 0.3);

  const initials = (user.name || user.username || '?')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const avatarEl = (
    <div
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {/* Frame / Avatar circle */}
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#1a1a1a',
          position: 'relative',
          flexShrink: 0,
          ...frameStyle,
        }}
      >
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name || 'avatar'}
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
          />
        ) : (
          <span
            style={{
              fontSize: size * 0.38,
              fontWeight: 700,
              color: '#e5e7eb',
              userSelect: 'none',
              fontFamily: 'var(--font-tajawal), sans-serif',
            }}
          >
            {initials}
          </span>
        )}
      </div>

      {/* Verified / Admin badge */}
      {showBadge && (user.isVerified || isAdmin) && (
        <div
          style={{
            position: 'absolute',
            bottom: -1,
            right: -1,
            width: badgeSize,
            height: badgeSize,
            borderRadius: '50%',
            background: isAdmin
              ? 'linear-gradient(135deg, #ff4444, #8B0000)'
              : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1.5px solid #111',
            fontSize: badgeSize * 0.55,
            zIndex: 2,
          }}
          title={isAdmin ? 'مدير النظام' : 'موثق'}
        >
          {isAdmin ? '👑' : '✓'}
        </div>
      )}

      {/* Animated rainbow border keyframes */}
      <style>{`
        @keyframes spin-border {
          to { filter: hue-rotate(360deg); }
        }
      `}</style>
    </div>
  );

  if (clickable && user.username) {
    return (
      <Link href={`/profile/${user.username}`} style={{ textDecoration: 'none' }}>
        {avatarEl}
      </Link>
    );
  }

  return avatarEl;
}

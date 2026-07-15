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
    border: '2px solid rgba(255,255,255,0.1)',
  },
  gold: {
    border: '3px solid transparent',
    background: 'linear-gradient(#1a1a1a, #1a1a1a) padding-box, linear-gradient(135deg, #FFD700, #FFA500, #FFD700) border-box',
    animation: 'pulse-gold 2s infinite alternate',
  },
  red: {
    border: '3px solid transparent',
    background: 'linear-gradient(#1a1a1a, #1a1a1a) padding-box, linear-gradient(135deg, #ff0000, #8B0000, #ff4444) border-box',
    animation: 'pulse-red 2s infinite alternate',
  },
  neon: {
    border: '3px solid transparent',
    background: 'linear-gradient(#1a1a1a, #1a1a1a) padding-box, linear-gradient(135deg, #00ff88, #00bfff, #00ff88) border-box',
    animation: 'pulse-neon 1.5s infinite alternate',
  },
  rainbow: {
    border: '3px solid transparent',
    background: 'linear-gradient(#1a1a1a, #1a1a1a) padding-box, conic-gradient(from 0deg, #ff0000, #ff7700, #ffff00, #00ff00, #0000ff, #8b00ff, #ff0000) border-box',
    animation: 'spin-border 3s linear infinite',
  },
  diamond: {
    border: '3px solid transparent',
    background: 'linear-gradient(#1a1a1a, #1a1a1a) padding-box, linear-gradient(135deg, #00ffff, #0088ff, #ffffff) border-box',
    animation: 'pulse-diamond 2s infinite alternate',
  },
};

export default function UserAvatar({ user, size = 40, showBadge = true, clickable = true }: UserAvatarProps) {
  const frameType = user.frameType || 'none';
  const frameStyle = FRAMES[frameType] || FRAMES.none;
  const isAdmin = user.role === 'ADMIN';
  const badgeSize = Math.max(16, size * 0.35);

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
            bottom: -badgeSize * 0.1,
            right: -badgeSize * 0.1,
            width: badgeSize,
            height: badgeSize,
            borderRadius: '50%',
            background: isAdmin
              ? 'linear-gradient(135deg, #FFD700, #FFA500)'
              : 'linear-gradient(135deg, #00c6ff, #0072ff)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid #1a1a1a',
            boxShadow: isAdmin 
              ? '0 0 12px rgba(255, 215, 0, 0.8)' 
              : '0 0 12px rgba(0, 198, 255, 0.8)',
            zIndex: 2,
          }}
          title={isAdmin ? 'مدير النظام' : 'موثق'}
        >
          {isAdmin ? (
            <svg width={badgeSize * 0.6} height={badgeSize * 0.6} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 17L3.2 9L7 12L12 4L17 12L20.8 9L22 17H2Z" fill="#fff" />
            </svg>
          ) : (
            <svg width={badgeSize * 0.6} height={badgeSize * 0.6} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </div>
      )}

      {/* Global styles for animations */}
      <style>{`
        @keyframes spin-border {
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse-gold {
          0% { box-shadow: 0 0 10px rgba(255, 215, 0, 0.5), inset 0 0 5px rgba(255, 215, 0, 0.3); }
          100% { box-shadow: 0 0 20px rgba(255, 215, 0, 1), inset 0 0 15px rgba(255, 215, 0, 0.6); }
        }
        @keyframes pulse-red {
          0% { box-shadow: 0 0 10px rgba(255, 0, 0, 0.5), inset 0 0 5px rgba(255, 0, 0, 0.3); }
          100% { box-shadow: 0 0 20px rgba(255, 0, 0, 1), inset 0 0 15px rgba(255, 0, 0, 0.6); }
        }
        @keyframes pulse-neon {
          0% { box-shadow: 0 0 10px rgba(0, 255, 136, 0.5), inset 0 0 5px rgba(0, 255, 136, 0.3); }
          100% { box-shadow: 0 0 20px rgba(0, 255, 136, 1), inset 0 0 15px rgba(0, 255, 136, 0.6); }
        }
        @keyframes pulse-diamond {
          0% { box-shadow: 0 0 10px rgba(0, 255, 255, 0.5), inset 0 0 5px rgba(0, 255, 255, 0.3); }
          100% { box-shadow: 0 0 25px rgba(0, 255, 255, 1), inset 0 0 15px rgba(0, 255, 255, 0.6); }
        }
      `}</style>
    </div>
  );

  if (clickable && (user.username || user.id)) {
    return (
      <Link href={`/profile/${user.username || user.id}`} style={{ textDecoration: 'none' }}>
        {avatarEl}
      </Link>
    );
  }

  return avatarEl;
}

'use client';

import React from 'react';
import Link from 'next/link';
import UserAvatar from './UserAvatar';

interface ChatPartner {
  id: string;
  name: string;
  username: string | null;
  avatar: string | null;
  isVerified: boolean;
  frameType: string;
  role: string;
}

interface LastMessage {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  isRead: boolean;
  createdAt: string;
}

interface Conversation {
  partner: ChatPartner;
  lastMessage: LastMessage;
}

interface ChatListProps {
  conversations: Conversation[];
  activePartnerId?: string;
}

export default function ChatList({ conversations, activePartnerId }: ChatListProps) {
  if (conversations.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#6b7280', fontFamily: 'var(--font-tajawal), sans-serif' }}>
        <span style={{ fontSize: '2.5rem' }}>💬</span>
        <p style={{ marginTop: '0.75rem', fontSize: '0.95rem' }}>لا توجد محادثات نشطة بعد.</p>
        <p style={{ fontSize: '0.8rem', color: '#4b5563' }}>ابدأ محادثة بزيارة الملف الشخصي لأحد الأعضاء.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {conversations.map((conv) => {
        const isActive = conv.partner.id === activePartnerId;
        const unread = !conv.lastMessage.isRead && conv.lastMessage.receiverId !== conv.partner.id; // Received and unread

        return (
          <Link
            key={conv.partner.id}
            href={`/chat/${conv.partner.id}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.875rem',
              padding: '0.875rem 1rem',
              borderRadius: '0.75rem',
              backgroundColor: isActive
                ? 'rgba(139, 0, 0, 0.15)'
                : unread
                ? 'rgba(255, 255, 255, 0.03)'
                : 'transparent',
              border: isActive
                ? '1px solid rgba(139, 0, 0, 0.4)'
                : '1px solid transparent',
              textDecoration: 'none',
              transition: 'background-color 0.2s',
              direction: 'rtl',
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = unread ? 'rgba(255, 255, 255, 0.03)' : 'transparent';
              }
            }}
          >
            <UserAvatar user={conv.partner} size={42} clickable={false} />

            <div style={{ flex: 1, minWidth: 0, textAlign: 'right' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span
                  style={{
                    color: '#e5e7eb',
                    fontWeight: unread ? 800 : 600,
                    fontSize: '0.9rem',
                    fontFamily: 'var(--font-tajawal), sans-serif',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {conv.partner.name}
                </span>
                <span style={{ color: '#4b5563', fontSize: '0.7rem' }}>
                  {new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p
                  style={{
                    color: unread ? '#ffffff' : '#9ca3af',
                    fontWeight: unread ? 700 : 400,
                    fontSize: '0.8rem',
                    margin: 0,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    fontFamily: 'var(--font-tajawal), sans-serif',
                  }}
                >
                  {conv.lastMessage.content}
                </p>
                {unread && (
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: '#e57368',
                      flexShrink: 0,
                      marginLeft: '0.5rem',
                    }}
                  />
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

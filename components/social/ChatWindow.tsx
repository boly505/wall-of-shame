'use client';

import React, { useState, useEffect, useRef } from 'react';
import UserAvatar from './UserAvatar';

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  createdAt: string;
  sender: {
    name: string;
    avatar: string | null;
  };
}

interface ChatWindowProps {
  partnerId: string;
  currentUserId: string;
}

export default function ChatWindow({ partnerId, currentUserId }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [partner, setPartner] = useState<any>(null);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages
  const fetchMessages = async (silent = false) => {
    try {
      const res = await fetch(`/api/messages/${partnerId}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setMessages(data.messages);
      if (data.partner) setPartner(data.partner);
    } catch (e) {
      console.error('Failed to load chat messages');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    setLoading(true);
    fetchMessages();
  }, [partnerId]);

  // Polling every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      fetchMessages(true);
    }, 5000);
    return () => clearInterval(timer);
  }, [partnerId]);

  // Auto-scroll to bottom when messages load
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || sending) return;

    const content = inputValue.trim();
    setInputValue('');
    setSending(true);

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId: partnerId, content }),
      });

      if (res.ok) {
        const newMsg = await res.json();
        setMessages((prev) => [...prev, newMsg]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flex: 1, height: '100%', alignItems: 'center', justifyContent: 'center', padding: '3rem' }}>
        <span style={{ display: 'inline-block', width: '1.5rem', height: '1.5rem', border: '3px solid rgba(255,255,255,0.2)', borderTopColor: '#8B0000', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#111111', borderRadius: '1rem', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
      {/* Header */}
      {partner && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', backgroundColor: '#161616', borderBottom: '1px solid rgba(255,255,255,0.06)', direction: 'rtl' }}>
          <UserAvatar user={partner} size={40} />
          <div style={{ textAlign: 'right' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span style={{ color: '#e5e7eb', fontWeight: 700, fontSize: '0.95rem', fontFamily: 'var(--font-tajawal), sans-serif' }}>
                {partner.name}
              </span>
              {partner.isVerified && <span style={{ color: '#3b82f6', fontSize: '0.8rem' }}>✓</span>}
            </div>
            {partner.username && <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>@{partner.username}</span>}
          </div>
        </div>
      )}

      {/* Messages area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '55vh' }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#6b7280', marginTop: '2rem', fontFamily: 'var(--font-tajawal), sans-serif', fontSize: '0.85rem' }}>
            قل مرحباً وابدأ المحادثة! 👋
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentUserId;
            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  justifyContent: isMe ? 'flex-end' : 'flex-start',
                  direction: isMe ? 'ltr' : 'rtl',
                }}
              >
                <div
                  style={{
                    maxWidth: '70%',
                    padding: '0.75rem 1rem',
                    borderRadius: '1rem',
                    borderTopRightRadius: isMe ? '1rem' : 0,
                    borderTopLeftRadius: isMe ? 0 : '1rem',
                    backgroundColor: isMe ? '#8B0000' : '#1e1e1e',
                    border: isMe ? '1px solid #a50000' : '1px solid rgba(255,255,255,0.06)',
                    color: '#e5e7eb',
                    fontSize: '0.9rem',
                    lineHeight: 1.5,
                    fontFamily: 'var(--font-tajawal), sans-serif',
                    wordBreak: 'break-word',
                    textAlign: 'right',
                    direction: 'rtl',
                  }}
                >
                  <p style={{ margin: 0 }}>{msg.content}</p>
                  <span style={{ display: 'block', fontSize: '0.65rem', color: isMe ? 'rgba(255,255,255,0.6)' : '#6b7280', marginTop: '0.25rem', textAlign: 'left' }}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} style={{ padding: '0.75rem 1rem', backgroundColor: '#161616', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '0.5rem', direction: 'rtl' }}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="اكتب رسالتك هنا..."
          style={{
            flex: 1,
            backgroundColor: '#111111',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '0.75rem',
            padding: '0.625rem 1rem',
            color: '#e5e7eb',
            fontSize: '0.9rem',
            outline: 'none',
            fontFamily: 'var(--font-tajawal), sans-serif',
            direction: 'rtl',
            textAlign: 'right',
          }}
          onFocus={(e) => (e.target.style.borderColor = 'rgba(139,0,0,0.5)')}
          onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || sending}
          style={{
            backgroundColor: !inputValue.trim() || sending ? '#3a0000' : '#8B0000',
            color: !inputValue.trim() || sending ? '#6b7280' : '#ffffff',
            border: 'none',
            borderRadius: '0.75rem',
            padding: '0 1.25rem',
            cursor: !inputValue.trim() || sending ? 'not-allowed' : 'pointer',
            fontWeight: 700,
            fontSize: '0.9rem',
            fontFamily: 'var(--font-tajawal), sans-serif',
            transition: 'background-color 0.2s',
          }}
        >
          إرسال
        </button>
      </form>
    </div>
  );
}

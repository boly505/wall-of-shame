'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ChatList from '@/components/social/ChatList';

export default function ChatsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/messages');
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/chat');
      return;
    }
    if (status === 'authenticated') {
      fetchConversations();
    }
  }, [status]);

  if (loading || status === 'loading') {
    return (
      <div style={{ display: 'flex', minHeight: '60vh', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ display: 'inline-block', width: '2rem', height: '2rem', border: '3px solid rgba(255,255,255,0.2)', borderTopColor: '#8B0000', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '38rem', margin: '0 auto', direction: 'rtl', fontFamily: 'var(--font-tajawal), sans-serif' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#e5e7eb', margin: '0 0 0.25rem' }}>المحادثات الخاصة</h1>
        <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: 0 }}>تواصل مع الأعضاء الآخرين في سرية تامة.</p>
      </div>

      <div
        className="glass-card"
        style={{
          padding: '1.25rem',
          borderRadius: '1.25rem',
          border: '1px solid rgba(255,255,255,0.06)',
          background: 'linear-gradient(135deg, rgba(26,26,26,0.95) 0%, rgba(18,18,18,0.98) 100%)',
        }}
      >
        <ChatList conversations={conversations} />
      </div>
    </div>
  );
}

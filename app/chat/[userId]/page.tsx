'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import ChatList from '@/components/social/ChatList';
import ChatWindow from '@/components/social/ChatWindow';

export default function ChatDetailPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  const partnerId = params.userId as string;

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
      router.push(`/auth/signin?callbackUrl=/chat/${partnerId}`);
      return;
    }
    if (status === 'authenticated') {
      fetchConversations();
    }
  }, [status, partnerId]);

  if (loading || status === 'loading') {
    return (
      <div style={{ display: 'flex', minHeight: '60vh', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ display: 'inline-block', width: '2rem', height: '2rem', border: '3px solid rgba(255,255,255,0.2)', borderTopColor: '#8B0000', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '64rem', margin: '0 auto', direction: 'rtl', fontFamily: 'var(--font-tajawal), sans-serif' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 320px) 1fr', gap: '1.5rem', height: 'calc(100vh - 12rem)', minHeight: '500px' }} className="chat-layout">
        
        {/* Sidebar (Conversations List) */}
        <div
          className="glass-card chat-sidebar"
          style={{
            padding: '1rem',
            borderRadius: '1.25rem',
            border: '1px solid rgba(255,255,255,0.06)',
            background: 'linear-gradient(135deg, rgba(26,26,26,0.95) 0%, rgba(18,18,18,0.98) 100%)',
            overflowY: 'auto',
          }}
        >
          <h2 style={{ fontSize: '1rem', fontWeight: 900, color: '#e5e7eb', margin: '0 0 1rem 0', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.75rem', textAlign: 'right' }}>
            المحادثات
          </h2>
          <ChatList conversations={conversations} activePartnerId={partnerId} />
        </div>

        {/* Main Chat Area */}
        <div style={{ height: '100%' }}>
          <ChatWindow partnerId={partnerId} currentUserId={session!.user.id} />
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .chat-layout {
            grid-template-columns: 1fr !important;
          }
          .chat-sidebar {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

function SignInForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get('callbackUrl') || '/';
  const registered = params.get('registered');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) { setError('يرجى ملء جميع الحقول.'); return; }
    setLoading(true); setError('');
    try {
      const result = await signIn('credentials', { email: email.trim(), password, redirect: false });
      if (result?.error) {
        setError(result.error);
        setLoading(false);
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err: any) {
      setError(err?.message || 'حدث خطأ غير متوقع أثناء تسجيل الدخول.');
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a',
    borderRadius: '0.75rem', padding: '0.75rem 1rem', color: '#c9d1d9',
    fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' as const,
    transition: 'border-color 0.2s', direction: 'rtl' as const,
    textAlign: 'right' as const, fontFamily: 'var(--font-tajawal), sans-serif',
  };

  return (
    <div style={{ backgroundColor: '#111111', border: '1px solid #222222', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 0 60px rgba(139,0,0,0.2)' }}>
      {/* رأس النافذة */}
      <div style={{ padding: '2rem 2rem 1.5rem', textAlign: 'center', borderBottom: '1px solid #1a1a1a', background: 'linear-gradient(to bottom, #1a1a1a, #111111)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '0.875rem' }}>
          <div style={{ height: '1px', width: '3rem', background: 'linear-gradient(to right, transparent, #6b0000)' }} />
          <span style={{ color: '#8B0000', fontSize: '1.25rem' }}>⚔</span>
          <div style={{ height: '1px', width: '3rem', background: 'linear-gradient(to left, transparent, #6b0000)' }} />
        </div>
        <h1 style={{ fontFamily: 'var(--font-tajawal), sans-serif', fontSize: '1.5rem', fontWeight: 900, color: '#e5e7eb', margin: 0 }}>
          ادخل الأرشيف
        </h1>
        <p style={{ color: '#6b7280', fontSize: '0.8rem', marginTop: '0.375rem' }}>سجّل دخولك للوصول إلى الأرشيف</p>
      </div>

      {/* النموذج */}
      <form onSubmit={handleSubmit} style={{ padding: '1.75rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.125rem', direction: 'rtl' }}>
        {registered && (
          <div style={{ backgroundColor: '#022c22', border: '1px solid #064e3b', color: '#6ee7b7', fontSize: '0.875rem', padding: '0.75rem 1rem', borderRadius: '0.75rem' }}>
            ✓ تم إنشاء الحساب بنجاح. يمكنك الدخول الآن.
          </div>
        )}
        {error && (
          <div style={{ backgroundColor: '#2d0000', border: '1px solid #6b0000', color: '#fca5a5', fontSize: '0.875rem', padding: '0.75rem 1rem', borderRadius: '0.75rem' }}>
            ⚠ {error}
          </div>
        )}

        <div>
          <label style={{ display: 'block', color: '#9ca3af', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.4rem', fontFamily: 'var(--font-tajawal), sans-serif' }}>
            البريد الإلكتروني
          </label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="example@mail.com" style={inputStyle}
            onFocus={e => (e.target.style.borderColor = '#8B0000')} onBlur={e => (e.target.style.borderColor = '#2a2a2a')} />
        </div>

        <div>
          <label style={{ display: 'block', color: '#9ca3af', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.4rem', fontFamily: 'var(--font-tajawal), sans-serif' }}>
            كلمة المرور
          </label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" style={inputStyle}
            onFocus={e => (e.target.style.borderColor = '#8B0000')} onBlur={e => (e.target.style.borderColor = '#2a2a2a')} />
        </div>

        <button type="submit" disabled={loading} style={{
          width: '100%', padding: '0.875rem', backgroundColor: loading ? '#4a0000' : '#8B0000',
          color: '#ffffff', border: '1px solid #6b0000', borderRadius: '0.75rem',
          fontSize: '1rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
          fontFamily: 'var(--font-tajawal), sans-serif', transition: 'background-color 0.2s',
        }}
          onMouseEnter={e => !loading && ((e.target as HTMLElement).style.backgroundColor = '#a50000')}
          onMouseLeave={e => !loading && ((e.target as HTMLElement).style.backgroundColor = '#8B0000')}
        >
          {loading ? (
            <><span style={{ display: 'inline-block', width: '1rem', height: '1rem', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />جاري الدخول…</>
          ) : 'دخول الأرشيف'}
        </button>

        <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.8rem', margin: 0, fontFamily: 'var(--font-tajawal), sans-serif' }}>
          ليس لديك حساب؟{' '}
          <Link href="/auth/register" style={{ color: '#e57368', textDecoration: 'none', fontWeight: 600 }}>سجّل الآن</Link>
        </p>
      </form>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function SignInSkeleton() {
  return <div style={{ backgroundColor: '#111111', border: '1px solid #222222', borderRadius: '1rem', height: '22rem', animation: 'pulse 1.5s ease-in-out infinite' }} />;
}

export default function SignInPage() {
  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', direction: 'rtl' }}>
      <motion.div style={{ width: '100%', maxWidth: '28rem' }} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Suspense fallback={<SignInSkeleton />}>
          <SignInForm />
        </Suspense>
      </motion.div>
    </div>
  );
}

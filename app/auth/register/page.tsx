'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.password) { setError('يرجى ملء جميع الحقول.'); return; }
    if (form.password.length < 8) { setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل.'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name.trim(), email: form.email.trim(), password: form.password }),
      });
      const json = await res.json();
      if (json.success) router.push('/auth/signin?registered=1');
      else setError(json.error || 'فشل إنشاء الحساب.');
    } catch { setError('خطأ في الشبكة. تأكد من اتصال قاعدة البيانات.'); }
    finally { setLoading(false); }
  };

  const inputStyle = {
    width: '100%', backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a',
    borderRadius: '0.75rem', padding: '0.75rem 1rem', color: '#c9d1d9',
    fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' as const,
    direction: 'rtl' as const, textAlign: 'right' as const,
    fontFamily: 'var(--font-tajawal), sans-serif',
  };

  const fields = [
    { key: 'name' as const, label: 'الاسم المعروض', type: 'text', placeholder: 'اسمك' },
    { key: 'email' as const, label: 'البريد الإلكتروني', type: 'email', placeholder: 'example@mail.com' },
    { key: 'password' as const, label: 'كلمة المرور', type: 'password', placeholder: '8 أحرف على الأقل' },
  ];

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', direction: 'rtl' }}>
      <motion.div style={{ width: '100%', maxWidth: '28rem' }} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div style={{ backgroundColor: '#111111', border: '1px solid #222222', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 0 60px rgba(139,0,0,0.2)' }}>
          {/* رأس النافذة */}
          <div style={{ padding: '2rem 2rem 1.5rem', textAlign: 'center', borderBottom: '1px solid #1a1a1a', background: 'linear-gradient(to bottom, #1a1a1a, #111111)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '0.875rem' }}>
              <div style={{ height: '1px', width: '3rem', background: 'linear-gradient(to right, transparent, #6b0000)' }} />
              <span style={{ color: '#8B0000', fontSize: '1.25rem' }}>⚔</span>
              <div style={{ height: '1px', width: '3rem', background: 'linear-gradient(to left, transparent, #6b0000)' }} />
            </div>
            <h1 style={{ fontFamily: 'var(--font-tajawal), sans-serif', fontSize: '1.5rem', fontWeight: 900, color: '#e5e7eb', margin: 0 }}>
              انضم إلى الأرشيف
            </h1>
            <p style={{ color: '#6b7280', fontSize: '0.8rem', marginTop: '0.375rem' }}>
              أنشئ هويتك. ستلتزم بالميثاق.
            </p>
          </div>

          {/* النموذج */}
          <form onSubmit={handleSubmit} style={{ padding: '1.75rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.125rem', direction: 'rtl' }}>
            {error && (
              <div style={{ backgroundColor: '#2d0000', border: '1px solid #6b0000', color: '#fca5a5', fontSize: '0.875rem', padding: '0.75rem 1rem', borderRadius: '0.75rem' }}>
                ⚠ {error}
              </div>
            )}
            {fields.map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label style={{ display: 'block', color: '#9ca3af', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.4rem', fontFamily: 'var(--font-tajawal), sans-serif' }}>
                  {label}
                </label>
                <input type={type} value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                  required placeholder={placeholder} style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = '#8B0000')}
                  onBlur={e => (e.target.style.borderColor = '#2a2a2a')} />
              </div>
            ))}

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
                <><span style={{ display: 'inline-block', width: '1rem', height: '1rem', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />جاري الإنشاء…</>
              ) : 'إنشاء الحساب'}
            </button>

            <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.8rem', margin: 0, fontFamily: 'var(--font-tajawal), sans-serif' }}>
              لديك حساب بالفعل؟{' '}
              <Link href="/auth/signin" style={{ color: '#e57368', textDecoration: 'none', fontWeight: 600 }}>سجّل دخولك</Link>
            </p>
          </form>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </motion.div>
    </div>
  );
}

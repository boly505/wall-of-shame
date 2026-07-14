'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const COVENANT_KEY = 'wos_covenant_accepted_v2';

const RULES = [
  {
    icon: '⚖️',
    title: 'المادة الأولى — عدم التسامح مع التحرش',
    body: 'الهجمات الموجهة والتهديدات الشخصية والتحرش المستمر بأي فرد يُفضي إلى الحظر الدائم الفوري. الأرشيف لا رحمة فيه لمن يصطاد داخل قاعاته.',
  },
  {
    icon: '🔇',
    title: 'المادة الثانية — حظر كشف الهوية والانتهاك',
    body: 'نشر معلومات خاصة كالعناوين وأرقام الهواتف أو أي بيانات شخصية عن أي شخص يُعدّ جريمة تستوجب الحظر الدائم والإحالة القانونية.',
  },
  {
    icon: '🛡️',
    title: 'المادة الثالثة — نزاهة المحتوى',
    body: 'الرسائل المزعجة ومحتوى الروبوتات وروابط التصيد والمعلومات المضللة محظورة. كل منشور يجب أن يحمل الحقيقة. الأرشيف سجل لا قصة.',
  },
  {
    icon: '🔞',
    title: 'المادة الرابعة — المحتوى للبالغين فقط',
    body: 'هذه المنصة للبالغين فقط (18+). بدخولك أنت تؤكد استيفاءك لهذا الشرط. يجب أن يكون جميع المحتوى مناسباً لغرض المنصة.',
  },
  {
    icon: '👑',
    title: 'المادة الخامسة — سلطة المدير مطلقة',
    body: 'قرارات المدير نهائية. التحايل على الحظر أو إنشاء حسابات بديلة أو انتحال شخصية المدير جرائم حظر دائم.',
  },
  {
    icon: '📜',
    title: 'المادة السادسة — احترم الأرشيف',
    body: 'يجب أن تكون التعليقات ذات صلة وذات معنى. التكرار غير المجدي أو المنشورات خارج الموضوع يُفضي إلى إيقاف مؤقت.',
  },
];

export default function CovenantBanner() {
  const [show, setShow] = useState(false);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(COVENANT_KEY);
      if (!stored) {
        const timer = setTimeout(() => setShow(true), 600);
        return () => clearTimeout(timer);
      }
    } catch { /* ignore */ }
  }, []);

  const handleAccept = () => {
    setAccepting(true);
    try { localStorage.setItem(COVENANT_KEY, 'true'); } catch { /* ignore */ }
    setTimeout(() => { setShow(false); setAccepting(false); }, 400);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem',
            backgroundColor: 'rgba(0,0,0,0.96)',
            backdropFilter: 'blur(8px)',
            direction: 'rtl',
          }}
        >
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(139,0,0,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <motion.div
            initial={{ scale: 0.88, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 220, delay: 0.05 }}
            style={{
              position: 'relative', width: '100%', maxWidth: '40rem',
              maxHeight: '90vh', display: 'flex', flexDirection: 'column',
              backgroundColor: '#111111', border: '1px solid #6b0000',
              borderRadius: '1.25rem', overflow: 'hidden',
              boxShadow: '0 0 80px rgba(139,0,0,0.4)',
            }}
          >
            {/* رأس النافذة */}
            <div style={{
              padding: '1.75rem 2rem 1.25rem', textAlign: 'center',
              background: 'linear-gradient(to bottom, #1a1a1a, #111111)',
              borderBottom: '1px solid #2d0000', flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '0.875rem' }}>
                <div style={{ height: '1px', width: '4rem', background: 'linear-gradient(to right, transparent, #8B0000)' }} />
                <span style={{ color: '#8B0000', fontSize: '1.5rem' }}>⚔</span>
                <div style={{ height: '1px', width: '4rem', background: 'linear-gradient(to left, transparent, #8B0000)' }} />
              </div>
              <h2 style={{ fontFamily: 'var(--font-tajawal), sans-serif', fontSize: '1.75rem', fontWeight: 900, color: '#e5e7eb', margin: 0, lineHeight: 1.2 }}>
                الميثاق
              </h2>
              <p style={{ fontFamily: 'var(--font-tajawal), sans-serif', color: '#8B0000', fontSize: '0.8rem', letterSpacing: '0.2em', margin: '0.25rem 0 0.875rem' }}>
                ميثاق السلوك
              </p>
              <p style={{ color: '#9ca3af', fontSize: '0.82rem', lineHeight: 1.7, margin: 0 }}>
                أنت على أعتاب الأرشيف. قبل أن تشهد ما بداخله، يجب أن تقرّ بالميثاق وتلتزم به.
                انتهاك هذه المواد يُفضي إلى حكم سريع ودائم.
              </p>
            </div>

            {/* قواعد قابلة للتمرير */}
            <div style={{ overflowY: 'auto', padding: '0.875rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', backgroundColor: '#0d0d0d' }}>
              {RULES.map((rule, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.07 }}
                  style={{
                    display: 'flex', gap: '0.875rem', padding: '0.875rem 1rem',
                    backgroundColor: '#161616', border: '1px solid #222',
                    borderRadius: '0.75rem', direction: 'rtl',
                  }}
                >
                  <span style={{ fontSize: '1.25rem', flexShrink: 0, lineHeight: 1.4 }}>{rule.icon}</span>
                  <div style={{ textAlign: 'right' }}>
                    <h3 style={{ color: '#e57368', fontWeight: 700, fontSize: '0.82rem', margin: '0 0 0.25rem', fontFamily: 'var(--font-tajawal), sans-serif' }}>
                      {rule.title}
                    </h3>
                    <p style={{ color: '#9ca3af', fontSize: '0.78rem', lineHeight: 1.65, margin: 0 }}>
                      {rule.body}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* تذييل / قبول */}
            <div style={{ padding: '1.125rem 1.5rem 1.5rem', backgroundColor: '#111111', borderTop: '1px solid #222', textAlign: 'center', flexShrink: 0 }}>
              <p style={{ color: '#4a4a4a', fontSize: '0.72rem', fontStyle: 'italic', marginBottom: '0.875rem', lineHeight: 1.6 }}>
                "من يخرق الميثاق يُذكر للأبد — ليس في الأرشيف، بل في سجل الحظر."
              </p>
              <button
                onClick={handleAccept}
                disabled={accepting}
                style={{
                  width: '100%', padding: '0.875rem 1.5rem',
                  backgroundColor: accepting ? '#4a0000' : '#8B0000',
                  color: '#ffffff', border: '1px solid #6b0000',
                  borderRadius: '0.875rem', fontSize: '1rem', fontWeight: 700,
                  cursor: accepting ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  transition: 'background-color 0.2s',
                  boxShadow: '0 0 20px rgba(139,0,0,0.3)',
                  fontFamily: 'var(--font-tajawal), sans-serif',
                }}
                onMouseEnter={e => !accepting && ((e.currentTarget.style.backgroundColor = '#a50000'))}
                onMouseLeave={e => !accepting && ((e.currentTarget.style.backgroundColor = '#8B0000'))}
              >
                {accepting ? (
                  <>
                    <span style={{ display: 'inline-block', width: '0.875rem', height: '0.875rem', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                    جاري الدخول…
                  </>
                ) : (
                  '⚔ أفهم وأقبل الميثاق'
                )}
              </button>
              <p style={{ color: '#333', fontSize: '0.65rem', marginTop: '0.5rem' }}>
                بالمتابعة، تؤكد أنك بالغ (18+) وتوافق على قواعد المنصة.
              </p>
            </div>
          </motion.div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

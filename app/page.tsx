import type { Metadata } from 'next';
import MasonryGrid from '@/components/gallery/MasonryGrid';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'الأرشيف — جدار العار',
  description: 'تصفّح معرض الوسائط الحصري. كل عرض سجل دائم لا يُمحى.',
};

export default async function HomePage() {
  return (
    <div style={{ maxWidth: '90rem', margin: '0 auto', padding: '2rem 1.25rem' }}>
      {/* قسم العنوان */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        {/* خط زخرفي */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ height: '1px', width: '5rem', background: 'linear-gradient(to right, transparent, #8B0000)' }} />
          <span style={{ color: '#8B0000', fontSize: '1.75rem' }}>⚔</span>
          <div style={{ height: '1px', width: '5rem', background: 'linear-gradient(to left, transparent, #8B0000)' }} />
        </div>

        <h1 style={{
          fontFamily: 'var(--font-tajawal), sans-serif',
          fontSize: 'clamp(2.5rem, 8vw, 4rem)',
          fontWeight: 900,
          color: '#e5e7eb',
          letterSpacing: '0.05em',
          margin: '0 0 0.5rem',
          textShadow: '0 0 40px rgba(139,0,0,0.4)',
        }}>
          الأرشيف
        </h1>

        <p style={{
          fontFamily: 'var(--font-tajawal), sans-serif',
          color: '#8B0000',
          fontSize: '0.875rem',
          letterSpacing: '0.25em',
          margin: '0 0 1rem',
          textTransform: 'uppercase',
        }}>
          جدار العار
        </p>

        <p style={{
          color: '#9ca3af',
          fontSize: '0.875rem',
          maxWidth: '28rem',
          margin: '0 auto',
          lineHeight: 1.75,
          fontFamily: 'var(--font-tajawal), sans-serif',
        }}>
          كل عرض سجل دائم. الأرشيف لا ينسى، لا يسامح، ولا يحذف. تصفّح بوعي.
        </p>
      </div>

      {/* المعرض */}
      <MasonryGrid />
    </div>
  );
}

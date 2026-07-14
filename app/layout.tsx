import type { Metadata, Viewport } from 'next';
import { Inter, Cinzel, Tajawal } from 'next/font/google';
import './globals.css';
import Providers from './providers';
import Navbar from '@/components/Navbar';
import CovenantBanner from '@/components/CovenantBanner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-cinzel',
  display: 'swap',
  weight: ['400', '600', '700', '900'],
});

const tajawal = Tajawal({
  subsets: ['arabic'],
  variable: '--font-tajawal',
  display: 'swap',
  weight: ['300', '400', '500', '700', '900'],
});

export const viewport: Viewport = {
  themeColor: '#000000',
};

export const metadata: Metadata = {
  title: 'جدار العار — الأرشيف',
  description: 'معرض إعلامي حصري مدفوع بالمجتمع. السجل دائم. الأرشيف لا ينسى أبداً.',
  keywords: ['معرض', 'مجتمع', 'أرشيف', 'جدار العار'],
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: 'جدار العار — الأرشيف',
    description: 'معرض إعلامي حصري. السجل دائم.',
    type: 'website',
    images: ['/logo.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${inter.variable} ${cinzel.variable} ${tajawal.variable}`} suppressHydrationWarning>
      <body className="bg-obsidian-950 text-silver-700 antialiased min-h-screen" suppressHydrationWarning>
        <Providers>
          <CovenantBanner />
          <Navbar />
          <main>{children}</main>
          <footer style={{ borderTop: '1px solid #1a1a1a', marginTop: '4rem', padding: '2rem 0', textAlign: 'center' }}>
            <p style={{ color: '#333', fontSize: '0.75rem' }}>
              © {new Date().getFullYear()} جدار العار. الأرشيف أبدي.
            </p>
          </footer>
        </Providers>
      </body>
    </html>
  );
}

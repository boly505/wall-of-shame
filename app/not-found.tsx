import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      <div className="text-8xl mb-6 opacity-20">📜</div>
      <h1 className="font-display text-6xl font-bold text-crimson-800 mb-4">404</h1>
      <p className="text-silver-700 text-xl font-display mb-2">Page Not Found</p>
      <p className="text-silver-900 text-sm mb-8 max-w-xs">
        This exhibit does not exist in the Archive. It may have been removed or never existed.
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-crimson-700 hover:bg-crimson-600 text-white rounded-xl font-medium transition-colors shadow-crimson"
      >
        Return to the Archive
      </Link>
    </div>
  );
}

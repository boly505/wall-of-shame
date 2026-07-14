import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Middleware is intentionally minimal — admin auth is handled server-side in app/admin/page.tsx
export function middleware(req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};

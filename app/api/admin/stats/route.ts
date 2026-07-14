import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/admin/stats
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'Forbidden.' }, { status: 403 });
  }

  try {
    const [totalPosts, totalUsers, totalComments, totalFlags, bannedUsers] = await Promise.all([
      prisma.post.count(),
      prisma.user.count(),
      prisma.comment.count(),
      prisma.flag.count(),
      prisma.user.count({ where: { isBanned: true } }),
    ]);

    return NextResponse.json({
      success: true,
      data: { totalPosts, totalUsers, totalComments, totalFlags, bannedUsers },
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch stats.' }, { status: 500 });
  }
}

import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type Params = { params: Promise<{ id: string }> };

// PATCH /api/admin/users/[id] — ban, timeout, unban, flag
export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'Forbidden.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { action, reason, timeoutHours } = body;
    // action: 'ban' | 'unban' | 'timeout' | 'clear_timeout' | 'flag'

    let updateData: Record<string, unknown> = {};

    if (action === 'ban') {
      updateData = { isBanned: true, timeoutUntil: null };

      await prisma.flag.create({
        data: {
          userId: id,
          reason: reason || 'No reason provided.',
          flaggedBy: session.user.id,
          severity: 'BAN',
        },
      });
    } else if (action === 'unban') {
      updateData = { isBanned: false, timeoutUntil: null };
    } else if (action === 'timeout') {
      const hours = timeoutHours || 24;
      const until = new Date(Date.now() + hours * 60 * 60 * 1000);
      updateData = { timeoutUntil: until };

      await prisma.flag.create({
        data: {
          userId: id,
          reason: reason || `Timeout for ${hours}h.`,
          flaggedBy: session.user.id,
          severity: 'TIMEOUT',
        },
      });
    } else if (action === 'clear_timeout') {
      updateData = { timeoutUntil: null };
    } else if (action === 'flag') {
      await prisma.flag.create({
        data: {
          userId: id,
          reason: reason || 'Flagged by admin.',
          flaggedBy: session.user.id,
          severity: 'WARNING',
        },
      });
      return NextResponse.json({ success: true, data: { flagged: true } });
    } else {
      return NextResponse.json({ success: false, error: 'Unknown action.' }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, name: true, isBanned: true, timeoutUntil: true },
    });

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error('[PATCH /api/admin/users/[id]]', error);
    return NextResponse.json({ success: false, error: 'Action failed.' }, { status: 500 });
  }
}

// DELETE /api/admin/users/[id] — hard delete user
export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'Forbidden.' }, { status: 403 });
  }

  try {
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true, data: { id } });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to delete user.' }, { status: 500 });
  }
}

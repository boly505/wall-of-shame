import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type Params = { params: Promise<{ userId: string }> };

// GET /api/messages/[userId] — get conversation with a specific user
export async function GET(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { userId: otherId } = await params;
  const myId = session.user.id;

  try {
    // Mark messages as read
    await prisma.message.updateMany({
      where: { senderId: otherId, receiverId: myId, isRead: false },
      data: { isRead: true },
    });

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: myId, receiverId: otherId },
          { senderId: otherId, receiverId: myId },
        ],
      },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: { select: { id: true, name: true, username: true, avatar: true, isVerified: true, frameType: true, role: true } },
      },
    });

    // Get partner info
    const partner = await prisma.user.findUnique({
      where: { id: otherId },
      select: { id: true, name: true, username: true, avatar: true, isVerified: true, frameType: true, role: true },
    });

    return NextResponse.json({ messages, partner });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

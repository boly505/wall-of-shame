import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/messages — list all conversations (latest message per user)
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = session.user.id;

  try {
    // Get all messages involving this user
    const messages = await prisma.message.findMany({
      where: { OR: [{ senderId: userId }, { receiverId: userId }] },
      orderBy: { createdAt: 'desc' },
      include: {
        sender: { select: { id: true, name: true, username: true, avatar: true, isVerified: true, frameType: true, role: true } },
        receiver: { select: { id: true, name: true, username: true, avatar: true, isVerified: true, frameType: true, role: true } },
      },
    });

    // Group by conversation partner
    const convMap = new Map<string, any>();
    for (const msg of messages) {
      const partner = msg.senderId === userId ? msg.receiver : msg.sender;
      if (!convMap.has(partner.id)) {
        convMap.set(partner.id, { partner, lastMessage: msg });
      }
    }

    return NextResponse.json(Array.from(convMap.values()));
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/messages — send a message
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { receiverId, content } = await req.json();
    if (!receiverId || !content?.trim()) {
      return NextResponse.json({ error: 'receiverId and content are required' }, { status: 400 });
    }

    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const message = await prisma.message.create({
      data: { id, content: content.trim(), senderId: session.user.id, receiverId },
      include: {
        sender: { select: { id: true, name: true, username: true, avatar: true, isVerified: true, frameType: true, role: true } },
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

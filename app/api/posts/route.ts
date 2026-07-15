import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const POST_SELECT = {
  id: true,
  content: true,
  imageUrl: true,
  caption: true,
  createdAt: true,
  author: {
    select: {
      id: true,
      name: true,
      username: true,
      avatar: true,
      isVerified: true,
      frameType: true,
      role: true,
    },
  },
  _count: { select: { likes: true, comments: true } },
};

// GET /api/posts — public, paginated
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Optionally get session to check liked status
    const session = await getServerSession(authOptions);

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: POST_SELECT,
      }),
      prisma.post.count(),
    ]);

    // Add isLiked flag
    let likedPostIds = new Set<string>();
    if (session?.user?.id) {
      const liked = await prisma.postLike.findMany({
        where: { userId: session.user.id, postId: { in: posts.map((p) => p.id) } },
        select: { postId: true },
      });
      likedPostIds = new Set(liked.map((l) => l.postId));
    }

    const enriched = posts.map((p) => ({ ...p, isLiked: likedPostIds.has(p.id) }));

    return NextResponse.json({ success: true, data: enriched, total, page, limit });
  } catch (error) {
    console.error('[GET /api/posts]', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch posts.' }, { status: 500 });
  }
}

// POST /api/posts — any logged-in user
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { content, imageUrl, caption } = body;

    if (!content?.trim() && !imageUrl) {
      return NextResponse.json({ success: false, error: 'Content or imageUrl is required.' }, { status: 400 });
    }

    const post = await prisma.post.create({
      data: {
        content: content?.trim() || null,
        imageUrl: imageUrl || null,
        caption: caption || null,
        authorId: session.user.id,
      },
      select: POST_SELECT,
    });

    return NextResponse.json({ ...post, isLiked: false }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/posts]', error);
    return NextResponse.json({ success: false, error: 'Failed to create post.' }, { status: 500 });
  }
}

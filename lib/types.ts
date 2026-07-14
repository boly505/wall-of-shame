import { Role } from '@prisma/client';

// ─── Shared Types ────────────────────────────────────────────────────────────

export type UserPublic = {
  id: string;
  name: string;
  role: Role;
  statusLevel: number;
  isBanned: boolean;
  timeoutUntil: string | null;
  createdAt: string;
};

export type PostWithCommentCount = {
  id: string;
  imageUrl: string;
  caption: string | null;
  createdAt: string;
  _count: { comments: number };
};

export type CommentWithDetails = {
  id: string;
  content: string;
  postId: string;
  userId: string;
  timestamp: string;
  user: {
    id: string;
    name: string;
    statusLevel: number;
    role: Role;
  };
  replies: ReplyWithUser[];
  likes: { userId: string }[];
  _count: { likes: number };
};

export type ReplyWithUser = {
  id: string;
  content: string;
  commentId: string;
  userId: string;
  timestamp: string;
  user: {
    id: string;
    name: string;
    statusLevel: number;
    role: Role;
  };
};

export type FlagWithUser = {
  id: string;
  userId: string;
  reason: string;
  flaggedBy: string;
  severity: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
};

export type AdminStats = {
  totalPosts: number;
  totalUsers: number;
  totalComments: number;
  totalFlags: number;
  bannedUsers: number;
};

// ─── API Response Helpers ────────────────────────────────────────────────────

export type ApiResponse<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string };

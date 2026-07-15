-- =====================================================
-- Migration: Add social media features
-- Run this SQL directly in Supabase SQL Editor
-- =====================================================

-- 1. Add new columns to existing users table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "username" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "avatar" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "bio" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "isVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "frameType" TEXT NOT NULL DEFAULT 'none';

-- 2. Populate username with a unique value for existing users (use id as default)
UPDATE "users" SET "username" = "id" WHERE "username" IS NULL;

-- 3. Add unique index on username
CREATE UNIQUE INDEX IF NOT EXISTS "users_username_key" ON "users"("username");

-- 4. Add content and authorId to posts table
ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "content" TEXT;
ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "authorId" TEXT;

-- 5. Add foreign key for posts.authorId -> users.id (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'posts_authorId_fkey'
  ) THEN
    ALTER TABLE "posts" ADD CONSTRAINT "posts_authorId_fkey"
      FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END
$$;

-- 6. Make imageUrl nullable in posts (it may already be nullable)
ALTER TABLE "posts" ALTER COLUMN "imageUrl" DROP NOT NULL;

-- 7. Create post_likes table
CREATE TABLE IF NOT EXISTS "post_likes" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "post_likes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "post_likes_postId_userId_key" ON "post_likes"("postId", "userId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'post_likes_postId_fkey'
  ) THEN
    ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_postId_fkey"
      FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'post_likes_userId_fkey'
  ) THEN
    ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;

-- 8. Create messages table
CREATE TABLE IF NOT EXISTS "messages" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'messages_senderId_fkey'
  ) THEN
    ALTER TABLE "messages" ADD CONSTRAINT "messages_senderId_fkey"
      FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'messages_receiverId_fkey'
  ) THEN
    ALTER TABLE "messages" ADD CONSTRAINT "messages_receiverId_fkey"
      FOREIGN KEY ("receiverId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;

-- Done!
SELECT 'Migration completed successfully!' as status;

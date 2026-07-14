# Wall of Shame

A high-performance, exclusive media gallery and community interaction web application.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Database**: Prisma ORM with PostgreSQL
- **Auth**: NextAuth.js (JWT strategy, Credentials provider)
- **Animations**: Framer Motion

## Setup

### 1. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and set:
- `DATABASE_URL` — your PostgreSQL connection string (e.g., Neon.tech, Supabase, Railway)
- `NEXTAUTH_SECRET` — run `openssl rand -base64 32` and paste the result
- `NEXTAUTH_URL` — `http://localhost:3000` for local dev

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up the Database

```bash
# Run migrations
npx prisma migrate dev --name init

# Seed with admin user and demo posts
npx prisma db seed
```

Default admin credentials (from `.env`):
- **Email**: `admin@wallofshame.com`
- **Password**: `Admin@Shame2024!`

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Features

### Public Gallery
- Masonry grid layout for media posts
- Lazy-loaded images with hover effects
- Inline comment section per post (click 💬)

### Comments & Engagement
- Post and reply to comments
- Like comments (optimistic updates)
- Gamified status levels: **Lurker → Initiate → Regular → Veteran → Elder**
- Status auto-increments on every comment/reply

### Covenant Banner
- First-visit modal with 6 platform rules (Articles I-VI)
- Dismissal stored in `localStorage`
- Must accept to access the Archive

### Admin Dashboard (`/admin`)
| Page | Description |
|------|-------------|
| `/admin` | Stats overview |
| `/admin/upload` | Upload media (URL or file drag-and-drop) |
| `/admin/posts` | Edit captions, delete posts |
| `/admin/users` | Ban, timeout (custom hours), flag users |
| `/admin/modlog` | Chronological moderation log |

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # NextAuth + registration
│   │   ├── posts/         # Post CRUD
│   │   ├── comments/      # Comments, likes, replies
│   │   └── admin/         # Admin-only endpoints
│   ├── admin/             # Admin dashboard pages
│   ├── auth/              # Sign in / Register pages
│   └── page.tsx           # Gallery home
├── components/
│   ├── ui/                # Button, Modal, Badge
│   ├── gallery/           # MasonryGrid, PostCard
│   ├── comments/          # CommentSection, CommentItem, ReplyItem
│   ├── CovenantBanner.tsx
│   ├── Navbar.tsx
│   └── StatusBadge.tsx
├── lib/
│   ├── auth.ts            # NextAuth config
│   ├── prisma.ts          # DB client singleton
│   ├── statusLevel.ts     # Level-up system
│   ├── types.ts           # Shared TS types
│   └── utils.ts           # cn(), formatDate(), timeAgo()
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Admin + demo post seed
└── middleware.ts          # Admin route guard
```

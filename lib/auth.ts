import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required.');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error('No account found with this email.');
        }

        if (user.isBanned) {
          throw new Error('Your account has been permanently banned.');
        }

        if (user.timeoutUntil && user.timeoutUntil > new Date()) {
          const until = user.timeoutUntil.toLocaleString();
          throw new Error(`You are in timeout until ${until}.`);
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error('Incorrect password.');
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          username: user.username,
          avatar: user.avatar,
          isVerified: user.isVerified,
          frameType: user.frameType,
          statusLevel: user.statusLevel,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.username = (user as any).username;
        token.avatar = (user as any).avatar;
        token.isVerified = (user as any).isVerified;
        token.frameType = (user as any).frameType;
        token.statusLevel = (user as any).statusLevel;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.username = token.username as string;
        session.user.avatar = token.avatar as string | null;
        session.user.isVerified = token.isVerified as boolean;
        session.user.frameType = token.frameType as string;
        session.user.statusLevel = token.statusLevel as number;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: false,
};

// Augment next-auth types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
      username: string;
      avatar?: string | null;
      isVerified: boolean;
      frameType: string;
      statusLevel: number;
    };
  }
}

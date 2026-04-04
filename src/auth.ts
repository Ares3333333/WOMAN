import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  DEV_BYPASS_PASSWORD,
  devAutoLoginEmail,
  isDevSkipLoginEnabled,
} from "@/lib/dev-auth";

const nextAuth = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: "/sign-in",
  },
  providers: [
    Credentials({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const emailRaw = credentials?.email?.toString().trim().toLowerCase();
        const password = credentials?.password?.toString() ?? "";

        try {
          if (isDevSkipLoginEnabled() && password === DEV_BYPASS_PASSWORD) {
            const email = emailRaw || devAutoLoginEmail();
            const user = await prisma.user.findUnique({ where: { email } });
            if (!user) return null;
            return {
              id: user.id,
              email: user.email ?? undefined,
              name: user.name ?? undefined,
              image: user.image ?? undefined,
            };
          }

          const email = emailRaw;
          if (!email || !password) return null;

          const user = await prisma.user.findUnique({ where: { email } });
          if (!user?.passwordHash) return null;

          const valid = await bcrypt.compare(password, user.passwordHash);
          if (!valid) return null;

          return {
            id: user.id,
            email: user.email ?? undefined,
            name: user.name ?? undefined,
            image: user.image ?? undefined,
          };
        } catch (err) {
          console.error("[auth] Database error during sign-in", err);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) token.sub = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});

export const { auth, signIn, signOut, handlers } = nextAuth;
export const { GET, POST } = handlers;

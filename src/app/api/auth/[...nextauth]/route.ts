import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

// Auth options — supports customer credential + Google OAuth + admin login
export const authOptions: NextAuthOptions = {
  providers: [
    // Customer credential login (email + password)
    CredentialsProvider({
      id: "customer-credentials",
      name: "Customer Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await db.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });
        if (!user || !user.password) return null;
        if (user.status === "BLOCKED") return null;
        const ok = await bcrypt.compare(credentials.password, user.password);
        if (!ok) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          image: user.image ?? undefined,
          role: user.role,
        };
      },
    }),

    // Admin credential login (separate admin table)
    CredentialsProvider({
      id: "admin-credentials",
      name: "Admin Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const admin = await db.admin.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });
        if (!admin) return null;
        const ok = await bcrypt.compare(credentials.password, admin.password);
        if (!ok) return null;
        return {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role === "SUPER_ADMIN" ? "SUPER_ADMIN" : "ADMIN",
          isAdmin: true,
        };
      },
    }),

    // Google OAuth (works for both customers and admins; customers get auto-created)
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "dummy-client-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "dummy-client-secret",
      profile(profile: any) {
        return {
          id: profile.sub,
          email: profile.email,
          name: profile.name,
          image: profile.picture,
          role: "CUSTOMER",
        };
      },
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    async signIn({ user, account }) {
      // Auto-create user in database on first Google OAuth sign-in
      if (account?.provider === "google" && user.email) {
        const existing = await db.user.findUnique({
          where: { email: user.email.toLowerCase() },
        });
        if (!existing) {
          const newUser = await db.user.create({
            data: {
              email: user.email.toLowerCase(),
              name: user.name || null,
              image: user.image || null,
              role: "CUSTOMER",
            },
          });
          (user as any).id = newUser.id;
        } else {
          (user as any).id = existing.id;
          // Check if existing user is an admin
          const admin = await db.admin.findUnique({
            where: { email: user.email.toLowerCase() },
          });
          if (admin) {
            (user as any).isAdmin = true;
            (user as any).role = admin.role === "SUPER_ADMIN" ? "SUPER_ADMIN" : "ADMIN";
          }
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role ?? "CUSTOMER";
        token.isAdmin = (user as any).isAdmin ?? false;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).isAdmin = token.isAdmin;
      }
      return session;
    },
  },

  pages: {
    signIn: "/signin",
    error: "/signin",
  },

  secret: process.env.NEXTAUTH_SECRET || "ruhvique-dev-secret-change-me-in-prod",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

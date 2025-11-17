// auth.ts
import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { User } from "@/types/user";

export const authOptions: AuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24, // 1 day
  },
  pages: {
    signIn: "/auth/login",
  },
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials) return null;

        // 1) Login -> token
        const loginRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/login`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          }
        );

        const loginData = await loginRes.json();
        if (!loginRes.ok || !loginData?.data?.token) return null;
        const token: string = loginData.data.token;

        // 2) /me
        const meRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/me?forceRefresh=1`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        const meData = await meRes.json();
        const user: User | undefined = meData?.data;
        if (!meRes.ok || !user) return null;

        // Kembalikan tepat sesuai /me + token
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          token,
          email_verified_at: user.email_verified_at,
          created_at: user.created_at,
          updated_at: user.updated_at,
          anggota: "anggota" in user ? user.anggota : null,
          roles: user.roles,
          refferal: "refferal" in user ? user.refferal : null,
          referrer: "referrer" in user ? user.referrer : null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as number;
        token.name = user.name as string;
        token.email = user.email as string;
        token.token = (user as unknown as { token: string }).token;
        token.email_verified_at = (
          user as unknown as { email_verified_at: string | null }
        ).email_verified_at;
        token.created_at = (
          user as unknown as { created_at: string }
        ).created_at;
        token.updated_at = (
          user as unknown as { updated_at: string }
        ).updated_at;
        token.anggota = (
          user as unknown as { anggota: "" }
        ).anggota;
        token.roles = (user as unknown as { roles: User["roles"] }).roles;
        token.refferal = (
          user as unknown as { refferal: "" }
        ).refferal;
        token.referrer = (
          user as unknown as { referrer: "" }
        ).referrer;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as number;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.token = token.token as string;
        session.user.email_verified_at = token.email_verified_at as
          | string
          | null;
        session.user.created_at = token.created_at as string;
        session.user.updated_at = token.updated_at as string;
        session.user.anggota = token.anggota as "";
        session.user.roles = token.roles as User["roles"];
        session.user.refferal = token.refferal as "";
        session.user.referrer = token.referrer as "";
      }
      return session;
    },
  },
};
/* eslint-disable @typescript-eslint/no-unused-vars */
import NextAuth, { DefaultSession } from "next-auth";
import type { Anggota, UserRole, Refferal } from "@/types/user";

declare module "next-auth" {
  interface Session {
    user: {
      id: number;
      token: string;
      name: string;
      email: string;
      email_verified_at: string | null;
      created_at: string;
      updated_at: string;
      anggota: Anggota | null;
      roles: UserRole[];
      refferal: Refferal | null;
      referrer: unknown | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: number;
    token: string;
    name: string;
    email: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    anggota: Anggota | null;
    roles: UserRole[];
    refferal: Refferal | null;
    referrer: unknown | null;
  }
}
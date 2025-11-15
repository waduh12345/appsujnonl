"use client";

import { useEffect, useMemo, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import {
  useGetAnggotaListQuery,
  useGetAnggotaByIdQuery,
} from "@/services/admin/anggota.service";
import type { Anggota } from "@/types/admin/anggota";

import { useLogoutMutation } from "@/services/auth.service";
import { displayDate } from "@/lib/format-utils";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Wallet,
  CreditCard,
  User,
  Lock,
  Users,
  LogOut,
  ChevronRight,
  TrendingUp,
  DollarSign,
} from "lucide-react";

function getInitials(name?: string | null): string {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] ?? "" : "";
  return (first + last).toUpperCase() || "U";
}

type RoleWithDate = { id: number; name: string; created_at?: string };

export default function ProfilePage() {
  const { data: session } = useSession();
  const user = session?.user;
  const sessionUserId = user?.id ?? null;

  const [logoutApi, { isLoading: isLoggingOut }] = useLogoutMutation();

  const [page, setPage] = useState(1);
  const paginate = 100; // ambil banyak biar cepat ketemu
  const [foundAnggotaId, setFoundAnggotaId] = useState<
    number | null | undefined
  >(undefined);

  const {
    data: listResp,
    isLoading: isListLoading,
    isFetching: isListFetching,
  } = useGetAnggotaListQuery(
    { page, paginate },
    { skip: !sessionUserId || foundAnggotaId !== undefined } // stop setelah ketemu / mentok
  );

  useEffect(() => {
    if (!sessionUserId) return;
    if (!listResp) return;

    const match = (listResp.data ?? []).find(
      (row) => Number(row.user_id) === Number(sessionUserId)
    );
    if (match) {
      setFoundAnggotaId(match.id);
      return;
    }

    const last = listResp.last_page ?? 1;
    if (page < last) {
      setPage((p) => p + 1);
    } else {
      setFoundAnggotaId(null); // tidak ketemu di seluruh halaman
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listResp, sessionUserId]);

  // Ambil detail anggota setelah id ketemu
  const {
    data: anggotaDetail,
    isLoading: isDetailLoading,
    isFetching: isDetailFetching,
  } = useGetAnggotaByIdQuery(foundAnggotaId as number, {
    skip: !foundAnggotaId || foundAnggotaId === null,
  });

  const anggota: Anggota | undefined = anggotaDetail;

  // Sumber tampilan: prioritas data anggota; kalau tidak ada, fallback ke session
  const displayName = anggota?.name ?? user?.name ?? "-";
  const displayEmail = anggota?.email ?? user?.email ?? "-";

  // avatar dari anggota.photo_file → jika kosong fallback default
  const pf = anggota?.photo_file;
  const avatarSrc = typeof pf === "string" && pf.trim() !== "" ? pf : "";

  // const avatarSrc = (() => {
  //   if (typeof pf === "string") return pf.trim() || "";
  //   // if (pf instanceof File) return URL.createObjectURL(pf); // optional: preview lokal
  //   return "";
  // })();

  // Bergabung sejak → roles.created_at paling awal
  const roles = (user?.roles as RoleWithDate[] | undefined) ?? [];
  const roleDates = roles
    .map((r) => r.created_at)
    .filter((s): s is string => Boolean(s));
  const joinedAtISO = roleDates.length
    ? roleDates.slice().sort()[0]
    : undefined;
  const joinedAtText = displayDate(joinedAtISO);

  const isLoadingAnything =
    isListLoading ||
    isListFetching ||
    (foundAnggotaId !== null && foundAnggotaId === undefined) ||
    isDetailLoading ||
    isDetailFetching;

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
    } finally {
      await signOut({ callbackUrl: "/anggota/login", redirect: true });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Profile Info */}
      <div
        className="p-6 text-white"
        style={{
          background:
            "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
        }}
      >
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20 border-4 border-white/20">
            <AvatarImage src={avatarSrc || undefined} />
            <AvatarFallback className="bg-white text-primary text-xl font-bold">
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <h1 className="text-xl font-bold">{displayName}</h1>
            <p className="text-sm text-white/80">{displayEmail}</p>
            <p className="text-xs text-white/60 mt-1">
              Bergabung sejak {joinedAtText}
            </p>
            {isLoadingAnything && (
              <p className="text-[11px] text-white/60 mt-1">
                Memuat data akun…
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Menu Navigation */}
      <div className="p-4 space-y-4">

        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground px-2">
            Akun
          </h2>
          <Card>
            <CardContent className="p-0">
              <Link
                href="/profile/informasi-pribadi"
                className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors border-b"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Informasi Pribadi</p>
                    <p className="text-xs text-muted-foreground">
                      Edit profil dan data diri
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Link>

              <Link
                href="/profile/ubah-password"
                className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors border-b"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Lock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Ubah Password</p>
                    <p className="text-xs text-muted-foreground">
                      Ganti kata sandi akun
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Link>

              <Link
                href="/profile/referal"
                className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Referal Saya</p>
                    <p className="text-xs text-muted-foreground">
                      Kode dan link referal
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Logout Button */}
        <Button
          disabled={isLoggingOut}
          onClick={handleLogout}
          variant="outline"
          className="w-full justify-start gap-3 h-auto p-4 border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive bg-transparent"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Keluar dari Akun</span>
        </Button>

        {/* App Version */}
        <p className="text-center text-xs text-muted-foreground pt-2">
          Versi Aplikasi 1.0.0
        </p>
      </div>
    </div>
  );
}

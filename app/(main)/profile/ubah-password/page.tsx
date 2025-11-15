"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Swal from "sweetalert2";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  useGetAnggotaListQuery,
  useGetAnggotaByIdQuery,
  useUpdateAnggotaMutation,
} from "@/services/admin/anggota.service";
import type { Anggota } from "@/types/admin/anggota";

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

function validateNewPassword(pw: string): string | null {
  if (pw.length < 8) return "Password minimal 8 karakter.";
  if (!/[A-Za-z]/.test(pw) || !/\d/.test(pw))
    return "Gunakan kombinasi huruf dan angka.";
  return null;
}

// Append jika ada nilai
const appendIf = (fd: FormData, key: string, val?: string | number | null) => {
  if (val !== undefined && val !== null && String(val).length > 0) {
    fd.append(key, String(val));
  }
};

export default function UbahPasswordPage() {
  const { data: session } = useSession();
  const sessionUserId = session?.user?.id;

  const [form, setForm] = useState<PasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // ===========================
  // 1) Cari anggota milik user (tanpa user_id param di API)
  // ===========================
  const [page, setPage] = useState(1);
  const paginate = 100;
  const [foundAnggotaId, setFoundAnggotaId] = useState<
    number | null | undefined
  >(
    undefined // undefined = belum tahu, number = ketemu, null = tidak ketemu
  );

  const {
    data: listResp,
    isLoading: isListLoading,
    isFetching: isListFetching,
  } = useGetAnggotaListQuery(
    { page, paginate },
    {
      skip: !sessionUserId || foundAnggotaId !== undefined, // stop fetch saat sudah ketemu / tidak ketemu
    }
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
      setFoundAnggotaId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listResp, sessionUserId]);

  // 2) Setelah ketemu anggota.id, ambil detail lengkap
  const {
    data: anggotaDetail,
    isFetching: isDetailFetching,
    isLoading: isDetailLoading,
  } = useGetAnggotaByIdQuery(foundAnggotaId as number, {
    skip: !foundAnggotaId || foundAnggotaId === null,
  });

  const [updateAnggota, { isLoading: isUpdating }] = useUpdateAnggotaMutation();

  const newPwError = useMemo(
    () => validateNewPassword(form.newPassword),
    [form.newPassword]
  );

  const canSubmit = useMemo(() => {
    if (!foundAnggotaId) return false; // wajib pakai anggota.id untuk update
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword)
      return false;
    if (form.newPassword !== form.confirmPassword) return false;
    if (form.currentPassword === form.newPassword) return false;
    if (newPwError) return false;
    return true;
  }, [foundAnggotaId, form, newPwError]);

  const handleSubmit = async () => {
    if (!foundAnggotaId) {
      await Swal.fire(
        "Data tidak ditemukan",
        "Anggota milik akun ini tidak ditemukan.",
        "info"
      );
      return;
    }
    if (!canSubmit) return;

    try {
      // Siapkan FormData. Banyak API Laravel perlu field lain juga saat update
      const a: Anggota | undefined = anggotaDetail;
      const fd = new FormData();

      // Field existing (append jika ada) — sesuaikan dengan validasi backend kamu
      if (a) {
        appendIf(fd, "name", a.name);
        appendIf(fd, "email", a.email);
        appendIf(fd, "phone", a.phone);
        appendIf(fd, "address", a.address);
        appendIf(fd, "ktp", a.ktp);
        appendIf(fd, "level_id", a.level_id);

        appendIf(fd, "province_id", a.province_id);
        appendIf(fd, "regency_id", a.regency_id);
        appendIf(fd, "district_id", a.district_id);
        appendIf(fd, "village_id", a.village_id);
        appendIf(fd, "rt", a.rt);
        appendIf(fd, "rw", a.rw);

        appendIf(fd, "gender", a.gender);
        appendIf(fd, "birth_place", a.birth_place);
        appendIf(fd, "birth_date", a.birth_date);
        appendIf(fd, "postal_code", a.postal_code);
        appendIf(fd, "religion", a.religion);
        appendIf(fd, "marital_status", a.marital_status);
        appendIf(fd, "occupation", a.occupation);
        appendIf(fd, "last_education", a.last_education);
        appendIf(fd, "phone_home", a.phone_home);
        appendIf(fd, "phone_office", a.phone_office);
        appendIf(fd, "phone_faksimili", a.phone_faksimili);
        appendIf(fd, "facebook", a.facebook);
        appendIf(fd, "instagram", a.instagram);
        appendIf(fd, "twitter", a.twitter);
        appendIf(fd, "whatsapp", a.whatsapp);
        appendIf(fd, "tiktok", a.tiktok);
        appendIf(fd, "path", a.path);
      }

      // Field khusus ubah password
      fd.append("current_password", form.currentPassword);
      fd.append("password", form.newPassword);
      fd.append("password_confirmation", form.confirmPassword);

      // Laravel method spoofing
      fd.append("_method", "PUT");

      await updateAnggota({ id: foundAnggotaId, payload: fd }).unwrap();

      await Swal.fire("Berhasil", "Password berhasil diperbarui.", "success");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (e: unknown) {
      const msg =
        (e as { data?: { message?: string } })?.data?.message ??
        "Tidak dapat memperbarui password. Pastikan password saat ini benar dan data lain valid.";
      await Swal.fire("Gagal", msg, "error");
    }
  };

  if (!sessionUserId) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="sticky top-0 z-10 bg-background border-b">
          <div className="flex items-center gap-4 p-4">
            <Link href="/profile">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-lg font-bold">Ubah Password</h1>
          </div>
        </div>
        <div className="p-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ganti Kata Sandi</CardTitle>
              <p className="text-sm text-muted-foreground">
                Anda perlu login untuk mengubah password.
              </p>
            </CardHeader>
            <CardContent>
              <Link href="/anggota/login">
                <Button className="w-full">Ke Halaman Login</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const isFinding =
    isListLoading ||
    isListFetching ||
    (foundAnggotaId !== null && foundAnggotaId === undefined);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="flex items-center gap-4 p-4">
          <Link href="/profile">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-bold">Ubah Password</h1>
        </div>
      </div>

      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ganti Kata Sandi</CardTitle>
            <p className="text-sm text-muted-foreground">
              Pastikan password baru Anda kuat dan mudah diingat
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current Password */}
            <div className="space-y-2">
              <Label htmlFor="current-password">Password Saat Ini</Label>
              <Input
                id="current-password"
                type="password"
                placeholder="Masukkan password saat ini"
                value={form.currentPassword}
                onChange={(e) =>
                  setForm((s) => ({ ...s, currentPassword: e.target.value }))
                }
              />
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="new-password">Password Baru</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Masukkan password baru"
                value={form.newPassword}
                onChange={(e) =>
                  setForm((s) => ({ ...s, newPassword: e.target.value }))
                }
              />
              <p className="text-xs text-muted-foreground">
                Minimal 8 karakter dengan kombinasi huruf dan angka
              </p>
              {form.newPassword && validateNewPassword(form.newPassword) && (
                <p className="text-xs text-destructive">
                  {validateNewPassword(form.newPassword)}
                </p>
              )}
              {form.newPassword &&
                form.currentPassword &&
                form.currentPassword === form.newPassword && (
                  <p className="text-xs text-destructive">
                    Password baru tidak boleh sama dengan password saat ini.
                  </p>
                )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Konfirmasi Password Baru</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Masukkan ulang password baru"
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm((s) => ({ ...s, confirmPassword: e.target.value }))
                }
              />
              {form.confirmPassword &&
                form.newPassword !== form.confirmPassword && (
                  <p className="text-xs text-destructive">
                    Konfirmasi password tidak cocok.
                  </p>
                )}
            </div>

            <Button
              className="w-full mt-6"
              onClick={handleSubmit}
              disabled={
                isFinding ||
                isDetailLoading ||
                isDetailFetching ||
                !canSubmit ||
                isUpdating
              }
            >
              {isUpdating ? "Menyimpan..." : "Ubah Password"}
            </Button>

            {foundAnggotaId === null && (
              <p className="text-xs text-muted-foreground mt-2">
                Data anggota milik akun ini tidak ditemukan.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
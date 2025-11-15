"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { useGetAnggotaListQuery } from "@/services/admin/anggota.service";
import { Anggota } from "@/types/admin/anggota";
import Image from "next/image";

function formatTanggal(iso?: string | null) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso ?? "-";
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function KTACard() {
  const router = useRouter();

  // 1) Ambil user_id dari session
  const { data: session, status } = useSession();
  const userId: number | null =
    (session?.user as { id?: number } | undefined)?.id ?? null;

  // 2) Ambil list anggota (tanpa param user_id), lalu filter di frontend
  const { data: anggotaPaged, isLoading } = useGetAnggotaListQuery({
    page: 1,
    paginate: 100, // naikkan agar peluang data user masuk di page ini lebih besar
  });

  const list: Anggota[] = (anggotaPaged?.data ?? []) as Anggota[];

  const anggota = useMemo(
    () =>
      userId == null ? null : list.find((a) => a.user_id === userId) ?? null,
    [list, userId]
  );

  // Loading states (session / fetch)
  if (status === "loading" || isLoading) {
    return (
      <Card className="relative w-full overflow-hidden rounded-xl shadow-xl border-0 p-6 animate-pulse">
        <div className="h-5 w-48 bg-white/20 rounded mb-4" />
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-4 bg-white/20 rounded" />
          ))}
        </div>
      </Card>
    );
  }

  // Jika belum login (harusnya sudah diblokir oleh AuthGate), tampilkan info singkat
  if (userId == null) {
    return (
      <Card
        onClick={() => router.push("/siswa/login")}
        role="button"
        aria-label="Masuk untuk melihat KTA"
        className="relative w-full overflow-hidden rounded-xl shadow-xl border-0 text-[13px] p-6 cursor-pointer"
        style={{
          background:
            "linear-gradient(145deg, var(--primary) 0%, var(--secondary) 95%)",
          color: "var(--primary-foreground)",
        }}
      >
        <div className="text-white space-y-2">
          <p className="text-sm font-medium opacity-90 tracking-widest">
            KARTU TANDA ANGGOTA
          </p>
          <p className="text-base">Silakan masuk untuk melihat KTA.</p>
        </div>
      </Card>
    );
  }

  // Jika data anggota untuk user ini tidak ditemukan
  if (!anggota) {
    return (
      <Card
        onClick={() => router.push("/kta")}
        role="button"
        aria-label="Lengkapi Data Anggota"
        className="relative w-full overflow-hidden rounded-xl shadow-xl border-0 text-[13px] p-6 cursor-pointer"
        style={{
          background:
            "linear-gradient(145deg, var(--primary) 0%, var(--secondary) 95%)",
          color: "var(--primary-foreground)",
        }}
      >
        <div className="text-white space-y-2">
          <p className="text-sm font-medium opacity-90 tracking-widest">
            KARTU TANDA ANGGOTA
          </p>
          <p className="text-base">
            Data anggota belum ditemukan untuk akun ini. Klik untuk membuka
            halaman KTA dan melengkapi data.
          </p>
        </div>
      </Card>
    );
  }

  // 3) Map field ke kartu
  const memberId =
    anggota.reference || `KTA-${anggota.id.toString().padStart(6, "0")}`;
  const memberName = anggota.name;
  const placeOfBirth = anggota.birth_place;
  const dateOfBirth = formatTanggal(anggota.birth_date);
  const kelurahan = anggota.village_name ?? "-";
  const kecamatan = anggota.district_name ?? "-";
  const province = anggota.province_name ?? "-";
  const alamatLengkap = [
    anggota.address,
    anggota.rt ? `RT ${anggota.rt}` : "",
    anggota.rw ? `RW ${anggota.rw}` : "",
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <Card
      onClick={() => router.push("/kta")}
      role="button"
      aria-label="Buka Kartu Anggota"
      className="relative w-full overflow-hidden rounded-xl shadow-xl border-0 text-[13px] p-6 cursor-pointer"
      style={{
        background:
          "linear-gradient(145deg, var(--primary) 0%, var(--secondary) 95%)",
        color: "var(--primary-foreground)",
      }}
    >
      {/* Decorative accents */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full" />
        <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-white/10 rounded-full" />
      </div>

      <div className="relative flex flex-col justify-between space-y-4 text-white">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-medium opacity-90 tracking-widest">
              KARTU TANDA ANGGOTA
            </p>
          </div>
          <div className="w-10 h-7 bg-yellow-300 rounded-md relative shadow-inner">
            <div className="absolute inset-1 border border-yellow-600 rounded-md" />
            <div className="absolute inset-x-2 top-1/2 h-[1px] bg-yellow-600 opacity-60" />
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-[auto_1fr] gap-x-10 sm:gap-x-14 gap-y-1">
          <span className="opacity-90">No. Anggota</span>
          <span className="font-semibold ">{memberId}</span>

          <span className="opacity-90">Nama</span>
          <span className="font-semibold ">{memberName}</span>

          <span className="opacity-90">Tempat/Tgl Lahir</span>
          <span>
            {placeOfBirth}, {dateOfBirth}
          </span>

          <span className="opacity-90">Alamat</span>
          <span className="leading-snug">{alamatLengkap}</span>

          <span className="opacity-90">Kelurahan</span>
          <span>{kelurahan}</span>

          <span className="opacity-90">Kecamatan</span>
          <span>{kecamatan}</span>

          <span className="opacity-90">Provinsi</span>
          <span>{province}</span>
        </div>

        {/* Footer branding */}
        <div className="flex justify-between items-center pt-2 border-t border-white/20">
          <span className="text-xs opacity-85">
            {/* {formatTanggal(anggota.registered_at)} */}
          </span>
          <div className="flex items-center gap-2">
            <Image src="/icon-flag.png" alt="Logo KTA" width={20} height={20} />
            <span className="font-bold text-base italic text-white">
              🇮🇩 e-KTA
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}

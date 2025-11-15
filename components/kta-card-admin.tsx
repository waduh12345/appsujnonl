"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import type { Anggota } from "@/types/admin/anggota";
import { useGetCurrentUserQuery } from "@/services/auth.service";
import { useGetAnggotaByIdQuery } from "@/services/admin/anggota.service";
import { skipToken } from "@reduxjs/toolkit/query";
import Image from "next/image";

function fmtDate(value?: string | null): string | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value ?? undefined;
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

type KtaMemberView = {
  memberId?: string;
  memberName?: string;
  placeOfBirth?: string;
  dateOfBirth?: string;
  address?: string;
  kelurahan?: string;
  kecamatan?: string;
  province?: string;
  memberSince?: string;
};

type NestedNamed = { id?: string; name?: string } | null | undefined;

type AnggotaLike = Partial<Anggota> & {
  reference?: string;
  ref_number?: number;
  member_id?: string | number;
  memberId?: string | number;
  kta_number?: string;
  card_number?: string;
  province?: NestedNamed;
  regency?: NestedNamed;
  district?: NestedNamed;
  village?: NestedNamed;
  created_at?: string;
  member_since?: string;
};

type MeAnggota = { id?: number | string } | null | undefined;
type MeData =
  | { name?: string; anggota_id?: number | string; anggota?: MeAnggota }
  | undefined;

function pickString(...candidates: Array<unknown>): string | undefined {
  for (const c of candidates) {
    if (typeof c === "string" && c.trim().length > 0) return c;
    if (typeof c === "number") return String(c);
  }
  return undefined;
}
function pickNamed(obj: NestedNamed, key: "name"): string | undefined {
  if (!obj) return undefined;
  const v = obj[key];
  return typeof v === "string" ? v : undefined;
}

/** Build route using [id] or append query (?memberId=). */
function buildRouteWithId(
  route: string,
  id?: number | string,
  queryKey: "memberId" | "id" = "memberId"
): string {
  if (!id) return route;

  if (route.includes("[id]")) return route.replace("[id]", String(id));

  const [pathAndQuery, hash = ""] = route.split("#");
  const hasQueryKey = new RegExp(`[?&]${queryKey}(=|$)`).test(pathAndQuery);
  const joiner = pathAndQuery.includes("?") ? "&" : "?";
  const finalPath = hasQueryKey
    ? `${pathAndQuery}${String(id)}`
    : `${pathAndQuery}${joiner}${queryKey}=${encodeURIComponent(String(id))}`;
  return hash ? `${finalPath}#${hash}` : finalPath;
}

// ---- Props ----------------------------------------------------------------
type KTACardProps = {
  /** Jika tidak diisi, component akan coba ambil dari session (user login). */
  memberId?: number | string;
  /** Route tujuan saat card di-click. Bisa "/admin/kta/[id]" atau "/admin/kta" (nanti jadi ?memberId=). */
  onClickRoute?: string;
  /** Override data (opsional). */
  dataOverride?: Partial<AnggotaLike>;
};

export function KTACard({
  memberId,
  onClickRoute = "/admin/kta",
  dataOverride,
}: KTACardProps) {
  const router = useRouter();

  // 1) Kalau memberId tidak ada, ambil dari user yang login
  const meShouldSkip = Boolean(memberId || dataOverride);
  const { data: meData } = useGetCurrentUserQuery(
    meShouldSkip ? skipToken : undefined
  );
  const me = (meData as MeData) ?? undefined;

  const meAnggotaId: number | string | undefined =
    typeof me?.anggota_id === "number" || typeof me?.anggota_id === "string"
      ? me.anggota_id
      : typeof me?.anggota?.id === "number" ||
        typeof me?.anggota?.id === "string"
      ? me?.anggota?.id
      : undefined;

  const resolvedId = memberId ?? meAnggotaId;

  const anggotaId: number | undefined =
    typeof resolvedId === "number"
      ? resolvedId
      : typeof resolvedId === "string" && /^\d+$/.test(resolvedId)
      ? Number(resolvedId)
      : undefined;

  const shouldSkip = !anggotaId || Boolean(dataOverride);

  // 2) Ambil detail anggota bila ada id (kecuali sudah diberi dataOverride)
  const { data: anggotaData, isLoading } = useGetAnggotaByIdQuery(
    shouldSkip ? skipToken : anggotaId
  );

  // 3) Sumber data akhir
  const raw: AnggotaLike | undefined = useMemo(() => {
    if (dataOverride && Object.keys(dataOverride).length > 0) {
      return dataOverride as AnggotaLike;
    }
    return (anggotaData as AnggotaLike | undefined) ?? undefined;
  }, [anggotaData, dataOverride]);

  const rawId: number | undefined =
    typeof raw?.id === "number"
      ? raw.id
      : typeof raw?.id === "string" && /^\d+$/.test(raw.id)
      ? Number(raw.id)
      : undefined;

  const idToSend = anggotaId ?? rawId;

  // 4) View model kartu
  const view: KtaMemberView = useMemo(() => {
    const idStr = pickString(
      raw?.member_id,
      raw?.memberId,
      raw?.kta_number,
      raw?.card_number,
      raw?.reference,
      raw?.ref_number && `KTA-${raw.ref_number}`
    );
    const nameStr = pickString(raw?.name, (meData as MeData)?.name);
    const pob = pickString(raw?.birth_place);
    const dob = pickString(raw?.birth_date);
    const addr = pickString(raw?.address);

    const provinceName =
      pickString(raw?.province_name, pickNamed(raw?.province, "name")) ??
      undefined;
    const regencyName =
      pickString(raw?.regency_name, pickNamed(raw?.regency, "name")) ??
      undefined;
    const districtName =
      pickString(raw?.district_name, pickNamed(raw?.district, "name")) ??
      undefined;
    const villageName =
      pickString(raw?.village_name, pickNamed(raw?.village, "name")) ??
      undefined;

    const since = pickString(raw?.member_since, raw?.created_at);

    return {
      memberId: idStr,
      memberName: nameStr,
      placeOfBirth: pob,
      dateOfBirth: fmtDate(dob),
      address: addr,
      kelurahan: villageName,
      kecamatan: districtName,
      province: provinceName ?? regencyName,
      memberSince: fmtDate(since),
    };
  }, [raw, meData]);

  // 5) Loading skeleton
  if (!raw && isLoading) {
    return (
      <Card className="relative w-full overflow-hidden rounded-xl shadow-xl border-0 text-[13px] p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-5 w-40 bg-gray-200 dark:bg-zinc-700 rounded" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-3 bg-gray-200 dark:bg-zinc-700 rounded" />
            <div className="h-3 bg-gray-200 dark:bg-zinc-700 rounded" />
            <div className="h-3 bg-gray-200 dark:bg-zinc-700 rounded" />
            <div className="h-3 bg-gray-200 dark:bg-zinc-700 rounded" />
            <div className="h-3 bg-gray-200 dark:bg-zinc-700 rounded" />
            <div className="h-3 bg-gray-200 dark:bg-zinc-700 rounded" />
          </div>
        </div>
      </Card>
    );
  }

  const empty = !raw || !view.memberName;

  return (
    <Card
      onClick={() =>
        router.push(buildRouteWithId(onClickRoute, idToSend, "memberId"))
      }
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
          <p className="text-sm font-medium opacity-90 tracking-widest">
            KARTU TANDA ANGGOTA
          </p>
          <div className="w-10 h-7 bg-yellow-300 rounded-md relative shadow-inner">
            <div className="absolute inset-1 border border-yellow-600 rounded-md" />
            <div className="absolute inset-x-2 top-1/2 h-[1px] bg-yellow-600 opacity-60" />
          </div>
        </div>

        {/* Content */}
        {empty ? (
          <div className="py-4">
            <p className="text-sm opacity-90">Data anggota belum tersedia.</p>
            <p className="text-xs opacity-80">Klik untuk melengkapi data.</p>
          </div>
        ) : (
          <div className="grid grid-cols-[auto_1fr] gap-x-10 sm:gap-x-14 gap-y-1">
            <span className="opacity-90">No</span>
            <span className="font-semibold ">{view.memberId ?? "-"}</span>

            <span className="opacity-90">Nama</span>
            <span className="font-semibold ">{view.memberName ?? "-"}</span>

            <span className="opacity-90">Tgl Lahir</span>
            <span>{view.dateOfBirth ? `${view.dateOfBirth}` : ""}</span>

            <span className="opacity-90">Alamat</span>
            <span className="leading-snug">{view.address ?? "-"}</span>

            {/* <span className="opacity-90">Kelurahan</span>
            <span>{view.kelurahan ?? "-"}</span>

            <span className="opacity-90">Kecamatan</span>
            <span>{view.kecamatan ?? "-"}</span>

            <span className="opacity-90">Provinsi</span>
            <span>{view.province ?? "-"}</span> */}
          </div>
        )}

        {/* Footer branding */}
        <div className="flex justify-between items-center pt-2 border-t border-white/20">
          <span className="text-xs opacity-85">
            {view.memberSince ? `Anggota sejak ${view.memberSince}` : ""}
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

export default KTACard;

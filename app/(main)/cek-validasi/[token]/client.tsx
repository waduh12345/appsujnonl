"use client";

import { useMemo, useRef } from "react";
import { KTACard } from "@/components/kta-card-admin";
import KTACardBack from "@/components/kta-card-back-admin";
import { useGetAnggotaByReferenceQuery } from "@/services/admin/anggota.service";
import type { Anggota } from "@/types/admin/anggota";

/** sensor nomor: tampil 5 digit terakhir */
function maskMemberNumber(source: string, visible = 5): string {
  const s = String(source ?? "");
  const last = s.slice(-visible);
  return "*".repeat(Math.max(0, s.length - visible)) + last;
}

function pickField(obj: unknown, key: string): string | undefined {
  if (typeof obj !== "object" || obj === null) return undefined;
  const rec = obj as Record<string, unknown>;
  const v = rec[key];
  return typeof v === "string" && v.trim() ? v : undefined;
}

type Props = { memberRef: string; token: string };

export default function CekValidasiClient({ memberRef, token }: Props) {
  const printRef = useRef<HTMLDivElement | null>(null);

  // Ambil data anggota berdasar reference (string)
  const { data } = useGetAnggotaByReferenceQuery(memberRef, {
    skip: memberRef.trim().length === 0,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: false,
    refetchOnReconnect: false,
  });

  // Override untuk menyensor nomor di kartu depan
  const override:
    | Partial<
        Anggota & {
          kta_number: string;
          member_id: string;
          memberId: string;
          card_number: string;
          reference: string;
        }
      >
    | undefined = useMemo(() => {
    if (!data) return undefined;

    const original =
      pickField(data, "reference") ??
      pickField(data, "kta_number") ??
      pickField(data, "member_id") ??
      pickField(data, "memberId") ??
      pickField(data, "card_number") ??
      memberRef;

    const masked = maskMemberNumber(original, 5);

    return {
      ...data,
      kta_number: masked,
      member_id: masked,
      memberId: masked,
      card_number: masked,
      reference: masked,
    };
  }, [data, memberRef]);

  return (
    <div ref={printRef} className="space-y-6 py-10">
      <div className="flex items-center justify-center">
        <KTACard dataOverride={override} />
      </div>

      <div className="flex items-center justify-center">
        {/* kirim TOKEN agar QR belakang menunjuk /cek-validasi/<token> */}
        <KTACardBack qrPayload={token} />
      </div>
    </div>
  );
}
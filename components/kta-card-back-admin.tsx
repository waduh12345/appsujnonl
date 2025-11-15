"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useGetAnggotaByIdQuery } from "@/services/admin/anggota.service";

/* ===== Helpers (browser) ===== */
const te = new TextEncoder();

function b64urlEncode(bytes: Uint8Array): string {
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function deriveKey(secret: string): Promise<CryptoKey> {
  const h = await crypto.subtle.digest("SHA-256", te.encode(secret));
  return crypto.subtle.importKey("raw", h, { name: "AES-GCM" }, false, [
    "encrypt",
  ]);
}

async function encryptToToken(plain: string, secret: string): Promise<string> {
  const key = await deriveKey(secret);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    te.encode(plain)
  );
  const ctTag = new Uint8Array(enc as ArrayBuffer);
  const out = new Uint8Array(iv.length + ctTag.length);
  out.set(iv, 0);
  out.set(ctTag, iv.length);
  return b64urlEncode(out);
}

/* ===== Base URL (prefer NEXTAUTH_URL) ===== */
function pickOrigin(): string {
  const cands = [
    (process.env.NEXTAUTH_URL ?? "").trim(),
    (process.env.NEXT_PUBLIC_SITE_URL ?? "").trim(),
  ].filter(Boolean);
  const chosen =
    cands[0] ||
    (typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:3000");
  return chosen.replace(/\/+$/, "");
}

/* ===== Safe readers (tanpa any) ===== */
function readReferenceFromSessionUser(user: unknown): string | undefined {
  if (!user || typeof user !== "object") return undefined;
  const u = user as Record<string, unknown>;
  const anggota = u["anggota"];
  if (!anggota || typeof anggota !== "object") return undefined;
  const ref = (anggota as Record<string, unknown>)["reference"];
  return typeof ref === "string" && ref.trim() ? ref : undefined;
}

/* ===== Props ===== */
type Props = {
  /** Prioritas #1: langsung pakai reference yang dikirim */
  reference?: string;
  /** Prioritas #2: jika reference tidak ada → ambil reference dari anggota by ID */
  userId?: number;
  /** Override total: jika diisi, QR akan pakai payload ini (mis. token /cek-validasi) */
  qrPayload?: string;
};

const FRONT_SECRET = process.env.NEXT_PUBLIC_KTA_URL_SECRET ?? "";

export default function KTACardBack({ reference, userId, qrPayload }: Props) {
  const { data: session } = useSession();
  const origin = useMemo(() => pickOrigin(), []);
  const [qrSrc, setQrSrc] = useState<string>("");

  // ambil reference by userId (jika disediakan)
  const { data: anggotaById } = useGetAnggotaByIdQuery(userId as number, {
    skip: typeof userId !== "number",
    refetchOnMountOrArgChange: false,
    refetchOnFocus: false,
    refetchOnReconnect: false,
  });

  const resolvedReference = useMemo(() => {
    const refFromProp =
      typeof reference === "string" && reference.trim()
        ? reference.trim()
        : undefined;
    const refFromId =
      typeof anggotaById?.reference === "string" && anggotaById.reference.trim()
        ? anggotaById.reference.trim()
        : undefined;
    const refFromSession = readReferenceFromSessionUser(session?.user);

    return refFromProp ?? refFromId ?? refFromSession;
  }, [reference, anggotaById?.reference, session?.user]);

  useEffect(() => {
    let cancelled = false;

    async function build() {
      // Bila qrPayload disediakan (mis. halaman /cek-validasi), langsung gunakan
      const payload = qrPayload ?? resolvedReference;
      if (!payload) {
        if (!cancelled) setQrSrc("");
        return;
      }

      try {
        const token = FRONT_SECRET
          ? await encryptToToken(payload, FRONT_SECRET)
          : payload;
        const url = `${origin}/cek-validasi/${encodeURIComponent(token)}`;
        const img = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
          url
        )}`;
        if (!cancelled) setQrSrc(img);
      } catch {
        if (!cancelled) setQrSrc("");
      }
    }

    build();
    return () => {
      cancelled = true;
    };
  }, [qrPayload, resolvedReference, origin]);

  return (
    <div
      className="w-full h-full rounded-xl shadow-xl overflow-hidden p-6 space-y-4"
      style={{
        background:
          "linear-gradient(145deg, var(--secondary) 0%, var(--primary) 95%)",
      }}
    >
      <div className="flex text-white">
        <div className="w-2/3 pr-3 overflow-hidden">
          <h3 className="font-semibold mb-2">Ketentuan Keanggotaan</h3>
          <ul className="text-xs leading-snug list-disc pl-5 opacity-90 space-y-1">
            <li>Anggota wajib menjaga kerahasiaan data Digital KTA.</li>
            <li>Kartu hanya digunakan untuk keperluan resmi Digital KTA.</li>
            <li>Segera laporkan kehilangan atau penyalahgunaan ke admin.</li>
          </ul>
        </div>

        <div className="w-1/3 flex flex-col items-start justify-start self-start">
          <div className="bg-white p-2 rounded-md">
            {qrSrc ? (
              <Image src={qrSrc} alt="QR KTA" width={160} height={160} />
            ) : (
              <div className="w-[220px] h-[220px] bg-white/60 rounded flex items-center justify-center text-xs text-black/60">
                QR tidak tersedia
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center border-t border-white/20">
        <span className="text-xs opacity-85" />
        <div className="flex items-center gap-2">
          <Image src="/icon-flag.png" alt="Logo KTA" width={20} height={20} />
          <span className="font-bold text-base italic text-white">
            🇮🇩 e-KTA
          </span>
        </div>
      </div>
    </div>
  );
}
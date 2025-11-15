"use client";

import { PrinterIcon, IdCard } from "lucide-react";
import { useRef, useMemo, Suspense } from "react";
import { useSearchParams, useParams } from "next/navigation";
import { KTACard } from "@/components/kta-card-admin";
import KTACardBack from "@/components/kta-card-back-admin";
import { Button } from "@/components/ui/button";

function KtaPageFallback() {
  return (
    <div className="min-h-screen bg-background p-4 animate-pulse">
      <div className="h-10 w-1/3 bg-muted rounded mb-4" />
      <div className="h-6 w-2/3 bg-muted rounded mb-6" />
      <div className="h-[220px] bg-muted rounded mb-4" />
      <div className="h-[220px] bg-muted rounded mb-6" />
      <div className="h-12 w-full bg-muted rounded" />
    </div>
  );
}

function KtaPageContent() {
  const searchParams = useSearchParams();
  const params = useParams();

  const rawId: string | undefined =
    (typeof params?.id === "string" ? (params.id as string) : undefined) ??
    searchParams?.get("id") ??
    searchParams?.get("memberId") ??
    undefined;

  const numericId = useMemo<number | undefined>(() => {
    if (!rawId) return undefined;
    return /^\d+$/.test(rawId) ? Number(rawId) : undefined;
  }, [rawId]);

  const backId: string = rawId ?? "KTA-001234";

  const printRef = useRef<HTMLDivElement | null>(null);
  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Global styles: samakan tinggi via aspect-ratio + ukuran print konsisten */}
      <style jsx global>{`
        :root {
          /* Lebar pratinjau & cetak */
          --card-width-preview: 130mm; /* tampil di layar */
          --card-width-print: 130mm; /* ukuran tetap saat print */
          --page-margin: 8mm;
          --card-gap: 10mm;
        }

        /* Frame pembungkus yang MENENTUKAN ukuran kartu.
           Gunakan rasio kartu ISO ID-1 (85.6mm x 54mm) agar tinggi selalu sama. */
        .kta-card-frame {
          width: var(--card-width-preview);
          aspect-ratio: 120 / 54; /* <- samakan tinggi otomatis */
          display: grid; /* biar inner bisa stretch full */
          place-items: stretch;
          break-inside: avoid;
          page-break-inside: avoid;
          overflow: hidden; /* antisipasi konten overflow */
          border-radius: 0.75rem; /* opsional: sudut konsisten */
        }

        /* Inner memastikan child mengisi penuh frame */
        .kta-card-inner {
          width: 100%;
          height: 100%;
          display: block;
        }

        /* Area print bersebelahan */
        .print-area {
          display: flex;
          flex-direction: row;
          align-items: flex-start;
          justify-content: center;
          gap: var(--card-gap);
          flex-wrap: nowrap;
        }

        @media print {
          @page {
            size: A4 landscape; /* 2 kartu berdampingan */
            margin: var(--page-margin);
          }

          html,
          body,
          #__next {
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
            overflow: visible !important;
            background: transparent !important;
          }

          body * {
            visibility: hidden !important;
          }

          .print-area,
          .print-area * {
            visibility: visible !important;
          }

          .print-area {
            position: fixed;
            inset: 0;
            margin: var(--page-margin);
            gap: var(--card-gap);
          }

          /* Saat print, kunci lebar & rasio sama → tinggi otomatis identik */
          .kta-card-frame {
            width: var(--card-width-print) !important;
            aspect-ratio: 120 / 54;
            break-inside: avoid;
            page-break-inside: avoid;
          }

          /* Warna full saat print */
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="space-y-6">
        {/* Header (hilang saat print) */}
        <div className="pt-2 flex gap-3 no-print">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <IdCard className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground leading-tight">
              Kartu Anggota
            </h1>
            <p className="text-sm text-muted-foreground">
              Tampilan depan & belakang kartu, tinggi selalu sama, siap cetak
            </p>
          </div>
        </div>

        {/* === Area yang dicetak (dua kartu berdampingan) === */}
        <div
          ref={printRef}
          className="print-area flex md:flex-row flex-col items-stretch gap-[var(--card-gap)]"
        >
          {/* Depan */}
          <div className="kta-card-frame shadow-sm bg-transparent">
            <div className="kta-card-inner">
              <KTACard memberId={numericId} onClickRoute="/admin/kta" />
            </div>
          </div>

          {/* Belakang */}
          <div className="kta-card-frame shadow-sm bg-transparent">
            <div className="kta-card-inner">
              <KTACardBack
                userId={numericId}
                reference={
                  typeof backId === "string" && !/^\d+$/.test(backId)
                    ? backId
                    : undefined
                }
              />
            </div>
          </div>
        </div>

        {/* Tombol Print (hilang saat print) */}
        <div className="no-print">
          <Button className="w-full" onClick={handlePrint} size="lg">
            <PrinterIcon className="mr-2 h-4 w-4" />
            <span>Print / Download PDF</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function KtaPage() {
  return (
    <Suspense fallback={<KtaPageFallback />}>
      <KtaPageContent />
    </Suspense>
  );
}
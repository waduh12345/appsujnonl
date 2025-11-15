"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PrinterIcon } from "lucide-react";
import { KTACard } from "@/components/kta-card-admin";
import KTACardBack from "@/components/kta-card-back-admin";
import { useGetAnggotaListQuery } from "@/services/admin/anggota.service";
import type { Anggota } from "@/types/admin/anggota";

/** Wrapper WAJIB: supaya useSearchParams ada di dalam Suspense */
export default function BatchKtaPage() {
  return (
    <Suspense fallback={<div className="p-4 text-sm">Memuat parameter…</div>}>
      <BatchKtaContent />
    </Suspense>
  );
}

function BatchKtaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Ambil kelurahan dari sessionStorage (diset di halaman list)
  const [villageId, setVillageId] = useState<string | null>(null);
  const [villageName, setVillageName] = useState<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    setVillageId(sessionStorage.getItem("batch_kta_village_id"));
    setVillageName(sessionStorage.getItem("batch_kta_village_name") ?? "");
  }, []);

  // Param hanya page & paginate
  const startPage = useMemo(
    () => Number(searchParams.get("page") ?? 1),
    [searchParams]
  );
  const perPage = useMemo(
    () => Number(searchParams.get("paginate") ?? 100),
    [searchParams]
  );

  // Kumpulkan semua anggota by kelurahan (multi page)
  const [page, setPage] = useState<number>(startPage);
  const [acc, setAcc] = useState<Anggota[]>([]);
  const [done, setDone] = useState<boolean>(false);

  const { data, isFetching, isLoading } = useGetAnggotaListQuery(
    { page, paginate: perPage, village_id: villageId ?? undefined },
    { skip: !villageId || done }
  );

  useEffect(() => {
    if (!data) return;
    const items = data.data ?? [];
    setAcc((prev) => {
      const map = new Map<number, Anggota>();
      prev.forEach((x) => map.set(x.id, x));
      items.forEach((x) => map.set(x.id, x));
      return Array.from(map.values());
    });

    const lastPage = data.last_page ?? 1;
    if (page < lastPage) setPage((p) => p + 1);
    else setDone(true);
  }, [data, page]);

  const printRef = useRef<HTMLDivElement | null>(null);
  const handlePrint = () => window.print();

  const loadingText = !villageId
    ? "Kelurahan belum dipilih. Kembali ke halaman Anggota."
    : isLoading && acc.length === 0
    ? "Mengambil data..."
    : isFetching && !done
    ? `Memuat halaman ${page}...`
    : done
    ? `Siap cetak (${acc.length} anggota)`
    : "Menyiapkan...";

  return (
    <div className="min-h-screen bg-background p-4">
      {/* PRINT CSS */}
      <style jsx global>{`
        :root {
          /* Lebar pratinjau & cetak per kartu */
          --card-width-screen: 130mm; /* preview */
          --card-width-print: 130mm; /* print (muat 2 kartu di A4 landscape) */
          --page-margin: 8mm;
          --gap-screen: 10mm;
          --gap-print: 10mm;
        }

        /* ======== PREVIEW (LAYAR) ======== */
        /* Frame pembungkus yang MENENTUKAN ukuran kartu */
        .kta-card-frame {
          width: var(--card-width-screen);
          aspect-ratio: 120 / 54; /* ukuran ID-1 → tinggi selalu sama */
          display: grid;
          place-items: stretch;
          overflow: hidden;
          border-radius: 0.75rem;
          break-inside: avoid;
          page-break-inside: avoid;
        }

        /* Satu anggota = 2 kartu (depan & belakang) */
        .kta-sheet {
          display: grid;
          grid-template-columns: 1fr;
          justify-items: center;
          row-gap: var(--gap-screen);
          margin: 0 0 var(--gap-screen) 0;
        }

        /* Lebar besar → tampil side-by-side juga saat preview */
        @media (min-width: 1024px) {
          .kta-sheet {
            grid-template-columns: 1fr 1fr;
            column-gap: var(--gap-screen);
            row-gap: 0;
          }
        }

        /* ======== PRINT ======== */
        @media print {
          @page {
            size: A4 landscape; /* dua kartu berdampingan */
            margin: var(--page-margin);
          }

          /* Lepas batas height/scroll di shell app */
          html,
          body,
          #__next,
          #__next > *,
          main,
          .min-h-screen,
          .h-screen,
          .max-h-screen {
            height: auto !important;
            max-height: none !important;
            overflow: visible !important;
          }
          [class*="overflow-"],
          [class*="max-h-"] {
            overflow: visible !important;
            max-height: none !important;
          }

          /* Hanya area print yang terlihat */
          body * {
            visibility: hidden !important;
          }
          #kta-print-root,
          #kta-print-root * {
            visibility: visible !important;
          }

          #kta-print-root {
            position: static !important;
            display: block !important;
            overflow: visible !important;
          }

          /* Setiap pasangan kartu tetap satu baris & tak terbelah halaman */
          .kta-sheet {
            display: flex !important;
            flex-direction: row;
            justify-content: center;
            align-items: flex-start;
            gap: var(--gap-print);
            margin: 0 0 var(--gap-print) 0 !important;
            padding: 0 !important;
            break-inside: avoid-page;
            page-break-inside: avoid;
          }

          /* Frame kartu saat cetak */
          .kta-card-frame {
            width: var(--card-width-print) !important;
            aspect-ratio: 120 / 54;
            margin: 0 !important;
            break-inside: avoid;
            page-break-inside: avoid;
          }

          /* Warna full saat print */
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          /* Sembunyikan kontrol UI */
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Header (non-print) */}
      <div className="no-print mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Batch KTA (Kelurahan)</h1>
          <p className="text-sm text-muted-foreground">
            {villageName
              ? `Kelurahan: ${villageName}`
              : "Kelurahan tidak diketahui"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{loadingText}</p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="no-print"
          >
            Kembali
          </Button>
          <Button
            onClick={handlePrint}
            disabled={!done || acc.length === 0 || !villageId}
          >
            <PrinterIcon className="mr-2 h-4 w-4" />
            Print / Download PDF
          </Button>
        </div>
      </div>

      {!villageId ? (
        <div className="no-print text-sm text-destructive">
          Kelurahan belum dipilih. Silakan kembali ke halaman Anggota, pilih
          Kelurahan, lalu klik Generate KTA.
        </div>
      ) : null}

      {/* ===== Area cetak: konten mengalir, auto tambah halaman ===== */}
      <div id="kta-print-root" ref={printRef}>
        {acc.map((m) => (
          <section key={m.id} className="kta-sheet">
            {/* Depan (kiri) */}
            <div className="kta-card-frame">
              <KTACard memberId={m.id} onClickRoute="/admin/kta/[id]" />
            </div>

            {/* Belakang (kanan) */}
            <div className="kta-card-frame">
              <KTACardBack reference={m.reference ?? undefined} userId={m.id} />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
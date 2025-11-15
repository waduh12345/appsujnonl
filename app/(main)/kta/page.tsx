"use client";

import { PrinterIcon, IdCard } from "lucide-react";
import { useRef } from "react";
import { KTACard } from "@/components/kta-card-admin";
import KTACardBack from "@/components/kta-card-back-admin";
import { Button } from "@/components/ui/button";

export default function KtaPage() {
  const printRef = useRef<HTMLDivElement | null>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Print-only CSS: kiri–kanan saat print, layar tetap seperti sekarang */}
      <style jsx global>{`
        :root {
          --card-width-print: 130mm; /* lebar tiap kartu saat print */
          --page-margin: 8mm;
          --card-gap: 10mm; /* jarak antar kartu saat print */
        }

        /* LAYAR (default): jangan mengubah layout yang ada */
        .kta-card-frame {
          display: contents; /* tidak mempengaruhi layout saat layar */
        }

        @media print {
          @page {
            size: A4 landscape; /* 2 kartu berdampingan */
            margin: var(--page-margin);
          }

          /* Lepas batasan tinggi/scrolling di shell app */
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

          /* Sembunyikan elemen non-print, tampilkan area print */
          body * {
            visibility: hidden !important;
          }
          #kta-print-root,
          #kta-print-root * {
            visibility: visible !important;
          }

          /* Kiri–kanan hanya saat print */
          #kta-print-root {
            display: flex !important;
            flex-direction: row !important;
            justify-content: center !important;
            align-items: flex-start !important;
            gap: var(--card-gap) !important;
            position: static !important;
            margin: 0 !important;
          }

          /* Frame kartu: samakan tinggi via aspect ratio ID-1 */
          .kta-card-frame {
            display: block !important;
            width: var(--card-width-print) !important;
            aspect-ratio: 120 / 54;
            break-inside: avoid;
            page-break-inside: avoid;
            border-radius: 0.75rem; /* opsional */
            overflow: hidden; /* antisipasi konten overflow */
          }

          /* Pastikan komponen mengisi penuh frame */
          .kta-card-frame > * {
            width: 100% !important;
            height: 100% !important;
            display: block !important;
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
        {/* Header */}
        <div className="pt-2 flex gap-3 no-print">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <IdCard className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground leading-tight">
              Kartu Anggota
            </h1>
            <p className="text-sm text-muted-foreground">
              Tampilan depan dan belakang kartu, siap cetak
            </p>
          </div>
        </div>

        {/* LAYAR: tetap atas–bawah. PRINT: jadi kiri–kanan */}
        <div ref={printRef} id="kta-print-root" className="space-y-6">
          <div className="flex items-center justify-center">
            <div className="kta-card-frame">
              <KTACard />
            </div>
          </div>
          <div className="flex items-center justify-center">
            {/* Tanpa prop: QR otomatis dari session.user.anggota.reference */}
            <div className="kta-card-frame">
              <KTACardBack />
            </div>
          </div>
        </div>

        <div>
          <Button className="w-full no-print" onClick={handlePrint} size="lg">
            <PrinterIcon />
            <span className="ml-2">Print / Download PDF</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
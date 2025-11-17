"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Play, RotateCcw, Clock3, ListChecks } from "lucide-react";
import {
  useGetParticipantHistoryByIdQuery,
  useGetActiveCategoryQuery,
  useContinueCategoryMutation,
} from "@/services/student/tryout.service";
import Swal from "sweetalert2";

function formatDurationFromSeconds(seconds?: number) {
  if (!seconds || seconds <= 0) return "-";
  const totalMin = Math.round(seconds / 60);
  if (totalMin < 60) return `${totalMin} menit`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${h} jam${m ? ` ${m} menit` : ""}`;
}

/** Daftar aturan/larangan yang akan ditampilkan di halaman & modal konfirmasi */
const RULES: readonly string[] = [
  "Jangan refresh atau menutup tab selama ujian berlangsung",
  "Jangan keluar dari mode layar penuh dan jangan menekan tombol Esc",
  "Jangan berpindah tab atau meminimalkan jendela",
  "Jangan membuka Developer Tools (F12, Ctrl+Shift-I/J/C, Ctrl+U)",
  "Jangan menyalin, menempel, klik kanan, drag, atau menyeleksi teks",
  "Jangan menyimpan atau mencetak halaman (Ctrl+S / Ctrl+P)",
];

export default function StartTryoutPage() {
  const params = useParams<{ participantTestId: string }>();
  const participantTestId = Number(params.participantTestId);
  const router = useRouter();

  const { data: detail, isFetching: loadingDetail } = useGetParticipantHistoryByIdQuery(participantTestId);
  const { data: activeCategory, isFetching: loadingActiveCategory } =
    useGetActiveCategoryQuery(participantTestId);
  const [continueCategory, { isLoading: starting }] =
    useContinueCategoryMutation();

  const isFetching = loadingDetail || loadingActiveCategory;

  async function handleStart() {
    if (!activeCategory) {
      await Swal.fire({
        icon: "info",
        title: "Tidak ada kategori aktif",
        text: "Sesi mungkin sudah selesai atau belum dimulai.",
      });
      return;
    }

    // Modal konfirmasi aturan
    const htmlList = `<ol style="text-align:left;margin:0 0 0 1em;padding:0;font-size: 14px;">
      ${RULES.map((r) => `<li style="margin:8px 0;">${r}</li>`).join("")}
      </ol>
      <p style="margin-top:15px;font-size: 14px;"><strong>Pelanggaran berulang dapat membuat sesi otomatis terselesaikan.</strong></p>
      <p style="margin-top:4px;font-size: 14px;">Menekan <strong>Esc</strong> akan memicu peringatan dan dapat langsung mensubmit ujian.</p>`;

    const confirm = await Swal.fire({
      icon: "warning",
      title: "Konfirmasi Aturan Ujian",
      html: htmlList,
      confirmButtonText: "Saya mengerti dan setuju",
      cancelButtonText: "Batal",
      showCancelButton: true,
      reverseButtons: true,
      focusConfirm: false,
      customClass: {
        popup: 'w-11/12 max-w-lg', // Lebar popup lebih responsif
      }
    });

    if (!confirm.isConfirmed) return;

    try {
      await continueCategory({
        participant_test_id: participantTestId,
        participant_category_id: activeCategory.id,
      }).unwrap();
      router.push(
        `/tryout/session/${participantTestId}/exam?category=${activeCategory.id}`
      );
    } catch (e) {
      await Swal.fire({
        icon: "error",
        title: "Gagal memulai sesi kategori",
        text: e instanceof Error ? e.message : "Coba lagi.",
      });
    }
  }

  const isResume = !!activeCategory;
  const isTryoutAvailable = !!detail && !isFetching;

  const testTitle = detail?.test_details.title ?? "Ujian Tryout";
  const timerType = detail?.test_details.timer_type;
  const totalTime = detail?.test_details.total_time;
  const totalQuestions = detail?.test_details.total_questions;

  return (
    <div className="min-h-screen p-4 md:p-0">
      <div className="mx-auto w-full max-w-4xl py-6">
        {/* Header Responsif */}
        <div className="mb-6 flex items-center justify-between">
          <Button variant="outline" asChild className="rounded-xl border-zinc-200 text-zinc-700 hover:bg-zinc-50">
            <Link href="/tryout">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali
            </Link>
          </Button>
          <h1 className="text-xl font-semibold text-center md:text-2xl">
            {isResume ? "Lanjutkan Ujian" : "Mulai Ujian"}
          </h1>
          <div className="w-20 hidden md:block" /> {/* Spacer */}
        </div>

        {/* Konten Utama */}
        <section className="overflow-hidden rounded-3xl border bg-white p-4 shadow-xl md:p-6">
          <div className="mx-auto max-w-3xl rounded-2xl bg-gradient-to-br from-sky-600 to-sky-500 p-5 text-white shadow ring-1 ring-white/10 md:p-6">
            <h2 className="text-center text-lg font-semibold md:text-xl">
              Pastikan Anda siap sebelum {isResume ? "melanjutkan" : "memulai"}{" "}
              ujian
            </h2>

            {/* Detail Ujian */}
            <div className="mt-5 rounded-xl bg-white p-4 text-zinc-900 md:p-5">
              <h3 className="text-lg font-bold mb-3 border-b pb-2 text-sky-700">
                Detail Ujian
              </h3>
              {isFetching ? (
                <div className="space-y-3">
                  <div className="h-4 w-full animate-pulse rounded bg-zinc-200" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-zinc-200" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-zinc-200" />
                </div>
              ) : isTryoutAvailable ? (
                <div className="space-y-3">
                  <Row label="Nama Ujian" value={testTitle} />
                  <Row
                    label="Durasi"
                    icon={<Clock3 className="h-4 w-4 text-sky-600" />}
                    value={
                      timerType === "per_category"
                        ? "Per kategori"
                        : formatDurationFromSeconds(totalTime)
                    }
                  />
                  <Row
                    label="Total Soal"
                    icon={<ListChecks className="h-4 w-4 text-sky-600" />}
                    value={`${totalQuestions ?? 0}`}
                  />
                </div>
              ) : (
                <p className="text-sm text-red-600">Detail ujian tidak dapat dimuat.</p>
              )}
            </div>

            {/* Catatan penting / Larangan */}
            <div className="mt-6 text-sm">
              <p className="mb-2 font-semibold text-white">
                ⚠️ Aturan Penting Selama Ujian:
              </p>
              <ul className="list-inside list-disc space-y-2 text-white/90 px-2 md:px-0">
                {RULES.map((rule) => (
                  <li key={rule} className="text-sm leading-relaxed">
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <Button
              className="w-full sm:w-auto rounded-xl bg-sky-600 px-8 py-3 text-lg font-semibold hover:bg-sky-700"
              onClick={handleStart}
              disabled={isFetching || starting || !activeCategory}
            >
              {isResume ? (
                <>
                  <RotateCcw className="mr-3 h-5 w-5" />
                  Lanjutkan Ujian
                </>
              ) : (
                <>
                  <Play className="mr-3 h-5 w-5" />
                  Mulai Ujian
                </>
              )}
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}

// Komponen Row yang diperbarui untuk mobile responsif
function Row({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    // Menggunakan 2 kolom di mobile dan 3 di desktop untuk Row
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm items-start">
      <div className="col-span-1 text-zinc-600 flex items-center gap-2">
        {icon}
        {label}
      </div>
      <div className="col-span-2 font-semibold sm:font-medium break-words">{value}</div>
    </div>
  );
}
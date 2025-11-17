"use client";

import { useMemo } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock3, ListChecks, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetParticipantHistoryListQuery } from "@/services/student/tryout.service";
import dynamic from "next/dynamic";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import type { ParticipantHistoryItem } from "@/types/student/tryout";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);
// Pastikan dynamic import ada di luar component agar tidak melanggar rules
const Bar = dynamic(() => import("react-chartjs-2").then((m) => m.Bar), {
  ssr: false,
});

type WithScoreBreakdown = { total_correct: number; total_incorrect: number };
function hasBreakdown(
  x: unknown
): x is ParticipantHistoryItem & WithScoreBreakdown {
  return (
    typeof x === "object" &&
    x !== null &&
    "total_correct" in x &&
    "total_incorrect" in x
  );
}

// Utilitas untuk memformat tanggal
function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("id-ID", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

import { Suspense } from "react";

function TryoutResultPageInner() {
  const params = useParams<{ testId: string }>();
  const sp = useSearchParams();
  const justFinished = sp.get("justFinished") === "1";
  const testId = Number(params.testId);

  // Ambil SEMUA riwayat (tanpa filter is_completed / is_ongoing)
  const { data, isFetching } = useGetParticipantHistoryListQuery({
    page: 1,
    paginate: 100,
  });

  const attempts = useMemo<ParticipantHistoryItem[]>(() => {
    const all = data?.data ?? [];
    return all
      .filter((i) => i.test_id === testId)
      .sort((a, b) => {
        // Urut berdasarkan waktu selesai atau waktu update (lebih baik daripada hanya created_at)
        const ta = a.end_date ?? a.updated_at ?? a.created_at;
        const tb = b.end_date ?? b.updated_at ?? b.created_at;
        return new Date(ta).getTime() - new Date(tb).getTime();
      });
  }, [data, testId]);

  const latest = attempts[attempts.length - 1];
  const showBreakdown = !!latest && hasBreakdown(latest);

  const labels = attempts.map((a, index) => `Attempt ${index + 1}`);
  const dataset = attempts.map((a) => a.grade ?? 0);

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false, // Penting untuk mobile
    plugins: {
      legend: { display: false }, // Label ditaruh di Title/Header card saja
      title: { 
        display: true, 
        text: "Perkembangan Nilai",
        font: { size: 16 }
      },
      tooltip: {
        callbacks: {
          title: (context) => attempts[context[0].dataIndex]?.test_details?.title ?? `Attempt ${context[0].dataIndex + 1}`,
          label: (context) => `Nilai: ${context.formattedValue}`,
        }
      }
    },
    scales: {
      y: { 
        beginAtZero: true, 
        max: 100, 
        ticks: { stepSize: 10 },
        title: { display: true, text: "Nilai (Grade)"}
      },
      x: {
        ticks: {
          font: { size: 10 } // Ukuran font label X di mobile
        }
      }
    },
  };

  return (
    <div className="min-h-screen p-4 md:p-0"> {/* Tambahkan padding di mobile */}
      <div className="mx-auto w-full max-w-5xl py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="outline" asChild className="rounded-xl border-zinc-200 text-zinc-700 hover:bg-zinc-50">
            <Link href="/tryout">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali
            </Link>
          </Button>
          <h1 className="text-xl font-semibold md:text-2xl">Hasil Tryout</h1>
          <div className="w-20 hidden md:block" />
        </div>
        {/* Banner selesai */}
        {justFinished && latest && (
          <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sky-900 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="inline-grid h-8 w-8 place-items-center rounded-full bg-sky-200 text-sky-700 shrink-0">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold text-base">Sesi selesai! 🎉</div>
                <div className="text-sm">
                  Nilai terakhir Anda:{" "}
                  <span className="font-bold text-lg">{latest.grade ?? 0}</span>
                  {showBreakdown && (
                    <>
                      {" • "}
                      Benar:{" "}
                      <span className="font-semibold text-emerald-700">{latest.total_correct}</span>
                      {" | "}Salah:{" "}
                      <span className="font-semibold text-red-700">{latest.total_incorrect}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Chart Card */}
        <section className="overflow-hidden rounded-3xl border bg-white p-4 shadow-lg md:p-6">
          <h2 className="text-lg font-semibold mb-3 border-b pb-2">Perkembangan Nilai</h2>
          <div className="mb-4 text-sm text-zinc-600">
            Nilai dari semua percobaan pengerjaan Tryout ini.
          </div>
          
          {isFetching ? (
            <div className="h-64 animate-pulse rounded-xl bg-zinc-100" />
          ) : attempts.length ? (
            <div className="h-64 w-full"> {/* Kontainer dengan tinggi tetap */}
              <Bar
                options={options}
                data={{
                  labels,
                  datasets: [
                    {
                      label: "Nilai",
                      data: dataset,
                      backgroundColor: "rgba(14,165,233,0.7)", // sky-500/70
                      borderRadius: 4,
                    },
                  ],
                }}
              />
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-10 text-center text-zinc-600">
              <p className="text-base">Belum ada hasil pengerjaan tryout ini.</p>
              <p className="text-sm mt-2">Mulai kerjakan di halaman Tryout.</p>
            </div>
          )}
        </section>
        {/* Table */}
        <section className="overflow-hidden rounded-3xl border bg-white shadow-lg">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Riwayat Pengerjaan</h2>
          </div>
          <div className="max-w-full overflow-x-auto">
            <table className="min-w-full divide-y">
              <thead className="bg-zinc-50 text-left text-sm font-semibold">
                <tr>
                  <th className="px-4 py-3 whitespace-nowrap">No</th>
                  <th className="px-4 py-3 whitespace-nowrap">Mulai</th>
                  <th className="px-4 py-3 whitespace-nowrap">Selesai</th>
                  <th className="px-4 py-3 whitespace-nowrap text-center">Nilai</th>
                  {showBreakdown && (
                    <>
                      <th className="px-4 py-3 whitespace-nowrap text-center">Benar</th>
                      <th className="px-4 py-3 whitespace-nowrap text-center">Salah</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y">
                {attempts.map((a, idx) => {
                  const rowHasBreakdown = hasBreakdown(a);
                  return (
                    <tr key={a.id} className="text-sm hover:bg-zinc-50/60">
                      <td className="px-4 py-3 font-medium">{idx + 1}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {formatDate(a.start_date ?? a.created_at)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {formatDate(a.end_date)}
                      </td>
                      <td className="px-4 py-3 font-semibold text-center text-sky-700">{a.grade ?? 0}</td>
                      {showBreakdown && (
                        <>
                          <td className="px-4 py-3 text-center text-emerald-600">
                            {rowHasBreakdown ? a.total_correct : "-"}
                          </td>
                          <td className="px-4 py-3 text-center text-red-600">
                            {rowHasBreakdown ? a.total_incorrect : "-"}
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
                {!attempts.length && (
                  <tr>
                    <td
                      className="px-5 py-8 text-center text-zinc-500"
                      colSpan={showBreakdown ? 6 : 4}
                    >
                      Tidak ada data pengerjaan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function TryoutResultPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TryoutResultPageInner />
    </Suspense>
  );
}
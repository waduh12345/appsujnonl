"use client";

import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  HeartHandshake,
  Megaphone,
  Building2,
  Landmark,
  Tent,
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler,
  type ChartData,
  type ChartOptions,
  type TooltipItem,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useGetDashboardAdminQuery } from "@/services/admin/dashboard.service";

// Registrasi Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler
);

// ===== Utilitas =====
const formatNumber = (num: number): string =>
  new Intl.NumberFormat("id-ID").format(num);

// Label bulan
const labels = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

// ===== Data Dummy (hanya jika data API belum tersedia sama sekali) =====
const DUMMY_SUMMARY = {
  totalAnggota: 125430,
  totalRelawan: 88720,
  totalSimpatisan: 215600,
  totalKantorPartai: 34,
  totalKantorOrmas: 12,
  totalPoskoRelawan: 350,
  totalSimses: 5210, // tidak ada di API
  totalTimsus: 1850, // tidak ada di API
};
const DUMMY_MONTHLY_ANGGOTA = [
  110500, 112300, 113800, 115100, 116900, 118200, 119500, 121000, 122400,
  123600, 124500, 125430,
];

export default function DashboardPartaiPage() {
  // ===== Filter Tahun (default tahun berjalan) =====
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState<number>(currentYear);

  // Ambil data
  const { data, isFetching } = useGetDashboardAdminQuery({ year });

  // === Summary: pakai API kalau tersedia; nilai 0 tetap dipakai (BUKAN fallback) ===
  const summary = useMemo(() => {
    if (!data) {
      return DUMMY_SUMMARY;
    }
    return {
      totalAnggota: data.total_anggota ?? 0,
      totalRelawan: data.total_relawan ?? 0,
      totalSimpatisan: data.total_simpatisan ?? 0,
      totalKantorPartai: data.total_kantor_partai ?? 0,
      totalKantorOrmas: data.total_kantor_ormas ?? 0,
      totalPoskoRelawan: data.total_posko_relawan ?? 0,
      // Field di luar kontrak API tetap dummy
      totalSimses: DUMMY_SUMMARY.totalSimses,
      totalTimsus: DUMMY_SUMMARY.totalTimsus,
    };
  }, [data]);

  // === Bulanan anggota: SELALU render dari API jika array tersedia (meski semua 0) ===
  const monthlyAnggotaFromApi: number[] = useMemo(() => {
    if (data?.monthly_new_anggota && Array.isArray(data.monthly_new_anggota)) {
      const arr = Array(12).fill(0);
      for (const it of data.monthly_new_anggota) {
        const m = typeof it.month === "number" ? it.month : 0;
        if (m >= 1 && m <= 12) arr[m - 1] = it.count ?? 0;
      }
      return arr; // tidak cek “semua 0”, biarkan 0 tampil apa adanya
    }
    // kalau field bulanan belum dikirim sama sekali → dummy
    return DUMMY_MONTHLY_ANGGOTA;
  }, [data]);

  const cards = [
    {
      title: "Total Anggota",
      value: formatNumber(summary.totalAnggota),
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Total Relawan",
      value: formatNumber(summary.totalRelawan),
      icon: HeartHandshake,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
    },
    {
      title: "Total Simpatisan",
      value: formatNumber(summary.totalSimpatisan),
      icon: Megaphone,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Total Kantor Partai",
      value: formatNumber(summary.totalKantorPartai),
      icon: Building2,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Total Kantor Ormas",
      value: formatNumber(summary.totalKantorOrmas),
      icon: Landmark,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
    {
      title: "Total Posko Relawan",
      value: formatNumber(summary.totalPoskoRelawan),
      icon: Tent,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
  ] as const;

  // ===== Konfigurasi Grafik (Umum) =====
  const commonChartOptions: ChartOptions<"line" | "bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { position: "top" },
      tooltip: {
        callbacks: {
          label: (ctx: TooltipItem<"line" | "bar">): string => {
            const v = ctx.parsed.y ?? 0;
            return `${ctx.dataset.label ?? "Data"}: ${formatNumber(v)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (tickValue: string | number) =>
            formatNumber(Number(tickValue)),
        },
      },
    },
  };

  // Grafik Anggota → dari API (0 juga ditampilkan)
  const anggotaChartData: ChartData<"line"> = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: "Kenaikan Anggota / Bulan",
          data: monthlyAnggotaFromApi,
          borderColor: "rgba(59,130,246,1)",
          backgroundColor: "rgba(59,130,246,0.2)",
          fill: true,
          tension: 0.35,
          pointRadius: 2,
        },
      ],
    }),
    [monthlyAnggotaFromApi]
  );
  // Opsi tahun (contoh: 6 tahun terakhir)
  const yearOptions = useMemo(
    () => Array.from({ length: 6 }, (_, i) => currentYear - i),
    [currentYear]
  );

  useEffect(() => {
    if (!year) setYear(currentYear);
  }, [year, currentYear]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard Digital KTA
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Ringkasan data keanggotaan dan infrastruktur
          </p>
        </div>

        {/* Filter Tahun */}
        <div className="flex items-center gap-2">
          <label htmlFor="year" className="text-sm text-gray-600">
            Tahun:
          </label>
          <select
            id="year"
            className="h-9 rounded-md border border-gray-300 bg-white px-3 text-sm"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          {isFetching && <span className="text-xs text-gray-500">memuat…</span>}
        </div>
      </div>

      {/* Kartu Ringkasan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <Card
              key={i}
              className="hover:shadow-lg transition-shadow duration-200"
            >
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-full ${card.bgColor}`}>
                    <Icon className={`h-12 w-12 ${card.color}`} />
                  </div>
                  <CardTitle className="text-md font-medium text-gray-600">
                    {card.title}
                    <div className="text-2xl font-bold text-gray-900 text-left">
                      {card.value}
                    </div>
                  </CardTitle>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {/* Grafik */}
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Grafik Kenaikan Anggota ({year})
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <Line data={anggotaChartData} options={commonChartOptions} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
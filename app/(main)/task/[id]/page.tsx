"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Calendar, Share2, Loader2, XCircle, Users, Target, Coins, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useGetTugasByIdQuery } from "@/services/admin/tugas.service";
import { skipToken } from "@reduxjs/toolkit/query";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

/* helpers */
const formatDate = (iso: string, includeYear: boolean = true): string => {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: includeYear ? "numeric" : undefined,
    });
  } catch {
    return iso;
  }
};

const renderDescription = (content: string | null | undefined) => {
  if (!content) {
    return (
      <p className="text-base text-muted-foreground italic">
        Tidak ada deskripsi rinci untuk tugas ini.
      </p>
    );
  }
  // Membagi konten berdasarkan baris baru ganda untuk paragraf
  return content.split("\n\n").map((p, i) => (
    <p key={i} className="mb-3 text-base text-foreground leading-relaxed text-pretty">
      {/* Membagi paragraf berdasarkan baris baru tunggal (untuk list atau baris pendek) */}
      <span dangerouslySetInnerHTML={{ __html: p.replace(/\n/g, '<br/>') }} />
    </p>
  ));
};

const categoryColors: Record<string, string> = {
  Rekruitmen: "bg-blue-500 text-white",
  Simpatisan: "bg-green-500 text-white",
  Kegiatan: "bg-violet-500 text-white",
  Like: "bg-pink-500 text-white",
  Comment: "bg-amber-500 text-white",
};

export default function TugasDetailPage() {
  const { id } = useParams<{ id: string }>();

  // parse to number; undefined if invalid
  const numericId = (() => {
    const raw = Array.isArray(id) ? id[0] : id;
    const n = Number(raw);
    return Number.isFinite(n) ? n : undefined;
  })();

  // ALWAYS call the hook; skip when id invalid/absent
  const {
    data: tugasData,
    isLoading,
    isError,
  } = useGetTugasByIdQuery(numericId ?? skipToken);

  // Fallback data for TaskCard style display (achieved/progress)
  // Asumsi: Kita asumsikan 0 achieved karena API detail by ID tidak memberikan data tersebut.
  const achieved = 0; 
  const target = tugasData?.target || 0;
  const progress = target > 0 ? Math.round((achieved / target) * 100) : 0;
  
  // Invalid URL (after hook call -> OK for rules-of-hooks)
  if (!numericId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <XCircle className="w-12 h-12 text-destructive" />
        <h1 className="text-xl font-bold mt-4">URL tidak valid</h1>
        <p className="mt-2 text-muted-foreground text-center">
          Parameter <code>[id]</code> harus berupa angka.
        </p>
        <Button asChild className="mt-6">
          <Link href="/task">Kembali ke Daftar Tugas</Link>
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="mt-2 text-muted-foreground">
          Memuat detail task...
        </p>
      </div>
    );
  }

  if (isError || !tugasData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <XCircle className="w-12 h-12 text-destructive" />
        <h1 className="text-xl font-bold mt-4">Tugas Tidak Ditemukan</h1>
        <p className="mt-2 text-muted-foreground text-center">
          {isError
            ? "Terjadi kesalahan saat mengambil data."
            : `Tugas dengan ID "${numericId}" tidak ada.`}
        </p>
        <Button asChild className="mt-6">
          <Link href="/task">Kembali ke Daftar Tugas</Link>
        </Button>
      </div>
    );
  }

  const categoryName = tugasData.task_category_name || "Lainnya";
  const badgeClass = categoryColors[categoryName] ?? "bg-primary/80 text-primary-foreground";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900">
      <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto space-y-6 pb-12">
        {/* Header dan Judul Tugas */}
        <Card className="shadow-lg">
          <CardHeader className="p-4 md:p-6 pb-2">
            <div className="flex justify-between items-start mb-2">
              <Badge className={`text-sm py-1 px-3 ${badgeClass}`}>
                {categoryName}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    void navigator.clipboard.writeText(window.location.href);
                  }
                }}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Bagikan
              </Button>
            </div>
            <h1 className="text-3xl font-extrabold text-foreground leading-snug">
              {tugasData.name}
            </h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2 border-t border-dashed mt-3">
                <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>Mulai: {formatDate(tugasData.start_date, false)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>Selesai: {formatDate(tugasData.end_date, false)}</span>
                </div>
                {tugasData.status && (
                    <div className="flex items-center gap-1.5 text-green-600">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Aktif</span>
                    </div>
                )}
            </div>
          </CardHeader>
        </Card>

        {/* Panel Statistik (Target, Progress, Bonus) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Target */}
            <Card className="shadow-md border-t-4 border-l-4 border-blue-500">
                <CardContent className="p-4 flex items-center gap-4">
                    <Target className="w-8 h-8 text-blue-500" />
                    <div>
                        <p className="text-sm text-muted-foreground">Target Anggota/Aksi</p>
                        <h2 className="text-2xl font-bold">{target.toLocaleString('id-ID')}</h2>
                    </div>
                </CardContent>
            </Card>

            {/* Bonus */}
            <Card className="shadow-md border-t-4 border-l-4 border-green-500">
                <CardContent className="p-4 flex items-center gap-4">
                    <Coins className="w-8 h-8 text-green-500" />
                    <div>
                        <p className="text-sm text-muted-foreground">Bonus Aksi</p>
                        <h2 className="text-2xl font-bold text-green-600">Rp {Number(tugasData.bonus).toLocaleString("id-ID")}</h2>
                    </div>
                </CardContent>
            </Card>
        </div>


            {/* Progress */}
            <Card className="shadow-md border-t-4 border-l-4 border-amber-500">
                <CardContent className="p-4 space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Pencapaian (Progress)</span>
                        <span className="font-semibold text-foreground">
                            {achieved.toLocaleString('id-ID')}/{target.toLocaleString('id-ID')}
                        </span>
                    </div>
                    <Progress value={progress} className="h-2 bg-amber-200" />
                    <p className="text-xs font-semibold text-amber-600">
                        {progress}% Selesai
                    </p>
                </CardContent>
            </Card>


        {/* Detail Konten Tugas */}
        <Card className="shadow-lg">
          <CardHeader className="p-4 md:p-6 pb-2 border-b">
             <h2 className="text-xl font-bold text-foreground">Rincian Tugas</h2>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <div className="prose prose-sm max-w-none dark:prose-invert">
              {renderDescription(tugasData.description)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

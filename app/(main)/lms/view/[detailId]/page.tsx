// /app/lms/view/[detailId]/page.tsx
"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetLmsDetailByIdQuery } from "@/services/lms-detail.service";
import {
  ArrowLeft,
  FileVideo2,
  FileAudio2,
  FileText,
  Image as ImageIcon,
  Link2,
  PlayCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LmsDetail } from "@/types/lms-detail";

const TypeIcon: Record<LmsDetail["type"], React.ReactNode> = {
  video: <FileVideo2 className="h-5 w-5" />,
  audio: <FileAudio2 className="h-5 w-5" />,
  pdf: <FileText className="h-5 w-5" />,
  image: <ImageIcon className="h-5 w-5" />,
  external_link: <Link2 className="h-5 w-5" />,
};

export default function LmsViewerPage() {
  const params = useParams<{ detailId: string }>();
  const router = useRouter();
  const detailId = Number(params.detailId);

  const { data, isFetching, isError } = useGetLmsDetailByIdQuery(detailId, {
    skip: !detailId,
  });

  const activeType = data?.type;
  const activeFile = data?.file ?? data?.media?.[0]?.original_url ?? null;
  const activeLink = data?.link ?? null;

  // 💡 Ganti tinggi tetap menjadi aspect ratio (16:9) yang responsif
  const VIEW_CLASS = "aspect-video md:max-h-[70vh]";

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,rgba(14,165,233,0.06),transparent_40%),radial-gradient(ellipse_at_bottom_right,rgba(99,102,241,0.06),transparent_40%)]">
      {/* Tambahkan padding di mobile */}
      <div className="mx-auto w-full max-w-6xl px-4 py-4 md:py-6">
        {/* Header */}
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-1 items-center gap-3">
            <div className="inline-grid h-10 w-10 place-items-center rounded-xl bg-sky-500 text-white ring-1 ring-sky-200 md:h-11 md:w-11">
              <PlayCircle className="h-5 w-5 md:h-6 md:w-6" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold md:text-xl">
                {isFetching ? (
                  <span className="text-zinc-600">Memuat materi…</span>
                ) : (
                  data?.title ?? `Materi #${detailId}`
                )}
              </h1>
              {data?.sub_title && (
                <p className="truncate text-sm text-sky-700">
                  {data.sub_title}
                </p>
              )}
              {activeType && (
                <div className="mt-1 flex items-center gap-2 text-sm text-sky-700">
                  {TypeIcon[activeType]}
                  <span className="capitalize">
                    {activeType.replace("_", " ")}
                  </span>
                </div>
              )}
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full md:w-auto rounded-xl border-sky-200 text-sky-700 hover:bg-sky-50"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Daftar
          </Button>
        </div>

        {/* Viewer */}
        <div className="rounded-2xl border border-sky-100 bg-white p-3 shadow-md">
          {isFetching ? (
            <div
              className={`flex items-center justify-center rounded-xl bg-zinc-100 ${VIEW_CLASS}`}
            >
              <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
            </div>
          ) : isError || !data ? (
            <div className="rounded-xl border border-dashed border-red-300 p-6 text-red-600">
              Materi tidak ditemukan atau terjadi kesalahan saat memuat.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border border-sky-100 bg-white">
                {/* PDF */}
                {activeType === "pdf" && activeFile && (
                  <iframe
                    src={`${activeFile}#toolbar=1&navpanes=0`}
                    className={`w-full rounded-lg ${VIEW_CLASS} min-h-[400px]`} // Minimal tinggi untuk PDF viewer
                    title="PDF Viewer"
                  />
                )}

                {/* Video */}
                {activeType === "video" && (activeFile || activeLink) && (
                  <div className={VIEW_CLASS}>
                    <video
                      className="w-full h-full rounded-lg"
                      src={activeFile ?? activeLink ?? undefined}
                      controls
                    />
                  </div>
                )}

                {/* Audio (tinggi alami, tidak perlu aspect-ratio) */}
                {activeType === "audio" && (activeFile || activeLink) && (
                  <audio
                    className="w-full rounded-lg p-2"
                    src={activeFile ?? activeLink ?? undefined}
                    controls
                  />
                )}

                {/* Image */}
                {activeType === "image" && activeFile && (
                  <div
                    className={`flex w-full justify-center overflow-auto rounded-lg bg-zinc-50 p-2 ${VIEW_CLASS}`}
                  >
                    <img
                      src={activeFile}
                      alt={data.title}
                      className="h-full w-auto max-w-full rounded-lg object-contain"
                    />
                  </div>
                )}

                {/* External link */}
                {activeType === "external_link" && activeLink && (
                  <div className="rounded-lg border border-sky-200 bg-sky-50 p-4 text-sky-700">
                    <p className="text-sm font-medium mb-1">
                      Materi tersedia pada tautan eksternal:
                    </p>
                    <a
                      href={activeLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-base font-medium underline break-words flex items-center gap-1 hover:text-sky-800"
                    >
                      <Link2 className="h-4 w-4 shrink-0" />
                      {activeLink}
                    </a>
                  </div>
                )}

                {/* Placeholder jika tipe tidak dikenali */}
                {(!activeType || (activeType !== "audio" && !activeFile && !activeLink)) && (
                  <div className={`rounded-xl border border-dashed border-zinc-300 p-6 text-zinc-600 ${VIEW_CLASS} flex items-center justify-center`}>
                    <p className="text-sm">Tipe atau file materi tidak tersedia.</p>
                  </div>
                )}

              </div>

              {/* Deskripsi Materi */}
              {data.description && (
                <div className="prose prose-sm max-w-none prose-a:text-sky-600 p-1">
                  <h2 className="text-lg font-semibold border-b pb-2">Deskripsi Materi</h2>
                  <div dangerouslySetInnerHTML={{ __html: data.description }} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
"use client";

import * as React from "react";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGetLmsQuery } from "@/services/lms.service";
import type { Lms } from "@/types/lms";
import {
  Search,
  BookOpen,
  Image as ImageIcon,
  ChevronRight,
  BookCopy,
  X, // Import icon X
} from "lucide-react";
import { Button } from "@/components/ui/button";

/* ====== UI bits ====== */
function Badge({
  children,
  tone = "sky",
}: {
  children: React.ReactNode;
  tone?: "sky" | "outline";
}) {
  return tone === "sky" ? (
    <span className="inline-flex items-center rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700 ring-1 ring-sky-200">
      {children}
    </span>
  ) : (
    // Disesuaikan agar lebih kontras di atas background putih
    <span className="inline-flex items-center rounded-full bg-white px-2.5 py-1 text-xs font-medium text-zinc-600 ring-1 ring-zinc-300">
      {children}
    </span>
  );
}

/** Cover seragam tinggi tetap, tanpa ruang kosong (object-cover) */
function CardCover({ src, alt }: { src?: string | null; alt: string }) {
  return (
    <div className="relative h-36 w-full overflow-hidden rounded-t-2xl bg-sky-50 md:h-44"> {/* Tinggi sedikit dikurangi di mobile */}
      {src ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-sky-600/70">
          <ImageIcon className="h-7 w-7 md:h-8 md:w-8" />
        </div>
      )}
      {/* overlay halus */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/5 to-transparent" />
    </div>
  );
}

/* ====== Skeleton untuk Suspense ====== */
function PageSkeleton() {
  return (
    <div className="min-h-screen p-4 md:p-0 bg-[radial-gradient(ellipse_at_top_left,rgba(14,165,233,0.06),transparent_40%),radial-gradient(ellipse_at_bottom_right,rgba(99,102,241,0.06),transparent_40%)]">
      <div className="mx-auto w-full max-w-6xl py-6">
        <header className="mb-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="inline-grid h-10 w-10 place-items-center rounded-xl bg-sky-200 md:h-11 md:w-11" />
            <div>
              <div className="h-5 w-40 rounded bg-zinc-200 md:h-6 md:w-48" />
              <div className="mt-1 h-3 w-56 rounded bg-zinc-200 md:mt-2 md:h-4 md:w-64" />
            </div>
          </div>
          <div className="flex w-full max-w-lg gap-2">
            <div className="relative flex-1">
              <div className="h-9 w-full rounded-xl bg-zinc-200 md:h-10" />
            </div>
            <div className="h-9 w-14 rounded-xl bg-zinc-200 md:h-10 md:w-16" />
          </div>
        </header>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-sm"
            >
              <div className="h-36 w-full animate-pulse bg-zinc-200 md:h-44" />
              <div className="p-4">
                <div className="h-5 w-2/3 animate-pulse rounded bg-zinc-200" />
                <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-zinc-200" />
                <div className="mt-4 h-9 w-full animate-pulse rounded bg-zinc-200" /> {/* Tombol full width */}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ====== Inner yang pakai hooks searchParams (dibungkus Suspense) ====== */
function LmsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [page, setPage] = useState(1);
  const [paginate] = useState(12);

  const urlQuery = searchParams.get("search") ?? "";
  const [search, setSearch] = useState(urlQuery);

  useEffect(() => {
    setSearch(urlQuery);
    setPage(1);
  }, [urlQuery]);

  const { data, isFetching } = useGetLmsQuery({
    page,
    paginate,
    search,
  });

  const rows: Lms[] = data?.data ?? [];

  const pushSearch = () => {
    const term = search.trim();
    router.push(term ? `/lms?search=${encodeURIComponent(term)}` : "/lms");
  };

  const clearSearch = () => {
    setSearch("");
    router.push("/lms");
  };

  return (
    <div className="min-h-screen p-4 md:p-0"> {/* Tambahkan padding global */}
      <div className="mx-auto w-full max-w-6xl py-6">
        {/* Header */}
        <header className="mb-6 flex flex-col gap-4"> {/* Stack di mobile */}
          <div className="flex items-center gap-3">
            <div className="inline-grid h-10 w-10 place-items-center rounded-xl bg-sky-500 text-white ring-1 ring-sky-200 md:h-11 md:w-11">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold md:text-2xl">
                Materi Pembelajaran
              </h1>
              <p className="text-sm text-sky-700">
                Pilih materi dan pelajari dengan nyaman.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-end"> {/* Kontrol search di mobile: stack dan full width */}
            <div className="flex w-full max-w-lg gap-2">
              <div className="relative w-full rounded-xl">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sky-600/70" />
                <input
                  type="text"
                  placeholder="Cari judul materi…"
                  aria-label="Cari materi"
                  className="w-full rounded-xl border border-sky-300 pl-9 pr-10 py-2 text-sm focus:border-sky-500 focus:ring-sky-500"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && pushSearch()}
                />
                {/* Tombol clear yang lebih bersih dan ikonik */}
                {search && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-zinc-500 hover:text-sky-700"
                    aria-label="Bersihkan pencarian"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <Button
                onClick={pushSearch}
                className="shrink-0 rounded-xl bg-sky-500 font-medium hover:bg-sky-600"
              >
                Cari
              </Button>
            </div>
          </div>
        </header>

        {/* Grid Konten */}
        <section>
          {isFetching && rows.length === 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"> {/* Layout grid responsif */}
              {Array.from({ length: paginate }).slice(0, 6).map((_, i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-sm"
                >
                  <div className="h-36 w-full animate-pulse bg-zinc-200 md:h-44" />
                  <div className="p-4">
                    <div className="h-5 w-2/3 animate-pulse rounded bg-zinc-200" />
                    <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-zinc-200" />
                    <div className="mt-4 h-9 w-full animate-pulse rounded bg-zinc-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : rows.length === 0 ? (
            <div className="rounded-2xl border border-sky-100 bg-white p-6 text-center text-zinc-600">
              Tidak ada materi yang ditemukan untuk pencarian &quot;{urlQuery}&quot;.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {rows.map((item) => (
                <article
                  key={item.id}
                  className="group overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-md transition hover:shadow-lg"
                >
                  <CardCover
                    src={typeof item.cover === "string" ? item.cover : ""}
                    alt={item.title}
                  />

                  <div className="p-4">
                    {/* Minimal height for clean layout */}
                    <h3 className="line-clamp-2 min-h-[40px] text-base font-semibold text-zinc-900 md:min-h-[48px]">
                      {item.title}
                    </h3>
                    {item.sub_title && (
                      <p className="mt-1 line-clamp-2 min-h-[40px] text-sm text-zinc-600">
                        {item.sub_title}
                      </p>
                    )}

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {item.subject_name && (
                        <Badge tone="sky">{item.subject_name}</Badge>
                      )}
                      {item.subject_sub_name && (
                        <Badge tone="outline">{item.subject_sub_name}</Badge>
                      )}
                    </div>

                    <div className="mt-4">
                      <Button
                        asChild
                        className="w-full rounded-xl bg-sky-600 font-medium hover:bg-sky-700"
                      >
                        <Link
                          href={`/lms/${item.id}`}
                          className="inline-flex items-center justify-center gap-1.5"
                        >
                          <BookCopy className="h-4 w-4" />
                          Detail <ChevronRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Pagination sederhana (next/prev) */}
        {data?.last_page && data.last_page > 1 && (
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button
              variant="outline"
              className="w-full sm:w-auto rounded-xl border-sky-200 text-sky-700 hover:bg-sky-50"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Sebelumnya
            </Button>
            <div className="rounded-xl border border-sky-200 bg-white px-3 py-1.5 text-sm font-medium text-sky-700 shadow-sm">
              Halaman {data.current_page} dari {data.last_page}
            </div>
            <Button
              variant="outline"
              className="w-full sm:w-auto rounded-xl border-sky-200 text-sky-700 hover:bg-sky-50"
              disabled={page >= data.last_page}
              onClick={() =>
                setPage((p) => Math.min(data.last_page ?? p, p + 1))
              }
            >
              Berikutnya
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ====== Export default dengan Suspense ====== */
export default function LmsPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <LmsPageInner />
    </Suspense>
  );
}
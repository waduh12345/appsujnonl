"use client";

import { AnnouncementCard } from "@/components/announcement-card";
import { Badge } from "@/components/ui/badge";
import { Megaphone } from "lucide-react";

import { useGetPengumumanListQuery } from "@/services/admin/pengumuman.service";
import { Card } from "@/components/ui/card";
import type { Pengumuman } from "@/types/admin/pengumuman";

type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;
const Skeleton = ({ className = "", ...props }: SkeletonProps) => (
  <div
    className={`animate-pulse rounded-md bg-muted ${className}`}
    {...props}
  />
);

/* =========================
   Type guards (tanpa `any`)
   ========================= */
function isPengumuman(x: unknown): x is Pengumuman {
  if (typeof x !== "object" || x === null) return false;
  const o = x as Record<string, unknown>;
  const hasId =
    "id" in o && (typeof o.id === "number" || typeof o.id === "string");
  const hasTitle = "title" in o && typeof o.title === "string";
  const hasContent = "content" in o && typeof o.content === "string";
  return hasId && hasTitle && hasContent;
}

function hasDataArray<T>(
  value: unknown,
  itemGuard: (v: unknown) => v is T
): value is { data: T[] } {
  if (typeof value !== "object" || value === null) return false;
  const obj = value as Record<string, unknown>;
  if (!Array.isArray(obj.data)) return false;
  return (obj.data as unknown[]).every(itemGuard);
}

/** Baca flag opsional `isImportant` (kalau tidak ada, dianggap `false`) */
function readIsImportant(x: Pengumuman): boolean {
  const v = (x as unknown as { isImportant?: unknown }).isImportant;
  return typeof v === "boolean" ? v : false;
}

export default function PengumumanPage() {
  const currentPage = 1;
  const itemsPerPage = 10;
  const query = "";

  const { data, isLoading, isError } = useGetPengumumanListQuery({
    page: currentPage,
    paginate: itemsPerPage,
    search: query,
  });

  // Ekstrak array pengumuman secara aman (tanpa any)
  const announcements: Pengumuman[] = hasDataArray<Pengumuman>(
    data,
    isPengumuman
  )
    ? data.data
    : [];

  const regularAnnouncements = announcements.filter((a) => !readIsImportant(a));

  /* -------- Loading -------- */
  if (isLoading) {
    return (
      <div className="space-y-6 p-4 safe-area-top">
        <div className="pt-4 flex gap-3">
          <Skeleton className="w-12 h-12 rounded-xl" />
          <div>
            <Skeleton className="h-6 w-48 mb-1" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <section className="space-y-3">
          <Skeleton className="h-5 w-full" />
          <div className="space-y-4">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
        </section>
        <section className="space-y-3">
          <Skeleton className="h-5 w-full" />
          <div className="grid grid-cols-1 gap-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </section>
      </div>
    );
  }

  /* -------- Error -------- */
  if (isError) {
    return (
      <div className="p-4 safe-area-top">
        <Card className="p-5 text-center bg-red-50 border-red-300 text-red-700">
          Gagal memuat pengumuman. Terjadi kesalahan saat mengambil data dari
          server.
        </Card>
      </div>
    );
  }

  /* -------- Kosong -------- */
  if (announcements.length === 0) {
    return (
      <div className="space-y-6 p-4 safe-area-top">
        <div className="pt-4 flex gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Megaphone className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground leading-tight">
              Pengumuman
            </h1>
            <p className="text-sm text-muted-foreground">
              Informasi terbaru untuk seluruh anggota
            </p>
          </div>
        </div>
        <Card className="p-5 text-center text-muted-foreground border-dashed">
          Tidak ada pengumuman yang tersedia saat ini.
        </Card>
      </div>
    );
  }

  /* -------- Konten -------- */
  return (
    <div className="space-y-6 p-4 safe-area-top">
      {/* Header */}
      <div className="pt-4 flex gap-3">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Megaphone className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground leading-tight">
            Pengumuman
          </h1>
          <p className="text-sm text-muted-foreground">
            Informasi terbaru untuk seluruh anggota
          </p>
        </div>
      </div>

      {/* Semua Pengumuman */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 pb-1 border-b border-border">
          <Megaphone className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold">Semua Pengumuman</h2>
          <Badge variant="secondary" className="h-5 text-xs">
            {regularAnnouncements.length}
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {regularAnnouncements.map((announcement) => (
            <AnnouncementCard key={announcement.id} {...announcement} />
          ))}
        </div>
      </section>
    </div>
  );
}
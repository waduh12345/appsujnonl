'use client';

import { KTACard } from "@/components/kta-card";
import { AnnouncementCarousel } from "@/components/announcement-carousel";
import { TaskCard } from "@/components/task-card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Megaphone, Briefcase, LayoutGrid, Loader2 } from "lucide-react";
import Link from "next/link";
import {
  useGetTugasListQuery,
} from "@/services/admin/tugas.service";
import { Tugas } from "@/types/admin/tugas";

// Definisikan tipe untuk props TaskCard yang sudah dimodifikasi
type TaskCardProps = {
  id: string;
  category: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  achieved: number;
  startDate: string;
  endDate: string;
  bonus: number;
};

// Fungsi helper untuk memformat data Tugas API ke TaskCardProps
function formatTugasToTaskCardProps(tugas: Tugas): TaskCardProps {
  // Asumsi: Karena API tidak menyediakan data 'achieved'/'progress', kita gunakan 0.
  const achieved = 0;
  const progress = tugas.target > 0 ? Math.round((achieved / tugas.target) * 100) : 0;
  
  return {
    id: String(tugas.id),
    category: tugas.task_category_name || "Lainnya",
    title: tugas.name || "Nama Tugas Tidak Tersedia",
    description: tugas.description || "Tidak ada deskripsi.",
    progress: progress,
    target: tugas.target || 0,
    achieved: achieved,
    // Format tanggal ISO string ke format yang lebih singkat (misal: "1 Jan")
    startDate: tugas.start_date ? new Date(tugas.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : 'N/A',
    endDate: tugas.end_date ? new Date(tugas.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : 'N/A',
    bonus: tugas.bonus || 0,
  };
}

export default function HomePage() {
  const currentPage = 1;
  const itemsPerPage = 4; // Ambil 4 tugas teratas/pertama
  const query = "";
  
  // Ambil data Tugas
  const { data, isLoading, isError } = useGetTugasListQuery({
      page: currentPage,
      paginate: itemsPerPage, // Minta hanya 4 item dari API
      search: query,
  });

  // Konversi data API ke format TaskCardProps
  const popularTasks: TaskCardProps[] = (data?.data || [])
    .slice(0, 4) // Batasi maksimal 4 untuk tampilan homepage
    .map(formatTugasToTaskCardProps);

  return (
    <div className="space-y-6 p-4 safe-area-top">
      {/* Header */}
      <div className="w-full pt-4 flex justify-between items-center">
        <div className="pt-4 flex gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <LayoutGrid className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground leading-tight">
              Selamat Datang
            </h1>
            <p className="text-sm text-muted-foreground">
              Kelola keanggotaan Anda dengan mudah
            </p>
          </div>
        </div>
      </div>

      {/* KTA Card */}
      <section>
        <KTACard />
      </section>

      {/* Announcements Carousel */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-2 flex-1">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold leading-tight">
                Pengumuman Terbaru
              </h2>
              <p className="text-xs text-muted-foreground">
                Informasi penting untuk Anda
              </p>
            </div>
          </div>
          <Link href="/pengumuman">
            <Button variant="ghost" size="sm" className="text-primary h-8 px-2">
              Semua
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
        <AnnouncementCarousel />
      </section>

      {/* Popular Tasks */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-2 flex-1">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold leading-tight">Task Populer</h2>
              <p className="text-xs text-muted-foreground">
                Selesaikan dan dapatkan bonus
              </p>
            </div>
          </div>
          <Link href="/task">
            <Button variant="ghost" size="sm" className="text-primary h-8 px-2">
              Semua
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
        
        {/* Konten Task */}
        {isLoading ? (
          <div className="flex justify-center items-center h-24">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="ml-2 text-sm text-muted-foreground">Memuat tugas...</p>
          </div>
        ) : isError || popularTasks.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground border rounded-lg">
            {isError ? "Gagal memuat data tugas." : "Belum ada tugas yang tersedia saat ini."}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {popularTasks.map((task) => (
              <TaskCard key={task.id} {...task} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
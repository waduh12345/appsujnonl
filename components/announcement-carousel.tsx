"use client"

import type React from "react"

import { useState, useEffect, useRef, useMemo } from "react"
import { Card } from "@/components/ui/card"
import {
  useGetPengumumanListQuery,
} from "@/services/admin/pengumuman.service";
import { Pengumuman } from "@/types/admin/pengumuman";
import Link from "next/link";

// Local fallback Skeleton component to avoid missing module error
const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`animate-pulse bg-muted rounded-md ${className}`} />
)

function hasDataArray(value: unknown): value is { data: unknown[] } {
  if (typeof value !== "object" || value === null) return false;
  const obj = value as Record<string, unknown>;
  return Array.isArray(obj.data);
}

function isPengumuman(item: unknown): item is Pengumuman {
  if (typeof item !== "object" || item === null) return false;
  const o = item as Record<string, unknown>;
  const hasId =
    "id" in o && (typeof o.id === "number" || typeof o.id === "string");
  const hasTitle = "title" in o && typeof o.title === "string";
  const hasContent = "content" in o && typeof o.content === "string";
  // kolom lain (image, created_at, dll) boleh opsional
  return hasId && hasTitle && hasContent;
}

export function AnnouncementCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const autoSlideRef = useRef<ReturnType<typeof setInterval> | null>(null)
  
  // Asumsi nilai default untuk pagination, sesuaikan jika perlu
  const currentPage = 1;
  const itemsPerPage = 10;
  const query = "";

  const { data, isLoading, isError } = useGetPengumumanListQuery({
      page: currentPage,
      paginate: itemsPerPage,
      search: query,
  });

  // Ekstrak data pengumuman dari respons API. Gunakan array kosong jika data belum tersedia.
  const announcements: Pengumuman[] = useMemo(() => {
    if (!hasDataArray(data)) return [];
    return data.data.filter(isPengumuman);
  }, [data]);

  // Reset currentIndex ketika data berubah (misalnya, setelah refetch atau pertama kali dimuat)
  useEffect(() => {
    setCurrentIndex(0);
  }, [announcements.length])


  useEffect(() => {
    if (announcements.length > 0) {
      // Pastikan ada pengumuman sebelum memulai autoslide
      autoSlideRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev === announcements.length - 1 ? 0 : prev + 1))
      }, 10000)
    }

    return () => {
      if (autoSlideRef.current) {
        clearInterval(autoSlideRef.current)
      }
    }
  }, [announcements.length]) // Dependency array menyertakan announcements.length

  const resetAutoSlide = () => {
    if (autoSlideRef.current) {
      clearInterval(autoSlideRef.current)
    }
    // Hanya atur interval jika ada pengumuman
    if (announcements.length > 0) {
      autoSlideRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev === announcements.length - 1 ? 0 : prev + 1))
      }, 10000)
    }
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    if (announcements.length === 0) return // Hentikan jika tidak ada data

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) {
      setCurrentIndex((prev) => (prev === announcements.length - 1 ? 0 : prev + 1))
      resetAutoSlide()
    }
    if (isRightSwipe) {
      setCurrentIndex((prev) => (prev === 0 ? announcements.length - 1 : prev - 1))
      resetAutoSlide()
    }

    setTouchStart(0)
    setTouchEnd(0)
  }

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
          return dateString; // Kembalikan string asli jika tidak valid
      }
      const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
      return date.toLocaleDateString('id-ID', options);
    } catch (error) {
      return dateString;
    }
  };

  // --- Fungsi Helper untuk Menghapus Tag HTML ---
  /**
   * Menghapus tag HTML dari string (untuk membersihkan konten).
   * @param htmlString String yang mengandung HTML
   * @returns String teks murni
   */
  const stripHtmlTags = (htmlString: string): string => {
    if (!htmlString) return '';
    return htmlString.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ');
  };
  
  // --- Penanganan Loading dan Error ---

  if (isLoading) {
    // Tampilkan skeleton/loading state saat data sedang diambil
    return (
      <div className="relative">
        <Skeleton className="h-48 w-full rounded-xl" />
        <div className="flex justify-center gap-2 mt-4">
          <Skeleton className="h-2 w-6 rounded-full" />
          <Skeleton className="h-2 w-2 rounded-full" />
          <Skeleton className="h-2 w-2 rounded-full" />
        </div>
      </div>
    );
  }

  if (isError) {
    // Tampilkan pesan error jika query gagal
    return (
      <Card className="p-5 text-center text-red-600 border-red-600">
        Gagal memuat pengumuman. Silakan coba lagi.
      </Card>
    );
  }
  
  if (announcements.length === 0) {
    // Tampilkan pesan jika tidak ada pengumuman
    return (
      <Card className="p-5 text-center text-muted-foreground">
        Tidak ada pengumuman saat ini.
      </Card>
    );
  }

  // --- Render Carousel ---

  return (
    <div className="relative">
      <div
        className="overflow-hidden rounded-xl"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {announcements.map((announcement) => (
            <div key={announcement.id} className="min-w-full">
              <Link className="block" href={`/pengumuman/${announcement.id}`}>
                <Card className="relative h-48 overflow-hidden border-0 shadow-lg">
                  {/* Gunakan imageUrl dari data API jika ada */}
                  <img
                    src={announcement.image || "/placeholder.svg"} 
                    alt={announcement.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                    <h3 className="text-lg font-bold mb-1 text-balance">{announcement.title}</h3>
                    {/* Pastikan field description ada di data API */}
                    <p className="text-sm opacity-90 text-pretty">{stripHtmlTags(announcement.content)}</p>
                  </div>
                </Card>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Indicators */}
      <div className="flex justify-center gap-2 mt-4">
        {announcements.map((_, index) => (
          <button
            key={index}
            className={`h-2 rounded-full transition-all ${
              index === currentIndex ? "w-6 bg-primary" : "w-2 bg-muted-foreground/30"
            }`}
            onClick={() => {
              setCurrentIndex(index)
              resetAutoSlide()
            }}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
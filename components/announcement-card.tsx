import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge" // Badge tidak digunakan di sini, tapi saya biarkan
import { Calendar } from "lucide-react"
import { Pengumuman } from "@/types/admin/pengumuman";

// --- Fungsi Helper untuk Memformat Tanggal ---
/**
 * Mengubah string tanggal ISO menjadi format "15 Oktober 2025".
 * @param dateString String tanggal (e.g., "2025-10-15T16:15:00.000000Z")
 * @returns String tanggal yang diformat.
 */
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        return dateString; // Kembalikan string asli jika tidak valid
    }
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('id-ID', options);
  } catch (error: unknown) {
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


export function AnnouncementCard({
  id,
  title,
  content,
  image,
  date,
}: Pengumuman) {
  
  // 1. Format Tanggal
  const formattedDate = formatDate(date);
  
  // 2. Bersihkan Konten dari Tag HTML
  const cleanContent = stripHtmlTags(content);

  // Default card variant
  return (
    <Link className="block" href={`/pengumuman/${id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
        <div className="relative h-40">
          {/* Asumsi properti image di Pengumuman adalah URL */}
          <img src={image || "/placeholder.svg"} alt={title} className="w-full h-full object-cover" />
        </div>
        <CardContent className="p-4 space-y-2">
          <h3 className="font-bold text-base leading-tight line-clamp-2 text-balance">{title}</h3>
          
          {/* Gunakan cleanContent yang sudah dibersihkan */}
          <p className="text-sm text-muted-foreground line-clamp-2 text-pretty">{cleanContent}</p>
          
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            
            {/* Gunakan formattedDate */}
            <span>{formattedDate}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
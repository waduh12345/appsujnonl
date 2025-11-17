"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

export default function TryoutFinishedPage() {
  const router = useRouter();
  return (
    // Tambahkan padding global di mobile dan atur lebar maksimal yang lebih responsif
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6 rounded-3xl border border-sky-200 bg-white p-6 text-center shadow-xl md:p-10">
        
        {/* Ikon Sukses */}
        <div className="mx-auto w-fit rounded-full bg-emerald-50 p-4 text-emerald-500 ring-4 ring-emerald-100/70">
          <CheckCircle2 className="h-10 w-10 md:h-12 md:w-12" />
        </div>

        {/* Judul dan Pesan */}
        <h1 className="text-2xl font-bold text-zinc-800 md:text-3xl">
          Yeay! Ujian Selesai 🎉
        </h1>
        <p className="text-base text-zinc-500">
          Kamu telah berhasil menyelesaikan tryout ini.
        </p>
        <p className="text-sm text-zinc-600 border-t pt-4">
          Kamu hanya bisa mengerjakan tryout ini sekali. Silakan tunggu hasil
          penilaian dari sistem.
        </p>

        {/* Tombol Aksi */}
        <div className="flex justify-center pt-2">
          <Button
            className="w-full sm:w-auto rounded-xl bg-sky-600 px-8 py-2.5 text-base font-semibold hover:bg-sky-700 transition"
            onClick={() => router.push("/tryout")}
          >
            Kembali ke Daftar Tryout
          </Button>
        </div>
      </div>
    </div>
  );
}
"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AnnouncementDetailHeaderProps {
  imageUrl: string
  title: string
}

export function AnnouncementDetailHeader({ imageUrl, title }: AnnouncementDetailHeaderProps) {
  const router = useRouter()

  return (
    <div className="relative">
      {/* Banner Image */}
      <div className="relative h-64 overflow-hidden">
        <img src={imageUrl || "/placeholder.svg"} alt={title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 left-4 h-9 px-3 bg-white/90 hover:bg-white text-foreground safe-area-top"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali
        </Button>

        {/* Title */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h1 className="text-2xl font-bold text-white leading-tight text-balance">{title}</h1>
        </div>
      </div>
    </div>
  )
}

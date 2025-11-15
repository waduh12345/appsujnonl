"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface TaskDetailHeaderProps {
  title: string
  category: "Rekrutment" | "Simpatisan" | "Lainnya"
  progress: number
  target: number
  achieved: number
  startDate: string
  endDate: string
}

const categoryColors = {
  Rekrutment: "bg-blue-500 text-white",
  Simpatisan: "bg-green-500 text-white",
  Lainnya: "bg-orange-500 text-white",
}

export function TaskDetailHeader({
  title,
  category,
  progress,
  target,
  achieved,
  startDate,
  endDate,
}: TaskDetailHeaderProps) {
  const router = useRouter()

  return (
    <div className="bg-card border-b border-border sticky top-0 z-10 safe-area-top">
      <div className="p-4 space-y-4">
        {/* Back Button */}
        <Button variant="ghost" size="sm" className="h-9 px-2 -ml-2" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali
        </Button>

        {/* Category Badge */}
        <Badge className={categoryColors[category]}>{category}</Badge>

        {/* Title */}
        <h1 className="text-xl font-bold leading-tight text-balance">{title}</h1>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress Task</span>
            <span className="font-semibold">
              {achieved}/{target}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Date Range */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>
            {startDate} - {endDate}
          </span>
        </div>
      </div>
    </div>
  )
}

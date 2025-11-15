import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Coins } from "lucide-react";
import Link from "next/link";

interface TaskCardProps {
  id: string;
  category: string; // ← dibuat generic agar sesuai kategori API (Rekruitmen, Simpatisan, Kegiatan, Like, Comment, dst.)
  title: string;
  description: string;
  progress: number;
  target: number;
  achieved: number;
  startDate: string; // e.g. "1 Jan"
  endDate: string; // e.g. "31 Jan"
  bonus: number;
}

const categoryColors: Record<string, string> = {
  Rekruitmen: "bg-blue-500 text-white",
  Simpatisan: "bg-green-500 text-white",
  Kegiatan: "bg-violet-500 text-white",
  Like: "bg-pink-500 text-white",
  Comment: "bg-amber-500 text-white",
};

export function TaskCard({
  id,
  category,
  title,
  description,
  progress,
  target,
  achieved,
  startDate,
  endDate,
  bonus,
}: TaskCardProps) {
  const badgeClass =
    categoryColors[category] ?? "bg-primary text-primary-foreground";

  return (
    <Link href={`/task/${id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2 mb-2">
            <Badge className={badgeClass}>{category}</Badge>
            <div className="flex items-center gap-1 text-xs font-semibold text-primary">
              <Coins className="w-3.5 h-3.5" />
              <span>Rp {Number(bonus).toLocaleString("id-ID")}</span>
            </div>
          </div>
          <h3 className="font-bold text-base leading-tight text-balance">
            {title}
          </h3>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground line-clamp-2 text-pretty">
            {description || "-"}
          </p>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span className="font-semibold text-foreground">
                {achieved}/{target}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            <span>
              {startDate} - {endDate}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
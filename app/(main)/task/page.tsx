"use client";

import { useMemo, useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { TaskCard } from "@/components/task-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, ArrowUpDown, Briefcase } from "lucide-react";
import { useGetTugasListQuery } from "@/services/admin/tugas.service";
import { useGetKategoriTugasListQuery } from "@/services/admin/master/kategori-tugas.service";

dayjs.locale("id");

type UITask = {
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
  createdAt: string; // for sorting
};

export default function TaskPage() {
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  // fetch tasks
  const { data: taskResp, isLoading: isTaskLoading } = useGetTugasListQuery({
    page: 1,
    paginate: 100,
    search: "",
  });

  // fetch categories
  const { data: catResp } = useGetKategoriTugasListQuery({
    page: 1,
    paginate: 100,
    search: "",
  });

  const categories = useMemo(
    () => (catResp?.data ?? []).map((c) => c.name),
    [catResp]
  );

  const tasksRaw = taskResp?.data ?? [];

  const allTasks: UITask[] = useMemo(
    () =>
      tasksRaw.map((t) => ({
        id: String(t.id),
        category: t.task_category_name ?? "-",
        title: t.name ?? "-",
        description: t.description ?? "",
        progress: 0, // belum ada di response → default 0
        achieved: 0, // belum ada di response → default 0
        target: Number(t.target ?? 0),
        startDate: dayjs(t.start_date).isValid()
          ? dayjs(t.start_date).format("D MMM")
          : "",
        endDate: dayjs(t.end_date).isValid()
          ? dayjs(t.end_date).format("D MMM")
          : "",
        bonus: Number(t.bonus ?? 0),
        createdAt: t.created_at ?? "",
      })),
    [tasksRaw]
  );

  // filter by category (name)
  const filteredTasks = useMemo(() => {
    if (categoryFilter === "all") return allTasks;
    return allTasks.filter((t) => t.category === categoryFilter);
  }, [allTasks, categoryFilter]);

  // sort by createdAt
  const sortedTasks = useMemo(() => {
    const copy = [...filteredTasks];
    copy.sort((a, b) => {
      const da = dayjs(a.createdAt).valueOf();
      const db = dayjs(b.createdAt).valueOf();
      return sortBy === "newest" ? db - da : da - db;
    });
    return copy;
  }, [filteredTasks, sortBy]);

  return (
    <div className="space-y-4 p-4 safe-area-top">
      {/* Header */}
      <div className="pt-4 flex gap-3">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Briefcase className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground leading-tight">
            Semua Task
          </h1>
          <p className="text-sm text-muted-foreground">
            Pilih task dan selesaikan untuk mendapatkan bonus
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="flex-1">
          <Select
            value={categoryFilter}
            onValueChange={setCategoryFilter}
            disabled={isTaskLoading}
          >
            <SelectTrigger className="h-10 w-full">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              {(categories ?? []).map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="h-10 w-full">
              <ArrowUpDown className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Urutkan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Terbaru</SelectItem>
              <SelectItem value="oldest">Terlama</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Task Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4">
        {sortedTasks.map((task) => (
          <TaskCard key={task.id} {...task} />
        ))}
      </div>

      {!isTaskLoading && sortedTasks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Tidak ada task ditemukan</p>
        </div>
      )}
    </div>
  );
}
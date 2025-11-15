"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { Tugas } from "@/types/admin/tugas";
import { useGetLevelListQuery } from "@/services/admin/master/level.service";
import { useGetKategoriTugasListQuery } from "@/services/admin/master/kategori-tugas.service";
import { Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { formatDateForInput } from "@/lib/format-utils";

// Definisikan tipe props yang lebih spesifik untuk form ini
interface TugasFormProps {
  form: Partial<Tugas>;
  setForm: (data: Partial<Tugas>) => void;
  onCancel: () => void;
  onSubmit: () => void;
  readonly?: boolean;
  isLoading?: boolean;
}

export default function TugasForm({
  form,
  setForm,
  onCancel,
  onSubmit,
  readonly = false,
  isLoading = false,
}: TugasFormProps) {
  const [mounted, setMounted] = useState(false);

  const [levelSearch, setLevelSearch] = useState("");
  const { data: levelData, isLoading: isLevelLoading } = useGetLevelListQuery({
    page: 1,
    paginate: 100,
    search: levelSearch,
  });

  const [kategoriTugasSearch, setKategoriTugasSearch] = useState("");
  const { data: kategoriTugasData, isLoading: isKategoriTugasLoading } =
    useGetKategoriTugasListQuery({
      page: 1,
      paginate: 100,
      search: kategoriTugasSearch,
    });

  const [isDropdownLevelOpen, setDropdownLevelOpen] = useState(false);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    if (form.level_id && levelData?.data) {
      const selectedLevel = levelData.data.find((p) => p.id === form.level_id);
      if (selectedLevel) {
        setLevelSearch(selectedLevel.name);
      }
    }
  }, [form.level_id, levelData]);

  useEffect(() => {
    setMounted(true);
    if (form.task_category_id && kategoriTugasData?.data) {
      const selectedKategori = kategoriTugasData.data.find(
        (p) => p.id === form.task_category_id
      );
      if (selectedKategori) {
        setKategoriTugasSearch(selectedKategori.name);
      }
    }
  }, [form.task_category_id, kategoriTugasData]);

  // Menutup dropdown saat klik di luar komponen
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
        setDropdownLevelOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const handleLevelSelect = (level: { id: number; name: string }) => {
    setForm({ ...form, level_id: level.id });
    setLevelSearch(level.name);
    setDropdownLevelOpen(false);
  };

  const filteredLevel = useMemo(() => {
    if (!levelData?.data || levelSearch.length < 2) {
      return [];
    }
    return levelData.data.filter((level) =>
      level.name.toLowerCase().includes(levelSearch.toLowerCase())
    );
  }, [levelSearch, levelData]);

  const filteredKategoriTugas = useMemo(() => {
    if (!kategoriTugasData?.data || kategoriTugasSearch.length < 2) {
      return [];
    }
    return kategoriTugasData.data.filter((kategori) =>
      kategori.name.toLowerCase().includes(kategoriTugasSearch.toLowerCase())
    );
  }, [kategoriTugasSearch, kategoriTugasData]);

  const handleKategoriTugasSelect = (kategori: {
    id: number;
    name: string;
  }) => {
    setForm({ ...form, task_category_id: kategori.id });
    setKategoriTugasSearch(kategori.name);
    setDropdownOpen(false);
  };

  if (!mounted) {
    // Skeleton loading
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-zinc-700">
          <h2 className="text-lg font-semibold">Loading...</h2>
        </div>
        <div className="flex-1 p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 dark:bg-zinc-800 rounded w-full"></div>
            <div className="h-10 bg-gray-200 dark:bg-zinc-800 rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg w-full max-w-2xl min-h-[400px] max-h-[90vh] flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-zinc-700 flex-shrink-0">
        <h2 className="text-lg font-semibold">
          {readonly ? "Detail Tugas" : form.id ? "Edit Tugas" : "Tambah Tugas"}
        </h2>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          ✕
        </Button>
      </div>

      {/* Content */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="flex-1 overflow-y-auto p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Level Searchable Dropdown */}
          <div className="flex flex-col gap-y-1.5" ref={dropdownRef}>
            <Label htmlFor="level_id">Level</Label>
            <div className="relative">
              <Input
                id="level_id"
                placeholder="Ketik min 2 huruf untuk mencari level..."
                value={levelSearch}
                onChange={(e) => {
                  setLevelSearch(e.target.value);
                  setDropdownLevelOpen(true);
                  // Hapus level_id jika input diubah
                  if (form.level_id) {
                    setForm({ ...form, level_id: undefined });
                  }
                }}
                onFocus={() => setDropdownLevelOpen(true)}
                readOnly={readonly}
                required
                autoComplete="off"
              />
              {isDropdownLevelOpen && !readonly && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {isLevelLoading ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                  ) : levelSearch.length < 2 ? (
                    <p className="text-sm text-gray-500 p-3">
                      Ketik minimal 2 huruf...
                    </p>
                  ) : filteredLevel.length > 0 ? (
                    filteredLevel.map((level) => (
                      <button
                        type="button"
                        key={level.id}
                        onClick={() => handleLevelSelect(level)}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-700"
                      >
                        {level.name}
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 p-3">
                      Level tidak ditemukan.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Kategori Tugas Searchable Dropdown */}
          <div className="flex flex-col gap-y-1.5" ref={dropdownRef}>
            <Label htmlFor="task_category_id">Kategori Tugas</Label>
            <div className="relative">
              <Input
                id="task_category_id"
                placeholder="Ketik min 2 huruf untuk mencari kategori tugas..."
                value={kategoriTugasSearch}
                onChange={(e) => {
                  setKategoriTugasSearch(e.target.value);
                  setDropdownOpen(true);
                  // Hapus task_category_id jika input diubah
                  if (form.task_category_id) {
                    setForm({ ...form, task_category_id: undefined });
                  }
                }}
                onFocus={() => setDropdownOpen(true)}
                readOnly={readonly}
                required
                autoComplete="off"
              />
              {isDropdownOpen && !readonly && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {isKategoriTugasLoading ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                  ) : kategoriTugasSearch.length < 2 ? (
                    <p className="text-sm text-gray-500 p-3">
                      Ketik minimal 2 huruf...
                    </p>
                  ) : filteredKategoriTugas.length > 0 ? (
                    filteredKategoriTugas.map((kategori) => (
                      <button
                        type="button"
                        key={kategori.id}
                        onClick={() => handleKategoriTugasSelect(kategori)}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-700"
                      >
                        {kategori.name}
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 p-3">
                      Kategori tidak ditemukan.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Nama Tugas */}
          <div className="flex flex-col gap-y-1.5 col-span-1 md:col-span-2">
            <Label htmlFor="name">Nama Tugas</Label>
            <Input
              id="name"
              value={form.name ?? ""}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              readOnly={readonly}
              required
            />
          </div>

          {/* Start Date */}
          <div className="flex flex-col gap-y-1.5">
            <Label htmlFor="start_date">Tanggal Mulai</Label>
            <Input
              id="start_date"
              type="date"
              value={formatDateForInput(form.start_date ?? "")}
              onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              readOnly={readonly}
              required
            />
          </div>

          {/* End Date */}
          <div className="flex flex-col gap-y-1.5">
            <Label htmlFor="end_date">Tanggal Selesai</Label>
            <Input
              id="end_date"
              type="date"
              value={formatDateForInput(form.end_date ?? "")}
              onChange={(e) => setForm({ ...form, end_date: e.target.value })}
              readOnly={readonly}
              required
            />
          </div>

          {/* Target */}
          <div className="flex flex-col gap-y-1.5">
            <Label htmlFor="target">Target</Label>
            <Input
              id="target"
              value={form.target ?? ""}
              onChange={(e) =>
                setForm({ ...form, target: Number(e.target.value) })
              }
              readOnly={readonly}
              required
            />
          </div>

          {/* Bonus */}
          <div className="flex flex-col gap-y-1.5">
            <Label htmlFor="bonus">Bonus</Label>
            <Input
              id="bonus"
              value={form.bonus ?? ""}
              onChange={(e) =>
                setForm({ ...form, bonus: Number(e.target.value) })
              }
              readOnly={readonly}
              required
            />
          </div>

          {/* Status */}
          <div className="flex flex-col gap-y-1.5 col-span-1 md:col-span-2">
            <Label htmlFor="status">Status</Label>

            {(() => {
              // Tampilkan 1/0 apapun tipe `form.status`-nya
              const statusValue =
                typeof form.status === "boolean"
                  ? form.status
                    ? 1
                    : 0
                  : Number(form.status ?? 1);

              return (
                <select
                  id="status"
                  value={statusValue}
                  onChange={(e) =>
                    setForm({ ...form, status: Number(e.target.value) })
                  }
                  disabled={readonly}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value={1}>Aktif</option>
                  <option value={0}>Tidak Aktif</option>
                </select>
              );
            })()}
          </div>
        </div>
      </form>

      {/* Footer */}
      {!readonly && (
        <div className="p-6 border-t border-gray-200 dark:border-zinc-700 flex justify-end gap-2 flex-shrink-0">
          <Button variant="outline" onClick={onCancel}>
            Batal
          </Button>
          <Button onClick={onSubmit} disabled={isLoading}>
            {isLoading ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      )}
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import Swal from "sweetalert2";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import useModal from "@/hooks/use-modal";

import {
  useGetPengumumanListQuery,
  useCreatePengumumanMutation,
  useUpdatePengumumanMutation,
  useDeletePengumumanMutation,
} from "@/services/admin/pengumuman.service";
import { Pengumuman } from "@/types/admin/pengumuman";
import FormPengumuman from "@/components/form-modal/admin/pengumuman-form";
import ActionsGroup from "@/components/admin-components/actions-group";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function PengumumanPage() {
  const [form, setForm] = useState<Partial<Pengumuman>>();
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [readonly, setReadonly] = useState(false);
  const { isOpen, openModal, closeModal } = useModal();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, refetch } = useGetPengumumanListQuery({
    page: currentPage,
    paginate: itemsPerPage,
    search: query,
  });

  const list = useMemo(() => data?.data || [], [data]);
  const lastPage = useMemo(() => data?.last_page || 1, [data]);

  const [createPengumuman, { isLoading: isCreating }] = useCreatePengumumanMutation();
  const [updatePengumuman, { isLoading: isUpdating }] = useUpdatePengumumanMutation();
  const [deletePengumuman] = useDeletePengumumanMutation();

  const toText = (htmlOrMd?: string) =>
    (htmlOrMd || "")
      .replace(/<[^>]*>/g, " ")
      .replace(/^#{1,6}\s+/gm, "")
      .replace(/\s+/g, " ")
      .trim();

  const handleSubmit = async () => {
    try {
      if (!form) return;

      const payload = new FormData();
      
      if (form.title) payload.append("title", form.title);
      if (form.content) payload.append("content", form.content);
      if (form.status) payload.append("status", form.status ? "1" : "0");
      if (form.date) payload.append("date", form.date);
      if (form.image instanceof File) payload.append("image", form.image);

      if (editingSlug) {
        await updatePengumuman({ slug: editingSlug, payload }).unwrap();
        Swal.fire("Sukses", "Pengumuman diperbarui", "success");
      } else {
        await createPengumuman(payload).unwrap();
        Swal.fire("Sukses", "Pengumuman ditambahkan", "success");
      }

      setForm(undefined);
      setEditingSlug(null);
      await refetch();
      closeModal();
    } catch (error) {
      console.error(error);
      Swal.fire("Gagal", "Gagal menyimpan data", "error");
    }
  };

  const handleCreate = () => {
    setForm({
      title: "",
      content: "",
      date: "",
      image: "",
      status: 1,
    });
    setEditingSlug(null);
    setReadonly(false);
    openModal();
  };

  const handleEdit = (item: Pengumuman) => {
    setForm(item);
    setEditingSlug(item.id.toString() ?? "");
    setReadonly(false);
    openModal();
  };

  const handleDetail = (item: Pengumuman) => {
    setForm(item);
    setReadonly(true);
    setEditingSlug(item.id.toString() ?? "");
    openModal();
  };

  const handleDelete = async (item: Pengumuman) => {
    const confirm = await Swal.fire({
      title: "Yakin hapus pengumuman?",
      text: item.title,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hapus",
    });

    if (confirm.isConfirmed) {
      try {
        const key = item.id.toString() ?? String(item.id);
        await deletePengumuman(key).unwrap();
        await refetch();
        Swal.fire("Berhasil", "Pengumuman dihapus", "success");
      } catch (error) {
        Swal.fire("Gagal", "Gagal menghapus Pengumuman", "error");
        console.error(error);
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="rounded-md bg-white p-4 border border-gray-100 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Kiri: filter */}
          <div className="w-full flex flex-col gap-3 sm:flex-row sm:items-center">
            <Input
              placeholder="Cari Pengumuman..."
              value={query}
              onChange={(e) => {
                const q = e.target.value;
                setQuery(q);
              }}
              className="w-full sm:max-w-xs"
            />
          </div>

          {/* Kanan: aksi */}
          <div className="shrink-0 flex flex-wrap items-center gap-2">
            {/* Tambah data (opsional) */}
            {openModal && <Button onClick={openModal}><Plus /> Tambah Pengumuman</Button>}
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left">
              <tr>
                <th className="px-4 py-2">Aksi</th>
                <th className="px-4 py-2">Gambar</th>
                <th className="px-4 py-2">Judul</th>
                <th className="px-4 py-2">Tanggal</th>
                <th className="px-4 py-2">Ringkas Konten</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center p-4">
                    Memuat data...
                  </td>
                </tr>
              ) : list.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-4">
                    Tidak ada data
                  </td>
                </tr>
              ) : (
                list.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="px-4 py-2">
                      <ActionsGroup
                        handleDetail={() => handleDetail(item)}
                        handleEdit={() => handleEdit(item)}
                        handleDelete={() => handleDelete(item)}
                      />
                    </td>
                    <td className="px-4 py-2">
                      {typeof item.image === "string" && item.image ? (
                        <div className="relative w-16 h-10 rounded overflow-hidden border">
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <Badge variant="secondary">–</Badge>
                      )}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap max-w-[260px]">
                      <div
                        className="font-medium truncate"
                        title={item.title}
                      >
                        {item.title.split(" ").length > 15
                          ? item.title.split(" ").slice(0, 15).join(" ") + "..."
                          : item.title}
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {item.date
                        ? new Date(item.date).toLocaleString("id-ID")
                        : "—"}
                    </td>
                    <td className="px-4 py-2 max-w-[380px]">
                      <div className="text-muted-foreground line-clamp-2">
                        {toText(item.content)}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>

        <div className="p-4 flex items-center justify-between bg-muted">
          <div className="text-sm">
            Halaman <strong>{currentPage}</strong> dari{" "}
            <strong>{lastPage}</strong>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Sebelumnya
            </Button>
            <Button
              variant="outline"
              disabled={currentPage >= lastPage}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Berikutnya
            </Button>
          </div>
        </div>
      </Card>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <FormPengumuman
            form={form}
            setForm={(f: Partial<Pengumuman>) => setForm({ ...(form || {}), ...f })}
            onCancel={() => {
              setForm(undefined);
              setEditingSlug(null);
              setReadonly(false);
              closeModal();
            }}
            onSubmit={handleSubmit}
            readonly={readonly}
            isLoading={isCreating || isUpdating}
          />
        </div>
      )}
    </div>
  );
}

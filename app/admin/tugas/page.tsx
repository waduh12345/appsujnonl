"use client";

import { useMemo, useState } from "react";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import useModal from "@/hooks/use-modal";
import {
  useGetTugasListQuery,
  useCreateTugasMutation,
  useUpdateTugasMutation,
  useDeleteTugasMutation,
} from "@/services/admin/tugas.service";
import { Tugas } from "@/types/admin/tugas";
import FormTugas from "@/components/form-modal/admin/tugas-form";
import { Input } from "@/components/ui/input";
import ActionsGroup from "@/components/admin-components/actions-group";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { displayDate } from "@/lib/format-utils";

export default function TugasPage() {
  const [form, setForm] = useState<Partial<Tugas>>({
    level_id: 0,
    task_category_id: 0,
    name: "",
    start_date: "",
    end_date: "",
    target: 0,
    bonus: 0,
    status: true,
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [readonly, setReadonly] = useState(false);
  const { isOpen, openModal, closeModal } = useModal();
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [query, setQuery] = useState("");

  const { data, isLoading, refetch } = useGetTugasListQuery({
    page: currentPage,
    paginate: itemsPerPage,
    search: query,
  });

  const categoryList = useMemo(() => data?.data || [], [data]);
  const lastPage = useMemo(() => data?.last_page || 1, [data]);

  // Filter data based on query (if needed)
  const filteredData = useMemo(() => {
    if (!query) return categoryList;
    return categoryList.filter((item: Tugas) =>
      item.name?.toLowerCase().includes(query.toLowerCase())
    );
  }, [categoryList, query]);

  const [createCategory, { isLoading: isCreating }] = useCreateTugasMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateTugasMutation();
  const [deleteCategory] = useDeleteTugasMutation();

  const handleSubmit = async () => {
    try {
      // Normalisasi status dari boolean/number → boolean
      const statusBool =
        typeof form.status === "boolean"
          ? form.status
          : Number(form.status) === 1;

      const payload = {
        level_id: form.level_id || 0,
        task_category_id: form.task_category_id || 0,
        name: form.name || "",
        start_date: form.start_date || "",
        end_date: form.end_date || "",
        target: form.target || 0,
        bonus: form.bonus || 0,
        // Jika API terima boolean:
        status: statusBool,
        // Jika API minta 0/1, pakai ini:
        // status: statusBool ? 1 : 0,
      };

      if (editingId) {
        await updateCategory({ id: editingId, payload }).unwrap();
        Swal.fire("Sukses", "Tugas diperbarui", "success");
      } else {
        await createCategory(payload).unwrap();
        Swal.fire("Sukses", "Tugas ditambahkan", "success");
      }

      setForm({ name: "" });
      setEditingId(null);
      await refetch();
      closeModal();
    } catch (error) {
      console.error(error);
      Swal.fire("Gagal", "Gagal menyimpan data", "error");
    }
  };

  const handleEdit = (item: Tugas) => {
    setForm({ ...item });
    setEditingId(item.id);
    setReadonly(false);
    openModal();
  };

  const handleDetail = (item: Tugas) => {
    setForm(item);
    setReadonly(true);
    openModal();
  };

  const handleDelete = async (item: Tugas) => {
    const confirm = await Swal.fire({
      title: "Yakin hapus Tugas?",
      text: item.name,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hapus",
    });

    if (confirm.isConfirmed) {
      try {
        await deleteCategory(item.id).unwrap();
        await refetch();
        Swal.fire("Berhasil", "Tugas dihapus", "success");
      } catch (error) {
        Swal.fire("Gagal", "Gagal menghapus Tugas", "error");
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
              placeholder="Cari tugas..."
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
            {openModal && (
              <Button onClick={openModal}>
                <Plus /> Tugas
              </Button>
            )}
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left">
              <tr>
                <th className="px-4 py-2">Aksi</th>
                <th className="px-4 py-2">Level</th>
                <th className="px-4 py-2">Kategori Tugas</th>
                <th className="px-4 py-2">Nama</th>
                <th className="px-4 py-2">Tanggal Mulai</th>
                <th className="px-4 py-2">Tanggal Selesai</th>
                <th className="px-4 py-2">Target</th>
                <th className="px-4 py-2">Bonus</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center p-4">
                    Memuat data...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-4">
                    Tidak ada data
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="px-4 py-2">
                      <div className="flex gap-2">
                        <ActionsGroup
                          handleDetail={() => handleDetail(item)}
                          handleEdit={() => handleEdit(item)}
                          handleDelete={() => handleDelete(item)}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-2 font-medium">{item.level_name}</td>
                    <td className="px-4 py-2 font-medium">
                      {item.task_category_name}
                    </td>
                    <td className="px-4 py-2 font-medium">{item.name}</td>
                    <td className="px-4 py-2 font-medium">
                      {displayDate(item.start_date)}
                    </td>
                    <td className="px-4 py-2 font-medium">
                      {displayDate(item.end_date)}
                    </td>
                    <td className="px-4 py-2 font-medium">{item.target}</td>
                    <td className="px-4 py-2 font-medium">{item.bonus}</td>
                    <td className="px-4 py-2">
                      {item.status === true ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="destructive">Inactive</Badge>
                      )}
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
          <FormTugas
            form={form}
            setForm={setForm}
            onCancel={() => {
              setForm({ name: "" });
              setEditingId(null);
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

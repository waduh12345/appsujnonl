"use client";

import { useMemo, useState } from "react";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import useModal from "@/hooks/use-modal";
import {
  useGetKategoriTugasListQuery,
  useCreateKategoriTugasMutation,
  useUpdateKategoriTugasMutation,
  useDeleteKategoriTugasMutation,
} from "@/services/admin/master/kategori-tugas.service";
import { KategoriTugas } from "@/types/admin/master/kategori-tugas";
import FormKategoriTugas from "@/components/form-modal/admin/master/kategori-tugas-form";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import ActionsGroup from "@/components/admin-components/actions-group";
import { Plus } from "lucide-react";

export default function KategoriTugasPage() {
  const [form, setForm] = useState<Partial<KategoriTugas>>({
    name: "",
    description: "",
    status: true,
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [readonly, setReadonly] = useState(false);
  const { isOpen, openModal, closeModal } = useModal();
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [query, setQuery] = useState("");

  const { data, isLoading, refetch } = useGetKategoriTugasListQuery({
    page: currentPage,
    paginate: itemsPerPage,
  });

  const categoryList = useMemo(() => data?.data || [], [data]);
  const lastPage = useMemo(() => data?.last_page || 1, [data]);

  const [createCategory, { isLoading: isCreating }] =
    useCreateKategoriTugasMutation();
  const [updateCategory, { isLoading: isUpdating }] =
    useUpdateKategoriTugasMutation();
  const [deleteCategory] = useDeleteKategoriTugasMutation();

  const handleSubmit = async () => {
    try {
      const payload = {
        name: form.name || "",
        description: form.description || "",
        status: form.status === undefined ? 1 : form.status ? 1 : 0,
      };

      if (editingId) {
        await updateCategory({ id: editingId, payload }).unwrap();
        Swal.fire("Sukses", "Kategori Tugas diperbarui", "success");
      } else {
        // For create, if the API expects number, convert to 1/0
        const createPayload = {
          ...payload,
          status: payload.status,
        };
        await createCategory(createPayload).unwrap();
        Swal.fire("Sukses", "Kategori Tugas ditambahkan", "success");
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

  const handleEdit = (item: KategoriTugas) => {
    setForm({ ...item });
    setEditingId(item.id);
    setReadonly(false);
    openModal();
  };

  const handleDetail = (item: KategoriTugas) => {
    setForm(item);
    setReadonly(true);
    openModal();
  };

  const handleDelete = async (item: KategoriTugas) => {
    const confirm = await Swal.fire({
      title: "Yakin hapus Kategori Tugas?",
      text: item.name,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hapus",
    });

    if (confirm.isConfirmed) {
      try {
        await deleteCategory(item.id).unwrap();
        await refetch();
        Swal.fire("Berhasil", "Kategori Tugas dihapus", "success");
      } catch (error) {
        Swal.fire("Gagal", "Gagal menghapus Kategori Tugas", "error");
        console.error(error);
      }
    }
  };

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!query) return categoryList;
    return categoryList.filter(
      (item) =>
        item.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [categoryList, query]);

  return (
    <div className="p-6 space-y-6">
      <div className="rounded-md bg-white p-4 border border-gray-100 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Kiri: filter */}
          <div className="w-full flex flex-col gap-3 sm:flex-row sm:items-center">
            <Input
              placeholder="Cari kategori tugas..."
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
            {openModal && <Button onClick={openModal}><Plus /> Kategori Tugas</Button>}
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left">
              <tr>
                <th className="px-4 py-2">Aksi</th>
                <th className="px-4 py-2">Nama</th>
                <th className="px-4 py-2">Deskripsi</th>
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
                    <td className="px-4 py-2 font-medium">{item.name}</td>
                    <td className="px-4 py-2">{item.description}</td>
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
          <FormKategoriTugas
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

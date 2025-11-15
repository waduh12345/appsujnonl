"use client";

import { useMemo, useState } from "react";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import useModal from "@/hooks/use-modal";
import {
  useGetKantorListQuery,
  useCreateKantorMutation,
  useUpdateKantorMutation,
  useDeleteKantorMutation,
} from "@/services/admin/kantor.service";
import { Kantor } from "@/types/admin/kantor";
import FormKantor from "@/components/form-modal/admin/kantor-form";
import { Input } from "@/components/ui/input";
import ActionsGroup from "@/components/admin-components/actions-group";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function KantorPage() {
  const [form, setForm] = useState<Partial<Kantor>>({
    office_type_id: 0,
    province_id: "",
    regency_id: "",
    district_id: "",
    village_id: "",
    name: "",
    address: "",
    phone: "",
    status: true
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [readonly, setReadonly] = useState(false);
  const { isOpen, openModal, closeModal } = useModal();
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [query, setQuery] = useState("");

  const { data, isLoading, refetch } = useGetKantorListQuery({
    page: currentPage,
    paginate: itemsPerPage,
    search: query,
  });

  const categoryList = useMemo(() => data?.data || [], [data]);
  const lastPage = useMemo(() => data?.last_page || 1, [data]);

  // Filter data based on query (if needed)
  const filteredData = useMemo(() => {
    if (!query) return categoryList;
    return categoryList.filter((item: Kantor) =>
      item.name?.toLowerCase().includes(query.toLowerCase())
    );
  }, [categoryList, query]);

  const [createCategory, { isLoading: isCreating }] =
    useCreateKantorMutation();
  const [updateCategory, { isLoading: isUpdating }] =
    useUpdateKantorMutation();
  const [deleteCategory] = useDeleteKantorMutation();

  const handleSubmit = async () => {
    try {
      const payload = {
        office_type_id: form.office_type_id || 0,
        province_id: form.province_id || "",
        regency_id: form.regency_id || "",
        district_id: form.district_id || "",
        village_id: form.village_id || "",
        name: form.name || "",
        address: form.address || "",
        phone: form.phone || "",
        status: form.status || false
      };

      if (editingId) {
        await updateCategory({ id: editingId, payload }).unwrap();
        Swal.fire("Sukses", "Kantor diperbarui", "success");
      } else {
        await createCategory(payload).unwrap();
        Swal.fire("Sukses", "Kantor ditambahkan", "success");
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

  const handleEdit = (item: Kantor) => {
    setForm({ ...item });
    setEditingId(item.id);
    setReadonly(false);
    openModal();
  };

  const handleDetail = (item: Kantor) => {
    setForm(item);
    setReadonly(true);
    openModal();
  };

  const handleDelete = async (item: Kantor) => {
    const confirm = await Swal.fire({
      title: "Yakin hapus Kantor?",
      text: item.name,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hapus",
    });

    if (confirm.isConfirmed) {
      try {
        await deleteCategory(item.id).unwrap();
        await refetch();
        Swal.fire("Berhasil", "Kantor dihapus", "success");
      } catch (error) {
        Swal.fire("Gagal", "Gagal menghapus Kantor", "error");
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
              placeholder="Cari kantor..."
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
            {openModal && <Button onClick={openModal}><Plus /> Kantor</Button>}
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left">
              <tr>
                <th className="px-4 py-2">Aksi</th>
                <th className="px-4 py-2">Provinsi</th>
                <th className="px-4 py-2">Kota / Kabupaten</th>
                <th className="px-4 py-2">Nama Kantor</th>
                <th className="px-4 py-2">Alamat</th>
                <th className="px-4 py-2">No. Handphone</th>
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
                    <td className="px-4 py-2 font-medium">{item.province_name}</td>
                    <td className="px-4 py-2 font-medium">{item.regency_name}</td>
                    <td className="px-4 py-2 font-medium">{item.name}</td>
                    <td className="px-4 py-2 font-medium">{item.address}</td>
                    <td className="px-4 py-2 font-medium">{item.phone}</td>
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
          <FormKantor
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

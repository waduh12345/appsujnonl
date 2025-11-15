"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Swal from "sweetalert2";
import {
  useGetAnggotaByIdQuery,
  useCreateAnggotaMutation,
  useUpdateAnggotaMutation,
} from "@/services/admin/anggota.service";
import type { Anggota } from "@/types/admin/anggota";
import AnggotaForm from "@/components/form-modal/admin/anggota-form";

type Mode = "add" | "edit" | "detail";

// ✅ Tambah tipe state biar aman dan tetap strongly-typed
export type AdminAnggotaFormState = Partial<Anggota> & {
  password?: string;
  password_confirmation?: string;
  // file upload (opsional — hanya terkirim kalau dipilih)
  upload_ktp?: File | null;
  upload_foto?: File | null;
  postal_code?: string | null;
};

export default function AnggotaAddEditPage() {
  return (
    <Suspense fallback={<div className="p-6">Memuat formulir…</div>}>
      <AnggotaAddEditPageInner />
    </Suspense>
  );
}

function AnggotaAddEditPageInner() {
  const router = useRouter();
  const sp = useSearchParams();

  const mode: Mode = (sp.get("mode") as Mode) || "add";
  const idParam = sp.get("id");
  const id = idParam ? Number(idParam) : undefined;

  const isDetail = mode === "detail";
  const isEdit = mode === "edit";
  const isAdd = mode === "add";

  const { data: detailData, isFetching } = useGetAnggotaByIdQuery(id!, {
    skip: !(isEdit || isDetail) || !id,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: false,
    refetchOnReconnect: false,
  });

  const [createAnggota, { isLoading: isCreating }] = useCreateAnggotaMutation();
  const [updateAnggota, { isLoading: isUpdating }] = useUpdateAnggotaMutation();

  const [form, setForm] = useState<AdminAnggotaFormState>({});

  useEffect(() => {
    if ((isEdit || isDetail) && detailData) {
      setForm({
        ...detailData,
        password: "",
        password_confirmation: "",
        // file opsional; biarkan kosong agar tidak mengirim saat edit
        upload_ktp: null,
        upload_foto: null,
        postal_code: detailData.postal_code ?? "",
      });
    }
  }, [detailData, isEdit, isDetail]);

  const readonly = isDetail;
  const isLoading = isCreating || isUpdating || isFetching;

  const handleSubmit = async () => {
    try {
      // Validasi dasar
      if (!form.name || !form.email || !form.phone || !form.ktp) {
        throw new Error("Nama, Email, Telepon, dan KTP wajib diisi");
      }

      const isPut = isEdit && !!id;
      const fd = new FormData();

      // Helper: hanya append kalau ada nilainya (0 tetap dikirim)
      const appendIf = (k: string, v: unknown) => {
        if (v === undefined || v === null || v === "") return;
        fd.append(k, String(v));
      };

      // Field teks/angka
      appendIf("name", form.name);
      appendIf("email", form.email);
      appendIf("phone", form.phone);
      appendIf("address", form.address);
      appendIf("gender", form.gender);
      appendIf("birth_date", form.birth_date);
      appendIf("birth_place", form.birth_place);
      appendIf("ktp", form.ktp);
      appendIf("postal_code", form.postal_code);

      appendIf("province_id", form.province_id);
      appendIf("regency_id", form.regency_id);
      appendIf("district_id", form.district_id);
      appendIf("village_id", form.village_id);
      appendIf("rt", form.rt);
      appendIf("rw", form.rw);
      appendIf("level_id", form.level_id);

      appendIf("religion", form.religion);
      appendIf("marital_status", form.marital_status);
      appendIf("occupation", form.occupation);
      appendIf("last_education", form.last_education);
      appendIf("phone_home", form.phone_home);
      appendIf("phone_office", form.phone_office);
      appendIf("phone_faksimili", form.phone_faksimili);
      appendIf("facebook", form.facebook);
      appendIf("instagram", form.instagram);
      appendIf("twitter", form.twitter);
      appendIf("whatsapp", form.whatsapp);
      appendIf("tiktok", form.tiktok);
      appendIf("path", form.path);

      // File: kirim HANYA jika user memilih file baru
      if (form.ktp_file instanceof File) {
        fd.append("ktp_file", form.ktp_file);
      }
      if (form.photo_file instanceof File) {
        fd.append("photo_file", form.photo_file);
      }

      // Password hanya saat create
      if (!isPut && form.password && form.password_confirmation) {
        fd.append("password", form.password);
        fd.append("password_confirmation", form.password_confirmation);
      }

      // Update via method override
      if (isPut) fd.append("_method", "PUT");

      // Kirim
      if (isPut && id) {
        await updateAnggota({ id, payload: fd }).unwrap();
        await Swal.fire("Sukses", "Anggota diperbarui", "success");
      } else {
        await createAnggota(fd).unwrap();
        await Swal.fire("Sukses", "Anggota ditambahkan", "success");
      }

      router.push("/admin/keanggotaan");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan";
      await Swal.fire("Gagal", msg, "error");
      console.error(err);
    }
  };

  return (
    <div className="p-4">
      {isFetching && (isEdit || isDetail) ? (
        <div className="text-center p-10">Memuat data anggota...</div>
      ) : (
        <AnggotaForm
          form={form}
          setForm={setForm}
          onCancel={() => {
            if (typeof window !== "undefined") {
              sessionStorage.setItem("anggota_need_refetch", "1");
            }
            router.back();
          }}
          onSubmit={handleSubmit}
          readonly={readonly}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { formatDateForInput } from "@/lib/format-utils";
import { useGetProvinsiListQuery } from "@/services/admin/master/provinsi.service";
import { useGetKotaListQuery } from "@/services/admin/master/kota.service";
import { useGetKecamatanListQuery } from "@/services/admin/master/kecamatan.service";
import { useGetKelurahanListQuery } from "@/services/admin/master/kelurahan.service";
import { KTACard } from "@/components/kta-card-admin";
import KTACardBack from "@/components/kta-card-back-admin";
import type { AdminAnggotaFormState } from "@/app/admin/keanggotaan/add-data/page";
import { useGetLevelListQuery } from "@/services/admin/master/level.service"; 

interface AnggotaFormProps {
  form: AdminAnggotaFormState;
  setForm: React.Dispatch<React.SetStateAction<AdminAnggotaFormState>>;
  onCancel: () => void;
  onSubmit: () => void;
  readonly?: boolean;
  isLoading?: boolean;
}

export default function AnggotaForm({
  form,
  setForm,
  onCancel,
  onSubmit,
  readonly = false,
  isLoading = false,
}: AnggotaFormProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // ------ PREVIEW untuk upload KTP & Foto (mirip RegisterForm) ------
  const [ktpPreview, setKtpPreview] = useState<string | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);

  const ktpSrc = useMemo(() => {
    if (ktpPreview) return ktpPreview;
    const v = form.ktp_file;
    return typeof v === "string" && v.length > 0 ? v : null;
  }, [ktpPreview, form.ktp_file]);

  const fotoSrc = useMemo(() => {
    if (fotoPreview) return fotoPreview;
    const v = form.photo_file;
    return typeof v === "string" && v.length > 0 ? v : null;
  }, [fotoPreview, form.photo_file]);

  const handleKtpUpload = (file?: File | null) => {
    setForm((f) => ({ ...f, ktp_file: file ?? null }));
    // ganti preview
    if (ktpPreview && ktpPreview.startsWith("blob:"))
      URL.revokeObjectURL(ktpPreview);
    setKtpPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleFotoUpload = (file?: File | null) => {
    setForm((f) => ({ ...f, photo_file: file ?? null }));
    if (fotoPreview && fotoPreview.startsWith("blob:"))
      URL.revokeObjectURL(fotoPreview);
    setFotoPreview(file ? URL.createObjectURL(file) : null);
  };

  // optional: bersihkan saat unmount
  useEffect(() => {
    return () => {
      if (ktpPreview && ktpPreview.startsWith("blob:"))
        URL.revokeObjectURL(ktpPreview);
      if (fotoPreview && fotoPreview.startsWith("blob:"))
        URL.revokeObjectURL(fotoPreview);
    };
  }, [ktpPreview, fotoPreview]);

  // ------------------------------------------------------------------

  // provinsi
  const [provinsiSearch, setProvinsiSearch] = useState("");
  const { data: provinsiData, isLoading: isProvinsiLoading } =
    useGetProvinsiListQuery({
      page: 1,
      paginate: 100,
      search: provinsiSearch,
    });
  const [isDropdownProvinsiOpen, setDropdownProvinsiOpen] = useState(false);
  const dropdownProvinsiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    if (form.province_id && provinsiData?.data) {
      const selectedProvinsi = provinsiData.data.find(
        (p) => p.id === form.province_id
      );
      if (selectedProvinsi) setProvinsiSearch(selectedProvinsi.name);
    }
  }, [form.province_id, provinsiData]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownProvinsiRef.current &&
        !dropdownProvinsiRef.current.contains(event.target as Node)
      ) {
        setDropdownProvinsiOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownProvinsiRef]);

  const filteredProvinsi = useMemo(() => {
    if (!provinsiData?.data || provinsiSearch.length < 2) return [];
    return provinsiData.data.filter((provinsi) =>
      provinsi.name.toLowerCase().includes(provinsiSearch.toLowerCase())
    );
  }, [provinsiSearch, provinsiData]);

  const handleProvinsiSelect = (provinsi: { id: string; name: string }) => {
    setForm({
      ...form,
      province_id: provinsi.id,
      regency_id: undefined,
      district_id: undefined,
      village_id: undefined,
    });
    setProvinsiSearch(provinsi.name);
    setDropdownProvinsiOpen(false);
    setKotaSearch("");
    setKecamatanSearch("");
    setKelurahanSearch("");
  };

  // kota
  const [kotaSearch, setKotaSearch] = useState("");
  const { data: kotaData, isLoading: isKotaLoading } = useGetKotaListQuery({
    page: 1,
    paginate: 100,
    search: kotaSearch,
    province_id: form.province_id || "",
  });
  const [isDropdownKotaOpen, setDropdownKotaOpen] = useState(false);
  const dropdownKotaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    if (form.regency_id && kotaData?.data) {
      const selectedKota = kotaData.data.find((p) => p.id === form.regency_id);
      if (selectedKota) setKotaSearch(selectedKota.name);
    }
  }, [form.regency_id, kotaData]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownKotaRef.current &&
        !dropdownKotaRef.current.contains(event.target as Node)
      ) {
        setDropdownKotaOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownKotaRef]);

  const filteredKota = useMemo(() => {
    if (!kotaData?.data || kotaSearch.length < 2) return [];
    return kotaData.data.filter((kota) =>
      kota.name.toLowerCase().includes(kotaSearch.toLowerCase())
    );
  }, [kotaSearch, kotaData]);

  const handleKotaSelect = (kota: { id: string; name: string }) => {
    setForm({
      ...form,
      regency_id: kota.id,
      district_id: undefined,
      village_id: undefined,
    });
    setKotaSearch(kota.name);
    setDropdownKotaOpen(false);
  };

  // kecamatan
  const [kecamatanSearch, setKecamatanSearch] = useState("");
  const { data: kecamatanData, isLoading: isKecamatanLoading } =
    useGetKecamatanListQuery({
      page: 1,
      paginate: 100,
      search: kecamatanSearch,
      regency_id: form.regency_id || "",
    });
  const [isDropdownKecamatanOpen, setDropdownKecamatanOpen] = useState(false);
  const dropdownKecamatanRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    if (form.district_id && kecamatanData?.data) {
      const selectedKecamatan = kecamatanData.data.find(
        (p) => p.id === form.district_id
      );
      if (selectedKecamatan) setKecamatanSearch(selectedKecamatan.name);
    }
  }, [form.district_id, kecamatanData]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownKecamatanRef.current &&
        !dropdownKecamatanRef.current.contains(event.target as Node)
      ) {
        setDropdownKecamatanOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownKecamatanRef]);

  const filteredKecamatan = useMemo(() => {
    if (!kecamatanData?.data || kecamatanSearch.length < 2) return [];
    return kecamatanData.data.filter((kecamatan) =>
      kecamatan.name.toLowerCase().includes(kecamatanSearch.toLowerCase())
    );
  }, [kecamatanSearch, kecamatanData]);

  const handleKecamatanSelect = (kecamatan: { id: string; name: string }) => {
    setForm({ ...form, district_id: kecamatan.id, village_id: undefined });
    setKecamatanSearch(kecamatan.name);
    setDropdownKecamatanOpen(false);
    setKelurahanSearch("");
  };

  // kelurahan
  const [kelurahanSearch, setKelurahanSearch] = useState("");
  const { data: kelurahanData, isLoading: isKelurahanLoading } =
    useGetKelurahanListQuery({
      page: 1,
      paginate: 100,
      search: kelurahanSearch,
      district_id: form.district_id || "",
    });
  const [isDropdownKelurahanOpen, setDropdownKelurahanOpen] = useState(false);
  const dropdownKelurahanRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    // ✅ FIX: pakai village_id untuk cari nama kelurahan awal
    if (form.village_id && kelurahanData?.data) {
      const selectedKelurahan = kelurahanData.data.find(
        (p) => p.id === form.village_id
      );
      if (selectedKelurahan) setKelurahanSearch(selectedKelurahan.name);
    }
  }, [form.village_id, kelurahanData]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownKelurahanRef.current &&
        !dropdownKelurahanRef.current.contains(event.target as Node)
      ) {
        setDropdownKelurahanOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownKelurahanRef]);

  const filteredKelurahan = useMemo(() => {
    if (!kelurahanData?.data || kelurahanSearch.length < 2) return [];
    return kelurahanData.data.filter((kelurahan) =>
      kelurahan.name.toLowerCase().includes(kelurahanSearch.toLowerCase())
    );
  }, [kelurahanSearch, kelurahanData]);

  const handleKelurahanSelect = (kelurahan: { id: string; name: string }) => {
    setForm({ ...form, village_id: kelurahan.id });
    setKelurahanSearch(kelurahan.name);
    setDropdownKelurahanOpen(false);
  };

  // =========================================================================
  // ✅ LOGIKA LEVEL BARU
  // =========================================================================
  // Gunakan useGetLevelListQuery untuk mendapatkan data level
  const { data: levelData, isLoading: isLevelLoading } = useGetLevelListQuery({
    page: 1,
    paginate: 100,
    search: "",
  });

  // Semua opsi level (diperlukan untuk dropdown)
  const allLevelOptions = useMemo(() => levelData?.data ?? [], [levelData]);

  // Handler untuk mengubah level
  const handleLevelChange = (value: string) => {
    const idNum = Number(value);
    // Perbarui form.level_id. Jika value kosong, set ke undefined.
    setForm({
      ...form,
      level_id: isNaN(idNum) || value === "" ? undefined : idNum,
    });
  };

  // Kosongkan state levelSearch dan logic handleLevelSelect/handleClearLevel
  // karena tidak lagi relevan (kita menggunakan <select> standar)

  // Kosongkan state search yang tidak perlu
  const [levelSearch, setLevelSearch] = useState("");
  const [isDropdownLevelOpen, setDropdownLevelOpen] = useState(false);

  if (!mounted) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-lg w-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-zinc-700 flex-shrink-0">
          <h2 className="text-lg font-semibold">Loading...</h2>
          <Button variant="ghost" onClick={onCancel}>
            ✕
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg w-full max-h-[90vh] flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-zinc-700 flex-shrink-0">
        <h2 className="text-lg font-semibold">
          {readonly
            ? "Detail Anggota"
            : form.id
            ? "Edit Anggota"
            : "Tambah Anggota"}
        </h2>
        <Button variant="ghost" onClick={onCancel}>
          ✕
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {readonly && form.id && (
            <>
              <KTACard memberId={form.id} onClickRoute="/admin/kta" />
              <KTACardBack
                reference={form.reference ?? undefined}
                userId={form.id}
              />
            </>
          )}

          {/* ========================================================== */}
          {/* BASIC INFO */}
          {/* ========================================================== */}
          <h3 className="sm:col-span-2 text-md font-semibold mt-2 border-b pb-2">
            Informasi Dasar
          </h3>

          {/* Nama */}
          <div className="flex flex-col gap-y-1">
            <Label>Nama</Label>
            <Input
              value={form.name ?? ""}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              readOnly={readonly}
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-y-1">
            <Label>Email</Label>
            <Input
              type="email"
              value={form.email ?? ""}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              readOnly={readonly}
            />
          </div>

          {/* Password (hanya add) */}
          {!readonly && !form.id && (
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-y-1">
                <Label>Password (wajib saat tambah)</Label>
                <Input
                  type="password"
                  value={form.password ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
              </div>
              <div className="flex flex-col gap-y-1">
                <Label>Konfirmasi Password</Label>
                <Input
                  type="password"
                  value={form.password_confirmation ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, password_confirmation: e.target.value })
                  }
                />
              </div>
            </div>
          )}

          {/* Gender */}
          <div className="flex flex-col gap-y-1">
            <Label>Jenis Kelamin</Label>
            <select
              className="border rounded-md px-3 py-2 text-sm bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-600"
              value={form.gender ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  gender: e.target.value as "laki-laki" | "wanita",
                })
              }
              disabled={readonly}
            >
              <option value="">Pilih Jenis Kelamin</option>
              <option value="laki-laki">Laki-laki</option>
              <option value="wanita">Perempuan</option>
            </select>
          </div>

          {/* KTP */}
          <div className="flex flex-col gap-y-1">
            <Label htmlFor="ktp">Nomor KTP</Label>
            <Input
              id="ktp"
              name="ktp"
              placeholder="Masukkan 16 digit nomor KTP"
              value={form.ktp ?? ""}
              onChange={(e) => {
                const digitsOnly = e.target.value
                  .replace(/\D/g, "")
                  .slice(0, 16);
                setForm({ ...form, ktp: digitsOnly });
              }}
              inputMode="numeric"
              maxLength={16}
              pattern="^\d{16}$"
              title="Nomor KTP harus 16 digit angka"
              readOnly={readonly}
              autoComplete="off"
              className={
                (form.ktp ?? "").length > 0 && !/^\d{16}$/.test(form.ktp ?? "")
                  ? "border-red-500 focus-visible:ring-red-500"
                  : undefined
              }
              aria-invalid={
                (form.ktp ?? "").length > 0 && !/^\d{16}$/.test(form.ktp ?? "")
                  ? "true"
                  : "false"
              }
            />
            {!readonly &&
              (form.ktp ?? "").length > 0 &&
              !/^\d{16}$/.test(form.ktp ?? "") && (
                <span className="text-xs text-red-600">
                  Nomor KTP harus terdiri dari 16 digit angka.
                </span>
              )}
          </div>

          {/* Tempat/Tanggal Lahir */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-y-1">
              <Label>Tempat Lahir</Label>
              <Input
                value={form.birth_place ?? ""}
                onChange={(e) =>
                  setForm({ ...form, birth_place: e.target.value })
                }
                readOnly={readonly}
              />
            </div>
            <div className="flex flex-col gap-y-1">
              <Label>Tanggal Lahir</Label>
              <Input
                type="date"
                value={formatDateForInput(form.birth_date) ?? ""}
                onChange={(e) =>
                  setForm({ ...form, birth_date: e.target.value })
                }
                readOnly={readonly}
              />
            </div>
          </div>

          {/* Agama */}
          <div className="flex flex-col gap-y-1">
            <Label>Agama</Label>
            <select
              className="border rounded-md px-3 py-2 text-sm bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-600"
              value={form.religion ?? ""}
              onChange={(e) => setForm({ ...form, religion: e.target.value })}
              disabled={readonly}
            >
              <option value="">Pilih Agama</option>
              <option value="Islam">Islam</option>
              <option value="Kristen">Kristen</option>
              <option value="Katolik">Katolik</option>
              <option value="Hindu">Hindu</option>
              <option value="Buddha">Buddha</option>
              <option value="Konghucu">Konghucu</option>
            </select>
          </div>

          {/* Status Pernikahan */}
          <div className="flex flex-col gap-y-1">
            <Label>Status Pernikahan</Label>
            <select
              className="border rounded-md px-3 py-2 text-sm bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-600"
              value={form.marital_status ?? ""}
              onChange={(e) =>
                setForm({ ...form, marital_status: e.target.value })
              }
              disabled={readonly}
            >
              <option value="">Pilih Status Pernikahan</option>
              <option value="Belum Menikah">Belum Menikah</option>
              <option value="Menikah">Menikah</option>
              <option value="Cerai Hidup">Cerai Hidup</option>
              <option value="Cerai Mati">Cerai Mati</option>
            </select>
          </div>

          {/* Pekerjaan */}
          <div className="flex flex-col gap-y-1">
            <Label>Pekerjaan</Label>
            <select
              className="border rounded-md px-3 py-2 text-sm bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-600"
              value={form.occupation ?? ""}
              onChange={(e) => setForm({ ...form, occupation: e.target.value })}
              disabled={readonly}
            >
              <option value="">Pilih Pekerjaan</option>
              <option value="PELAJAR/MAHASISWA">PELAJAR/MAHASISWA</option>
              <option value="WIRASWASTA">WIRASWASTA</option>
              <option value="KARYAWAN SWASTA">KARYAWAN SWASTA</option>
              <option value="PEGAWAI NEGERI SIPIL">PEGAWAI NEGERI SIPIL</option>
              <option value="TNI">TNI</option>
              <option value="POLRI">POLRI</option>
              <option value="MENGURUS RUMAH TANGGA">
                MENGURUS RUMAH TANGGA
              </option>
              <option value="BELUM/TIDAK BEKERJA">BELUM/TIDAK BEKERJA</option>
              <option value="PETANI/PEKEBUN">PETANI/PEKEBUN</option>
              <option value="PEDAGANG">PEDAGANG</option>
              <option value="PENSIUNAN">PENSIUNAN</option>
              <option value="LAINNYA">LAINNYA</option>
            </select>
          </div>

          {/* Pendidikan Terakhir */}
          <div className="flex flex-col gap-y-1">
            <Label>Pendidikan Terakhir</Label>
            <select
              className="border rounded-md px-3 py-2 text-sm bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-600"
              value={form.last_education ?? ""}
              onChange={(e) =>
                setForm({ ...form, last_education: e.target.value })
              }
              disabled={readonly}
            >
              <option value="">Pilih Pendidikan Terakhir</option>
              <option value="SD">SD</option>
              <option value="SMP">SMP</option>
              <option value="SMA/SMK">SMA/SMK</option>
              <option value="D1">D1</option>
              <option value="D2">D2</option>
              <option value="D3">D3</option>
              <option value="D4">D4</option>
              <option value="S1">S1</option>
              <option value="S2">S2</option>
              <option value="S3">S3</option>
            </select>
          </div>

          <div className="flex flex-col gap-y-1">
            <Label>Level</Label>
            <select
              id="level_id"
              className="border rounded-md px-3 py-2 text-sm bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-600"
              // Pastikan value adalah string (meskipun form.level_id adalah number)
              value={form.level_id?.toString() ?? ""}
              onChange={(e) => handleLevelChange(e.target.value)}
              disabled={readonly || isLevelLoading}
            >
              <option value="">
                {isLevelLoading ? "Memuat level..." : "Pilih Level"}
              </option>
              {!isLevelLoading &&
                allLevelOptions.map((level) => (
                  // ID dari API biasanya string, kita gunakan Number(level.id).toString()
                  // agar kompatibel dengan value select (yang selalu string)
                  <option key={level.id} value={Number(level.id).toString()}>
                    {level.name}
                  </option>
                ))}
            </select>
          </div>

          {/* ✅ Foto KTP (opsional, sama seperti RegisterForm) */}
          <div className="sm:col-span-2">
            <div className="space-y-2">
              <Label htmlFor="upload_ktp">Foto KTP</Label>
              <div className="flex flex-col gap-3">
                <div className="relative">
                  <Input
                    id="upload_ktp"
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleKtpUpload(e.target.files?.[0] ?? null)
                    }
                    disabled={readonly}
                    className="h-11"
                  />
                </div>
                {/* Preview KTP */}
                {ktpSrc && (
                  <div className="relative w-full h-40 rounded-lg overflow-hidden border border-border">
                    <img
                      src={ktpSrc}
                      alt="Preview KTP"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ✅ Foto Asli (opsional, sama seperti RegisterForm) */}
          <div className="sm:col-span-2">
            <div className="space-y-2">
              <Label htmlFor="upload_foto">Foto Asli</Label>
              <div className="flex flex-col gap-3">
                <div className="relative">
                  <Input
                    id="upload_foto"
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleFotoUpload(e.target.files?.[0] ?? null)
                    }
                    disabled={readonly}
                    className="h-11"
                  />
                </div>
                {/* Preview Foto */}
                {fotoSrc && (
                  <div className="relative w-full h-40 rounded-lg overflow-hidden border border-border">
                    <img
                      src={fotoSrc}
                      alt="Preview Foto"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ========================================================== */}
          {/* ADDRESS INFO */}
          {/* ========================================================== */}
          <h3 className="sm:col-span-2 text-md font-semibold mt-4 border-b pb-2">
            Informasi Alamat
          </h3>

          {/* Provinsi Searchable Dropdown */}
          <div className="flex flex-col gap-y-1.5" ref={dropdownProvinsiRef}>
            <Label htmlFor="province_id">Provinsi</Label>
            <div className="relative">
              <Input
                id="province_id"
                placeholder="Ketik min 2 huruf untuk mencari provinsi..."
                value={provinsiSearch}
                onChange={(e) => {
                  setProvinsiSearch(e.target.value);
                  setDropdownProvinsiOpen(true);
                  if (form.province_id) {
                    setForm({
                      ...form,
                      province_id: undefined,
                      regency_id: undefined,
                      district_id: undefined,
                      village_id: undefined,
                    });
                  }
                }}
                onFocus={() => setDropdownProvinsiOpen(true)}
                readOnly={readonly}
                required
                autoComplete="off"
              />
              {isDropdownProvinsiOpen && !readonly && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {isProvinsiLoading ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                  ) : provinsiSearch.length < 2 ? (
                    <p className="text-sm text-gray-500 p-3">
                      Ketik minimal 2 huruf...
                    </p>
                  ) : filteredProvinsi.length > 0 ? (
                    filteredProvinsi.map((provinsi) => (
                      <button
                        type="button"
                        key={provinsi.id}
                        onClick={() => handleProvinsiSelect(provinsi)}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-700"
                      >
                        {provinsi.name}
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 p-3">
                      Provinsi tidak ditemukan.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Kota */}
          <div className="flex flex-col gap-y-1.5" ref={dropdownKotaRef}>
            <Label htmlFor="regency_id">Kota / Kabupaten</Label>
            <div className="relative">
              <Input
                id="regency_id"
                placeholder={
                  !form.province_id
                    ? "Pilih provinsi terlebih dahulu"
                    : "Ketik min 2 huruf untuk mencari kota..."
                }
                value={kotaSearch}
                onChange={(e) => {
                  setKotaSearch(e.target.value);
                  setDropdownKotaOpen(true);
                  if (form.regency_id)
                    setForm({
                      ...form,
                      regency_id: undefined,
                      district_id: undefined,
                      village_id: undefined,
                    });
                }}
                onFocus={() => {
                  if (form.province_id) setDropdownKotaOpen(true);
                }}
                readOnly={readonly}
                required
                autoComplete="off"
                disabled={!form.province_id || readonly}
              />
              {isDropdownKotaOpen && !readonly && form.province_id && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {isKotaLoading ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                  ) : kotaSearch.length < 2 ? (
                    <p className="text-sm text-gray-500 p-3">
                      Ketik minimal 2 huruf...
                    </p>
                  ) : filteredKota.length > 0 ? (
                    filteredKota.map((kota) => (
                      <button
                        type="button"
                        key={kota.id}
                        onClick={() => handleKotaSelect(kota)}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-700"
                      >
                        {kota.name}
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 p-3">
                      Kota tidak ditemukan.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Kecamatan */}
          <div className="flex flex-col gap-y-1.5" ref={dropdownKecamatanRef}>
            <Label htmlFor="district_id">Kecamatan</Label>
            <div className="relative">
              <Input
                id="district_id"
                placeholder={
                  !form.regency_id
                    ? "Pilih kota terlebih dahulu"
                    : "Ketik min 2 huruf untuk mencari kecamatan..."
                }
                value={kecamatanSearch}
                onChange={(e) => {
                  setKecamatanSearch(e.target.value);
                  setDropdownKecamatanOpen(true);
                  if (form.district_id)
                    setForm({
                      ...form,
                      district_id: undefined,
                      village_id: undefined,
                    });
                }}
                onFocus={() => {
                  if (form.regency_id) setDropdownKecamatanOpen(true);
                }}
                readOnly={readonly}
                required
                autoComplete="off"
                disabled={!form.regency_id || readonly}
              />
              {isDropdownKecamatanOpen && !readonly && form.regency_id && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {isKecamatanLoading ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                  ) : kecamatanSearch.length < 2 ? (
                    <p className="text-sm text-gray-500 p-3">
                      Ketik minimal 2 huruf...
                    </p>
                  ) : filteredKecamatan.length > 0 ? (
                    filteredKecamatan.map((kecamatan) => (
                      <button
                        type="button"
                        key={kecamatan.id}
                        onClick={() => handleKecamatanSelect(kecamatan)}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-700"
                      >
                        {kecamatan.name}
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 p-3">
                      Kecamatan tidak ditemukan.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Kelurahan */}
          <div className="flex flex-col gap-y-1.5" ref={dropdownKelurahanRef}>
            <Label htmlFor="village_id">Kelurahan / Desa</Label>
            <div className="relative">
              <Input
                id="village_id"
                placeholder={
                  !form.district_id
                    ? "Pilih kota terlebih dahulu"
                    : "Ketik min 2 huruf untuk mencari kelurahan..."
                }
                value={kelurahanSearch}
                onChange={(e) => {
                  setKelurahanSearch(e.target.value);
                  setDropdownKelurahanOpen(true);
                  if (form.village_id)
                    setForm({ ...form, village_id: undefined });
                }}
                onFocus={() => {
                  if (form.district_id) setDropdownKelurahanOpen(true);
                }}
                readOnly={readonly}
                required
                autoComplete="off"
                disabled={!form.district_id || readonly}
              />
              {isDropdownKelurahanOpen && !readonly && form.district_id && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {isKelurahanLoading ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                  ) : kelurahanSearch.length < 2 ? (
                    <p className="text-sm text-gray-500 p-3">
                      Ketik minimal 2 huruf...
                    </p>
                  ) : filteredKelurahan.length > 0 ? (
                    filteredKelurahan.map((kelurahan) => (
                      <button
                        type="button"
                        key={kelurahan.id}
                        onClick={() => handleKelurahanSelect(kelurahan)}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-700"
                      >
                        {kelurahan.name}
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 p-3">
                      Kelurahan tidak ditemukan.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* RT / RW */}
          <div className="sm:col-span-2 grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-y-1">
              <Label>RT</Label>
              <Input
                type="number"
                value={form.rt ?? ""}
                onChange={(e) =>
                  setForm({ ...form, rt: Number(e.target.value) || undefined })
                }
                readOnly={readonly}
              />
            </div>
            <div className="flex flex-col gap-y-1">
              <Label>RW</Label>
              <Input
                type="number"
                value={form.rw ?? ""}
                onChange={(e) =>
                  setForm({ ...form, rw: Number(e.target.value) || undefined })
                }
                readOnly={readonly}
              />
            </div>
            {/* ✅ Kode Pos */}
            <div className="sm:col-span-2">
              <div className="flex flex-col gap-y-1">
                <Label>Kode Pos</Label>
                <Input
                  inputMode="numeric"
                  maxLength={5} // kode pos Indonesia umumnya 5 digit
                  placeholder="Misal: 53111"
                  value={form.postal_code ?? ""}
                  onChange={(e) => {
                    const digits = e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 5);
                    setForm({ ...form, postal_code: digits });
                  }}
                  readOnly={readonly}
                  autoComplete="postal-code"
                />
              </div>
            </div>
          </div>

          {/* Alamat (full) */}
          <div className="flex flex-col gap-y-1 col-span-2">
            <Label>Alamat Lengkap</Label>
            <Textarea
              value={form.address ?? ""}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              readOnly={readonly}
            />
          </div>

          {/* ========================================================== */}
          {/* CONTACT & SOCIAL MEDIA INFO */}
          {/* ========================================================== */}
          <h3 className="sm:col-span-2 text-md font-semibold mt-4 border-b pb-2">
            Informasi Kontak & Sosial Media
          </h3>

          {/* Phone (Main) */}
          <div className="flex flex-col gap-y-1">
            <Label>Telepon (Utama)</Label>
            <Input
              value={form.phone ?? ""}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              readOnly={readonly}
            />
          </div>
          {/* Phone Home */}
          <div className="flex flex-col gap-y-1">
            <Label>Telepon Rumah</Label>
            <Input
              value={form.phone_home ?? ""}
              onChange={(e) => setForm({ ...form, phone_home: e.target.value })}
              readOnly={readonly}
            />
          </div>
          {/* Phone Office */}
          <div className="flex flex-col gap-y-1">
            <Label>Telepon Kantor</Label>
            <Input
              value={form.phone_office ?? ""}
              onChange={(e) =>
                setForm({ ...form, phone_office: e.target.value })
              }
              readOnly={readonly}
            />
          </div>
          {/* Phone Faksimili */}
          <div className="flex flex-col gap-y-1">
            <Label>Faksimili</Label>
            <Input
              value={form.phone_faksimili ?? ""}
              onChange={(e) =>
                setForm({ ...form, phone_faksimili: e.target.value })
              }
              readOnly={readonly}
            />
          </div>

          {/* WhatsApp */}
          <div className="flex flex-col gap-y-1">
            <Label>WhatsApp</Label>
            <Input
              value={form.whatsapp ?? ""}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              readOnly={readonly}
            />
          </div>
          {/* Facebook */}
          <div className="flex flex-col gap-y-1">
            <Label>Facebook</Label>
            <Input
              value={form.facebook ?? ""}
              onChange={(e) => setForm({ ...form, facebook: e.target.value })}
              readOnly={readonly}
            />
          </div>
          {/* Instagram */}
          <div className="flex flex-col gap-y-1">
            <Label>Instagram</Label>
            <Input
              value={form.instagram ?? ""}
              onChange={(e) => setForm({ ...form, instagram: e.target.value })}
              readOnly={readonly}
            />
          </div>
          {/* Twitter */}
          <div className="flex flex-col gap-y-1">
            <Label>Twitter</Label>
            <Input
              value={form.twitter ?? ""}
              onChange={(e) => setForm({ ...form, twitter: e.target.value })}
              readOnly={readonly}
            />
          </div>
          {/* TikTok */}
          <div className="flex flex-col gap-y-1">
            <Label>TikTok</Label>
            <Input
              value={form.tiktok ?? ""}
              onChange={(e) => setForm({ ...form, tiktok: e.target.value })}
              readOnly={readonly}
            />
          </div>
        </div>
      </div>

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

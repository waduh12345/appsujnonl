"use client";

import type React from "react";

import useDebounce from "@/hooks/use-debounce";
import { useGetProvinsiListQuery } from "@/services/public/provinsi.service";
import { useGetKotaListQuery } from "@/services/public/kota.service";
import { useGetKecamatanListQuery } from "@/services/public/kecamatan.service";
import { useGetKelurahanListQuery } from "@/services/public/kelurahan.service";
import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Swal from "sweetalert2";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { UserPlus, Loader2 } from "lucide-react";
import { useRegisterMutation } from "@/services/admin/anggota.service";
import {
  extractApiErrorMessage,
  hasErrorString,
  isFetchBaseQueryError,
} from "@/lib/error-format";

const religions = [
  "Islam",
  "Kristen",
  "Katolik",
  "Hindu",
  "Buddha",
  "Konghucu",
];
const marital_statuses = [
  "Belum Menikah",
  "Menikah",
  "Cerai Hidup",
  "Cerai Mati",
];
const last_educationLevels = ["SD", "SMP", "SMA/SMK", "D3", "S1", "S2", "S3"];

export default function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // const taskId = searchParams.get("taskId") || "";
  const referal = searchParams.get("referal") || "";

  const dropdownProvinsiRef = useRef<HTMLDivElement>(null);
  const dropdownKotaRef = useRef<HTMLDivElement>(null);
  const dropdownKecamatanRef = useRef<HTMLDivElement>(null);
  const dropdownKelurahanRef = useRef<HTMLDivElement>(null);
  const [register, { isLoading: isCreating }] = useRegisterMutation();

  const [formData, setFormData] = useState({
    // Group 1: Akun
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    referalCode: "",
    gender: "",
    status: 0,
    // Group 2: Identitas
    upload_ktp: null as File | null,
    upload_foto: null as File | null,
    ktp: "",
    province_id: "",
    regency_id: "",
    district_id: "",
    village_id: "",
    rt: "",
    rw: "",
    address: "",
    birth_date: "",
    birth_place: "",
    religion: "",
    marital_status: "",
    occupation: "",
    last_education: "",
    // Group 3: Kontak
    phone: "",
    phone_home: "",
    phone_office: "",
    phone_faksimili: "",
    // Group 4: Media Sosial
    facebook: "",
    instagram: "",
    twitter: "",
    whatsapp: "",
    tiktok: "",
    path: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [ktpPreview, setKtpPreview] = useState<string | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);

  const [openSelect, setOpenSelect] = useState({
    province_id: false,
    regency_id: false,
    district_id: false,
    village_id: false,
  });

  // provinsi
  const [provinsiSearch, setProvinsiSearch] = useState("");
  const debouncedProvinsiSearch = useDebounce(provinsiSearch, 500);
  const { data: provinsiData, isLoading: isProvinsiLoading } =
    useGetProvinsiListQuery(
      {
        page: 1,
        paginate: 100,
        search: debouncedProvinsiSearch,
      },
      { skip: debouncedProvinsiSearch.length < 2 }
    );
  const filteredProvince = provinsiData?.data || [];

  // kota
  const [kotaSearch, setKotaSearch] = useState("");
  const debouncedKotaSearch = useDebounce(kotaSearch, 500);
  const { data: kotaData, isLoading: isKotaLoading } = useGetKotaListQuery(
    {
      page: 1,
      paginate: 100,
      search: debouncedKotaSearch,
      province_id: formData.province_id,
    },
    { skip: !formData.province_id || debouncedKotaSearch.length < 2 }
  );
  const filteredKota = useMemo(() => {
    if (!kotaData?.data) return [];

    return kotaData.data.filter((kota) => {
      return kota.name
        .toLowerCase()
        .includes(debouncedKotaSearch.toLowerCase());
    });
  }, [kotaData, debouncedKotaSearch]);

  // kecamatan
  const [district_idSearch, setDistrictSearch] = useState("");
  const debouncedDistrictSearch = useDebounce(district_idSearch, 500);
  const { data: kecamatanData, isLoading: isKecamatanLoading } =
    useGetKecamatanListQuery(
      {
        page: 1,
        paginate: 100,
        search: debouncedDistrictSearch,
        regency_id: formData.regency_id,
      },
      { skip: !formData.regency_id || debouncedDistrictSearch.length < 2 }
    );
  const filteredDistrict = useMemo(() => {
    if (!kecamatanData?.data) return [];
    return kecamatanData.data.filter((district_id) => {
      return district_id.name
        .toLocaleLowerCase()
        .includes(debouncedDistrictSearch.toLowerCase());
    });
  }, [kecamatanData, debouncedDistrictSearch]);

  // kelurahan
  const [village_idSearch, setSubDistrictSearch] = useState("");
  const debouncedSubDistrictSearch = useDebounce(village_idSearch, 500);
  const { data: kelurahanData, isLoading: isKelurahanLoading } =
    useGetKelurahanListQuery(
      {
        page: 1,
        paginate: 100,
        search: debouncedSubDistrictSearch,
        district_id: formData.district_id,
      },
      { skip: !formData.regency_id || debouncedSubDistrictSearch.length < 2 }
    );
  const filteredSubDistrict = useMemo(() => {
    if (!kelurahanData?.data) return [];
    return kelurahanData.data.filter((district_id) => {
      return district_id.name
        .toLocaleLowerCase()
        .includes(debouncedSubDistrictSearch.toLowerCase());
    });
  }, [kelurahanData, debouncedSubDistrictSearch]);

  const handleKtpUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, upload_ktp: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setKtpPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, upload_foto: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // validasi minimal
      if (!formData.name || !formData.email || !formData.phone || !formData.ktp)
        throw new Error("Nama, Email, Telepon, dan KTP wajib diisi");

      // ✅ Normalisasi gender sesuai rule backend: in:laki-laki,wanita
      const genderNormalized = (formData.gender ?? "").trim().toLowerCase();
      if (!["laki-laki", "wanita"].includes(genderNormalized)) {
        throw new Error("Jenis kelamin wajib dipilih (laki-laki/wanita)");
      }

      if (!formData.password || formData.password.trim().length < 8)
        throw new Error("Password minimal 8 karakter");
      if (formData.password !== formData.password_confirmation)
        throw new Error("Konfirmasi password tidak cocok");

      const fd = new FormData();
      fd.append("name", formData.name);
      fd.append("email", formData.email);
      fd.append("phone", formData.phone);
      fd.append("address", formData.address ?? "");
      fd.append("gender", genderNormalized); // ✅ kirim nilai yang valid
      fd.append("birth_date", formData.birth_date ?? "");
      fd.append("birth_place", formData.birth_place ?? "");
      fd.append("status", String(formData.status));
      fd.append("ktp", formData.ktp ?? "");

      if (formData.province_id) fd.append("province_id", formData.province_id);
      if (formData.regency_id) fd.append("regency_id", formData.regency_id);
      if (formData.district_id) fd.append("district_id", formData.district_id);
      if (formData.village_id) fd.append("village_id", formData.village_id);
      if (formData.rt !== undefined && formData.rt !== null)
        fd.append("rt", String(formData.rt));
      if (formData.rw !== undefined && formData.rw !== null)
        fd.append("rw", String(formData.rw));
      if (formData.religion) fd.append("religion", formData.religion);
      if (formData.marital_status)
        fd.append("marital_status", formData.marital_status);
      if (formData.occupation) fd.append("occupation", formData.occupation);
      if (formData.last_education)
        fd.append("last_education", formData.last_education);
      if (formData.phone_home) fd.append("phone_home", formData.phone_home);
      if (formData.phone_office)
        fd.append("phone_office", formData.phone_office);
      if (formData.phone_faksimili)
        fd.append("phone_faksimili", formData.phone_faksimili);
      if (formData.facebook) fd.append("facebook", formData.facebook);
      if (formData.instagram) fd.append("instagram", formData.instagram);
      if (formData.twitter) fd.append("twitter", formData.twitter);
      if (formData.whatsapp) fd.append("whatsapp", formData.whatsapp);
      if (formData.tiktok) fd.append("tiktok", formData.tiktok);
      if (formData.path) fd.append("path", formData.path);

      // yang tadi belum terkirim:
      if (formData.referalCode) fd.append("referal", formData.referalCode);
      if (formData.upload_ktp) fd.append("upload_ktp", formData.upload_ktp);
      if (formData.upload_foto) fd.append("upload_foto", formData.upload_foto);

      fd.append("password", formData.password);
      fd.append("password_confirmation", formData.password_confirmation);

      // PANGGIL API
      await register(fd).unwrap();

      // TUNGGU alert sukses SELESAI dulu, baru redirect
      await Swal.fire({
        title: "Sukses",
        text: "Daftar anggota berhasil",
        icon: "success",
        confirmButtonText: "OK",
      });

      router.push("/anggota/login");
    } catch (error: unknown) {
      let msg = "Terjadi kesalahan saat menyimpan";

      if (isFetchBaseQueryError(error)) {
        const serverMsg = extractApiErrorMessage(error.data);
        if (serverMsg) msg = serverMsg;
        else if (hasErrorString(error)) msg = error.error; // e.g. FETCH_ERROR
      } else if (error instanceof Error && error.message) {
        msg = error.message;
      }

      await Swal.fire("Gagal", msg, "error");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProvinsiSelect = (provinsi: { id: string; name: string }) => {
    console.log("dijalankan");
    setFormData((prev) => ({ ...prev, province_id: provinsi.id }));
    setProvinsiSearch(provinsi.name);
    setOpenSelect({ ...openSelect, province_id: false });
  };

  const handleKotaSelect = (kota: { id: string; name: string }) => {
    setFormData((prev) => ({ ...prev, regency_id: kota.id }));
    setKotaSearch(kota.name);
    setOpenSelect({ ...openSelect, regency_id: false });
  };

  const handleKecamatanSelect = (kecamatan: { id: string; name: string }) => {
    setFormData((prev) => ({ ...prev, district_id: kecamatan.id }));
    setDistrictSearch(kecamatan.name);
    setOpenSelect({ ...openSelect, district_id: false });
  };

  const handleKelurahanSelect = (kelurahan: { id: string; name: string }) => {
    setFormData((prev) => ({ ...prev, village_id: kelurahan.id }));
    setSubDistrictSearch(kelurahan.name);
    setOpenSelect({ ...openSelect, village_id: false });
  };

  useEffect(() => {
    if (referal) {
      setFormData((prev) => ({ ...prev, referalCode: referal }));
    }
  }, [referal]);

  return (
    <div className="relative">
      {/* Decorative background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <Card className="border-border shadow-xl">
        <CardHeader className="space-y-3">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-accent-foreground rounded-2xl flex items-center justify-center shadow-lg">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Daftar Anggota Baru
          </CardTitle>
          <CardDescription className="text-center">
            Lengkapi formulir pendaftaran di bawah ini
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Group 1: Informasi Akun */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">1</span>
                </div>
                <h3 className="font-semibold text-base">Informasi Akun</h3>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">
                  Nama Lengkap <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Masukkan nama lengkap"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@email.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">
                  Kata Sandi <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimal 8 karakter"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                  minLength={8}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password_confirmation">
                  Konfirmasi Kata Sandi{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="password_confirmation"
                  type="password"
                  placeholder="Ulangi kata sandi"
                  value={formData.password_confirmation}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      password_confirmation: e.target.value,
                    })
                  }
                  required
                  minLength={8}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="referalCode">Kode Referal (Opsional)</Label>
                <Input
                  disabled={!!referal}
                  id="referalCode"
                  type="text"
                  placeholder="Masukkan kode referal jika ada"
                  value={formData.referalCode}
                  onChange={(e) =>
                    setFormData({ ...formData, referalCode: e.target.value })
                  }
                  className="h-11"
                />
              </div>
            </div>

            {/* Group 2: Data Identitas */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">2</span>
                </div>
                <h3 className="font-semibold text-base">Data Identitas</h3>
              </div>

              <div className="space-y-2">
                <Label htmlFor="upload_ktp">
                  Foto KTP <span className="text-destructive">*</span>
                </Label>
                <div className="flex flex-col gap-3">
                  <div className="relative">
                    <Input
                      id="upload_ktp"
                      type="file"
                      accept="image/*"
                      onChange={handleKtpUpload}
                      required
                      className="h-11"
                    />
                  </div>
                  {ktpPreview && (
                    <div className="relative w-full h-40 rounded-lg overflow-hidden border border-border">
                      <Image
                        unoptimized // <-- This is correct
                        src={ktpPreview || "/placeholder.svg"}
                        alt="Preview KTP"
                        fill
                        sizes="100vw"
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="upload_foto">
                  Foto Asli <span className="text-destructive">*</span>
                </Label>
                <div className="flex flex-col gap-3">
                  <div className="relative">
                    <Input
                      id="upload_foto"
                      type="file"
                      accept="image/*"
                      onChange={handleFotoUpload}
                      required
                      className="h-11"
                    />
                  </div>
                  {fotoPreview && (
                    <div className="relative w-full h-40 rounded-lg overflow-hidden border border-border">
                      <Image
                        unoptimized // <-- This is correct
                        src={fotoPreview || "/placeholder.svg"}
                        alt="Preview Foto"
                        fill
                        sizes="100vw"
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ktp">
                  NIK <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="ktp"
                  type="text"
                  placeholder="16 digit NIK"
                  value={formData.ktp}
                  onChange={(e) =>
                    setFormData({ ...formData, ktp: e.target.value })
                  }
                  required
                  maxLength={16}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birth_date">
                  Tanggal Lahir <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="birth_date"
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) =>
                    setFormData({ ...formData, birth_date: e.target.value })
                  }
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="birth_place">
                  Tempat Lahir <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="birth_place"
                  type="text"
                  placeholder="Kota tempat lahir"
                  value={formData.birth_place}
                  onChange={(e) =>
                    setFormData({ ...formData, birth_place: e.target.value })
                  }
                  required
                  className="h-11"
                />
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label htmlFor="gender">
                  Jenis Kelamin <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) =>
                    setFormData({ ...formData, gender: value })
                  }
                >
                  <SelectTrigger id="gender" className="h-11 w-full">
                    <SelectValue placeholder="Pilih jenis kelamin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="laki-laki">Laki-laki</SelectItem>
                    <SelectItem value="wanita">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="religion">
                  Agama <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.religion}
                  onValueChange={(value) =>
                    setFormData({ ...formData, religion: value })
                  }
                  required
                >
                  <SelectTrigger className="h-11 w-full">
                    <SelectValue placeholder="Pilih agama" />
                  </SelectTrigger>
                  <SelectContent>
                    {religions.map((religion) => (
                      <SelectItem key={religion} value={religion}>
                        {religion}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="marital_status">
                  Status Menikah <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.marital_status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, marital_status: value })
                  }
                  required
                >
                  <SelectTrigger className="h-11 w-full">
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    {marital_statuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="occupation">
                  Pekerjaan <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="occupation"
                  type="text"
                  placeholder="Masukkan pekerjaan"
                  value={formData.occupation}
                  onChange={(e) =>
                    setFormData({ ...formData, occupation: e.target.value })
                  }
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_education">
                  Pendidikan Terakhir{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.last_education}
                  onValueChange={(value) =>
                    setFormData({ ...formData, last_education: value })
                  }
                  required
                >
                  <SelectTrigger className="h-11 w-full">
                    <SelectValue placeholder="Pilih pendidikan" />
                  </SelectTrigger>
                  <SelectContent>
                    {last_educationLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2" ref={dropdownProvinsiRef}>
                <Label htmlFor="province_id">Provinsi</Label>
                <div className="relative">
                  <Input
                    id="province_id"
                    placeholder="Ketik min 2 huruf untuk mencari provinsi..."
                    value={provinsiSearch}
                    onChange={(e) => {
                      setProvinsiSearch(e.target.value);
                      setOpenSelect({ ...openSelect, province_id: true });
                      if (formData.province_id) {
                        setFormData((prev) => ({ ...prev, province_id: "" }));
                      }
                    }}
                    onFocus={() => {
                      setOpenSelect({ ...openSelect, province_id: true });
                    }}
                    required
                    autoComplete="off"
                  />
                  {openSelect.province_id && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {isProvinsiLoading ? (
                        <div className="flex items-center justify-center p-4">
                          <Loader2 className="h-5 w-5 animate-spin" />
                        </div>
                      ) : provinsiSearch.length < 2 ? (
                        <p className="text-sm text-gray-500 p-3">
                          Ketik minimal 2 huruf...
                        </p>
                      ) : filteredProvince.length > 0 ? (
                        provinsiData?.data.map((provinsi) => (
                          <button
                            type="button"
                            key={provinsi.id}
                            onClick={() => {
                              handleProvinsiSelect(provinsi);
                            }}
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

              <div className="space-y-2" ref={dropdownKotaRef}>
                <Label htmlFor="regency_id">Kabupaten/Kota</Label>
                <div className="relative">
                  <Input
                    id="regency_id"
                    placeholder="Ketik min 2 huruf untuk mencari kabupaten/kota..."
                    value={kotaSearch}
                    onChange={(e) => {
                      setKotaSearch(e.target.value);
                      setOpenSelect({ ...openSelect, regency_id: true });
                      if (formData.regency_id) {
                        setFormData((prev) => ({ ...prev, regency_id: "" }));
                      }
                    }}
                    onFocus={() => {
                      setOpenSelect({ ...openSelect, regency_id: true });
                    }}
                    required
                    autoComplete="off"
                  />
                  {openSelect.regency_id && (
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

              <div className="space-y-2" ref={dropdownKecamatanRef}>
                <Label htmlFor="district_id">Kecamatan</Label>
                <div className="relative">
                  <Input
                    id="district_id"
                    placeholder="Ketik min 2 huruf untuk mencari kecamatan..."
                    value={district_idSearch}
                    onChange={(e) => {
                      setDistrictSearch(e.target.value);
                      setOpenSelect({ ...openSelect, district_id: true });
                      if (formData.regency_id) {
                        setFormData((prev) => ({ ...prev, district_id: "" }));
                      }
                    }}
                    onFocus={() => {
                      setOpenSelect({ ...openSelect, district_id: true });
                    }}
                    required
                    autoComplete="off"
                  />
                  {openSelect.district_id && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {isKecamatanLoading ? (
                        <div className="flex items-center justify-center p-4">
                          <Loader2 className="h-5 w-5 animate-spin" />
                        </div>
                      ) : district_idSearch.length < 2 ? (
                        <p className="text-sm text-gray-500 p-3">
                          Ketik minimal 2 huruf...
                        </p>
                      ) : filteredDistrict.length > 0 ? (
                        filteredDistrict.map((kecamatan) => (
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
                          kecamatan tidak ditemukan.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2" ref={dropdownKelurahanRef}>
                <Label htmlFor="village_id">Kelurahan</Label>
                <div className="relative">
                  <Input
                    id="village_id"
                    placeholder="Ketik min 2 huruf untuk mencari kelurahan..."
                    value={village_idSearch}
                    onChange={(e) => {
                      setSubDistrictSearch(e.target.value);
                      setOpenSelect({ ...openSelect, village_id: true });
                      if (formData.regency_id) {
                        setFormData((prev) => ({ ...prev, village_id: "" }));
                      }
                    }}
                    onFocus={() => {
                      setOpenSelect({ ...openSelect, village_id: true });
                    }}
                    required
                    autoComplete="off"
                  />
                  {openSelect.village_id && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {isKelurahanLoading ? (
                        <div className="flex items-center justify-center p-4">
                          <Loader2 className="h-5 w-5 animate-spin" />
                        </div>
                      ) : village_idSearch.length < 2 ? (
                        <p className="text-sm text-gray-500 p-3">
                          Ketik minimal 2 huruf...
                        </p>
                      ) : filteredSubDistrict.length > 0 ? (
                        filteredSubDistrict.map((kelurahan) => (
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

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="rt">
                    RT <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="rt"
                    type="text"
                    placeholder="Misal: 1"
                    value={formData.rt}
                    onChange={(e) =>
                      setFormData({ ...formData, rt: e.target.value })
                    }
                    required
                    maxLength={3}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rw">
                    RW <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="rw"
                    type="text"
                    placeholder="Misal: 1"
                    value={formData.rw}
                    onChange={(e) =>
                      setFormData({ ...formData, rw: e.target.value })
                    }
                    required
                    maxLength={3}
                    className="h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">
                  Alamat Detail <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="address"
                  placeholder="Masukkan alamat lengkap (nama jalan, nomor rumah, dll)"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  required
                  rows={3}
                  className="resize-none"
                />
              </div>
            </div>

            {/* Group 3: Informasi Kontak */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">3</span>
                </div>
                <h3 className="font-semibold text-base">Informasi Kontak</h3>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">
                  Nomor Telepon <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="08xxxxxxxxxx"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone_home">
                  Telepon Rumah{" "}
                  <span className="text-muted-foreground text-xs">
                    (Opsional)
                  </span>
                </Label>
                <Input
                  id="phone_home"
                  type="tel"
                  placeholder="021xxxxxxxx"
                  value={formData.phone_home}
                  onChange={(e) =>
                    setFormData({ ...formData, phone_home: e.target.value })
                  }
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone_office">
                  Telepon Kantor{" "}
                  <span className="text-muted-foreground text-xs">
                    (Opsional)
                  </span>
                </Label>
                <Input
                  id="phone_office"
                  type="tel"
                  placeholder="021xxxxxxxx"
                  value={formData.phone_office}
                  onChange={(e) =>
                    setFormData({ ...formData, phone_office: e.target.value })
                  }
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone_faksimili">
                  Faksimili{" "}
                  <span className="text-muted-foreground text-xs">
                    (Opsional)
                  </span>
                </Label>
                <Input
                  id="phone_faksimili"
                  type="tel"
                  placeholder="021xxxxxxxx"
                  value={formData.phone_faksimili}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      phone_faksimili: e.target.value,
                    })
                  }
                  className="h-11"
                />
              </div>
            </div>

            {/* Group 4: Media Sosial */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">4</span>
                </div>
                <h3 className="font-semibold text-base">Media Sosial</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Semua field di bawah ini bersifat opsional
              </p>

              <div className="space-y-2">
                <Label htmlFor="facebook">Link Facebook</Label>
                <Input
                  id="facebook"
                  type="url"
                  placeholder="https://facebook.com/username"
                  value={formData.facebook}
                  onChange={(e) =>
                    setFormData({ ...formData, facebook: e.target.value })
                  }
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagram">Link Instagram</Label>
                <Input
                  id="instagram"
                  type="url"
                  placeholder="https://instagram.com/username"
                  value={formData.instagram}
                  onChange={(e) =>
                    setFormData({ ...formData, instagram: e.target.value })
                  }
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="twitter">Link Twitter</Label>
                <Input
                  id="twitter"
                  type="url"
                  placeholder="https://twitter.com/username"
                  value={formData.twitter}
                  onChange={(e) =>
                    setFormData({ ...formData, twitter: e.target.value })
                  }
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp">Nomor WhatsApp</Label>
                <Input
                  id="whatsapp"
                  type="tel"
                  placeholder="08xxxxxxxxxx"
                  value={formData.whatsapp}
                  onChange={(e) =>
                    setFormData({ ...formData, whatsapp: e.target.value })
                  }
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tiktok">Link TikTok</Label>
                <Input
                  id="tiktok"
                  type="url"
                  placeholder="https://tiktok.com/@username"
                  value={formData.tiktok}
                  onChange={(e) =>
                    setFormData({ ...formData, tiktok: e.target.value })
                  }
                  className="h-11"
                />
              </div>
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                className="w-full h-12 font-semibold text-base"
                disabled={isLoading || isCreating}
              >
                {isLoading ? "Memproses Pendaftaran..." : "Daftar Sekarang"}
              </Button>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              Sudah punya akun?{" "}
              <Link
                href="/anggota/login"
                className="text-primary font-semibold hover:underline"
              >
                Masuk di sini
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

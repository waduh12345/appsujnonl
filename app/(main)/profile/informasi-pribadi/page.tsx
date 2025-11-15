"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ArrowLeft, Camera, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  useGetAnggotaListQuery,
  useGetAnggotaByIdQuery,
  useUpdateAnggotaMutation,
} from "@/services/admin/anggota.service";

import { useGetProvinsiListQuery } from "@/services/admin/master/provinsi.service";
import { useGetKotaListQuery } from "@/services/admin/master/kota.service";
import { useGetKecamatanListQuery } from "@/services/admin/master/kecamatan.service";
import { useGetKelurahanListQuery } from "@/services/admin/master/kelurahan.service";

type ProfileForm = {
  fullname: string;
  email: string;
  phone: string;
  address: string;
  kelurahan: string;
};

type Option = { id: string; name: string };

function initials(name?: string): string {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
  return (first + last).toUpperCase() || "U";
}

function toFormData(
  dto: {
    name: string;
    email: string;
    phone: string;
    address: string;
    province_id?: string;
    regency_id?: string;
    district_id?: string;
    village_id?: string;
  },
  useMethodPut = true
): FormData {
  const fd = new FormData();
  fd.append("name", dto.name);
  fd.append("email", dto.email);
  fd.append("phone", dto.phone);
  fd.append("address", dto.address);
  if (dto.province_id) fd.append("province_id", dto.province_id);
  if (dto.regency_id) fd.append("regency_id", dto.regency_id);
  if (dto.district_id) fd.append("district_id", dto.district_id);
  if (dto.village_id) fd.append("village_id", dto.village_id);
  if (useMethodPut) fd.append("_method", "PUT");
  return fd;
}

export default function InformasiPribadiPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? null;

  // =========================================================
  // 1) Temukan anggotaId (tanpa param user_id ke getById)
  //    -> ambil list bertahap sampai ketemu user_id === session.user.id
  //    -> pakai id tsb untuk getById
  // =========================================================
  const [page, setPage] = useState<number>(1);
  const paginate = 100;
  const [anggotaId, setAnggotaId] = useState<number | null>(null);
  const [searchDone, setSearchDone] = useState<boolean>(false); // selesai mencari id atau tidak

  const {
    data: listResp,
    isFetching: isFetchingList,
    isLoading: isLoadingList,
  } = useGetAnggotaListQuery(
    { page, paginate },
    { skip: !userId || Boolean(anggotaId) || searchDone }
  );

  useEffect(() => {
    if (!userId || !listResp || anggotaId) return;
    const found = (listResp.data ?? []).find(
      (it) => Number(it.user_id) === Number(userId)
    );
    if (found) {
      setAnggotaId(Number(found.id));
      setSearchDone(true);
    } else {
      const last = listResp.last_page ?? 1;
      if (page < last) {
        setPage((p) => p + 1);
      } else {
        setSearchDone(true); // selesai tapi tidak ketemu
      }
    }
  }, [listResp, userId, anggotaId, page]);

  // =========================================================
  // 2) GET DETAIL by ID (sesuai permintaan)
  // =========================================================
  const {
    data: anggotaDetail,
    isFetching: isFetchingDetail,
    isLoading: isLoadingDetail,
  } = useGetAnggotaByIdQuery(anggotaId as number, {
    skip: !anggotaId,
  });

  // =========================================================
  // 3) State Form & Prefill
  // =========================================================
  const [form, setForm] = useState<ProfileForm>({
    fullname: "",
    email: "",
    phone: "",
    address: "",
    kelurahan: "",
  });

  // Region IDs (yang akan dikirim ke API)
  const [provinceId, setProvinceId] = useState<string>("");
  const [regencyId, setRegencyId] = useState<string>("");
  const [districtId, setDistrictId] = useState<string>("");
  const [villageId, setVillageId] = useState<string>("");

  // Search text untuk dropdown
  const [provinsiSearch, setProvinsiSearch] = useState<string>("");
  const [kotaSearch, setKotaSearch] = useState<string>("");
  const [kecamatanSearch, setKecamatanSearch] = useState<string>("");
  const [kelurahanSearch, setKelurahanSearch] = useState<string>("");

  // Dropdown open flags + refs
  const [openProv, setOpenProv] = useState<boolean>(false);
  const [openKota, setOpenKota] = useState<boolean>(false);
  const [openKec, setOpenKec] = useState<boolean>(false);
  const [openKel, setOpenKel] = useState<boolean>(false);

  const refProv = useRef<HTMLDivElement>(null);
  const refKota = useRef<HTMLDivElement>(null);
  const refKec = useRef<HTMLDivElement>(null);
  const refKel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (refProv.current && !refProv.current.contains(e.target as Node))
        setOpenProv(false);
      if (refKota.current && !refKota.current.contains(e.target as Node))
        setOpenKota(false);
      if (refKec.current && !refKec.current.contains(e.target as Node))
        setOpenKec(false);
      if (refKel.current && !refKel.current.contains(e.target as Node))
        setOpenKel(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Prefill ketika detail tersedia
  useEffect(() => {
    if (!anggotaDetail) return;

    setForm({
      fullname: anggotaDetail.name ?? "",
      email: anggotaDetail.email ?? "",
      phone: anggotaDetail.phone ?? "",
      address: anggotaDetail.address ?? "",
      kelurahan: anggotaDetail.village?.name ?? "",
    });

    // Set ID region & placeholder nama ke input search dropdown
    setProvinceId(anggotaDetail.province_id ?? "");
    setRegencyId(anggotaDetail.regency_id ?? "");
    setDistrictId(anggotaDetail.district_id ?? "");
    setVillageId(anggotaDetail.village_id ?? "");

    setProvinsiSearch(anggotaDetail.province?.name ?? "");
    setKotaSearch(anggotaDetail.regency?.name ?? "");
    setKecamatanSearch(anggotaDetail.district?.name ?? "");
    setKelurahanSearch(anggotaDetail.village?.name ?? "");
  }, [anggotaDetail]);

  // =========================================================
  // 4) Master Data Queries (berantai)
  // =========================================================
  const { data: provinsiData, isLoading: isProvLoading } =
    useGetProvinsiListQuery({
      page: 1,
      paginate: 100,
      search: provinsiSearch,
    });

  const { data: kotaData, isLoading: isKotaLoading } = useGetKotaListQuery({
    page: 1,
    paginate: 100,
    search: kotaSearch,
    province_id: provinceId || "",
  });

  const { data: kecamatanData, isLoading: isKecLoading } =
    useGetKecamatanListQuery({
      page: 1,
      paginate: 100,
      search: kecamatanSearch,
      regency_id: regencyId || "",
    });

  const { data: kelurahanData, isLoading: isKelLoading } =
    useGetKelurahanListQuery({
      page: 1,
      paginate: 100,
      search: kelurahanSearch,
      district_id: districtId || "",
    });

  const provList: Option[] = useMemo(
    () =>
      (provinsiData?.data ?? []).map((p: Option) => ({
        id: p.id,
        name: p.name,
      })),
    [provinsiData]
  );
  const kotaList: Option[] = useMemo(
    () =>
      (kotaData?.data ?? []).map((p: Option) => ({ id: p.id, name: p.name })),
    [kotaData]
  );
  const kecList: Option[] = useMemo(
    () =>
      (kecamatanData?.data ?? []).map((p: Option) => ({
        id: p.id,
        name: p.name,
      })),
    [kecamatanData]
  );
  const kelList: Option[] = useMemo(
    () =>
      (kelurahanData?.data ?? []).map((p: Option) => ({
        id: p.id,
        name: p.name,
      })),
    [kelurahanData]
  );

  // Handler pilih tiap level wilayah
  const handleSelectProv = (opt: Option) => {
    setProvinceId(opt.id);
    setProvinsiSearch(opt.name);
    // reset chain
    setRegencyId("");
    setKotaSearch("");
    setDistrictId("");
    setKecamatanSearch("");
    setVillageId("");
    setKelurahanSearch("");
    setOpenProv(false);
  };

  const handleSelectKota = (opt: Option) => {
    setRegencyId(opt.id);
    setKotaSearch(opt.name);
    // reset bawahnya
    setDistrictId("");
    setKecamatanSearch("");
    setVillageId("");
    setKelurahanSearch("");
    setOpenKota(false);
  };

  const handleSelectKec = (opt: Option) => {
    setDistrictId(opt.id);
    setKecamatanSearch(opt.name);
    // reset bawahnya
    setVillageId("");
    setKelurahanSearch("");
    setOpenKec(false);
  };

  const handleSelectKel = (opt: Option) => {
    setVillageId(opt.id);
    setKelurahanSearch(opt.name);
    setForm((s) => ({ ...s, kelurahan: opt.name }));
    setOpenKel(false);
  };

  // =========================================================
  // 5) Update
  // =========================================================
  const [updateAnggota, { isLoading: isUpdating }] = useUpdateAnggotaMutation();

  const canSubmit = useMemo(
    () =>
      !!anggotaId &&
      form.fullname.trim().length > 0 &&
      form.email.trim().length > 0 &&
      form.phone.trim().length > 0 &&
      form.address.trim().length > 0 &&
      provinceId &&
      regencyId &&
      districtId &&
      villageId,
    [anggotaId, form, provinceId, regencyId, districtId, villageId]
  );

  const handleSubmit = async () => {
    if (!anggotaId) return;

    const fd = toFormData(
      {
        name: form.fullname,
        email: form.email,
        phone: form.phone,
        address: form.address,
        province_id: provinceId,
        regency_id: regencyId,
        district_id: districtId,
        village_id: villageId,
      },
      true
    );

    await updateAnggota({ id: anggotaId, payload: fd }).unwrap();
  };

  // =========================================================
  // 6) UI
  // =========================================================
  if (!userId) {
    return (
      <div className="p-6">
        <p className="text-sm">Anda belum login.</p>
        <Link href="/anggota/login">
          <Button className="mt-3">Ke Halaman Login</Button>
        </Link>
      </div>
    );
  }

  const searchingId =
    (!anggotaId && !searchDone) || isFetchingList || isLoadingList;
  const loadingDetail = !anggotaDetail && (isFetchingDetail || isLoadingDetail);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="flex items-center gap-4 p-4">
          <Link href="/profile">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-bold">Informasi Pribadi</h1>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Profile Photo */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  {/* gunakan photo_file */}
                  <AvatarImage src={anggotaDetail?.photo_file || ""} />
                  <AvatarFallback className="bg-primary text-white text-2xl">
                    {initials(form.fullname)}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                  title="Ubah foto (belum diimplementasi upload)"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Foto profil anggota
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {searchingId || loadingDetail ? "Memuat..." : "Data Pribadi"}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Nama */}
            <div className="space-y-2">
              <Label htmlFor="fullname">Nama Lengkap</Label>
              <Input
                id="fullname"
                placeholder="Masukkan nama lengkap"
                value={form.fullname}
                onChange={(e) =>
                  setForm((s) => ({ ...s, fullname: e.target.value }))
                }
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={form.email}
                onChange={(e) =>
                  setForm((s) => ({ ...s, email: e.target.value }))
                }
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">No. Handphone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="08xxxxxxxxxx"
                value={form.phone}
                onChange={(e) =>
                  setForm((s) => ({ ...s, phone: e.target.value }))
                }
              />
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">Alamat Lengkap</Label>
              <Input
                id="address"
                placeholder="Masukkan alamat lengkap"
                value={form.address}
                onChange={(e) =>
                  setForm((s) => ({ ...s, address: e.target.value }))
                }
              />
            </div>

            {/* Provinsi */}
            <div className="space-y-2" ref={refProv}>
              <Label>Provinsi</Label>
              <div className="relative">
                <Input
                  placeholder="Cari Provinsi..."
                  value={provinsiSearch}
                  onChange={(e) => {
                    setProvinsiSearch(e.target.value);
                    setOpenProv(true);
                    if (provinceId) {
                      // jika diubah ketik manual, kosongkan ID untuk hindari salah kirim
                      setProvinceId("");
                      setRegencyId("");
                      setDistrictId("");
                      setVillageId("");
                      setKotaSearch("");
                      setKecamatanSearch("");
                      setKelurahanSearch("");
                    }
                  }}
                  onFocus={() => setOpenProv(true)}
                />
                {openProv && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {isProvLoading ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="h-5 w-5 animate-spin" />
                      </div>
                    ) : provList.length > 0 ? (
                      provList.map((p) => (
                        <button
                          type="button"
                          key={p.id}
                          onClick={() => handleSelectProv(p)}
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-muted"
                        >
                          {p.name}
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

            {/* Kota / Kabupaten */}
            <div className="space-y-2" ref={refKota}>
              <Label>Kabupaten/Kota</Label>
              <div className="relative">
                <Input
                  placeholder={
                    provinceId
                      ? "Cari Kota/Kabupaten..."
                      : "Pilih provinsi dulu…"
                  }
                  value={kotaSearch}
                  onChange={(e) => {
                    setKotaSearch(e.target.value);
                    if (provinceId) setOpenKota(true);
                    if (regencyId) {
                      setRegencyId("");
                      setDistrictId("");
                      setVillageId("");
                      setKecamatanSearch("");
                      setKelurahanSearch("");
                    }
                  }}
                  onFocus={() => provinceId && setOpenKota(true)}
                  disabled={!provinceId}
                />
                {openKota && provinceId && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {isKotaLoading ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="h-5 w-5 animate-spin" />
                      </div>
                    ) : kotaList.length > 0 ? (
                      kotaList.map((p) => (
                        <button
                          type="button"
                          key={p.id}
                          onClick={() => handleSelectKota(p)}
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-muted"
                        >
                          {p.name}
                        </button>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 p-3">
                        Kota/Kabupaten tidak ditemukan.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Kecamatan */}
            <div className="space-y-2" ref={refKec}>
              <Label>Kecamatan</Label>
              <div className="relative">
                <Input
                  placeholder={
                    regencyId ? "Cari Kecamatan..." : "Pilih kota dulu…"
                  }
                  value={kecamatanSearch}
                  onChange={(e) => {
                    setKecamatanSearch(e.target.value);
                    if (regencyId) setOpenKec(true);
                    if (districtId) {
                      setDistrictId("");
                      setVillageId("");
                      setKelurahanSearch("");
                    }
                  }}
                  onFocus={() => regencyId && setOpenKec(true)}
                  disabled={!regencyId}
                />
                {openKec && regencyId && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {isKecLoading ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="h-5 w-5 animate-spin" />
                      </div>
                    ) : kecList.length > 0 ? (
                      kecList.map((p) => (
                        <button
                          type="button"
                          key={p.id}
                          onClick={() => handleSelectKec(p)}
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-muted"
                        >
                          {p.name}
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
            <div className="space-y-2" ref={refKel}>
              <Label>Kelurahan</Label>
              <div className="relative">
                <Input
                  placeholder={
                    districtId ? "Cari Kelurahan..." : "Pilih kecamatan dulu…"
                  }
                  value={kelurahanSearch}
                  onChange={(e) => {
                    setKelurahanSearch(e.target.value);
                    if (districtId) setOpenKel(true);
                    if (villageId) setVillageId("");
                  }}
                  onFocus={() => districtId && setOpenKel(true)}
                  disabled={!districtId}
                />
                {openKel && districtId && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {isKelLoading ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="h-5 w-5 animate-spin" />
                      </div>
                    ) : kelList.length > 0 ? (
                      kelList.map((p) => (
                        <button
                          type="button"
                          key={p.id}
                          onClick={() => handleSelectKel(p)}
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-muted"
                        >
                          {p.name}
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
          </CardContent>
        </Card>

        <Button
          className="w-full"
          onClick={handleSubmit}
          disabled={searchingId || loadingDetail || isUpdating || !canSubmit}
        >
          {isUpdating ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>

        {searchDone && !anggotaId && (
          <p className="text-xs text-muted-foreground text-center">
            Data anggota milik akun ini tidak ditemukan.
          </p>
        )}
      </div>
    </div>
  );
}
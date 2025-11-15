"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  useGetAnggotaListQuery,
  useDeleteAnggotaMutation,
  useExportAnggotaExcelMutation,
  useImportAnggotaExcelMutation,
} from "@/services/admin/anggota.service";
import { useGetCurrentUserQuery } from "@/services/auth.service";
import type { Anggota } from "@/types/admin/anggota";
import { useRouter } from "next/navigation";
import ActionsGroup from "@/components/admin-components/actions-group";
import { Plus, Loader2, Printer } from "lucide-react";
import useModal from "@/hooks/use-modal";
import { Input } from "@/components/ui/input";
import { useGetProvinsiListQuery } from "@/services/admin/master/provinsi.service";
import { useGetKotaListQuery } from "@/services/admin/master/kota.service";
import { useGetKecamatanListQuery } from "@/services/admin/master/kecamatan.service";
import { useGetKelurahanListQuery } from "@/services/admin/master/kelurahan.service";
import { useGetLevelListQuery } from "@/services/admin/master/level.service";

export default function AnggotaPage() {
  const router = useRouter();
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  
  // Menggunakan alias untuk hook levelData
  const profileMe = useGetCurrentUserQuery();
  const profileMeLevel = (profileMe.data?.anggota as { level_id?: number })?.level_id;
  const profileMeProvince = (profileMe.data?.anggota as { province_id?: string })?.province_id;
  const profileMeRegency = (profileMe.data?.anggota as { regency_id?: string })?.regency_id;

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | "0" | "1" | "2">("all");
  const { isOpen, openModal, closeModal } = useModal();
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // States untuk filter wilayah
  const [filterRegion, setFilterRegion] = useState<{
    province_id: string | undefined;
    regency_id: string | undefined;
    district_id: string | undefined;
    village_id: string | undefined;
  }>({
    province_id: undefined,
    regency_id: undefined,
    district_id: undefined,
    village_id: undefined,
  });

  const [filterLevelId, setFilterLevelId] = useState<number | undefined>(
    undefined
  );

  // =======================
  // HOOKS FETCH DATA PENDUKUNG
  // =======================

  // Hooks untuk mendapatkan daftar wilayah / level (digunakan untuk dropdown dan mencari nama)
  const { data: provinsiAll, isFetching: isProvinsiFetchingAll, isSuccess: isProvinsiSuccessAll } = useGetProvinsiListQuery({ page: 1, paginate: 500 });
  const { data: kotaAll, isFetching: isKotaFetchingAll, isSuccess: isKotaSuccessAll } = useGetKotaListQuery({ page: 1, paginate: 500 });

  // Hook untuk data anggota
  const { data, isLoading, refetch } = useGetAnggotaListQuery(
    {
      page: currentPage,
      paginate: itemsPerPage,
      province_id: filterRegion.province_id,
      regency_id: filterRegion.regency_id,
      district_id: filterRegion.district_id,
      village_id: filterRegion.village_id,
      level_id: filterLevelId,
    },
    {
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    }
  );

  // =======================
  // LOGIKA LOCKING FILTER BERDASARKAN LEVEL (PERBAIKAN)
  // =======================

  const isProfileDataReady = !profileMe.isLoading && profileMe.data;
  const areAllRegionDataReady = isProvinsiSuccessAll && isKotaSuccessAll;
  
  // State untuk melacak apakah filter sudah dikunci
  const [isFilterLocked, setIsFilterLocked] = useState(false);

  useEffect(() => {
    if (mounted && isProfileDataReady && areAllRegionDataReady && !isFilterLocked) {
      const level = Number(profileMeLevel);
      
      let shouldLock = false;
      
      // Level 2: Lock Provinsi
      if (level === 2 && profileMeProvince) {
        shouldLock = true;
        setFilterRegion((prev) => ({
            ...prev,
            province_id: profileMeProvince,
            regency_id: undefined,
            district_id: undefined,
            village_id: undefined,
        }));
        
        const provName = provinsiAll?.data.find(p => p.id === profileMeProvince)?.name;
        if (provName) setProvinsiSearch(provName);

        setKotaSearch("");
        setKecamatanSearch("");
        setKelurahanSearch("");
        
      } 
      // Level 3: Lock Provinsi & Kota/Kabupaten
      else if (level === 3 && profileMeProvince && profileMeRegency) {
        shouldLock = true;
        setFilterRegion((prev) => ({
            ...prev,
            province_id: profileMeProvince,
            regency_id: profileMeRegency,
            district_id: undefined,
            village_id: undefined,
        }));

        const provName = provinsiAll?.data.find(p => p.id === profileMeProvince)?.name;
        const regencyName = kotaAll?.data.find(k => k.id === profileMeRegency)?.name;
        
        if (provName) setProvinsiSearch(provName);
        if (regencyName) setKotaSearch(regencyName);
        
        setKecamatanSearch("");
        setKelurahanSearch("");
      }

      if (shouldLock) {
          setIsFilterLocked(true);
      } else if (level === 1 && isFilterLocked) {
          // Jika sudah di-lock sebelumnya tapi sekarang Level 1 (Full Access), buka kunci
          setIsFilterLocked(false);
          setProvinsiSearch("");
          setKotaSearch("");
      }
    }
  }, [
    mounted, 
    isProfileDataReady, 
    areAllRegionDataReady, 
    profileMeLevel, 
    profileMeProvince, 
    profileMeRegency, 
    provinsiAll, 
    kotaAll,
    isFilterLocked
  ]);

  // =======================
  // LOGIKA REFETCH DAN DATA MURNI (dipertahankan)
  // =======================

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") refetch();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [refetch]);

  // Refetch keras kalau form set flag setelah save/cancel
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("anggota_need_refetch") === "1") {
      sessionStorage.removeItem("anggota_need_refetch");
      refetch();
    }
  }, [refetch]);

  const list = useMemo(() => data?.data ?? [], [data]);

  const filteredList = useMemo(() => {
    let arr = list;
    if (status !== "all")
      arr = arr.filter((it) => it.status === Number(status));

    if (!query.trim()) return arr;
    const q = query.toLowerCase();
    return arr.filter((it) =>
      [it.name, it.email, it.phone, it.address, it.ktp, ""].some((f) =>
        f?.toLowerCase?.().includes?.(q)
      )
    );
  }, [list, query, status]);

  const lastPage = useMemo(() => data?.last_page ?? 1, [data]);

  const [deleteAnggota] = useDeleteAnggotaMutation();

  const [exportAnggotaExcel, { isLoading: isExporting }] =
    useExportAnggotaExcelMutation();
  const [importAnggotaExcel, { isLoading: isImporting }] =
    useImportAnggotaExcelMutation();

  const handleGoBatchKTA = () => {
    if (!filterRegion.village_id) return;
    if (typeof window !== "undefined") {
      sessionStorage.setItem("batch_kta_village_id", filterRegion.village_id);
      sessionStorage.setItem("batch_kta_village_name", kelurahanSearch || "");
    }
    router.push(`/admin/kta/print-multiple?page=1&paginate=100`);
  };

  const handleDelete = async (item: Anggota) => {
    const confirm = await Swal.fire({
      title: "Yakin hapus Anggota?",
      text: `${item.name} (${item.email})`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hapus",
    });
    if (confirm.isConfirmed) {
      try {
        await deleteAnggota(item.id).unwrap();
        await refetch();
        Swal.fire("Berhasil", "Anggota dihapus", "success");
      } catch (error) {
        Swal.fire("Gagal", "Gagal menghapus Anggota", "error");
        console.error(error);
      }
    }
  };

  // =======================
  // FILTER WILAYAH (dipertahankan)
  // =======================
  const [provinsiSearch, setProvinsiSearch] = useState("");
  const { data: provinsiData, isLoading: isProvinsiLoading } = useGetProvinsiListQuery({ page: 1, paginate: 100, search: provinsiSearch });
  const [isDropdownProvinsiOpen, setDropdownProvinsiOpen] = useState(false);
  const dropdownProvinsiRef = useRef<HTMLDivElement>(null);

  // NEW: Gunakan variabel isFilterLocked dan profileMeLevel untuk disabled
  const isProvinsiDisabled = Number(profileMeLevel) >= 2 && isFilterLocked;

  useEffect(() => {
    // Logika ini hanya untuk mengupdate search state jika ada perubahan filterRegion,
    // TIDAK BOLEH mengubah filterRegion jika filter terkunci
    if (filterRegion.province_id && provinsiData?.data) {
      const selectedProvinsi = provinsiData.data.find(
        (p) => p.id === filterRegion.province_id
      );
      if (selectedProvinsi) setProvinsiSearch(selectedProvinsi.name);
    } 
    // Jika filterRegion.province_id dihapus oleh user level 1, search juga dihapus.
    else if (!filterRegion.province_id && Number(profileMeLevel) === 1) {
        setProvinsiSearch("");
    }
  }, [filterRegion.province_id, provinsiData, profileMeLevel]);


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
    setFilterRegion({
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

  const [kotaSearch, setKotaSearch] = useState("");
  const { data: kotaData, isLoading: isKotaLoading } = useGetKotaListQuery({
    page: 1,
    paginate: 100,
    search: kotaSearch,
    province_id: filterRegion.province_id || "",
  });
  const [isDropdownKotaOpen, setDropdownKotaOpen] = useState(false);
  const dropdownKotaRef = useRef<HTMLDivElement>(null);
  
  // NEW: Gunakan variabel isFilterLocked dan profileMeLevel untuk disabled
  const isKotaDisabled = Number(profileMeLevel) >= 3 && isFilterLocked;

  useEffect(() => {
    if (filterRegion.regency_id && kotaData?.data) {
      const selectedKota = kotaData.data.find(
        (p) => p.id === filterRegion.regency_id
      );
      if (selectedKota) setKotaSearch(selectedKota.name);
    }
    else if (!filterRegion.regency_id && Number(profileMeLevel) <= 2) {

    }
  }, [filterRegion.regency_id, kotaData, profileMeLevel]);

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
    setFilterRegion((prev) => ({
      ...prev,
      regency_id: kota.id,
      district_id: undefined,
      village_id: undefined,
    }));
    setKotaSearch(kota.name);
    setDropdownKotaOpen(false);
    setKecamatanSearch("");
    setKelurahanSearch("");
  };

  const [kecamatanSearch, setKecamatanSearch] = useState("");
  const { data: kecamatanData, isLoading: isKecamatanLoading } =
    useGetKecamatanListQuery({
      page: 1,
      paginate: 100,
      search: kecamatanSearch,
      regency_id: filterRegion.regency_id || "",
    });
  const [isDropdownKecamatanOpen, setDropdownKecamatanOpen] = useState(false);
  const dropdownKecamatanRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (filterRegion.district_id && kecamatanData?.data) {
      const selectedKecamatan = kecamatanData.data.find(
        (p) => p.id === filterRegion.district_id
      );
      if (selectedKecamatan) setKecamatanSearch(selectedKecamatan.name);
    }
  }, [filterRegion.district_id, kecamatanData]);

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
    setFilterRegion((prev) => ({
      ...prev,
      district_id: kecamatan.id,
      village_id: undefined,
    }));
    setKecamatanSearch(kecamatan.name);
    setDropdownKecamatanOpen(false);
    setKelurahanSearch("");
  };

  const [kelurahanSearch, setKelurahanSearch] = useState("");
  const { data: kelurahanData, isLoading: isKelurahanLoading } =
    useGetKelurahanListQuery({
      page: 1,
      paginate: 100,
      search: kelurahanSearch,
      district_id: filterRegion.district_id || "",
    });
  const [isDropdownKelurahanOpen, setDropdownKelurahanOpen] = useState(false);
  const dropdownKelurahanRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (filterRegion.village_id && kelurahanData?.data) {
      const selectedKelurahan = kelurahanData.data.find(
        (p) => p.id === filterRegion.village_id
      );
      if (selectedKelurahan) setKelurahanSearch(selectedKelurahan.name);
    }
  }, [filterRegion.village_id, kelurahanData]);

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
    setFilterRegion((prev) => ({ ...prev, village_id: kelurahan.id }));
    setKelurahanSearch(kelurahan.name);
    setDropdownKelurahanOpen(false);
  };

  // =======================
  // FILTER LEVEL (dipertahankan)
  // =======================
  const [levelSearch, setLevelSearch] = useState("");
  const { data: levelData, isLoading: isLevelLoading } = useGetLevelListQuery({
    page: 1,
    paginate: 100,
    search: levelSearch,
  });
  const [isDropdownLevelOpen, setDropdownLevelOpen] = useState(false);
  const dropdownLevelRef = useRef<HTMLDivElement>(null);
  
  // ... (Logika Level Filter dipertahankan) ...
  
  useEffect(() => {
    if (filterLevelId && levelData?.data) {
      const selectedLevel = levelData.data.find(
        (l) => Number(l.id) === filterLevelId
      );
      if (selectedLevel) setLevelSearch(selectedLevel.name);
    } else if (!filterLevelId) {
      setLevelSearch("");
    }
  }, [filterLevelId, levelData]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownLevelRef.current &&
        !dropdownLevelRef.current.contains(event.target as Node)
      ) {
        setDropdownLevelOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownLevelRef]);

  const filteredLevel = useMemo(() => {
    if (!levelData?.data) return [];
    return levelData.data.filter((level) =>
      level.name.toLowerCase().includes(levelSearch.toLowerCase())
    );
  }, [levelSearch, levelData]);

  const handleLevelSelect = (level: { id: number; name: string }) => {
    setFilterLevelId(Number(level.id));
    setLevelSearch(level.name);
    setDropdownLevelOpen(false);
  };

  const handleClearLevel = () => {
    setFilterLevelId(undefined);
    setLevelSearch("");
    setDropdownLevelOpen(false);
  };

  // =======================
  // IMPORT / EXPORT / PRINT (dipertahankan)
  // =======================
  const [deleteAnggotaMutation] = useDeleteAnggotaMutation();
  const [exportAnggotaExcelMutation, { isLoading: isExportingMutation }] = useExportAnggotaExcelMutation();
  const [importAnggotaExcelMutation, { isLoading: isImportingMutation }] = useImportAnggotaExcelMutation();

  const handleImportExcel = async (file?: File) => {
    try {
      if (!file) return Swal.fire("Gagal", "File tidak ditemukan", "error");
      const res = await importAnggotaExcelMutation({ file }).unwrap();
      Swal.fire(
        "Import Dikirim",
        res.message ?? "Berhasil mengunggah file",
        "success"
      );
    } catch (e) {
      Swal.fire("Gagal", "Import gagal diproses", "error");
      console.error(e);
    }
  };

  const handleExportExcel = async () => {
    const fmt = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate()
      ).padStart(2, "0")}`;

    const from_date = "2020-01-01";
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const to_date = fmt(tomorrow);

    const exportPayload = {
      from_date,
      to_date,
      ...(filterRegion.province_id && {
        province_id: filterRegion.province_id,
      }),
      ...(filterRegion.regency_id && { regency_id: filterRegion.regency_id }),
      ...(filterRegion.district_id && {
        district_id: filterRegion.district_id,
      }),
      ...(filterRegion.village_id && { village_id: filterRegion.village_id }),
      ...(filterLevelId && { level_id: String(filterLevelId) }),
    };

    try {
      Swal.fire({
        title: "Mengirim permintaan Export...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
        showConfirmButton: false,
      });

      const res = await exportAnggotaExcelMutation(exportPayload).unwrap();

      Swal.fire({
        icon: "success",
        title: "Export diproses",
        text:
          res.message ??
          "Permintaan export diterima. Silahkan cek di notifikasi.",
        confirmButtonText: "Oke",
      });
    } catch (e) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Export gagal diproses.",
        confirmButtonText: "Tutup",
      });
      console.error(e);
    }
  };

  const templateCsvUrl =
    "https://api-koperasi.inovasidigitalpurwokerto.id/template-import-anggota.csv";
  const templateCsvLabel = "Template CSV";
  const exportLabel = isExportingMutation ? "Exporting..." : "Export Excel";
  const importLabel = isImportingMutation ? "Importing..." : "Import Excel";
  const exportDisabled = isExportingMutation;
  const importAccept = ".xlsx,.xls,.csv";
  const readonly = false; 

  const handlePrintKTA = (id: number) => {
    router.push(`/admin/kta?memberId=${id}`);
  };

  if (!mounted) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-lg w-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-zinc-700 flex-shrink-0">
          <h2 className="text-lg font-semibold">Memuat Halaman Keanggotaan...</h2>
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
  
  if (profileMe.isLoading) {
    return (
        <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-3 text-lg text-gray-600">Memuat data profil...</span>
        </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="rounded-md bg-white p-4 border border-gray-100 shadow-sm">
        {/* Filter baris-1 */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          {/* Provinsi */}
          <div className="w-full flex flex-col">
            <div className="relative" ref={dropdownProvinsiRef}>
              <Input
                id="province_id"
                placeholder="Filter Provinsi..."
                value={provinsiSearch}
                onChange={(e) => {
                  setProvinsiSearch(e.target.value);
                  setDropdownProvinsiOpen(true);
                  if (filterRegion.province_id) {
                    setFilterRegion({
                      province_id: undefined,
                      regency_id: undefined,
                      district_id: undefined,
                      village_id: undefined,
                    });
                  }
                }}
                onFocus={() => setDropdownProvinsiOpen(true)}
                readOnly={readonly || isProvinsiDisabled}
                required
                autoComplete="off"
                disabled={isProvinsiDisabled} // Disabled jika Level >= 2 dan sudah di lock
              />
              {isDropdownProvinsiOpen && !isProvinsiDisabled && ( 
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {isProvinsiLoading ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
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
          <div className="w-full flex flex-col">
            <div className="relative" ref={dropdownKotaRef}>
              <Input
                id="regency_id"
                placeholder={
                  !filterRegion.province_id
                    ? "Pilih provinsi terlebih dahulu..."
                    : "Filter Kota..."
                }
                value={kotaSearch}
                onChange={(e) => {
                  setKotaSearch(e.target.value);
                  setDropdownKotaOpen(true);
                  if (filterRegion.regency_id)
                    setFilterRegion((prev) => ({
                      ...prev,
                      regency_id: undefined,
                      district_id: undefined,
                      village_id: undefined,
                    }));
                }}
                onFocus={() => {
                  if (filterRegion.province_id) setDropdownKotaOpen(true);
                }}
                readOnly={readonly || isKotaDisabled} 
                required
                autoComplete="off"
                disabled={!filterRegion.province_id || isKotaDisabled} // Disabled jika Level >= 3 dan sudah di lock
              />
              {isDropdownKotaOpen && filterRegion.province_id && !isKotaDisabled && ( 
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {isKotaLoading ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
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
          <div className="w-full flex flex-col">
            <div className="relative" ref={dropdownKecamatanRef}>
              <Input
                id="district_id"
                placeholder={
                  !filterRegion.regency_id
                    ? "Pilih kota terlebih dahulu..."
                    : "Filter Kecamatan..."
                }
                value={kecamatanSearch}
                onChange={(e) => {
                  setKecamatanSearch(e.target.value);
                  setDropdownKecamatanOpen(true);
                  if (filterRegion.district_id)
                    setFilterRegion((prev) => ({
                      ...prev,
                      district_id: undefined,
                      village_id: undefined,
                    }));
                }}
                onFocus={() => {
                  if (filterRegion.regency_id) setDropdownKecamatanOpen(true);
                }}
                readOnly={readonly}
                required
                autoComplete="off"
                disabled={!filterRegion.regency_id || readonly}
              />
              {isDropdownKecamatanOpen &&
                !readonly &&
                filterRegion.regency_id && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {isKecamatanLoading ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="h-5 w-5 animate-spin" />
                      </div>
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
          <div className="w-full flex flex-col">
            <div className="relative" ref={dropdownKelurahanRef}>
              <Input
                id="village_id"
                placeholder={
                  !filterRegion.district_id
                    ? "Pilih kecamatan terlebih dahulu..."
                    : "Filter Kelurahan..."
                }
                value={kelurahanSearch}
                onChange={(e) => {
                  setKelurahanSearch(e.target.value);
                  setDropdownKelurahanOpen(true);
                  if (filterRegion.village_id)
                    setFilterRegion((prev) => ({
                      ...prev,
                      village_id: undefined,
                    }));
                }}
                onFocus={() => {
                  if (filterRegion.district_id) setDropdownKelurahanOpen(true);
                }}
                readOnly={readonly}
                required
                autoComplete="off"
                disabled={!filterRegion.district_id || readonly}
              />
              {isDropdownKelurahanOpen &&
                !readonly &&
                filterRegion.district_id && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {isKelurahanLoading ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="h-5 w-5 animate-spin" />
                      </div>
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

          {/* Level Filter */}
          <div className="w-full flex flex-col">
            <div className="relative" ref={dropdownLevelRef}>
              <Input
                id="level_id"
                placeholder="Filter Level..."
                value={levelSearch}
                onChange={(e) => {
                  setLevelSearch(e.target.value);
                  setDropdownLevelOpen(true);
                  if (filterLevelId) handleClearLevel();
                }}
                onFocus={() => setDropdownLevelOpen(true)}
                readOnly={readonly}
                autoComplete="off"
              />
              {isDropdownLevelOpen && !readonly && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {isLevelLoading ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                  ) : filteredLevel.length > 0 ? (
                    <>
                      <button
                        type="button"
                        onClick={handleClearLevel}
                        className="block w-full text-left px-4 py-2 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 border-b"
                      >
                        (Semua Level)
                      </button>
                      {filteredLevel.map((level) => (
                        <button
                          type="button"
                          key={level.id}
                          onClick={() => handleLevelSelect(level)}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-700"
                        >
                          {level.name}
                        </button>
                      ))}
                    </>
                  ) : (
                    <p className="text-sm text-gray-500 p-3">
                      Level tidak ditemukan.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Baris 2: Search & Actions */}
        <div className="flex flex-col md:flex-row items-center gap-3 mt-4">
          <div className="w-full md:w-2/5 lg:w-1/3 shrink-0">
            <Input
              placeholder="Cari anggota..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 justify-start md:justify-end w-full md:w-3/5 lg:w-2/3">
            <a
              href={templateCsvUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
            >
              <Button variant="outline" className="h-10 w-full sm:w-auto">
                {templateCsvLabel}
              </Button>
            </a>

            <Button
              className="h-10 w-full sm:w-auto"
              onClick={handleExportExcel}
              disabled={exportDisabled}
              variant="outline"
            >
              {exportLabel}
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              accept={importAccept}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleImportExcel(file);
                  e.currentTarget.value = "";
                }
              }}
            />
            <Button
              variant="outline"
              className="h-10 w-full sm:w-auto"
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
            >
              {importLabel}
            </Button>

            <Button
              className="h-10 w-full sm:w-auto gap-2"
              onClick={handleGoBatchKTA}
              disabled={!filterRegion.village_id}
              variant="secondary"
              title={
                filterRegion.village_id
                  ? "Cetak KTA semua anggota pada Kelurahan terpilih"
                  : "Pilih Kelurahan terlebih dahulu"
              }
            >
              <Printer className="h-4 w-4" />
              Generate KTA
            </Button>

            <Button
              onClick={() => router.push("/admin/keanggotaan/add-data")}
              className="h-10 w-full sm:w-auto"
            >
              <Plus /> Tambah Anggota
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left">
              <tr>
                <th className="px-4 py-2">Aksi</th>
                <th className="px-4 py-2">No. Anggota</th>
                <th className="px-4 py-2">Nama</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Telepon</th>
                <th className="px-4 py-2">Provinsi</th>
                <th className="px-4 py-2">Kota</th>
                <th className="px-4 py-2">Kecamatan</th>
                <th className="px-4 py-2">Kelurahan</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="text-center p-4">
                    Memuat data...
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center p-4">
                    Tidak ada data
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="px-4 py-2 whitespace-nowrap flex gap-2">
                      <ActionsGroup
                        handleDetail={() =>
                          router.push(
                            `/admin/keanggotaan/add-data?mode=detail&id=${item.id}`
                          )
                        }
                        handleEdit={() =>
                          router.push(
                            `/admin/keanggotaan/add-data?mode=edit&id=${item.id}`
                          )
                        }
                        handleDelete={() => handleDelete(item)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePrintKTA(item.id)}
                        className="gap-2"
                        title="Print KTA"
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {item.reference}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">{item.name}</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {item.email}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {item.phone}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {item.province_name}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {item.regency_name}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {item.district_name}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {item.village_name}
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
    </div>
  );
}
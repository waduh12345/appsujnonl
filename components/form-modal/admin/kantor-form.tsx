"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { Kantor } from "@/types/admin/kantor";
import {
  useGetJenisKantorListQuery,
} from "@/services/admin/master/jenis-kantor.service";
import {
  useGetProvinsiListQuery,
} from "@/services/admin/master/provinsi.service";
import {
  useGetKotaListQuery,
} from "@/services/admin/master/kota.service";
import { Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

// Definisikan tipe props yang lebih spesifik untuk form ini
interface KantorFormProps {
  form: Partial<Kantor>;
  setForm: (data: Partial<Kantor>) => void;
  onCancel: () => void;
  onSubmit: () => void;
  readonly?: boolean;
  isLoading?: boolean;
}

export default function KantorForm({
  form,
  setForm,
  onCancel,
  onSubmit,
  readonly = false,
  isLoading = false,
}: KantorFormProps) {
  const [mounted, setMounted] = useState(false);
 
  const [jenisKantorSearch, setJenisKantorSearch] = useState("");
  const { data: jenisKantorData, isLoading: isJenisKantorLoading } = useGetJenisKantorListQuery({
    page: 1,
    paginate: 100,
    search: jenisKantorSearch,
  });
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    // Cari dan set nama jenisKantor awal jika form dalam mode edit/readonly
    if (form.office_type_id && jenisKantorData?.data) {
      const selectedJenisKantor = jenisKantorData.data.find(p => p.id === form.office_type_id);
      if (selectedJenisKantor) {
        setJenisKantorSearch(selectedJenisKantor.name);
      }
    }
  }, [form.office_type_id, jenisKantorData]);
  
  // Menutup dropdown saat klik di luar komponen
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);


  const filteredJenisKantor = useMemo(() => {
    if (!jenisKantorData?.data || jenisKantorSearch.length < 2) {
      return [];
    }
    return jenisKantorData.data.filter((jenisKantor) =>
      jenisKantor.name.toLowerCase().includes(jenisKantorSearch.toLowerCase())
    );
  }, [jenisKantorSearch, jenisKantorData]);
  
  const handleJenisKantorSelect = (jenisKantor: { id: number; name: string }) => {
    setForm({ ...form, office_type_id: jenisKantor.id });
    setJenisKantorSearch(jenisKantor.name);
    setDropdownOpen(false);
  };

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
    // Cari dan set nama kota awal jika form dalam mode edit/readonly
    if (form.regency_id && kotaData?.data) {
      const selectedKota = kotaData.data.find(p => p.id === form.regency_id);
      if (selectedKota) {
        setKotaSearch(selectedKota.name);
      }
    }
  }, [form.regency_id, kotaData]);
  
  // Menutup dropdown saat klik di luar komponen
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownKotaRef.current && !dropdownKotaRef.current.contains(event.target as Node)) {
        setDropdownKotaOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownKotaRef]);


  const filteredKota = useMemo(() => {
    if (!kotaData?.data || kotaSearch.length < 2) {
      return [];
    }
    return kotaData.data.filter((kota) =>
      kota.name.toLowerCase().includes(kotaSearch.toLowerCase())
    );
  }, [kotaSearch, kotaData]);

  const handleKotaSelect = (kota: { id: string; name: string }) => {
    setForm({ ...form, regency_id: kota.id });
    setKotaSearch(kota.name);
    setDropdownKotaOpen(false);
  };

  const [provinsiSearch, setProvinsiSearch] = useState("");
  const { data: provinsiData, isLoading: isProvinsiLoading } = useGetProvinsiListQuery({
    page: 1,
    paginate: 100,
    search: provinsiSearch,
  });
  const [isDropdownProvinsiOpen, setDropdownProvinsiOpen] = useState(false);
  const dropdownProvinsiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    // Cari dan set nama provinsi awal jika form dalam mode edit/readonly
    if (form.province_id && provinsiData?.data) {
      const selectedProvinsi = provinsiData.data.find(p => p.id === form.province_id);
      if (selectedProvinsi) {
        setProvinsiSearch(selectedProvinsi.name);
      }
    }
  }, [form.province_id, provinsiData]);
  
  // Menutup dropdown saat klik di luar komponen
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownProvinsiRef.current && !dropdownProvinsiRef.current.contains(event.target as Node)) {
        setDropdownProvinsiOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownProvinsiRef]);


  const filteredProvinsi = useMemo(() => {
    if (!provinsiData?.data || provinsiSearch.length < 2) {
      return [];
    }
    return provinsiData.data.filter((provinsi) =>
      provinsi.name.toLowerCase().includes(provinsiSearch.toLowerCase())
    );
  }, [provinsiSearch, provinsiData]);
  
  const handleProvinsiSelect = (provinsi: { id: string; name: string }) => {
    setForm({ ...form, province_id: provinsi.id });
    setProvinsiSearch(provinsi.name);
    setDropdownProvinsiOpen(false);
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
          {readonly ? "Detail Kantor" : form.id ? "Edit Kantor" : "Tambah Kantor"}
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

          {/* JenisKantor Searchable Dropdown */}
          <div className="flex flex-col gap-y-1.5 col-span-1 md:col-span-2" ref={dropdownRef}>
            <Label htmlFor="office_type_id">Jenis Kantor</Label>
            <div className="relative">
              <Input
                id="office_type_id"
                placeholder="Ketik min 2 huruf untuk mencari jenis kantor..."
                value={jenisKantorSearch}
                onChange={(e) => {
                  setJenisKantorSearch(e.target.value);
                  setDropdownOpen(true);
                   // Hapus office_type_id jika input diubah
                  if (form.office_type_id) {
                    setForm({ ...form, office_type_id: undefined });
                  }
                }}
                onFocus={() => setDropdownOpen(true)}
                readOnly={readonly}
                required
                autoComplete="off"
              />
              {isDropdownOpen && !readonly && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {isJenisKantorLoading ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                  ) : jenisKantorSearch.length < 2 ? (
                     <p className="text-sm text-gray-500 p-3">Ketik minimal 2 huruf...</p>
                  ) : filteredJenisKantor.length > 0 ? (
                    filteredJenisKantor.map((jenisKantor) => (
                      <button
                        type="button"
                        key={jenisKantor.id}
                        onClick={() => handleJenisKantorSelect(jenisKantor)}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-700"
                      >
                        {jenisKantor.name}
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 p-3">Jenis Kantor tidak ditemukan.</p>
                  )}
                </div>
              )}
            </div>
          </div>

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
                  // Hapus province_id jika input diubah
                  if (form.province_id) {
                    setForm({ ...form, province_id: undefined });
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
                    <p className="text-sm text-gray-500 p-3">Ketik minimal 2 huruf...</p>
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
                    <p className="text-sm text-gray-500 p-3">Provinsi tidak ditemukan.</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Kota Searchable Dropdown */}
            <div className="flex flex-col gap-y-1.5" ref={dropdownKotaRef}>
            <Label htmlFor="regency_id">Kota</Label>
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
                // Hapus regency_id jika input diubah
                if (form.regency_id) {
                setForm({ ...form, regency_id: undefined });
                }
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
                <p className="text-sm text-gray-500 p-3">Ketik minimal 2 huruf...</p>
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
                <p className="text-sm text-gray-500 p-3">Kota tidak ditemukan.</p>
                )}
              </div>
              )}
            </div>
            </div>

          {/* Nama Kantor */}
          <div className="flex flex-col gap-y-1.5 col-span-1 md:col-span-2">
            <Label htmlFor="name">Nama Kantor</Label>
            <Input
              id="name"
              value={form.name ?? ""}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              readOnly={readonly}
              required
            />
          </div>

          {/* Alamat */}
          <div className="flex flex-col gap-y-1.5 col-span-1 md:col-span-2">
            <Label htmlFor="address">Alamat</Label>
            <Textarea
              id="address"
              value={form.address || ""}
              onChange={(e) =>
                setForm({ ...form, address: e.target.value })
              }
              readOnly={readonly}
              placeholder="Masukkan alamat kantor"
              rows={4}
            />
          </div>

          {/* No. Handphone */}
          <div className="flex flex-col gap-y-1.5">
            <Label htmlFor="phone">No. Handphone</Label>
            <Input
              id="phone"
              value={form.phone ?? ""}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              readOnly={readonly}
              required
            />
          </div>

          {/* Status */}
          <div className="flex flex-col gap-y-1.5">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={form.status === undefined ? "1" : form.status ? "1" : "0"}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value === "1" })
              }
              disabled={readonly}
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="1">Aktif</option>
              <option value="0">Tidak Aktif</option>
            </select>
          </div>

        </div>
      </form>

      {/* Footer */}
      {!readonly && (
        <div className="p-6 border-t border-gray-200 dark:border-zinc-700 flex justify-end gap-2 flex-shrink-0">
          <Button variant="outline" onClick={onCancel}>
            Batal
          </Button>
          <Button onClick={onSubmit} disabled={isLoading || !form.office_type_id}>
            {isLoading ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      )}
    </div>
  );
}

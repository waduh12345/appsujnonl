export interface ProvinceRef {
  id: string;
  name: string;
}

export interface RegencyRef {
  id: string;
  province_id: string;
  name: string;
}

export interface DistrictRef {
  id: string;
  regency_id: string;
  name: string;
}

export interface VillageRef {
  id: string;
  district_id: string;
  name: string;
}

export interface Anggota {
  id: number;
  reference?: string;
  name: string;
  email: string;
  gender: string;
  birth_place: string;
  user_id: number;
  birth_date: string;
  address: string;
  phone: string;
  postal_code: string | null;
  password?: string;
  password_confirmation?: string;
  status?: number;
  level_id: number | string;
  // New fields from the desired JSON structure:
  province_id?: string;
  province_name?: string;
  regency_id?: string;
  regency_name?: string;
  district_id?: string;
  district_name?: string;
  village_id?: string;
  village_name?: string;
  rt?: number;
  rw?: number;
  ktp?: string;
  religion?: string;
  marital_status?: string;
  occupation?: string;
  last_education?: string;
  phone_home?: string;
  phone_office?: string;
  phone_faksimili?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  whatsapp?: string;
  tiktok?: string;
  path?: string;
  photo_file: File | string | null;
  ktp_file: File | string | null;
  province?: ProvinceRef | null;
  regency?: RegencyRef | null;
  district?: DistrictRef | null;
  village?: VillageRef | null;
}

// gunakan nama yang sama persis dengan API
export type AdminAnggotaFormState = Partial<Anggota> & {
  password?: string;
  password_confirmation?: string;

  ktp_file?: File | null;
  photo_file?: File | null;
};

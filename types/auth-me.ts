export interface MediaItem {
  id: number;
  model_type: string;
  model_id: number;
  uuid: string;
  collection_name: string;
  name: string;
  file_name: string;
  mime_type: string;
  disk: string;
  conversions_disk: string;
  size: number;
  manipulations: unknown[];          // tetap ketat, tanpa any
  custom_properties: unknown[];
  generated_conversions: unknown[];
  responsive_images: unknown[];
  order_column: number;
  created_at: string;
  updated_at: string;
  original_url: string;
  preview_url: string;
}

export interface AnggotaFull {
  id: number;
  reference: string;
  ref_number: number;
  user_id: number;
  level_id: number;
  name: string;
  email: string;
  province_id: string;
  regency_id: string;
  district_id: string;
  village_id: string;
  rt: number;
  rw: number;
  address: string;
  postal_code: string | null;
  ktp: string;
  birth_place: string;
  birth_date: string;
  religion: string;
  marital_status: string;
  occupation: string;
  last_education: string;
  phone: string;
  phone_home: string | null;
  phone_office: string | null;
  phone_faksimili: string | null;
  facebook: string | null;
  instagram: string | null;
  twitter: string | null;
  whatsapp: string | null;
  tiktok: string | null;
  path: string | null;
  registered_at: string;
  created_at: string;
  updated_at: string;
  gender: string;
  ktp_file: string;
  photo_file: string;
  media: MediaItem[];
}

export interface RolePivot {
  model_type: string;
  model_id: number;
  role_id: number;
}

export interface RoleFull {
  id: number;
  name: string;
  guard_name: string;
  created_at: string;
  updated_at: string;
  pivot: RolePivot;
}

export interface Referral {
  id: number;
  user_id: number;
  code: string;
  level_1_refferals: number;
  level_2_refferals: number;
  level_3_refferals: number;
  total_refferals: number;
  created_at: string;
  updated_at: string;
}

// referrer bentuknya belum diketahui → gunakan Record<string, unknown> | null
export type Referrer = Record<string, unknown> | null;

export interface MeUser {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  anggota: AnggotaFull | null;
  roles: RoleFull[];
  refferal: Referral | null;    // ejaan mengikuti payload backend
  referrer: Referrer;
}

export interface MeResponse {
  code: number;
  message: string;
  data: MeUser;
}
// types/user.ts

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
  manipulations: unknown[];
  custom_properties: unknown[];
  generated_conversions: unknown[];
  responsive_images: unknown[];
  order_column: number;
  created_at: string;
  updated_at: string;
  original_url: string;
  preview_url: string;
}

export interface Anggota {
  id: number;
  reference: string;
  ref_number: number;
  user_id: number;
  level_id: number;
  name: string;
  email: string;
  province_id: string | null;
  regency_id: string | null;
  district_id: string | null;
  village_id: string | null;
  rt: number | null;
  rw: number | null;
  address: string | null;
  postal_code: string | null;
  ktp: string | null;
  birth_place: string | null;
  birth_date: string | null;
  religion: string | null;
  marital_status: string | null;
  occupation: string | null;
  last_education: string | null;
  phone: string | null;
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
  gender: string | null;
  ktp_file: string | null;
  photo_file: string | null;
  media: MediaItem[];
}

export interface RolePivot {
  model_type: string;
  model_id: number;
  role_id: number;
}

export interface UserRole {
  id: number;
  name: string;
  guard_name: string;
  created_at: string;
  updated_at: string;
  pivot: RolePivot;
}

export interface Refferal {
  // ejaan mengikuti response: "refferal"
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

export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  anggota: Anggota | null;
  roles: UserRole[];
  refferal: Refferal | null;
  referrer: unknown | null; // response saat ini null; disimpan apa adanya
}

export interface AuthenticatedUser extends User {
  token: string;
}

export interface LoginResponse {
  user: AuthenticatedUser;
  expires: string;
}
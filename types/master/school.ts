export interface School {
  id: number;
  name: string;
  description: string | null;
  status: boolean;
  created_at: string;
  updated_at: string;
  province_id: string | null;
  regency_id: string | null;
  district_id: string | null;
  village_id: string | null;
  province_name: string | null;
  regency_name: string | null;
  district_name: string | null;
}

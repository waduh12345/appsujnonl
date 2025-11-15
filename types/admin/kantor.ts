export interface Kantor {
  id: number;
  office_type_id: number;
  province_id: string;
  province_name?: string;
  regency_id: string;
  regency_name?: string;
  district_id: string;
  district_name?: string;
  village_id: string;
  village_name?: string;
  name: string;
  address?: string;
  phone?: string;
  status: boolean;
}

export interface KantorResponse {
  code: number;
  message: string;
  data: {
    current_page: number;
    data: Kantor[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: Array<{
      url: string | null;
      label: string;
      page: number | null;
      active: boolean;
    }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  };
}

export interface CreateKantorRequest {
  office_type_id: number;
  province_id: string;
  province_name?: string;
  regency_id: string;
  regency_name?: string;
  district_id: string;
  district_name?: string;
  village_id: string;
  village_name?: string;
  name: string;
  address?: string;
  phone?: string;
  status: boolean;
}

export interface UpdateKantorRequest {
  office_type_id: number;
  province_id: string;
  province_name?: string;
  regency_id: string;
  regency_name?: string;
  district_id: string;
  district_name?: string;
  village_id: string;
  village_name?: string;
  name: string;
  address?: string;
  phone?: string;
  status: boolean;
}

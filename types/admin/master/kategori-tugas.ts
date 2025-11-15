export interface KategoriTugas {
  id: number;
  name: string;
  description: string;
  status: boolean;
}

export interface KategoriTugasResponse {
  code: number;
  message: string;
  data: {
    current_page: number;
    data: KategoriTugas[];
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

export interface CreateKategoriTugasRequest {
  name: string;
  description: string;
  status: number;
}

export interface UpdateKategoriTugasRequest {
  name: string;
  description: string;
  status: number;
}

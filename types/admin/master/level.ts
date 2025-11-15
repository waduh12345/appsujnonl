export interface Level {
  id: number;
  code: string;
  name: string;
  order: string;
  description: string;
  status: boolean;
}

export interface LevelResponse {
  code: number;
  message: string;
  data: {
    current_page: number;
    data: Level[];
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

export interface CreateLevelRequest {
  code: string;
  name: string;
  order: string;
  description: string;
  status: number;
}

export interface UpdateLevelRequest {
  code: string;
  name: string;
  order: string;
  description: string;
  status: number;
}

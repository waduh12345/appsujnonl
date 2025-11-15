export interface MonthlyNewAnggota {
    month: number;
    count: number;
}

export interface DashboardAdmin {
  total_anggota: number;
  total_simpatisan: number;
  total_relawan: number;
  total_kantor_partai: number;
  total_kantor_ormas: number;
  total_posko_relawan: number;
  monthly_new_anggota: MonthlyNewAnggota[];
  year: string;
}
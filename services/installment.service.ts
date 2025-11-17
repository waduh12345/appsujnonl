import { apiSlice } from "./base-query";

export interface Installment {
  id: number;
  pinjaman_id: number;
  installment_number: number; // bulan ke berapa
  amount: number; // nominal angsuran
  due_date: string; // tanggal jatuh tempo
  paid_date?: string; // tanggal dibayar
  status: "pending" | "paid" | "overdue"; // status pembayaran
  payment_proof?: string; // bukti pembayaran
  created_at: string;
  updated_at: string;
}

export interface InstallmentResponse {
  code: number;
  message: string;
  data: {
    current_page: number;
    data: Installment[];
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

export interface PaymentProofRequest {
  installment_id: number;
  payment_proof: File;
}

export interface MarkAsPaidRequest {
  installment_id: number;
  paid_date: string;
}

export interface CreatePaymentRequest {
  pinjaman_id: number;
  pinjaman_detail_id: number;
  amount: number;
  type: 'manual' | 'automatic';
  image?: File;
}

export const installmentApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
  }),
});

export const {
} = installmentApi;

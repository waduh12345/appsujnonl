import { apiSlice } from "../base-query";
import {
  Kecamatan,
  KecamatanResponse,
} from "@/types/admin/master/kecamatan";

export const kecamatanApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // 🔍 Get All Kecamatan (with pagination)
    getKecamatanList: builder.query<
      {
        data: Kecamatan[];
        last_page: number;
        current_page: number;
        total: number;
        per_page: number;
      },
      { page: number; paginate: number; search?: string; regency_id?: string }
    >({
      query: ({ page, paginate, search, regency_id }) => ({
        url: `/public/reg/districts`,
        method: "GET",
        params: {
          page,
          paginate,
          search,
          regency_id
        },
      }),
      transformResponse: (response: KecamatanResponse) => ({
        data: response.data.data,
        last_page: response.data.last_page,
        current_page: response.data.current_page,
        total: response.data.total,
        per_page: response.data.per_page,
      }),
    }),

    // 🔍 Get Kecamatan by ID
    getKecamatanById: builder.query<Kecamatan, string>({
      query: (id) => ({
        url: `/public/reg/districts/${id}`,
        method: "GET",
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Kecamatan;
      }) => response.data,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetKecamatanListQuery,
  useGetKecamatanByIdQuery,
} = kecamatanApi;

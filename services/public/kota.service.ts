import { apiSlice } from "../base-query";
import {
  Kota,
  KotaResponse,
} from "@/types/admin/master/kota";

export const kotaApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // 🔍 Get All Kota (with pagination)
    getKotaList: builder.query<
      {
        data: Kota[];
        last_page: number;
        current_page: number;
        total: number;
        per_page: number;
      },
      { page: number; paginate: number; search?: string; province_id?: string }
    >({
      query: ({ page, paginate, search, province_id }) => ({
        url: `/public/reg/regencies`,
        method: "GET",
        params: {
          page,
          paginate,
          search,
          province_id,
        },
      }),
      transformResponse: (response: KotaResponse) => ({
        data: response.data.data,
        last_page: response.data.last_page,
        current_page: response.data.current_page,
        total: response.data.total,
        per_page: response.data.per_page,
      }),
    }),

    // 🔍 Get Kota by ID
    getKotaById: builder.query<Kota, string>({
      query: (id) => ({
        url: `/public/reg/regencies/${id}`,
        method: "GET",
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Kota;
      }) => response.data,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetKotaListQuery,
  useGetKotaByIdQuery,
} = kotaApi;

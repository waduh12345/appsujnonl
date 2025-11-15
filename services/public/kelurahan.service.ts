import { apiSlice } from "../base-query";
import {
  Kelurahan,
  KelurahanResponse,
  CreateKelurahanRequest,
  UpdateKelurahanRequest,
} from "@/types/admin/master/kelurahan";

export const kelurahanApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // 🔍 Get All Kelurahan (with pagination)
    getKelurahanList: builder.query<
      {
        data: Kelurahan[];
        last_page: number;
        current_page: number;
        total: number;
        per_page: number;
      },
      { page: number; paginate: number; search?: string; district_id?: string }
    >({
      query: ({ page, paginate, search, district_id }) => ({
        url: `/public/reg/villages`,
        method: "GET",
        params: {
          page,
          paginate,
          search,
          district_id,
        },
      }),
      transformResponse: (response: KelurahanResponse) => ({
        data: response.data.data,
        last_page: response.data.last_page,
        current_page: response.data.current_page,
        total: response.data.total,
        per_page: response.data.per_page,
      }),
    }),

    // 🔍 Get Kelurahan by ID
    getKelurahanById: builder.query<Kelurahan, string>({
      query: (id) => ({
        url: `/public/reg/villages/${id}`,
        method: "GET",
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Kelurahan;
      }) => response.data,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetKelurahanListQuery,
  useGetKelurahanByIdQuery,
} = kelurahanApi;

import { apiSlice } from "../base-query";
import {
  Provinsi,
  ProvinsiResponse,
} from "@/types/admin/master/provinsi";

export const provinsiApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // 🔍 Get All Provinsi (with pagination)
    getProvinsiList: builder.query<
      {
        data: Provinsi[];
        last_page: number;
        current_page: number;
        total: number;
        per_page: number;
      },
      { page: number; paginate: number; search?: string }
    >({
      query: ({ page, paginate, search }) => ({
        url: `/public/reg/provinces`,
        method: "GET",
        params: {
          page,
          paginate,
          search,
        },
      }),
      transformResponse: (response: ProvinsiResponse) => ({
        data: response.data.data,
        last_page: response.data.last_page,
        current_page: response.data.current_page,
        total: response.data.total,
        per_page: response.data.per_page,
      }),
    }),

    // 🔍 Get Provinsi by ID
    getProvinsiById: builder.query<Provinsi, string>({
      query: (id) => ({
        url: `/public/reg/provinces/${id}`,
        method: "GET",
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Provinsi;
      }) => response.data,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetProvinsiListQuery,
  useGetProvinsiByIdQuery,
} = provinsiApi;

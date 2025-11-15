import { apiSlice } from "../base-query";
import { Pengumuman } from "@/types/admin/pengumuman"; 

export const alumniApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // 🔍 Get All Pengumuman Categories (with pagination)
    getPengumumanList: builder.query<
      {
        data: Pengumuman[];
        last_page: number;
        current_page: number;
        total: number;
        per_page: number;
      },
      { page: number; paginate: number; search?: string }
    >({
      query: ({ page, paginate, search }) => ({
        url: `/announcement`,
        method: "GET",
        params: {
          page,
          paginate,
          search,
        },
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: {
          current_page: number;
          data: Pengumuman[];
          last_page: number;
          total: number;
          per_page: number;
        };
      }) => ({
        data: response.data.data,
        last_page: response.data.last_page,
        current_page: response.data.current_page,
        total: response.data.total,
        per_page: response.data.per_page,
      }),
    }),

    // 🔍 Get Pengumuman Category by Slug
    getPengumumanBySlug: builder.query<Pengumuman, number>({
      query: (id) => ({
        url: `/announcement/${id}`,
        method: "GET",
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Pengumuman;
      }) => response.data,
    }),

    // ➕ Create Pengumuman Category
    createPengumuman: builder.mutation<Pengumuman, FormData>({
      query: (payload) => ({
        url: `/announcement`,
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Pengumuman;
      }) => response.data,
    }),

    // ✏️ Update Pengumuman Category by Slug
    updatePengumuman: builder.mutation<
      Pengumuman,
      { slug: string; payload: FormData }
    >({
      query: ({ slug, payload }) => ({
        url: `/announcement/${slug}?_method=PUT`,
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Pengumuman;
      }) => response.data,
    }),

    // ❌ Delete Pengumuman Category by Slug
    deletePengumuman: builder.mutation<
      { code: number; message: string },
      string
    >({
      query: (slug) => ({
        url: `/announcement/${slug}`,
        method: "DELETE",
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: null;
      }) => response,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetPengumumanListQuery,
  useGetPengumumanBySlugQuery,
  useCreatePengumumanMutation,
  useUpdatePengumumanMutation,
  useDeletePengumumanMutation,
} = alumniApi;
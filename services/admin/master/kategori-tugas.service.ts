import { apiSlice } from "../../base-query";
import {
  KategoriTugas,
  KategoriTugasResponse,
  CreateKategoriTugasRequest,
  UpdateKategoriTugasRequest,
} from "@/types/admin/master/kategori-tugas";

export const KategoriTugasApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // 🔍 Get All KategoriTugas (with pagination)
    getKategoriTugasList: builder.query<
      {
        data: KategoriTugas[];
        last_page: number;
        current_page: number;
        total: number;
        per_page: number;
      },
      { page: number; paginate: number; search?: string }
    >({
      query: ({ page, paginate, search }) => ({
        url: `/master/task-categories`,
        method: "GET",
        params: {
          page,
          paginate,
          search,
        },
      }),
      transformResponse: (response: KategoriTugasResponse) => ({
        data: response.data.data,
        last_page: response.data.last_page,
        current_page: response.data.current_page,
        total: response.data.total,
        per_page: response.data.per_page,
      }),
    }),

    // 🔍 Get Simpanan Category by ID
    getKategoriTugasById: builder.query<KategoriTugas, number>({
      query: (id) => ({
        url: `/master/task-categories/${id}`,
        method: "GET",
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: KategoriTugas;
      }) => response.data,
    }),

    // ➕ Create Simpanan Category
    createKategoriTugas: builder.mutation<
      KategoriTugas,
      CreateKategoriTugasRequest
    >({
      query: (payload) => ({
        url: `/master/task-categories`,
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: KategoriTugas;
      }) => response.data,
    }),

    // ✏️ Update Simpanan Category by ID
    updateKategoriTugas: builder.mutation<
      KategoriTugas,
      { id: number; payload: UpdateKategoriTugasRequest }
    >({
      query: ({ id, payload }) => ({
        url: `/master/task-categories/${id}`,
        method: "PUT",
        body: payload,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: KategoriTugas;
      }) => response.data,
    }),

    // ❌ Delete Simpanan Category by ID
    deleteKategoriTugas: builder.mutation<
      { code: number; message: string },
      number
    >({
      query: (id) => ({
        url: `/master/task-categories/${id}`,
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
  useGetKategoriTugasListQuery,
  useGetKategoriTugasByIdQuery,
  useCreateKategoriTugasMutation,
  useUpdateKategoriTugasMutation,
  useDeleteKategoriTugasMutation,
} = KategoriTugasApi;

import { apiSlice } from "../base-query";
import {
  Tugas,
  TugasResponse,
  CreateTugasRequest,
  UpdateTugasRequest,
} from "@/types/admin/tugas";

export const tugasApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // 🔍 Get All Tugas (with pagination)
    getTugasList: builder.query<
      {
        data: Tugas[];
        last_page: number;
        current_page: number;
        total: number;
        per_page: number;
      },
      { page: number; paginate: number; search?: string }
    >({
      query: ({ page, paginate, search }) => ({
        url: `/task/tasks`,
        method: "GET",
        params: {
          page,
          paginate,
          search,
        },
      }),
      transformResponse: (response: TugasResponse) => ({
        data: response.data.data,
        last_page: response.data.last_page,
        current_page: response.data.current_page,
        total: response.data.total,
        per_page: response.data.per_page,
      }),
    }),

    // 🔍 Get Tugas by ID
    getTugasById: builder.query<Tugas, number>({
      query: (id) => ({
        url: `/task/tasks/${id}`,
        method: "GET",
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Tugas;
      }) => response.data,
    }),

    // ➕ Create Tugas
    createTugas: builder.mutation<
      Tugas,
      CreateTugasRequest
    >({
      query: (payload) => ({
        url: `/task/tasks`,
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Tugas;
      }) => response.data,
    }),

    // ✏️ Update Tugas by ID
    updateTugas: builder.mutation<
      Tugas,
      { id: number; payload: UpdateTugasRequest }
    >({
      query: ({ id, payload }) => ({
        url: `/task/tasks/${id}`,
        method: "PUT",
        body: payload,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Tugas;
      }) => response.data,
    }),

    // ❌ Delete Tugas by ID
    deleteTugas: builder.mutation<
      { code: number; message: string },
      number
    >({
      query: (id) => ({
        url: `/task/tasks/${id}`,
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
  useGetTugasListQuery,
  useGetTugasByIdQuery,
  useCreateTugasMutation,
  useUpdateTugasMutation,
  useDeleteTugasMutation,
} = tugasApi;

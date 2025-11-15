import { apiSlice } from "../../base-query";
import {
  Level,
  LevelResponse,
  CreateLevelRequest,
  UpdateLevelRequest,
} from "@/types/admin/master/level";

export const levelApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // 🔍 Get All Level (with pagination)
    getLevelList: builder.query<
      {
        data: Level[];
        last_page: number;
        current_page: number;
        total: number;
        per_page: number;
      },
      { page: number; paginate: number; search?: string }
    >({
      query: ({ page, paginate, search }) => ({
        url: `/master/levels`,
        method: "GET",
        params: {
          page,
          paginate,
          search,
        },
      }),
      transformResponse: (response: LevelResponse) => ({
        data: response.data.data,
        last_page: response.data.last_page,
        current_page: response.data.current_page,
        total: response.data.total,
        per_page: response.data.per_page,
      }),
    }),

    // 🔍 Get Simpanan Category by ID
    getLevelById: builder.query<Level, number>({
      query: (id) => ({
        url: `/master/levels/${id}`,
        method: "GET",
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Level;
      }) => response.data,
    }),

    // ➕ Create Simpanan Category
    createLevel: builder.mutation<
      Level,
      CreateLevelRequest
    >({
      query: (payload) => ({
        url: `/master/levels`,
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Level;
      }) => response.data,
    }),

    // ✏️ Update Simpanan Category by ID
    updateLevel: builder.mutation<
      Level,
      { id: number; payload: UpdateLevelRequest }
    >({
      query: ({ id, payload }) => ({
        url: `/master/levels/${id}`,
        method: "PUT",
        body: payload,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Level;
      }) => response.data,
    }),

    // ❌ Delete Simpanan Category by ID
    deleteLevel: builder.mutation<
      { code: number; message: string },
      number
    >({
      query: (id) => ({
        url: `/master/levels/${id}`,
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
  useGetLevelListQuery,
  useGetLevelByIdQuery,
  useCreateLevelMutation,
  useUpdateLevelMutation,
  useDeleteLevelMutation,
} = levelApi;

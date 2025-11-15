import { apiSlice } from "../base-query";
import {
  Kantor,
  KantorResponse,
  CreateKantorRequest,
  UpdateKantorRequest,
} from "@/types/admin/kantor";

export const kantorApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // 🔍 Get All Kantor (with pagination)
    getKantorList: builder.query<
      {
        data: Kantor[];
        last_page: number;
        current_page: number;
        total: number;
        per_page: number;
      },
      { page: number; paginate: number; search?: string }
    >({
      query: ({ page, paginate, search }) => ({
        url: `/office/offices`,
        method: "GET",
        params: {
          page,
          paginate,
          search,
        },
      }),
      transformResponse: (response: KantorResponse) => ({
        data: response.data.data,
        last_page: response.data.last_page,
        current_page: response.data.current_page,
        total: response.data.total,
        per_page: response.data.per_page,
      }),
    }),

    // 🔍 Get Kantor by ID
    getKantorById: builder.query<Kantor, number>({
      query: (id) => ({
        url: `/office/offices/${id}`,
        method: "GET",
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Kantor;
      }) => response.data,
    }),

    // ➕ Create Kantor
    createKantor: builder.mutation<
      Kantor,
      CreateKantorRequest
    >({
      query: (payload) => ({
        url: `/office/offices`,
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Kantor;
      }) => response.data,
    }),

    // ✏️ Update Kantor by ID
    updateKantor: builder.mutation<
      Kantor,
      { id: number; payload: UpdateKantorRequest }
    >({
      query: ({ id, payload }) => ({
        url: `/office/offices/${id}`,
        method: "PUT",
        body: payload,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Kantor;
      }) => response.data,
    }),

    // ❌ Delete Kantor by ID
    deleteKantor: builder.mutation<
      { code: number; message: string },
      number
    >({
      query: (id) => ({
        url: `/office/offices/${id}`,
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
  useGetKantorListQuery,
  useGetKantorByIdQuery,
  useCreateKantorMutation,
  useUpdateKantorMutation,
  useDeleteKantorMutation,
} = kantorApi;

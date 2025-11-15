import { apiSlice } from "../../base-query";
import {
  JenisKantor,
  JenisKantorResponse,
  CreateJenisKantorRequest,
  UpdateJenisKantorRequest,
} from "@/types/admin/master/jenis-kantor";

export const JenisKantorApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // 🔍 Get All JenisKantor (with pagination)
    getJenisKantorList: builder.query<
      {
        data: JenisKantor[];
        last_page: number;
        current_page: number;
        total: number;
        per_page: number;
      },
      { page: number; paginate: number; search?: string }
    >({
      query: ({ page, paginate, search }) => ({
        url: `/master/office-types`,
        method: "GET",
        params: {
          page,
          paginate,
          search,
        },
      }),
      transformResponse: (response: JenisKantorResponse) => ({
        data: response.data.data,
        last_page: response.data.last_page,
        current_page: response.data.current_page,
        total: response.data.total,
        per_page: response.data.per_page,
      }),
    }),

    // 🔍 Get Simpanan Category by ID
    getJenisKantorById: builder.query<JenisKantor, number>({
      query: (id) => ({
        url: `/master/office-types/${id}`,
        method: "GET",
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: JenisKantor;
      }) => response.data,
    }),

    // ➕ Create Simpanan Category
    createJenisKantor: builder.mutation<
      JenisKantor,
      CreateJenisKantorRequest
    >({
      query: (payload) => ({
        url: `/master/office-types`,
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: JenisKantor;
      }) => response.data,
    }),

    // ✏️ Update Simpanan Category by ID
    updateJenisKantor: builder.mutation<
      JenisKantor,
      { id: number; payload: UpdateJenisKantorRequest }
    >({
      query: ({ id, payload }) => ({
        url: `/master/office-types/${id}`,
        method: "PUT",
        body: payload,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: JenisKantor;
      }) => response.data,
    }),

    // ❌ Delete Simpanan Category by ID
    deleteJenisKantor: builder.mutation<
      { code: number; message: string },
      number
    >({
      query: (id) => ({
        url: `/master/office-types/${id}`,
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
  useGetJenisKantorListQuery,
  useGetJenisKantorByIdQuery,
  useCreateJenisKantorMutation,
  useUpdateJenisKantorMutation,
  useDeleteJenisKantorMutation,
} = JenisKantorApi;

import { apiSlice } from "../base-query";
import type { Anggota } from "@/types/admin/anggota";

type SearchBySpecific =
  | "reference"
  | "user_id"
  | "name"
  | "email"
  | "phone"
  | "ktp"
  | string;

type GetAnggotaListArgs = {
  page: number;
  paginate: number;
  status?: number;
  province_id?: string;
  regency_id?: string;
  district_id?: string;
  village_id?: string;
  level_id?: number;
  searchBySpecific?: SearchBySpecific;
  search?: string;
};

type GetAnggotaListResp = {
  data: Anggota[];
  last_page: number;
  current_page: number;
  total: number;
  per_page: number;
};

export const anggotaApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // 🔍 Get All Anggota (with pagination + searchBySpecific + search)
    getAnggotaList: builder.query<GetAnggotaListResp, GetAnggotaListArgs>({
      query: ({
        page,
        paginate,
        status,
        province_id,
        regency_id,
        district_id,
        village_id,
        level_id,
        searchBySpecific,
        search,
      }) => {
        // pastikan "" tetap terkirim: gunakan cek !== undefined, bukan truthy
        const params: Record<string, string | number | undefined> = {
          page,
          paginate,
          ...(status !== undefined ? { status } : {}),
          ...(province_id !== undefined ? { province_id } : {}),
          ...(regency_id !== undefined ? { regency_id } : {}),
          ...(district_id !== undefined ? { district_id } : {}),
          ...(village_id !== undefined ? { village_id } : {}),
          ...(level_id !== undefined ? { level_id } : {}),
          ...(searchBySpecific !== undefined ? { searchBySpecific } : {}),
          ...(search !== undefined ? { search } : {}),
        };

        return {
          url: `/anggota/anggotas`,
          method: "GET",
          params,
        };
      },
      transformResponse: (response: {
        code: number;
        message: string;
        data: {
          current_page: number;
          data: Anggota[];
          last_page: number;
          total: number;
          per_page: number;
        };
      }): GetAnggotaListResp => ({
        data: response.data.data,
        last_page: response.data.last_page,
        current_page: response.data.current_page,
        total: response.data.total,
        per_page: response.data.per_page,
      }),
    }),

    // 🔍 Get Anggota by ID
    getAnggotaById: builder.query<Anggota, number>({
      query: (id) => ({
        url: `/anggota/anggotas/${id}`,
        method: "GET",
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Anggota;
      }) => response.data,
    }),

    // 🔍 Get Anggota by Reference (public)
    getAnggotaByReference: builder.query<Anggota, string>({
      query: (reference) => ({
        url: `/public/anggotas/${reference}`,
        method: "GET",
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Anggota;
      }) => response.data,
    }),

    // ➕ Create
    createAnggota: builder.mutation<Anggota, FormData>({
      query: (payload) => ({
        url: `/anggota/anggotas`,
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Anggota;
      }) => response.data,
    }),

    // ✏️ Update
    updateAnggota: builder.mutation<Anggota, { id: number; payload: FormData }>(
      {
        query: ({ id, payload }) => ({
          url: `/anggota/anggotas/${id}?_method=PUT`,
          method: "POST",
          body: payload,
        }),
        transformResponse: (response: {
          code: number;
          message: string;
          data: Anggota;
        }) => response.data,
      }
    ),

    // ❌ Delete
    deleteAnggota: builder.mutation<{ code: number; message: string }, number>({
      query: (id) => ({
        url: `/anggota/anggotas/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: null;
      }) => ({ code: response.code, message: response.message }),
    }),

    // ✅ EXPORT Excel
    exportAnggotaExcel: builder.mutation<
      { code: number; message: string },
      { from_date: string; to_date: string }
    >({
      query: ({ from_date, to_date }) => ({
        url: `/anggota/anggotas/export`,
        method: "POST",
        body: { from_date, to_date },
      }),
      transformResponse: (response: { code: number; message: string }) => ({
        code: response.code,
        message: response.message,
      }),
    }),

    // ✅ IMPORT Excel
    importAnggotaExcel: builder.mutation<
      { code: number; message: string },
      { file: File }
    >({
      query: ({ file }) => {
        const formData = new FormData();
        formData.append("file", file);
        return {
          url: `/anggota/anggotas/import`,
          method: "POST",
          body: formData,
        };
      },
      transformResponse: (response: { code: number; message: string }) => ({
        code: response.code,
        message: response.message,
      }),
    }),

    // 🆕 Public Register
    register: builder.mutation<Anggota, FormData>({
      query: (payload) => ({
        url: `/register`,
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Anggota;
      }) => response.data,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAnggotaListQuery,
  useGetAnggotaByIdQuery,
  useGetAnggotaByReferenceQuery,
  useCreateAnggotaMutation,
  useUpdateAnggotaMutation,
  useDeleteAnggotaMutation,
  useExportAnggotaExcelMutation,
  useImportAnggotaExcelMutation,
  useRegisterMutation,
} = anggotaApi;
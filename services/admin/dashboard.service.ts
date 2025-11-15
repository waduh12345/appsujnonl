import { apiSlice } from "../base-query";
import type { DashboardAdmin } from "@/types/admin/dashboard";

type DashboardAdminResponse = {
  code: number;
  message: string;
  data: DashboardAdmin;
};

export const dashboardAdminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // 📊 Get Dashboard Admin (by year)
    getDashboardAdmin: builder.query<DashboardAdmin, { year: string | number }>(
      {
        query: ({ year }) => ({
          url: `/dashboard/admin`,
          method: "GET",
          params: { year },
        }),
        transformResponse: (response: DashboardAdminResponse) => response.data,
      }
    ),
  }),
  overrideExisting: false,
});

export const { useGetDashboardAdminQuery } = dashboardAdminApi;

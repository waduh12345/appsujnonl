import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

export type ApiErrorPayload = {
  message?: string;
  errors?: Record<string, string[] | string>;
};

export const isFetchBaseQueryError = (e: unknown): e is FetchBaseQueryError =>
  typeof e === "object" && e !== null && "status" in e;

export const hasErrorString = (e: unknown): e is { error: string } =>
  typeof e === "object" &&
  e !== null &&
  "error" in e &&
  typeof (e as { error?: unknown }).error === "string";

export const extractApiErrorMessage = (data: unknown): string | null => {
  if (!data || typeof data !== "object") return null;
  const { message, errors } = data as ApiErrorPayload;
  let msg = message ?? "";
  if (errors && typeof errors === "object") {
    const detail = Object.values(errors)
      .flatMap((v) => (Array.isArray(v) ? v : [String(v)]))
      .join("\n");
    if (detail) msg = msg ? `${msg}\n${detail}` : detail;
  }
  return msg || null;
};
import axios, { type AxiosRequestConfig } from "axios";
import { api } from "@/lib/axios";
import { API_BASE_URL } from "@/lib/constants";
import type { ApiResponse } from "@/types/api";

async function request<T>(
  method: AxiosRequestConfig["method"],
  url: string,
  body?: unknown,
  params?: Record<string, unknown>,
): Promise<T> {
  if (typeof window !== "undefined") {
    const { data } = await api.request<ApiResponse<T>>({
      method,
      url,
      data: body,
      params,
    });
    return data.data;
  }
  const { headers } = await import("next/headers");
  const incoming = await headers();
  const host = incoming.get("host");
  if (!host)
    throw new Error(
      "Unable to resolve the application host for an authenticated request.",
    );
  const protocol = incoming.get("x-forwarded-proto") ?? "http";
  const cookie = incoming.get("cookie") ?? "";
  const { data } = await axios.request<ApiResponse<T>>({
    method,
    url: `${protocol}://${host}${API_BASE_URL}${url}`,
    data: body,
    params,
    timeout: Number(process.env.NEXT_PUBLIC_API_TIMEOUT_MS ?? "15000"),
    headers: { Accept: "application/json", Cookie: cookie },
  });
  return data.data;
}
export async function postBlob(url: string, body?: unknown): Promise<Blob> {
  if (typeof window !== "undefined") {
    const { data } = await api.post(url, body, { responseType: "blob" });
    return data as Blob;
  }
  const { headers } = await import("next/headers");
  const incoming = await headers();
  const host = incoming.get("host");
  if (!host) throw new Error("Unable to resolve the application host for an authenticated request.");
  const protocol = incoming.get("x-forwarded-proto") ?? "http";
  const cookie = incoming.get("cookie") ?? "";
  const response = await axios.request<ArrayBuffer>({
    method: "POST", url: `${protocol}://${host}${API_BASE_URL}${url}`, data: body,
    timeout: Number(process.env.NEXT_PUBLIC_API_TIMEOUT_MS ?? "15000"),
    headers: { Accept: "text/plain, application/octet-stream", Cookie: cookie },
    responseType: "arraybuffer",
  });
  const contentType = response.headers["content-type"];
  return new Blob([response.data], {
    type: typeof contentType === "string" ? contentType : "text/plain",
  });
}

export const get = <T>(url: string, params?: Record<string, unknown>) =>
  request<T>("GET", url, undefined, params);
export const post = <T>(url: string, body?: unknown) =>
  request<T>("POST", url, body);
export const put = <T>(url: string, body?: unknown) =>
  request<T>("PUT", url, body);
export const patch = <T>(url: string, body?: unknown) =>
  request<T>("PATCH", url, body);
export const del = <T>(url: string) => request<T>("DELETE", url);

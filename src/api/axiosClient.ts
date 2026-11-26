import axios from "axios";
import type { BaseResponse } from "../types/Kanban";

export const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError<BaseResponse<unknown>>(error)) {
    const data = error.response?.data;
    if (data?.errors && Object.keys(data.errors).length > 0) {
      return Object.values(data.errors).join(", ");
    }
    if (data?.message) {
      return data.message;
    }
  }
  return fallback;
}
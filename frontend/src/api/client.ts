import { getToken } from "../utils/tokenStorage";

export const BASE_URL = "http://localhost:5000";

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  token?: string | null;
  isFormData?: boolean;
};

export const apiRequest = async <T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> => {
  const storedToken = await getToken();
  const token = options.token ?? storedToken;

  const headers: Record<string, string> = {};

  if (!options.isFormData) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: options.method || "GET",
    headers,
    body: options.body
      ? options.isFormData
        ? (options.body as FormData)
        : JSON.stringify(options.body)
      : undefined,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "API request failed");
  }

  return data as T;
};
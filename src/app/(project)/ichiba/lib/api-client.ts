import { useAuthStore } from "@/stores/auth-store";

// src/lib/api-client.ts
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl = "") {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const { user } = useAuthStore.getState();
    const defaultHeaders = {
      "Content-Type": "application/json",
      ...(user?.id && { "x-user-id": user.id }),
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Request failed");
    }

    return response.json();
  }

  get<T>(endpoint: string, query?: Record<string, string>) {
    const queryString = query ? `?${new URLSearchParams(query)}` : "";
    return this.request<T>(`${endpoint}${queryString}`);
  }

  post<T>(endpoint: string, data: Record<string, unknown>) {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  put<T>(endpoint: string, data: Record<string, unknown>) {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  delete(endpoint: string, data?: Record<string, unknown>) {
    return this.request(endpoint, {
      method: "DELETE",
      body: JSON.stringify(data),
    });
  }
}

export const apiClient = new ApiClient("/api");

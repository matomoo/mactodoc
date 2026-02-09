import type { Catalog } from "../../types";
import { apiClient } from "../api-client";
import type { CatalogFormData } from "../schemas";

// Simplified service using apiClient
export const catalogsService = {
  getAll: () => apiClient.get<Catalog[]>("/catalogs"),

  getById: (id: string) => apiClient.get<Catalog>("/catalogs", { id }),

  create: (catalog: CatalogFormData) => apiClient.post<Catalog>("/catalogs", catalog),

  update: (id: string, catalog: Partial<CatalogFormData>) => apiClient.put<Catalog>("/catalogs", { id, ...catalog }),

  delete: (id: string) => apiClient.delete("/catalogs", { id }),

  search: (query: string) => apiClient.get<Catalog[]>("/catalogs", { query }),
};

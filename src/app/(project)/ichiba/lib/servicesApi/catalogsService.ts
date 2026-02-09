// src/services/catalogsService.ts
// biome-ignore assist/source/organizeImports: <none>
import type { CatalogFormData } from "../schemas";
import type { Catalog } from "../../types";
import { useAuthStore } from "@/stores/auth-store";

const API_BASE = "/api/catalogs";

export const catalogsService = {
  async getAll() {
    const response = await fetch(API_BASE);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch catalogs");
    }
    return (await response.json()) as Catalog[];
  },

  async getById(id: string) {
    const response = await fetch(`${API_BASE}?id=${id}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch catalog");
    }
    return (await response.json()) as Catalog;
  },

  async create(catalog: CatalogFormData) {
    const { user } = useAuthStore.getState();
    if (!user?.id) {
      throw new Error("User not authenticated");
    }

    const response = await fetch(API_BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": user.id, // Pass user ID for activity logging
      },
      body: JSON.stringify(catalog),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create catalog");
    }

    return (await response.json()) as Catalog;
  },

  async update(id: string, catalog: Partial<CatalogFormData>) {
    const { user } = useAuthStore.getState();
    if (!user?.id) {
      throw new Error("User not authenticated");
    }

    const response = await fetch(API_BASE, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": user.id,
      },
      body: JSON.stringify({ id, ...catalog }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update catalog");
    }

    return (await response.json()) as Catalog;
  },

  async delete(id: string) {
    const { user } = useAuthStore.getState();
    if (!user?.id) {
      throw new Error("User not authenticated");
    }

    const response = await fetch(API_BASE, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": user.id,
      },
      body: JSON.stringify({ id }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete catalog");
    }
  },

  async search(query: string) {
    const response = await fetch(`${API_BASE}?query=${encodeURIComponent(query)}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to search catalogs");
    }
    return (await response.json()) as Catalog[];
  },
};

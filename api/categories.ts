import { apiFetch } from "./api-client";

export interface Category {
  id: number;
  name: string;
}

export async function getCategories(): Promise<Category[]> {
  const data = await apiFetch("api/category/all", { method: "GET" });
  return Array.isArray(data) ? data : [];
}

export async function addCategory(name: string): Promise<Category> {
  return apiFetch("api/category", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

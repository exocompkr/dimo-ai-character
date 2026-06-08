import { apiFetch } from "@/lib/apiClient";
import type { components } from "@/types/api";

export type ProductCategoryDto = components["schemas"]["ProductCategory"];

export function listProductCategories(): Promise<ProductCategoryDto[]> {
  return apiFetch<ProductCategoryDto[]>("/api/categories/product");
}

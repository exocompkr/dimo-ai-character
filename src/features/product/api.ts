import { apiFetch } from "@/lib/apiClient";
import type { components } from "@/types/api";

/**
 * 백엔드 자동 생성 타입의 별칭. 컴포넌트에서는 이걸로 import.
 */
export type ProductSummary = components["schemas"]["ProductResponse"];
export type ProductDetail = components["schemas"]["ProductDetailResponse"];
export type PaperOption = components["schemas"]["PaperOption"];
export type PageProductResponse = components["schemas"]["PageProductResponse"];

export interface ListProductsParams {
  categoryId?: number;
  page?: number;
  size?: number;
}

export function listProducts(params: ListProductsParams = {}): Promise<PageProductResponse> {
  const qs = new URLSearchParams();
  if (params.categoryId != null) qs.set("categoryId", String(params.categoryId));
  if (params.page != null) qs.set("page", String(params.page));
  if (params.size != null) qs.set("size", String(params.size));
  const tail = qs.toString();
  return apiFetch<PageProductResponse>(`/api/products${tail ? `?${tail}` : ""}`);
}

export function getProductDetail(id: number): Promise<ProductDetail> {
  return apiFetch<ProductDetail>(`/api/products/${id}`);
}

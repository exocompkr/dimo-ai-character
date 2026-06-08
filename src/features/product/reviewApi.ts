import { apiFetch } from "@/lib/apiClient";
import type { components } from "@/types/api";

export type ProductReviewDto = components["schemas"]["ProductReviewDto"];
export type ProductReviewSummary = components["schemas"]["ProductReviewSummary"];
export type ProductQnaDto = components["schemas"]["ProductQnaDto"];
export type PageProductReviewDto = components["schemas"]["PageProductReviewDto"];

export interface ListReviewsParams {
  productId: number;
  page?: number;
  size?: number;
}

export function listReviews(p: ListReviewsParams): Promise<PageProductReviewDto> {
  const qs = new URLSearchParams();
  if (p.page != null) qs.set("page", String(p.page));
  if (p.size != null) qs.set("size", String(p.size));
  const tail = qs.toString();
  return apiFetch<PageProductReviewDto>(
    `/api/products/${p.productId}/reviews${tail ? `?${tail}` : ""}`
  );
}

export function getReviewSummary(productId: number): Promise<ProductReviewSummary> {
  return apiFetch<ProductReviewSummary>(`/api/products/${productId}/reviews/summary`);
}

export function listQna(productId: number): Promise<ProductQnaDto[]> {
  return apiFetch<ProductQnaDto[]>(`/api/products/${productId}/qna`);
}

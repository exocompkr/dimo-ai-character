"use client";

import { useQuery } from "@tanstack/react-query";
import { getReviewSummary, listQna, listReviews } from "./reviewApi";

export const reviewKeys = {
  list: (productId: number, page: number, size: number) =>
    ["product", productId, "reviews", page, size] as const,
  summary: (productId: number) => ["product", productId, "reviews", "summary"] as const,
  qna: (productId: number) => ["product", productId, "qna"] as const,
};

export function useReviewList(productId: number, page: number, size = 5) {
  return useQuery({
    queryKey: reviewKeys.list(productId, page, size),
    queryFn: () => listReviews({ productId, page, size }),
    enabled: productId > 0,
  });
}

export function useReviewSummary(productId: number) {
  return useQuery({
    queryKey: reviewKeys.summary(productId),
    queryFn: () => getReviewSummary(productId),
    enabled: productId > 0,
  });
}

export function useProductQna(productId: number) {
  return useQuery({
    queryKey: reviewKeys.qna(productId),
    queryFn: () => listQna(productId),
    enabled: productId > 0,
  });
}

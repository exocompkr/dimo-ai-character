"use client";

import { useQuery } from "@tanstack/react-query";
import { listProductCategories, type ProductCategoryDto } from "./api";

export const categoryKeys = {
  all: ["categories"] as const,
  product: ["categories", "product"] as const,
};

export function useProductCategories() {
  return useQuery<ProductCategoryDto[]>({
    queryKey: categoryKeys.product,
    queryFn: listProductCategories,
    staleTime: 5 * 60 * 1000, // 마스터 데이터는 5분
  });
}

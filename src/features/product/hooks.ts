"use client";

import { useQuery } from "@tanstack/react-query";
import { getProductDetail, listProducts, type ListProductsParams } from "./api";

export const productKeys = {
  all: ["products"] as const,
  list: (params: ListProductsParams) =>
    [...productKeys.all, "list", params] as const,
  detail: (id: number) => [...productKeys.all, "detail", id] as const,
};

export function useProductList(params: ListProductsParams = {}) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => listProducts(params),
  });
}

export function useProductDetail(id: number) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => getProductDetail(id),
    enabled: Number.isFinite(id) && id > 0,
  });
}

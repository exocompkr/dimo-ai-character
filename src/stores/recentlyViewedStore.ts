"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/types/domain";

interface RecentlyViewedState {
  items: Product[];
  add: (product: Product) => void;
  remove: (productId: string) => void;
  clear: () => void;
}

const MAX_RECENT = 20;

/**
 * 최근 본 상품을 localStorage에 영속화하여 관리합니다.
 *
 * - 동일 상품을 다시 보면 최상단으로 이동
 * - 최대 20개까지 유지
 */
export const useRecentlyViewed = create<RecentlyViewedState>()(
  persist(
    (set) => ({
      items: [],
      add: (product) =>
        set((state) => {
          const filtered = state.items.filter((p) => p.id !== product.id);
          return { items: [product, ...filtered].slice(0, MAX_RECENT) };
        }),
      remove: (productId) =>
        set((state) => ({
          items: state.items.filter((p) => p.id !== productId),
        })),
      clear: () => set({ items: [] }),
    }),
    {
      name: "dimo-recently-viewed",
    }
  )
);

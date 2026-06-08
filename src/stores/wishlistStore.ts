"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ProductId } from "@/types/domain";

interface WishlistState {
  ids: ProductId[];
  has: (productId: ProductId) => boolean;
  toggle: (productId: ProductId) => void;
  clear: () => void;
}

/**
 * 찜한 상품 ID 목록. 상품 메타데이터는 API에서 다시 조회.
 */
export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      has: (productId) => get().ids.includes(productId),
      toggle: (productId) =>
        set((state) => ({
          ids: state.ids.includes(productId)
            ? state.ids.filter((id) => id !== productId)
            : [...state.ids, productId],
        })),
      clear: () => set({ ids: [] }),
    }),
    {
      name: "dimo-wishlist",
    }
  )
);

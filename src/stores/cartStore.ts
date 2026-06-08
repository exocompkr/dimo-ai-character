"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/types/domain";

export interface CartItem {
  product: Product;
  quantity: number;
  addedAt: number;
}

interface CartState {
  items: CartItem[];
  itemCount: () => number;
  totalPrice: () => number;
  add: (product: Product, quantity?: number) => void;
  remove: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
}

/**
 * 장바구니 상태. 실제 결제 직전까지는 클라이언트 단에서 관리.
 */
export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      itemCount: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),
      totalPrice: () =>
        get().items.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        ),
      add: (product, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.product.id === product.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.product.id === product.id
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
            };
          }
          return {
            items: [
              ...state.items,
              { product, quantity, addedAt: Date.now() },
            ],
          };
        }),
      remove: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.product.id !== productId),
        })),
      setQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items
            .map((i) =>
              i.product.id === productId ? { ...i, quantity } : i
            )
            .filter((i) => i.quantity > 0),
        })),
      clear: () => set({ items: [] }),
    }),
    {
      name: "dimo-cart",
    }
  )
);

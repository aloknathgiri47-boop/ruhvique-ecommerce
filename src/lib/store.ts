"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartLine {
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;       // discounted price
  originalPrice: number;
  size: string;
  color: string;
  quantity: number;
  stock: number;
}

interface CartState {
  items: CartLine[];
  sessionToken: string | null;
  setItems: (items: CartLine[]) => void;
  add: (line: CartLine) => void;
  updateQty: (productId: string, size: string, color: string, qty: number) => void;
  remove: (productId: string, size: string, color: string) => void;
  clear: () => void;
  setSessionToken: (t: string | null) => void;
  count: () => number;
  subtotal: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      sessionToken: null,
      setItems: (items) => set({ items }),
      add: (line) =>
        set((s) => {
          const idx = s.items.findIndex(
            (i) =>
              i.productId === line.productId &&
              i.size === line.size &&
              i.color === line.color
          );
          if (idx >= 0) {
            const items = [...s.items];
            items[idx] = {
              ...items[idx],
              quantity: Math.min(items[idx].quantity + line.quantity, line.stock),
            };
            return { items };
          }
          return { items: [...s.items, line] };
        }),
      updateQty: (productId, size, color, qty) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.productId === productId && i.size === size && i.color === color
              ? { ...i, quantity: Math.max(1, Math.min(qty, i.stock)) }
              : i
          ),
        })),
      remove: (productId, size, color) =>
        set((s) => ({
          items: s.items.filter(
            (i) =>
              !(i.productId === productId && i.size === size && i.color === color)
          ),
        })),
      clear: () => set({ items: [] }),
      setSessionToken: (t) => set({ sessionToken: t }),
      count: () => get().items.reduce((n, i) => n + i.quantity, 0),
      subtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    { name: "ruhvique-cart" }
  )
);

interface WishlistState {
  ids: string[];
  setIds: (ids: string[]) => void;
  toggle: (id: string) => void;
  has: (id: string) => boolean;
  remove: (id: string) => void;
  clear: () => void;
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      setIds: (ids) => set({ ids }),
      toggle: (id) =>
        set((s) => ({
          ids: s.ids.includes(id)
            ? s.ids.filter((x) => x !== id)
            : [...s.ids, id],
        })),
      has: (id) => get().ids.includes(id),
      remove: (id) => set((s) => ({ ids: s.ids.filter((x) => x !== id) })),
      clear: () => set({ ids: [] }),
    }),
    { name: "ruhvique-wishlist" }
  )
);

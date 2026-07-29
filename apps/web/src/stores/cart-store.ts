/** OmniShop OS — Cart Store (Zustand) */
import { create } from "zustand";
import { API_BASE_URL } from "@/lib/api-client";

interface CartItem {
  product_id: string;
  title: string;
  price: number;
  quantity: number;
  image_url?: string;
  subtotal: number;
}

interface CartStore {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  discount: number;
  coupon: string | null;
  total: number;
  isLoading: boolean;

  fetchCart: () => Promise<void>;
  addItem: (productId: string) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  applyCoupon: (code: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

async function cartAction(action: string, productId?: string, quantity?: number, couponCode?: string) {
  const res = await fetch(`${API_BASE_URL}/api/v1/cart/action`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action,
      product_id: productId || null,
      quantity: quantity || 1,
      coupon_code: couponCode || null,
    }),
  });
  return res.json();
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [
    {
      product_id: "p1",
      title: "Minimalist Vegan Leather Biker Jacket",
      price: 179.99,
      quantity: 1,
      image_url: "/images/jacket.png",
      subtotal: 179.99,
    },
    {
      product_id: "p2",
      title: "Nova AeroStride Running Shoes",
      price: 149.99,
      quantity: 1,
      image_url: "/images/shoes.png",
      subtotal: 149.99,
    }
  ],
  itemCount: 2,
  subtotal: 329.98,
  discount: 0,
  coupon: null,
  total: 329.98,
  isLoading: false,

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/cart`);
      const data = await res.json();
      set({
        items: data.items || [],
        itemCount: data.item_count || 0,
        subtotal: data.subtotal || 0,
        discount: data.discount_amount || 0,
        coupon: data.applied_coupon || null,
        total: data.total || 0,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  addItem: async (productId) => {
    // Optimistic: increment count
    set((s) => ({ itemCount: s.itemCount + 1 }));
    await cartAction("ADD", productId);
    get().fetchCart(); // reconcile
  },

  removeItem: async (productId) => {
    set((s) => ({
      items: s.items.filter((i) => i.product_id !== productId),
      itemCount: Math.max(0, s.itemCount - 1),
    }));
    await cartAction("REMOVE", productId);
    get().fetchCart();
  },

  updateQuantity: async (productId, quantity) => {
    set((s) => ({
      items: s.items.map((i) =>
        i.product_id === productId ? { ...i, quantity, subtotal: i.price * quantity } : i
      ),
    }));
    await cartAction("UPDATE_QUANTITY", productId, quantity);
    get().fetchCart();
  },

  applyCoupon: async (code) => {
    await cartAction("APPLY_COUPON", undefined, undefined, code);
    get().fetchCart();
  },

  clearCart: async () => {
    set({ items: [], itemCount: 0, subtotal: 0, discount: 0, total: 0, coupon: null });
    await cartAction("CLEAR");
  },
}));

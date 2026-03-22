import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
    product_id: number;
    name: string;
    price: number; 
    quantity: number;
    stock_quantity: number;
}

interface CartState {
    items: CartItem[];
    addItem: (item: Omit<CartItem, 'quantity'>) => void;
    removeItem: (productId: number) => void;
    clearCart: () => void;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],

            addItem: (newItem) => {
                const currentItems = get().items;
                const existingItem = currentItems.find((i) => i.product_id === newItem.product_id);

                if (existingItem) {
                    if (existingItem.quantity < existingItem.stock_quantity) {
                        set({
                            items: currentItems.map((i) =>
                                i.product_id === newItem.product_id
                                    ? { ...i, quantity: i.quantity + 1 }
                                    : i
                            ),
                        });
                    }
                } else {
                    set({ items: [...currentItems, { ...newItem, quantity: 1 }] });
                }
            },

            removeItem: (productId) => {
                set({ items: get().items.filter((i) => i.product_id !== productId) });
            },

            clearCart: () => set({ items: [] }),
        }),
        {
            name: 'client-demo-cart', 
        }
    )
);
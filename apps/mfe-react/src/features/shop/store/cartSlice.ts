import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { CartLine, Product } from '../types';
import { loadCart } from './persist';
import type { RootState } from './store';

type CartState = CartLine[];

const initialState: CartState = loadCart();

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem(state, action: PayloadAction<Product>) {
      const p = action.payload;
      const existing = state.find((l) => l.id === p.id);
      if (existing) {
        existing.qty += 1;
      } else {
        state.push({ id: p.id, title: p.title, price: p.price, image: p.image, qty: 1 });
      }
    },
    removeItem(state, action: PayloadAction<number>) {
      return state.filter((l) => l.id !== action.payload);
    },
    incrementQty(state, action: PayloadAction<number>) {
      const line = state.find((l) => l.id === action.payload);
      if (line) line.qty += 1;
    },
    decrementQty(state, action: PayloadAction<number>) {
      const line = state.find((l) => l.id === action.payload);
      if (!line) return;
      line.qty -= 1;
      if (line.qty <= 0) return state.filter((l) => l.id !== action.payload);
    },
    clearCart() {
      return [];
    },
  },
});

export const { addItem, removeItem, incrementQty, decrementQty, clearCart } =
  cartSlice.actions;
export default cartSlice.reducer;

// Selectors
export const selectCartItems = (s: RootState) => s.cart;
export const selectCartCount = (s: RootState) =>
  s.cart.reduce((n, l) => n + l.qty, 0);
export const selectCartSubtotal = (s: RootState) =>
  s.cart.reduce((sum, l) => sum + l.price * l.qty, 0);

// localStorage persistence for the cart, guarded so it never throws in
// private-mode / SSR / quota situations.
import type { CartLine } from '../types';

const KEY = 'kobi-shop-cart';

export function loadCart(): CartLine[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CartLine[]) : [];
  } catch {
    return [];
  }
}

export function saveCart(cart: CartLine[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(cart));
  } catch {
    /* ignore write failures */
  }
}

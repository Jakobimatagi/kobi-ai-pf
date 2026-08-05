// Fake Store API — free, no API key required. https://fakestoreapi.com
// Mirrors the fetch-based data layer in features/weather/api.ts.
import type { Product } from './types';

export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch('https://fakestoreapi.com/products');
  if (!res.ok) throw new Error(`Failed to load products (${res.status})`);
  const data = (await res.json()) as Product[];
  return data;
}

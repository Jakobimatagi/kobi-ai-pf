import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { fetchProducts as fetchProductsApi } from '../api';
import type { Product } from '../types';
import type { RootState } from './store';

export type ProductsStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

interface ProductsState {
  items: Product[];
  status: ProductsStatus;
  error: string | null;
  category: string; // 'all' | one of the API categories
}

const initialState: ProductsState = {
  items: [],
  status: 'idle',
  error: null,
  category: 'all',
};

// Async thunk: dispatches pending -> fulfilled/rejected around the API call.
export const fetchProducts = createAsyncThunk('products/fetch', async () => {
  return await fetchProductsApi();
});

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setCategory(state, action: PayloadAction<string>) {
      state.category = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Something went wrong.';
      });
  },
});

export const { setCategory } = productsSlice.actions;
export default productsSlice.reducer;

// Selectors
export const selectProductsStatus = (s: RootState) => s.products.status;
export const selectProductsError = (s: RootState) => s.products.error;
export const selectCategory = (s: RootState) => s.products.category;

export const selectCategories = (s: RootState): string[] => {
  const set = new Set(s.products.items.map((p) => p.category));
  return ['all', ...Array.from(set).sort()];
};

export const selectFilteredProducts = (s: RootState): Product[] => {
  const { items, category } = s.products;
  return category === 'all' ? items : items.filter((p) => p.category === category);
};

export const selectProductById =
  (id: number) =>
  (s: RootState): Product | undefined =>
    s.products.items.find((p) => p.id === id);

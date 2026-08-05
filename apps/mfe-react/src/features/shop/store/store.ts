import { configureStore } from '@reduxjs/toolkit';
import productsReducer from './productsSlice';
import cartReducer from './cartSlice';
import flowReducer, { flowMiddleware } from './flowSlice';
import { saveCart } from './persist';

export const store = configureStore({
  reducer: {
    products: productsReducer,
    cart: cartReducer,
    flow: flowReducer,
  },
  middleware: (getDefault) => getDefault().concat(flowMiddleware),
});

// Persist the cart to localStorage whenever it changes.
let lastCart = store.getState().cart;
store.subscribe(() => {
  const { cart } = store.getState();
  if (cart !== lastCart) {
    lastCart = cart;
    saveCart(cart);
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

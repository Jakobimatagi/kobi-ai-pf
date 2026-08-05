// Domain types for the Shop feature.

export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: { rate: number; count: number };
}

// A cart line stores just enough of the product to render the cart without
// re-fetching, plus the quantity.
export interface CartLine {
  id: number;
  title: string;
  price: number;
  image: string;
  qty: number;
}

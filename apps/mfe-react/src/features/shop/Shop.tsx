import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { NavLink, Route, Routes } from 'react-router-dom';
import { Badge } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { store } from './store/store';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { fetchProducts, selectProductsStatus } from './store/productsSlice';
import { selectCartCount } from './store/cartSlice';
import ProductList from './components/ProductList';
import ProductDetail from './components/ProductDetail';
import Cart from './components/Cart';
import ReduxFlowDiagram from './components/ReduxFlowDiagram';

const tabClass = ({ isActive }: { isActive: boolean }) =>
  [
    'rounded-lg px-3 py-1.5 text-sm font-medium transition',
    isActive
      ? 'bg-sky-600 text-white'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  ].join(' ');

function ShopInner() {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectProductsStatus);
  const cartCount = useAppSelector(selectCartCount);

  // Kick off the product fetch once when the mini-app mounts.
  useEffect(() => {
    if (status === 'idle') void dispatch(fetchProducts());
  }, [status, dispatch]);

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-slate-800">Shop</h2>
        <p className="text-sm text-slate-500">
          A mini store with products, cart, and a live Redux data-flow diagram.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-1 border-b border-slate-200 pb-3">
        <NavLink to="/shop" end className={tabClass}>
          Products
        </NavLink>
        <NavLink to="/shop/cart" className={tabClass}>
          {({ isActive }) => (
            <span className="flex items-center gap-1.5">
              <Badge badgeContent={cartCount} color="primary">
                <ShoppingCartIcon fontSize="small" />
              </Badge>
              <span className={isActive ? 'text-white' : ''}>Cart</span>
            </span>
          )}
        </NavLink>
        <NavLink to="/shop/flow" className={tabClass}>
          Redux Flow
        </NavLink>
      </div>

      <Routes>
        <Route index element={<ProductList />} />
        <Route path="product/:id" element={<ProductDetail />} />
        <Route path="cart" element={<Cart />} />
        <Route path="flow" element={<ReduxFlowDiagram />} />
      </Routes>
    </div>
  );
}

// The Shop is a self-contained Redux mini-app: it owns its store and mounts it
// via <Provider>, so no other feature is affected.
export default function Shop() {
  return (
    <Provider store={store}>
      <ShopInner />
    </Provider>
  );
}

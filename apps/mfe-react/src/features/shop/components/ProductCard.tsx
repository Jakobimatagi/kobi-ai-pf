import { Link } from 'react-router-dom';
import { Button, Rating } from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import type { Product } from '../types';
import { useAppDispatch } from '../store/hooks';
import { addItem } from '../store/cartSlice';

export default function ProductCard({ product }: { product: Product }) {
  const dispatch = useAppDispatch();

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <Link
        to={`/shop/product/${product.id}`}
        className="flex h-44 items-center justify-center bg-white p-4"
      >
        <img
          src={product.image}
          alt={product.title}
          className="max-h-full max-w-full object-contain"
          loading="lazy"
        />
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-sky-600">
          {product.category}
        </span>
        <Link
          to={`/shop/product/${product.id}`}
          className="mt-1 line-clamp-2 text-sm font-medium text-slate-800 hover:underline"
          title={product.title}
        >
          {product.title}
        </Link>
        <div className="mt-2 flex items-center gap-1">
          <Rating value={product.rating.rate} precision={0.5} size="small" readOnly />
          <span className="text-xs text-slate-400">({product.rating.count})</span>
        </div>
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="text-lg font-bold text-slate-900">
            ${product.price.toFixed(2)}
          </span>
          <Button
            size="small"
            variant="contained"
            startIcon={<AddShoppingCartIcon fontSize="small" />}
            onClick={() => dispatch(addItem(product))}
          >
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}

import { Link, useParams } from 'react-router-dom';
import { Alert, Button, Rating } from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { selectProductById } from '../store/productsSlice';
import { addItem } from '../store/cartSlice';

export default function ProductDetail() {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const product = useAppSelector(selectProductById(Number(id)));

  if (!product) {
    return (
      <div className="mt-4">
        <Alert severity="info">Product not found.</Alert>
        <Link to="/shop" className="mt-4 inline-block text-sm font-semibold text-sky-600 hover:underline">
          ← Back to products
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        to="/shop"
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-sky-600 hover:underline"
      >
        <ArrowBackIcon fontSize="small" /> Back to products
      </Link>

      <div className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2">
        <div className="flex h-72 items-center justify-center rounded-xl bg-white p-4 md:h-96">
          <img
            src={product.image}
            alt={product.title}
            className="max-h-full max-w-full object-contain"
          />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-wide text-sky-600">
            {product.category}
          </span>
          <h2 className="mt-1 text-xl font-bold text-slate-900">{product.title}</h2>
          <div className="mt-2 flex items-center gap-1">
            <Rating value={product.rating.rate} precision={0.5} size="small" readOnly />
            <span className="text-xs text-slate-400">
              {product.rating.rate} · {product.rating.count} reviews
            </span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-slate-600">
            {product.description}
          </p>
          <div className="mt-auto flex items-center justify-between pt-6">
            <span className="text-2xl font-bold text-slate-900">
              ${product.price.toFixed(2)}
            </span>
            <Button
              variant="contained"
              startIcon={<AddShoppingCartIcon />}
              onClick={() => dispatch(addItem(product))}
            >
              Add to cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

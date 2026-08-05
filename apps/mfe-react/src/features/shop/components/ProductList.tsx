import { Alert, Chip, CircularProgress } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  selectCategories,
  selectCategory,
  selectFilteredProducts,
  selectProductsError,
  selectProductsStatus,
  setCategory,
} from '../store/productsSlice';
import ProductCard from './ProductCard';

export default function ProductList() {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectProductsStatus);
  const error = useAppSelector(selectProductsError);
  const products = useAppSelector(selectFilteredProducts);
  const categories = useAppSelector(selectCategories);
  const activeCategory = useAppSelector(selectCategory);

  if (status === 'loading' || status === 'idle') {
    return (
      <div className="mt-16 flex justify-center">
        <CircularProgress />
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <Alert severity="warning" className="mt-4">
        {error ?? 'Could not load products.'}
      </Alert>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <Chip
            key={cat}
            label={cat === 'all' ? 'All' : cat}
            onClick={() => dispatch(setCategory(cat))}
            color={cat === activeCategory ? 'primary' : 'default'}
            variant={cat === activeCategory ? 'filled' : 'outlined'}
            className="capitalize"
          />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}

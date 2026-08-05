import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, Button, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteOutlineIcon from '@mui/icons-material/Delete';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  clearCart,
  decrementQty,
  incrementQty,
  removeItem,
  selectCartItems,
  selectCartSubtotal,
} from '../store/cartSlice';

export default function Cart() {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectCartSubtotal);
  const [checkedOut, setCheckedOut] = useState(false);

  const handleCheckout = () => {
    dispatch(clearCart());
    setCheckedOut(true);
  };

  if (checkedOut && items.length === 0) {
    return (
      <div className="mt-4">
        <Alert severity="success">
          Order placed — thanks for shopping! (This is a mock checkout.)
        </Alert>
        <Link
          to="/shop"
          className="mt-4 inline-block text-sm font-semibold text-sky-600 hover:underline"
        >
          ← Continue shopping
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mt-4">
        <Alert severity="info">Your cart is empty.</Alert>
        <Link
          to="/shop"
          className="mt-4 inline-block text-sm font-semibold text-sky-600 hover:underline"
        >
          ← Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <ul className="flex flex-col gap-3">
          {items.map((line) => (
            <li
              key={line.id}
              className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
            >
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-white">
                <img
                  src={line.image}
                  alt={line.title}
                  className="max-h-full max-w-full object-contain"
                  loading="lazy"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-sm font-medium text-slate-800" title={line.title}>
                  {line.title}
                </p>
                <p className="text-sm text-slate-500">${line.price.toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-1">
                <IconButton size="small" onClick={() => dispatch(decrementQty(line.id))}>
                  <RemoveIcon fontSize="small" />
                </IconButton>
                <span className="w-6 text-center text-sm font-semibold">{line.qty}</span>
                <IconButton size="small" onClick={() => dispatch(incrementQty(line.id))}>
                  <AddIcon fontSize="small" />
                </IconButton>
              </div>
              <span className="w-20 text-right text-sm font-bold text-slate-900">
                ${(line.price * line.qty).toFixed(2)}
              </span>
              <IconButton
                size="small"
                color="error"
                onClick={() => dispatch(removeItem(line.id))}
                aria-label="Remove item"
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </li>
          ))}
        </ul>
      </div>

      <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-800">Order summary</h3>
        <div className="mt-3 flex justify-between text-sm text-slate-600">
          <span>Subtotal</span>
          <span className="font-semibold text-slate-900">${subtotal.toFixed(2)}</span>
        </div>
        <div className="mt-1 flex justify-between text-sm text-slate-600">
          <span>Shipping</span>
          <span>Free</span>
        </div>
        <div className="mt-3 flex justify-between border-t border-slate-200 pt-3 text-base font-bold text-slate-900">
          <span>Total</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <Button fullWidth variant="contained" className="!mt-4" onClick={handleCheckout}>
          Checkout
        </Button>
        <Button
          fullWidth
          variant="text"
          color="inherit"
          className="!mt-1"
          onClick={() => dispatch(clearCart())}
        >
          Clear cart
        </Button>
      </aside>
    </div>
  );
}

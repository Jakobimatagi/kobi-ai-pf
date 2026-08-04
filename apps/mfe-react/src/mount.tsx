import { StrictMode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import App from './App';
import './index.css';

// Framework-agnostic mount contract consumed by the Vue shell.
// The shell hands us a DOM element; the React mini-app takes over that subtree.
const roots = new WeakMap<Element, Root>();

export function mount(el: HTMLElement): () => void {
  const root = createRoot(el);
  roots.set(el, root);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
  return () => unmount(el);
}

export function unmount(el: HTMLElement): void {
  roots.get(el)?.unmount();
  roots.delete(el);
}

export default mount;

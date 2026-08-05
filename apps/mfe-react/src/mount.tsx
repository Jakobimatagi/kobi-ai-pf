import { StrictMode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import App from './App';
import { BoardIdContext, resolveBoardId } from './features/jira/boardId';
import './index.css';

// Framework-agnostic mount contract consumed by the Vue shell.
// The shell hands us a DOM element and optional context (the per-browser
// board id); the React mini-app takes over that subtree.
const roots = new WeakMap<Element, Root>();

export interface MountContext {
  boardId?: string;
}

export function mount(el: HTMLElement, ctx?: MountContext): () => void {
  const root = createRoot(el);
  roots.set(el, root);
  const boardId = resolveBoardId(ctx?.boardId);
  root.render(
    <StrictMode>
      <BoardIdContext.Provider value={boardId}>
        <App />
      </BoardIdContext.Provider>
    </StrictMode>,
  );
  return () => unmount(el);
}

export function unmount(el: HTMLElement): void {
  roots.get(el)?.unmount();
  roots.delete(el);
}

export default mount;

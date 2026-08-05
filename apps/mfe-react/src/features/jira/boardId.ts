import { createContext, useContext } from 'react';

// Each browser gets its own board. Resolution order:
//   1. explicit — the shell hands one in via the mount() contract
//   2. ?board= URL param — for running this MFE standalone against a shared board
//   3. localStorage — a stable id for repeat standalone visits
//   4. a fresh random id (also persisted)
const KEY = 'kobi.board.id';

export function resolveBoardId(explicit?: string): string {
  if (explicit && explicit.trim()) return explicit.trim();

  try {
    const fromUrl = new URLSearchParams(window.location.search).get('board');
    if (fromUrl) return fromUrl;

    const stored = localStorage.getItem(KEY);
    if (stored) return stored;

    const fresh = crypto.randomUUID();
    localStorage.setItem(KEY, fresh);
    return fresh;
  } catch {
    return crypto.randomUUID();
  }
}

export const BoardIdContext = createContext<string>('');
export const useBoardId = () => useContext(BoardIdContext);

// The shell owns the per-browser board id and hands it to both micro-frontends:
// to React (mounted inline, same origin) via the mount() contract, and to the
// Angular iframe (a different origin, so localStorage can't be shared) via a
// ?board= URL param. One id → both MFEs read/write the same isolated board.
const KEY = 'kobi.board.id';

export function getBoardId(): string {
  try {
    const stored = localStorage.getItem(KEY);
    if (stored) return stored;
    const fresh = crypto.randomUUID();
    localStorage.setItem(KEY, fresh);
    return fresh;
  } catch {
    return crypto.randomUUID();
  }
}

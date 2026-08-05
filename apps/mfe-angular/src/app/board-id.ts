// Which board this Angular MFE reflects.
//
// The board id arrives as a ?board= param on the URL (the shell sets it on the
// iframe src). But the app uses hash-location routing, which rewrites the URL
// on bootstrap and drops the pre-hash query string — so we must read it at the
// very first script evaluation, before the router runs. `main.ts` imports this
// module first to guarantee that ordering; the captured value is a module
// singleton everything else reads.
const CAPTURED = (() => {
  try {
    return new URLSearchParams(window.location.search).get('board');
  } catch {
    return null;
  }
})();

const KEY = 'kobi.board.id';

export function resolveBoardId(): string {
  if (CAPTURED) return CAPTURED;
  // Standalone (no ?board): a stable per-browser id.
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

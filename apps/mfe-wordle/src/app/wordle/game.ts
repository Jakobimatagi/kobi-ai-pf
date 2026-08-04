export type LetterStatus = 'correct' | 'present' | 'absent';

export interface EvaluatedTile {
  letter: string;
  status: LetterStatus;
}

/**
 * Wordle scoring with correct duplicate-letter handling:
 * exact matches are counted first, then remaining letters are marked "present"
 * only while unused copies of that letter remain in the answer.
 */
export function evaluateGuess(guess: string, answer: string): EvaluatedTile[] {
  const g = guess.toUpperCase();
  const a = answer.toUpperCase();
  const result: EvaluatedTile[] = g.split('').map((letter) => ({
    letter,
    status: 'absent' as LetterStatus,
  }));

  const remaining: Record<string, number> = {};
  for (const ch of a) remaining[ch] = (remaining[ch] ?? 0) + 1;

  // Pass 1 — exact position matches.
  for (let i = 0; i < g.length; i++) {
    if (g[i] === a[i]) {
      result[i].status = 'correct';
      remaining[g[i]]--;
    }
  }

  // Pass 2 — right letter, wrong spot.
  for (let i = 0; i < g.length; i++) {
    if (result[i].status !== 'correct' && remaining[g[i]] > 0) {
      result[i].status = 'present';
      remaining[g[i]]--;
    }
  }

  return result;
}

const RANK: Record<LetterStatus, number> = { absent: 0, present: 1, correct: 2 };

/** Merge a row's tile statuses into the running best-known status per key. */
export function mergeKeyStatuses(
  rows: EvaluatedTile[][],
): Record<string, LetterStatus> {
  const map: Record<string, LetterStatus> = {};
  for (const row of rows) {
    for (const { letter, status } of row) {
      const current = map[letter];
      if (current === undefined || RANK[status] > RANK[current]) {
        map[letter] = status;
      }
    }
  }
  return map;
}

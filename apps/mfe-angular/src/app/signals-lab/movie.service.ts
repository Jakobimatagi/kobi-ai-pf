import { Injectable } from '@angular/core';

export interface RandomMovie {
  title: string;
  year: string;
  genres: string[];
  rating: number | null;
  source: 'tvmaze' | 'local';
}

// A handful of well-known shows to fall back on if the network is unavailable,
// so the demo always has something to show (same offline-first spirit as the
// Wordle word service).
const FALLBACK: RandomMovie[] = [
  { title: 'Breaking Bad', year: '2008', genres: ['Drama', 'Crime'], rating: 9.3, source: 'local' },
  { title: 'The Office', year: '2005', genres: ['Comedy'], rating: 8.6, source: 'local' },
  { title: 'Firefly', year: '2002', genres: ['Sci-Fi', 'Adventure'], rating: 8.9, source: 'local' },
  { title: 'The Wire', year: '2002', genres: ['Drama', 'Crime'], rating: 9.0, source: 'local' },
  { title: 'Arcane', year: '2021', genres: ['Animation', 'Action'], rating: 9.0, source: 'local' },
];

@Injectable({ providedIn: 'root' })
export class MovieService {
  /**
   * Fetch a random show title from the free, key-less TVmaze API.
   * Show ids 1–250 are densely populated, so a random pick almost always hits.
   * Any failure falls back to a local pick so the signal always resolves.
   */
  async getRandomMovie(): Promise<RandomMovie> {
    const id = 1 + Math.floor(Math.random() * 250);
    try {
      const res = await fetch(`https://api.tvmaze.com/shows/${id}`);
      if (res.ok) {
        const data = (await res.json()) as {
          name?: string;
          premiered?: string | null;
          genres?: string[];
          rating?: { average?: number | null };
        };
        if (data?.name) {
          return {
            title: data.name,
            year: data.premiered?.slice(0, 4) ?? '—',
            genres: data.genres?.length ? data.genres : ['Unlisted'],
            rating: data.rating?.average ?? null,
            source: 'tvmaze',
          };
        }
      }
    } catch {
      /* fall through to local */
    }
    return FALLBACK[Math.floor(Math.random() * FALLBACK.length)];
  }
}

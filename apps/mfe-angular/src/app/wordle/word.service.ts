import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { WORDS } from './words';

export interface DailyWord {
  word: string;
  date: string;
  source: 'supabase' | 'local';
}

@Injectable({ providedIn: 'root' })
export class WordService {
  /**
   * Fetch today's word from the Supabase edge function. Falls back to a
   * deterministic local pick so the game still works fully offline.
   */
  async getDailyWord(): Promise<DailyWord> {
    try {
      const res = await fetch(
        `${environment.supabaseUrl}/functions/v1/daily-word`,
        {
          headers: {
            apikey: environment.supabaseAnonKey,
            Authorization: `Bearer ${environment.supabaseAnonKey}`,
          },
        },
      );
      if (res.ok) {
        const data = (await res.json()) as { word: string; date: string };
        if (data?.word) {
          return {
            word: data.word.toUpperCase(),
            date: data.date,
            source: 'supabase',
          };
        }
      }
    } catch {
      /* fall through to local */
    }
    return this.localDailyWord();
  }

  private localDailyWord(): DailyWord {
    const anchor = Date.UTC(2026, 0, 1);
    const today = new Date();
    const todayUtc = Date.UTC(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const dayIndex = Math.floor((todayUtc - anchor) / 86_400_000);
    const word = WORDS[((dayIndex % WORDS.length) + WORDS.length) % WORDS.length];
    return {
      word: word.toUpperCase(),
      date: today.toISOString().slice(0, 10),
      source: 'local',
    };
  }
}

import {
  Component,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { MatButtonModule } from '@angular/material/button';
import { MovieService, RandomMovie } from './movie.service';

// The async movie section is a tiny state machine driven by one signal.
type MoviePhase = 'idle' | 'loading' | 'loaded' | 'error';
interface MovieState {
  phase: MoviePhase;
  movie: RandomMovie | null;
}

const UNIT_PRICE = 4.5; // House Blend, per bag
const BULK_MIN = 5; // qty at which the bulk discount kicks in
const BULK_RATE = 0.1; // 10% off
const FREE_SHIP_AT = 25; // free shipping threshold

@Component({
  selector: 'app-signals-lab',
  imports: [MatButtonModule],
  templateUrl: './signals-lab.html',
  // A one-shot "pop" whenever a bound value changes — used to give the live
  // total a subtle nudge each time it recalculates.
  animations: [
    trigger('pop', [
      transition('* => *', [
        style({ transform: 'scale(1.12)', filter: 'brightness(1.15)' }),
        animate(
          '400ms cubic-bezier(0.22, 1, 0.36, 1)',
          style({ transform: 'scale(1)', filter: 'brightness(1)' }),
        ),
      ]),
    ]),
  ],
})
export class SignalsLab {
  private readonly movieService = inject(MovieService);

  // ── Demo 1: boolean signal ────────────────────────────────────────────
  // A single writable signal is the source of truth for the light.
  readonly isOn = signal(false);
  // A computed derives from it — it recomputes only when isOn changes.
  readonly lightLabel = computed(() => (this.isOn() ? 'ON' : 'OFF'));

  toggleLight(): void {
    this.isOn.update((v) => !v);
  }

  // ── Demo 2: number signal → a live order summary ──────────────────────
  // One writable signal (the quantity) feeds a chain of computeds. Each one
  // recomputes automatically — and only when its inputs actually change.
  readonly unitPrice = UNIT_PRICE;
  readonly bulkMin = BULK_MIN;
  readonly qty = signal(1);

  readonly subtotal = computed(() => this.qty() * UNIT_PRICE);
  readonly bulkUnlocked = computed(() => this.qty() >= BULK_MIN);
  readonly discount = computed(() =>
    this.bulkUnlocked() ? this.subtotal() * BULK_RATE : 0,
  );
  readonly total = computed(() => this.subtotal() - this.discount());
  readonly freeShipping = computed(() => this.total() >= FREE_SHIP_AT);

  // An effect for the side-effect story: it re-runs whenever the total it
  // reads changes, counting recalculations. The write is wrapped in untracked
  // so it never becomes a dependency of its own effect.
  readonly recalcs = signal(0);

  incQty(): void {
    this.qty.update((n) => n + 1);
  }
  decQty(): void {
    this.qty.update((n) => Math.max(1, n - 1));
  }

  money(n: number): string {
    return `$${n.toFixed(2)}`;
  }

  // ── Demo 3: async data → signal ───────────────────────────────────────
  readonly movieState = signal<MovieState>({ phase: 'idle', movie: null });
  readonly isFetching = computed(() => this.movieState().phase === 'loading');

  async fetchMovie(): Promise<void> {
    this.movieState.set({ phase: 'loading', movie: null });
    try {
      const movie = await this.movieService.getRandomMovie();
      this.movieState.set({ phase: 'loaded', movie });
    } catch {
      this.movieState.set({ phase: 'error', movie: null });
    }
  }

  constructor() {
    effect(() => {
      this.total(); // tracked read — re-runs the effect on every recalculation
      untracked(() => this.recalcs.update((n) => n + 1));
    });
  }
}

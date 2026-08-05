import {
  Component,
  HostListener,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { WordService } from './word.service';
import { isValidGuess } from './words';
import {
  EvaluatedTile,
  LetterStatus,
  evaluateGuess,
  mergeKeyStatuses,
} from './game';

type GameStatus = 'loading' | 'playing' | 'won' | 'lost';

const WORD_LENGTH = 5;
const MAX_ROWS = 6;

const KEYBOARD: string[][] = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACK'],
];

interface Cell {
  letter: string;
  status: LetterStatus | 'empty' | 'filled';
}

@Component({
  selector: 'app-wordle',
  imports: [
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './wordle.html',
})
export class Wordle implements OnInit {
  private readonly wordService = inject(WordService);
  private readonly snackBar = inject(MatSnackBar);

  readonly keyboard = KEYBOARD;
  readonly wordLength = WORD_LENGTH;

  readonly answer = signal('');
  readonly source = signal<'supabase' | 'local'>('local');
  readonly puzzleDate = signal('');
  readonly status = signal<GameStatus>('loading');

  private readonly submitted = signal<EvaluatedTile[][]>([]);
  private readonly current = signal('');

  private readonly keyStatuses = computed(() =>
    mergeKeyStatuses(this.submitted()),
  );

  /** The 6×5 grid derived from submitted rows + the in-progress guess. */
  readonly grid = computed<Cell[][]>(() => {
    const rows: Cell[][] = [];
    const done = this.submitted();
    const typing = this.current();
    const playing = this.status() === 'playing';

    for (let r = 0; r < MAX_ROWS; r++) {
      if (r < done.length) {
        rows.push(done[r].map((t) => ({ letter: t.letter, status: t.status })));
      } else if (r === done.length && playing) {
        rows.push(
          Array.from({ length: WORD_LENGTH }, (_, i) => ({
            letter: typing[i] ?? '',
            status: (typing[i] ? 'filled' : 'empty') as Cell['status'],
          })),
        );
      } else {
        rows.push(
          Array.from({ length: WORD_LENGTH }, () => ({
            letter: '',
            status: 'empty' as Cell['status'],
          })),
        );
      }
    }
    return rows;
  });

  async ngOnInit(): Promise<void> {
    const daily = await this.wordService.getDailyWord();
    this.answer.set(daily.word);
    this.source.set(daily.source);
    this.puzzleDate.set(daily.date);
    this.status.set('playing');
  }

  keyStatus(letter: string): LetterStatus | '' {
    return this.keyStatuses()[letter] ?? '';
  }

  tileClass(status: Cell['status']): string {
    switch (status) {
      case 'correct':
        return 'bg-green-500 text-white border-0';
      case 'present':
        return 'bg-yellow-500 text-white border-0';
      case 'absent':
        return 'bg-slate-400 text-white border-0';
      case 'filled':
        return 'bg-white text-slate-800 border-2 border-slate-400';
      default:
        return 'bg-white text-slate-800 border-2 border-slate-200';
    }
  }

  keyClass(key: string): string {
    const size =
      key === 'ENTER' || key === 'BACK' ? 'px-3 min-w-[3.5rem]' : 'w-9';
    const status = this.keyStatus(key);
    let color = 'bg-slate-200 text-slate-800 hover:bg-slate-300';
    if (status === 'correct') color = 'bg-green-500 text-white';
    else if (status === 'present') color = 'bg-yellow-500 text-white';
    else if (status === 'absent') color = 'bg-slate-400 text-white';
    return `${size} ${color}`;
  }

  onKey(key: string): void {
    if (this.status() !== 'playing') return;
    if (key === 'ENTER') {
      this.submitGuess();
    } else if (key === 'BACK') {
      this.current.update((c) => c.slice(0, -1));
    } else if (/^[A-Z]$/.test(key) && this.current().length < WORD_LENGTH) {
      this.current.update((c) => c + key);
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboard(event: KeyboardEvent): void {
    if (this.status() !== 'playing') return;
    const key = event.key;
    if (key === 'Enter') this.onKey('ENTER');
    else if (key === 'Backspace') this.onKey('BACK');
    else if (/^[a-zA-Z]$/.test(key)) this.onKey(key.toUpperCase());
  }

  private submitGuess(): void {
    const guess = this.current();
    if (guess.length < WORD_LENGTH) {
      this.toast('Not enough letters');
      return;
    }
    if (!isValidGuess(guess)) {
      this.toast('Not in our word list (local dictionary)');
      return;
    }

    const evaluated = evaluateGuess(guess, this.answer());
    this.submitted.update((rows) => [...rows, evaluated]);
    this.current.set('');

    if (guess.toUpperCase() === this.answer()) {
      this.status.set('won');
      this.toast('Splendid! 🎉');
    } else if (this.submitted().length >= MAX_ROWS) {
      this.status.set('lost');
      this.toast(`The word was ${this.answer()}`);
    }
  }

  private toast(message: string): void {
    this.snackBar.open(message, undefined, {
      duration: 2000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }
}

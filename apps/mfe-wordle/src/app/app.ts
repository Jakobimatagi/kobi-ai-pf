import { Component } from '@angular/core';
import { Wordle } from './wordle/wordle';

@Component({
  selector: 'app-root',
  imports: [Wordle],
  template: `
    <div class="min-h-full w-full bg-slate-50 py-2">
      <app-wordle></app-wordle>
    </div>
  `,
})
export class App {}

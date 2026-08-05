import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { COMPONENTS } from './registry';

// This micro-frontend is a self-contained mini-app: its own router and many
// components under one remote. The shell embeds the whole app via iframe.
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
})
export class App {
  readonly components = COMPONENTS;
}

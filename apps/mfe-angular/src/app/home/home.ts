import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { COMPONENTS } from '../registry';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
})
export class Home {
  readonly components = COMPONENTS;
}

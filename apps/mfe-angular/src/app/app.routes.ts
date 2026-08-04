import { Routes } from '@angular/router';
import { Home } from './home/home';
import { COMPONENTS } from './registry';

export const routes: Routes = [
  { path: '', component: Home },
  ...COMPONENTS.map((c) => ({ path: c.path, loadComponent: c.loadComponent })),
  { path: '**', redirectTo: '' },
];

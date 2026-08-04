import { ApplicationRef } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { appConfig } from './app/app.config';

// Framework-agnostic mount contract consumed by the Vue shell.
// Angular bootstraps into an <app-root> we append inside the host element.
const refs = new WeakMap<Element, ApplicationRef>();

export async function mount(el: HTMLElement): Promise<() => void> {
  const host = document.createElement('app-root');
  el.appendChild(host);
  const appRef = await bootstrapApplication(App, appConfig);
  refs.set(el, appRef);
  return () => unmount(el);
}

export function unmount(el: HTMLElement): void {
  refs.get(el)?.destroy();
  refs.delete(el);
  el.querySelector('app-root')?.remove();
}

export default mount;

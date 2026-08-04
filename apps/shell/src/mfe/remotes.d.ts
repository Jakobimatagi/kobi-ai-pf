// Type shims for Module Federation remote modules.
// Each MFE exposes a framework-agnostic mount contract for its whole app.
declare module 'mfe_react/App' {
  export type MountFn = (el: HTMLElement) => () => void;
  export const mount: MountFn;
  export function unmount(el: HTMLElement): void;
  const _default: MountFn;
  export default _default;
}

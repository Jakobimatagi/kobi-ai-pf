// Type shims for Module Federation remote modules.
// Each exposed remote conforms to the framework-agnostic mount contract.
declare module 'mfe_weather/WeatherApp' {
  export type MountFn = (el: HTMLElement) => () => void;
  export const mount: MountFn;
  export function unmount(el: HTMLElement): void;
  const _default: MountFn;
  export default _default;
}

import { lazy, type ComponentType } from "react";

export function lazyDefault<T extends ComponentType<unknown>>(
  factory: () => Promise<{ default: T }>,
) {
  return lazy(factory);
}

export function lazyNamed<T extends ComponentType<unknown>>(
  factory: () => Promise<Record<string, unknown>>,
  exportName: string,
) {
  return lazy(async () => {
    const m = await factory();
    const C = m[exportName] as T;
    return { default: C };
  });
}

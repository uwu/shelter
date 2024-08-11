import { type Component } from "solid-js";

export type NativeExtendingComponent<
  Props extends object,
  NativeProps extends object,
  ExcludedKeys extends string | never = never,
> = Component<Props & Omit<NativeProps, keyof Props | ExcludedKeys>>;

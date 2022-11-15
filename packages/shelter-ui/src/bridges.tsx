import { Component, createEffect, createSignal, onCleanup } from "solid-js";
import { ReactiveRoot } from "./util";
import { React, ReactDOM } from "./react";

export const ReactInSolidBridge: Component<{ comp: (props: any) => any; props?: object }> = (props) => {
  const root = <div style="display:contents" />;

  let rroot;

  createEffect(() => {
    rroot ??= ReactDOM.createRoot(root);
    rroot.render(props.comp(props.props));
  });

  onCleanup(() => rroot?.unmount());

  return root;
};

export const SolidInReactBridge = ({ comp, props }: { comp: Component<any>; props?: any }) => {
  const ref = React.useRef();
  const propSignal = React.useRef(createSignal());
  const lastComp = React.useRef();

  propSignal.current[1](() => props);

  React.useEffect(() => {
    if (lastComp.current !== comp) {
      ref.innerHTML = "";
      ref.append(<ReactiveRoot>{comp(propSignal.current[0]())}</ReactiveRoot>);

      lastComp.current = comp;
    }
  });

  return React.createElement("div", {
    ref,
    style: "display: contents",
  });
};

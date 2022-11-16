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

export const SolidInReactBridge = (props: any) => {
  const ref = React.useRef();
  const propSignal = React.useRef(createSignal());

  propSignal.current[1](() => props.props);

  React.useEffect(() => {
    if (ref.current !== undefined) {
      ref.current.innerHTML = "";
      ref.current.append(<ReactiveRoot>{props.comp(propSignal.current[0]())}</ReactiveRoot>);
    }
  }, [props]);

  return React.createElement("div", {
    ref,
    style: { display: "contents" },
  });
};

export const renderSolidInReact = (comp: Component<any>, props?: any) => {
  return React.createElement(SolidInReactBridge, { comp, props });
};

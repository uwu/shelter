import { Component, createEffect, createSignal, onCleanup } from "solid-js";
import { ReactiveRoot } from "@uwu/shelter-ui";
import { React, ReactDOM } from "./react";

export const ReactInSolidBridge: Component<{
  children: any;
  comp: (props: any) => any;
  props?: object;
}> = (props) => {
  const root = <div style="display:contents" />;

  props.props = { ...props.props, children: props.children };

  createEffect(() => {
    ReactDOM.render(React.createElement(props.comp, props.props), root);
  });

  onCleanup(() => ReactDOM?.unmountComponentAtNode(root));

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

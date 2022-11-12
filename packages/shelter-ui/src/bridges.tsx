import { Component, createEffect, createSignal, onCleanup } from "solid-js";
import { ReactiveRoot } from "./util";
//import exfiltrate from "../../shelter/src/exfiltrate"

// exfiltrate react
/*let [React, setReact] = createSignal<any>();
let [ReactDOM, setReactDOM] = createSignal<any>();
export { React, ReactDOM };

exfiltrate("createElement").then(setReact);
exfiltrate("findDOMNode").then(setReactDOM);*/

export const ReactInSolidBridge: Component<{ ReactDOM; comp: (props: any) => any; props?: object }> = (props) => {
  const root = <div style="display:contents" />;

  let rroot;

  createEffect(() => {
    rroot ??= props.ReactDOM.createRoot(root);
    rroot.render(props.comp(props.props));
  });

  onCleanup(() => rroot?.unmount());

  return root;
};

export const SolidInReactBridge = ({ comp, props, React }: { React: any; comp: Component<any>; props?: any }) => {
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

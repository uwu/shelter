import { Component, createEffect, createSignal, onCleanup, Signal } from "solid-js";
import { ReactiveRoot } from "@uwu/shelter-ui";
import { React, ReactDOMClient } from "./react";

export const ReactInSolidBridge: Component<{
  children: any;
  comp: (props: any) => any;
  props?: object;
}> = (props) => {
  const rootDiv = (<div style="display:contents" />) as HTMLDivElement;
  const clientRoot = ReactDOMClient.createRoot(rootDiv);

  createEffect(() => clientRoot.render(React.createElement(props.comp, { ...props.props, children: props.children })));

  onCleanup(() => clientRoot.unmount());

  return rootDiv;
};

export const renderSolidInReact = (comp: Component<any>, props?: any) => {
  // defined inside the function because otherwise `React` doesn't exist yet.
  class SolidInReactBridge<TProps extends object = Record<string, unknown>> extends React.Component<{
    comp: Component<TProps>;
    props: TProps;
  }> {
    divRef = React.createRef<HTMLDivElement>();
    propsRef = React.createRef<Signal<[Component<TProps>, TProps]>>();

    constructor(props: { comp: Component<TProps>; props: TProps }) {
      super(props);

      this.propsRef.current = createSignal([props.comp, props.props]);
    }

    render() {
      return React.createElement("div", { ref: this.divRef, style: { display: "contents" } });
    }

    componentDidMount() {
      const render = () => {
        const [component, props] = this.propsRef.current[0]();
        return component(props);
      };

      this.divRef.current.innerHTML = "";
      this.divRef.current.append((<ReactiveRoot>{render()}</ReactiveRoot>) as HTMLDivElement);
    }

    shouldComponentUpdate(nextProps /*, _nextState, _nextContext*/) {
      // don't let react rerender EVER in case it fucks with our tree
      // - we want to handle any changes using solid's reactivity.
      this.propsRef.current[1]([nextProps.comp, nextProps.props]);
      return false;
    }
  }

  return React.createElement(SolidInReactBridge, { comp, props });
};

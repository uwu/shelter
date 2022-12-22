import { Header, HeaderTags } from "../header";
import { Text } from "../index";
import { classes } from "./index.tsx.scss";
import { Component } from "solid-js";

export default ((props) => (
  <div onClick={props.onClick} class={`${classes.toast} ${props.class ?? ""}`}>
    {props.title && (
      <Header tag={HeaderTags.H1} class={classes.toasttitle}>
        {props.title}
      </Header>
    )}
    {props.content && (
      <div>
        <Text>{props.content}</Text>
      </div>
    )}
  </div>
)) as Component<{
  title?: string;
  content?: string;
  class?: string;
  onClick?(): void;
}>;

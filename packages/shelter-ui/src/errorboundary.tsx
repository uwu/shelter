import { ErrorBoundary as SEB, JSXElement } from "solid-js";
import { Button, ButtonColors, ButtonLooks, ButtonSizes } from "./button";
import { Header, HeaderTags } from "./header";
import { TextArea } from "./textbox";
import { css, classes } from "./errorboundary.tsx.scss";
import { ensureInternalStyle } from "./internalstyles";

const ErrBoundFallback = (err: any, reset: () => void) => {
  ensureInternalStyle(css);

  console.error(err);

  return (
    <div class={classes.errbound}>
      <Header tag={HeaderTags.HeadingXL}>Oops, we had a fucky wucky. (shelter)</Header>
      <TextArea value={err} mono readonly />
      <Button color={ButtonColors.RED} size={ButtonSizes.SMALL} look={ButtonLooks.FILLED} onClick={reset}>
        Retry
      </Button>
    </div>
  );
};

export const ErrorBoundary = (props: { children: JSXElement }) => (
  <SEB fallback={ErrBoundFallback}>{props.children}</SEB>
);

import { ErrorBoundary as SEB } from "solid-js";
import { Button, ButtonColors, ButtonLooks, ButtonSizes } from "./button";
import { css, classes } from "./errorboundary.tsx.scss";
import { injectCss } from "./util";

let injectedCss = false;

const ErrBoundFallback = (err, reset) => {
  if (!injectedCss) {
    injectCss(css);
    injectedCss = true;
  }

  return (
    <div class={classes.errbound}>
      <h1 class={classes.errboundtitle}>Oops, we had a fucky wucky. (shelter)</h1>
      <code class={classes.errboundcode}>{err}</code>
      <Button color={ButtonColors.RED} size={ButtonSizes.TINY} look={ButtonLooks.OUTLINED} onClick={reset}>
        Retry
      </Button>
    </div>
  );
};

export const ErrorBoundary = (props) => <SEB fallback={ErrBoundFallback}>{props.children}</SEB>;

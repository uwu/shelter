import { ErrorBoundary as SEB } from "solid-js";
import { Button, ButtonColors, ButtonLooks, ButtonSizes } from "./button";
import { css, classes } from "./errorboundary.tsx.scss";
import { ensureInternalStyle } from "./internalstyles";

const ErrBoundFallback = (err, reset) => {
  ensureInternalStyle(css);

  return (
    <div class={classes.errbound}>
      <h1 class={classes.errboundtitle}>Oops, we had a fucky wucky. (shelter)</h1>
      <code class={classes.errboundcode}>{err}</code>
      <Button color={ButtonColors.RED} size={ButtonSizes.TINY} look={ButtonLooks.FILLED} onClick={reset}>
        Retry
      </Button>
    </div>
  );
};

export const ErrorBoundary = (props) => <SEB fallback={ErrBoundFallback}>{props.children}</SEB>;

---
outline: [2, 3]
---

<script setup>
  import Pill from "./.vitepress/theme/components/Pill.vue";
  import ShelterDemo from "./.vitepress/theme/components/ShelterDemo.vue";
</script>

# shelter UI Documentation

shelter UI is a set of UI components designed to look identical to Discord's, built entirely in Solid.

The API signatures are _not_ identical to Discord's React components.

If you are using shelter, these are exposed to you on `shelter.ui`, and if not, you can get it at
[`@uwu/shelter-ui`](https://npm.im/@uwu/shelter-ui), and please read the [relevant docs](#standalone-usage).

:::warning Visual Refresh
shelter-ui has been updated to Discord's 2025 visual refresh redesign. Changes other than styles include:
- Reworked `<Text>` component, supporting the newly added styles
- Completely overhauled toasts
- Various misc changes to shelter internal styling to look more "discordy"

Deprecated styles have been aliased to new styles, as to not break existing plugins: the styles might not be perfectly matching anymore and **an update to plugins is recommended**.
:::

## Standalone usage

shelter UI can be used outside of Discord. There are a few things that must be taken into consideration for this:
 - components may be affected by lack of Discord's stylesheets (css reset, etc.)
 - components may be affected by your own stylesheets
 - you must use the compatibility stylesheet
 - you must inject the shelter UI internal styles
 - you must be using Solid, or have some way of using Solid components in your page
 - some APIs available on `shelter.ui` are not available in `@uwu/shelter-ui`, and vice versa.

To get started in your Solid app/site, install `@uwu/shelter-ui`. It is a rolling release package, not semver, the
version numbers simply increment each release. This is because shelter itself is rolling release and has no versioning.

You must inject `@uwu/shelter-ui/compat.css` somewhere in your app.
This does two things. First, it sets CSS variables
on `:root` that the components rely on to look correct. The reason we use these variables at all instead of hardcoding
their values is so that themes apply to shelter UI inside of Discord.
Second, it adds `@font-face` rules for the custom fonts used by Discord, so that relevant fonts (gg sans, etc) load
correctly.

If you are using shelter UI within your main page, you should then import and call `injectInternalStyles()`.
This will add a style tag to your page to make the components look correct.
If you want to use toasts, you must call `initToasts(mountPoint)` passing the element where toasts should appear.

If you are using shelter UI within a shadow root or some other isolated context where this won't work, you should import
and render `<InternalStyles />` somewhere within the relevant context.

APIs that are only available in shelter will have this badge next to them in these
docs: <Pill col="shelter">shelter only</Pill>,
and the APIs only available standalone will have this one: <Pill col="red">standalone only</Pill>

They are also listed here:

shelter-only:
 - `ReactInSolidBridge`
 - `renderSolidInReact`

standalone-only:
 - `cleanupCss`
 - `initToasts`
 - `injectInternalStyles`
 - `InternalStyles`

## Accessibility

All efforts are taken to support users of
[accessibility technologies](https://developer.mozilla.org/en-US/docs/Web/Accessibility),
including screen readers and keyboard navigation.

This entails a few blanket behaviours across shelter-ui:
- All interactive elements (button, link, switch, etc.) have a [focus ring](#use-focusring)
- All interactive elements take an `aria-label` prop to override the default label
  * Labels are usually sensibly picked, eg the button and switchitem children prop
- Relevant interactive elements (checkboxes, switches, textboxes) take an id prop to use with a `<label>`.


## Components

### `<Text>`

::: details Type Signature
```ts
solid.Component<{
  tag?: string,       // default: TextTags.textMD
  weight?: string,    // default: TextWeights.normal
  style?: JSX.CSSProperties,
  class?: string,
  children?: JSX.Element
}>
```
:::

The Text component is used to render styled text that matches Discord's typography. It provides various text styles, sizes, and weights.

The `tag` prop controls the size and style of the text, using values from `TextTags`. If not provided, it defaults to `TextTags.textMD`.

The `weight` prop controls the font weight, using values from `TextWeights`. If not provided, it defaults to `TextWeights.normal`.

```jsx
<Text>Default text</Text>
<Text tag={TextTags.textLG} weight={TextWeights.bold}>Large bold text</Text>
<Text tag={TextTags.displayMD}>Medium display title</Text>
```

<ShelterDemo demo="text-variants" />

#### `TextTags`

Type: `Record<string, string>`

- `TextTags.textXXS`: Tiny text (10px)
- `TextTags.textXS`: Extra small text (12px)
- `TextTags.textSM`: Small text (14px)
- `TextTags.textMD`: Medium text (16px, default)
- `TextTags.textLG`: Large text (20px)
- `TextTags.messagePreview`: Message preview text (15px)
- `TextTags.channelTitle`: Channel title text (16px)
- `TextTags.displaySM`: Small display text (20px, bold)
- `TextTags.displayMD`: Medium display text (34px, bold)
- `TextTags.displayLG`: Large display text (44px, bold)

#### `TextWeights`

Type: `Record<string, string>`

- `TextWeights.normal`: Normal weight (400)
- `TextWeights.medium`: Medium weight (500)
- `TextWeights.semibold`: Semi-bold weight (600)
- `TextWeights.bold`: Bold weight (700)
- `TextWeights.extrabold`: Extra bold weight (800)

<ShelterDemo demo="text-weights" />

### `<Header>`

::: details Type Signature
```ts
solid.Component<{
  tag: string,
  weight?: string,
  margin?: boolean,
  children: JSX.Element,
  class?: string,
  id?: string
}>
```
:::

Header is, well, a header. It has a few styles, chosen by the `tag` prop.

The `weight` prop allows overriding the font weight using values from `HeaderWeights`.

The `margin` prop controls whether to include bottom margin (defaults to `true`).

```jsx
<Header tag={HeaderTags.HeadingXXL}>My cool page</Header>
```

<ShelterDemo demo="headers" />

#### `HeaderTags`

- `HeaderTags.HeadingXXL`: A nice big header - like the ones at the top of user settings sections.
- `HeaderTags.HeadingXL`: A slightly smaller header.
- `HeaderTags.HeadingLG`: A smaller again header - like "Gifts you purchased" in settings.
- `HeaderTags.HeadingMD`: Smaller again.
- `HeaderTags.HeadingSM`: Small.

Legacy aliases (for backwards compatibility):
- `HeaderTags.H1` → `HeaderTags.HeadingXXL`
- `HeaderTags.H2` → `HeaderTags.HeadingXL`
- `HeaderTags.H3` → `HeaderTags.HeadingLG`
- `HeaderTags.H4` → `HeaderTags.HeadingMD`
- `HeaderTags.H5` → `HeaderTags.HeadingSM`
- `HeaderTags.EYEBROW`: A descriptive keyword or phrase placed above the main headline.

#### `HeaderWeights`

- `HeaderWeights.normal`: Normal weight (400)
- `HeaderWeights.medium`: Medium weight (500)
- `HeaderWeights.semibold`: Semi-bold weight (600, default)
- `HeaderWeights.bold`: Bold weight (700)
- `HeaderWeights.extrabold`: Extra bold weight (800)

### `<Divider />`

::: details Type Signature
```ts
solid.Component<{ mt?: true | string, mb?: true | string }>
```
:::

Divider renders a grey horizontal divider line.

The `mt` and `mb` props control the top and bottom margin.

By default, there are no margins.
When a string is provided, that is the margin value.
When set true, `20px` is used.

```jsx
<Divider mt mb="30px" /> // 20px on top, 30px on bottom.
```

<ShelterDemo demo="divider" />

### `<Button>`

::: details Type Signature
```ts
solid.Component<{
  look?: string,       // default ButtonLooks.FILLED
  color?: string,      // default ButtonColors.PRIMARY
  size?: ButtonSize,   // default ButtonSizes.SMALL
  grow?: boolean,      // default false, adds width: auto
  disabled?: boolean,
  type?: "button" | "reset" | "submit",
  style?: JSX.CSSProperties,
  class?: string,
  onClick?(): void,
  onDblClick?(): void,
  children?: JSX.Element,
  tooltip?: JSX.Element
}>
```
:::

Button is a, well, button, using Discord's styles.

<ShelterDemo demo="button-colors" />

<ShelterDemo demo="button-sizes" margin="1.5rem" />

#### `ButtonColors`

Type: `Record<string, string>`

Current colors:
- `ButtonColors.PRIMARY`: Brand primary button
- `ButtonColors.SECONDARY`: Gray background
- `ButtonColors.CRITICAL_PRIMARY`: Red/danger filled button
- `ButtonColors.CRITICAL_SECONDARY`: Red/danger secondary button
- `ButtonColors.ACTIVE`: Green/success button
- `ButtonColors.OVERLAY_PRIMARY`: White button
- `ButtonColors.OVERLAY_SECONDARY`: Dark button

Legacy aliases (for backwards compatibility):
- `ButtonColors.BRAND` → `PRIMARY`
- `ButtonColors.RED` → `CRITICAL_PRIMARY`
- `ButtonColors.GREEN` → `ACTIVE`
- `ButtonColors.LINK` → `PRIMARY`
- `ButtonColors.WHITE` → `OVERLAY_PRIMARY`
- `ButtonColors.BLACK` → `OVERLAY_SECONDARY`
- `ButtonColors.TRANSPARENT` → `SECONDARY`

#### `ButtonSizes`

Type: `Record<string, ButtonSize>`

- `ButtonSizes.NONE`: does not attempt to set sizing on the button
- `ButtonSizes.TINY`: 52x24
- `ButtonSizes.SMALL`: 60x32
- `ButtonSizes.MEDIUM`: 96x38
- `ButtonSizes.LARGE`: 130x44
- `ButtonSizes.XLARGE`: 148x50, increases font size & padding
- `ButtonSizes.MIN`: as small as the content allows, increases padding, `display: inline`
- `ButtonSizes.MAX`: as large as the container allows, increases font size
- `ButtonSizes.ICON`: unset width, as high as the container allows, increases padding

#### `ButtonLooks`

Type: `Record<string, string>`

- `ButtonLooks.FILLED`: the standard Discord button (all other looks are aliased to this in the current design system)

::: info
In Discord's 2025 visual refresh (Mana design system), `INVERTED`, `OUTLINED`, and `LINK` looks no longer exist as separate styles. They are aliased to `FILLED` for backwards compatibility.
:::

### `<LinkButton>`

::: details Type Signature
```ts
solid.Component<{
  style?: JSX.CSSProperties,
  class?: string,
  href?: string,
  target?: string,
  "aria-label"?: string,
  tooltip?: JSX.Element,
  children?: JSX.Element
}>
```
:::

A link (`<a>`) that fits with Discord's UI.

It will open the href in a new tab / in your system browser by default.

<ShelterDemo demo="link-button" />

### `<Switch />`

::: details Type Signature
```ts
solid.Component<{
  id?: string,
  checked?: boolean,
  disabled?: boolean,
  onChange?(boolean): void,
  tooltip?: JSX.Element,
  "aria-label"?: string
}>
```
:::

A toggle switch.

The `id` prop sets the id of the `<input>`.

`checked`, `disabled`, `onChange` should be pretty self-explanatory.

`tooltip`, if set, adds a tooltip.

```jsx
const [switchState, setSwitchState] = createSignal(false);
<Switch checked={switchState()} onChange={setSwitchState} />;
```

<ShelterDemo demo="switch" />

### `<SwitchItem>`

::: details Type Signature
```ts
solid.Component<{
  checked: boolean,
  disabled?: boolean,
  onChange?(boolean): void,
  children: JSX.Element,
  note?: JSX.Element,
  hideBorder?: boolean,
  tooltip?: JSX.Element,
  "aria-label"?: string
}>
```
:::

An item with an option name, a switch, and optionally some extra info.

`checked` sets the value of the switch, `disabled` and `onChange` work as you'd expect.

`note`, if passed, sets the extra info to be displayed under the title and switch.

Unless `hideBorder` is set, a `<Divider />` is rendered under the component.

The child elements of the component is the title displayed next to the switch.

`tooltip`, if set, adds a tooltip.

```jsx
<SwitchItem note="Does cool things" checked={/*...*/}>A cool option</SwitchItem>
```

<ShelterDemo demo="switch-item" />

### `<Checkbox />`

::: details Type Signature
```ts
solid.Component<{
  id?: string,
  checked?: boolean,
  disabled?: boolean,
  onChange?(boolean): void,
  tooltip?: JSX.Element,
  "aria-label"?: string
}>
```
:::

Like `<Switch />` but its a checkbox.

<ShelterDemo demo="checkbox" />

### `<CheckboxItem>`

::: details Type Signature
```ts
solid.Component<{
  checked: boolean,
  disabled?: boolean,
  onChange?(boolean): void,
  children: JSX.Element,
  mt?: boolean,
  tooltip?: JSX.Element,
  "aria-label"?: string
}>
```
:::

Like `<SwitchItem>` but its a checkbox.
Takes an extra `mt` prop which enables a top margin. No note or divider.

<ShelterDemo demo="checkbox-item" />

### `<TextBox />`

::: details Type Signature
```ts
solid.Component<{
  value?: string,
  placeholder?: string,
  maxlength?: number,
  id?: string,
  "aria-label"?: string,
  onInput?(string): void
}>
```
:::

A discord style textbox.

Takes value, placeholder, maxlength, and onInput.

All optional. onInput called every keystroke and passed the full current value.

<ShelterDemo demo="textbox" />

### `<TextArea />`

::: details Type Signature
```ts
solid.Component<{
  value?: string,
  placeholder?: string,
  maxlength?: number,
  id?: string,
  "aria-label"?: string,
  onInput?(string): void,
  "resize-x"?: boolean,
  "resize-y"?: boolean,
  mono?: boolean,
  counter?: boolean
}>
```
:::

Like `<TextBox />` but its a textarea.

User resizing can be toggled with `resize-x` and `resize-y`, and you can apply a monospace font with `mono`.

The `counter` prop shows a character counter.

<ShelterDemo demo="textarea" />

### `<Slider />`

::: details Type Signature
```ts
solid.Component<{
  min: number,
  max: number,
  tick?: boolean | number,
  step?: number | "any",
  class?: string,
  style?: JSX.CSSProperties,
  onInput?(number): void,
  value?: number
}>
```
:::

A discord-style slider.
Takes `value` and returns in `onInput` as number,

Set `min` and `max` as needed.

`step` controls the size of the actual steps the slider is locked to.

`tick` controls the spacing between ticks to show. This must be an even divisor of (min - max), but plans are to fix this
in the future.

If `tick` is not passed, no ticks show.

`step` is any by default.

```jsx
<Slider value={val()} onInput={setVal}
        min={0} max={10}
        step={2} tick
/>
```

<ShelterDemo demo="slider" />

## Modals

Components for Discord-styled modals.
Also see [`openModal()`](#openmodal)

```jsx
<ModalRoot size={ModalSizes.SMALL}>
  <ModalHeader close={closeFn}>My cool modal</ModalHeader>
  <ModalBody>Look mom! I'm on the shelter-ui modal!</ModalBody>
  <ModalFooter>Uhhhhh idk this is the footer ig, its a good place for buttons!</ModalFooter>
</ModalRoot>
```

### `<ModalRoot>`

::: details Type Signature
```ts
solid.Component<{
  size?: string,
  children?: JSX.Element,
  class?: string,
  style?: JSX.CSSProperties | string
}>
```
:::

The root component of a discord-styled modal.

Takes a `size` from `ModalSizes` and some child elements.

`size` defaults to `ModalSizes.SMALL`.

All provided child parts of the modal (header, body, footer) are optional.

#### `ModalSizes`

Type: `Record<string, string>`

- `ModalSizes.SMALL`: 442px wide
- `ModalSizes.MEDIUM`: 602px wide
- `ModalSizes.LARGE`: 800px wide
- `ModalSizes.DYNAMIC`: Fits content

### `<ModalHeader>`

Type: `solid.Component<{ noClose?: boolean, close(): void, children?: JSX.Element }>`

The header of a discord-styled modal.

Takes a prop, `close`, which is the function that closes the modal.

Also has an optional boolean prop `noClose` which hides the close button.

### `<ModalBody>`

Type: `solid.Component<{ children?: JSX.Element }>`

The body of a discord-styled modal.

Has nice discord scrollbars and plays well with the header and footer when overflowed.

### `<ModalFooter>`

Type: `solid.Component<{ children: JSX.Element }>`

The footer of a Discord-styled modal, good for buttons!

### `<ModalConfirmFooter />`

::: details Type Signature
```ts
solid.Component<{
  close(): void,
  confirmText?: string,                    // default "Confirm"
  cancelText?: string,                     // default "Cancel"
  type?: "neutral" | "danger" | "confirm", // default "confirm"
  onConfirm?(): void,
  onCancel?(): void,
  disabled?: boolean,
  cancelDisabled?: boolean
}>
```
:::

A modal footer with configurable confirm and cancel buttons, the most common type of modal footer.

The `type` prop controls the colour of the confirm button.

The `disabled` prop affects the confirm button, and the `cancelDisabled` prop affects the cancel button.

<ShelterDemo demo="confirm-footer" />


## Utils

Not components, but UI utils used in shelter.

### `<ReactiveRoot>`

::: details Type Signature
```ts
solid.Component<{ children: JSX.Element }>
```
:::

`ReactiveRoot` creates a solid reactive root, to ensure that `onCleanup` works, and fix some reactivity bugs.

```jsx
elem.append(<ReactiveRoot>{/* ... */}</ReactiveRoot>);
```

You won't always need it - for example inside of shelter settings and modals you won't need one, and if your elements
do not have any lifecycle they might be fine,
but if you're inserting solid elements directly into the document, and reactivity is being weird, wrap your inserted
elements in one of these.

### `createPersistenceHelper`

::: details Type Signature
```ts
<T>(inject: (PersistenceHelper: solid.Component) => T): () => T
```
:::

`createPersistenceHelper` helps you take advantage of the [cleanup reinsertion](/guides/patterns#cleanup-reinsertion)
pattern, by giving you a `<PersistenceHelper />` component that you can place into the document as many times as you
like, that will cause `inject` to be re-run if it gets removed.

The example from the patterns page would look like this:

```jsx
function MyComponent() {
  // ReactiveRoot optional but recommended if you
  // encounter any weird reactivity issues without it
  return (
    <ReactiveRoot>
      <h1>My Header</h1>
    </ReactiveRoot>
  )
}

const insertComponent = createPersistenceHelper((PersistenceHelper) => {
  // see warning below
  if (!isPluginEnabled) return;

  const parent = document.querySelector(`[class*="whatever"]`)
  parent?.append(<PersistenceHelper />, <MyComponent />)
  // you should still probably handle the case where `parent` is missing...
});
```

### `injectCss`

::: details Type Signature
```ts
(string, Node?) => (string?) => void
```
:::

`injectCss`, as the name says, injects CSS.

It returns a callback which, if passed another string, changes the injected CSS.
If this callback is passed `undefined`, the CSS is removed from the page.
At this point, you cannot pass another string into this callback to re-add some styles.

```js
const modify = injectCss(" .myClass { color: red } ");
modify(" .myClass { color: green } "); // modifies the css
modify(); // removes the css
modify(" .myClass { color: blue } "); // no-op
```

### `genId`

::: details Type Signature
```ts
() => string
```
:::

`genId` generates a random ID.

This is useful in cases where you need to link elements together by ID,
but don't actually need a meaningful ID.

```jsx
export default () => {
  const id = genId();

  return (
    <>
      <label for={id}>A useful input</label>
      <input id={id} />
    </>
  );
};
```

<ShelterDemo demo="gen-id" />

### `openModal`

::: details Type Signature
```ts
(
  (() => void) => JSX.Element
) => () => void
```
:::

`openModal` opens the given component in a fullscreen popup modal.

It passes your component one prop, `close`, which is a function that closes the modal.

It returns a function that removes your modal.

You can open multiple modals, and focus trapping as well as clicking outside to close are automatic.

```js
const remove = openModal((p) => <button onclick={p.close}>Hi!</button>);
remove();
```

::: tip
You can use the [modal components](#modal-components) to style your modals like Discord easily.
:::

::: tip
You can listen for your modal being closed using [onCleanup](https://www.solidjs.com/tutorial/lifecycles_oncleanup).
:::

<ShelterDemo demo="open-modal" />

### `openConfirmationModal`

::: details Type Signature
```ts
({
  body: solid.Component,
  header: solid.Component,
  confirmText?: string,
  cancelText?: string,
  type?: ModalTypes,
  size?: string,
}) => Promise<void>
```
:::

`openConfirmationModal` shows a premade modal with a header, body, and confirm and cancel buttons.

It returns a promise that resolves on confirm, and rejects on cancel or close.

```js
openConfirmationModal({
  header: () => "Are you sure????",
  body: () => "Really destroy your entire hard disk? You sure? What?",
  type: "danger",
  confirmText: "Yes, really.",
  cancelText: "Oh shoot!"
}).then(
  () => console.log("let's delete!"),
  () => console.log("chicken.")
);
```

<ShelterDemo demo="confirmation-modal" />

### `showToast`

::: details Type Signature
```ts
({
  title?: string,
  content?: string,
  color?: string,
  onClick?(): void,
  class?: string,
  duration?: number
}) => () => void
```
:::

Shows a toast notification.
Returns a function to remove it instantly.

The default duration is `3000`.

The `color` prop accepts values from `ToastColors`:
- `ToastColors.INFO` - Blue info style (default)
- `ToastColors.SUCCESS` - Green success style
- `ToastColors.WARNING` - Orange warning style
- `ToastColors.CRITICAL` - Red critical/error style

```js
// all of these props are optional
showToast({
  title: "title!",
  content: "a cool toast",
  color: ToastColors.SUCCESS,
  onClick() {},
  class: "my-cool-toast",
  duration: 3000,
});
```

<ShelterDemo demo="toast" />

### `niceScrollbarsClass`

::: details Type Signature
```ts
() => string
```
:::

A getter that gets a class to add to an element to give it a Discord-style scrollbar.

```jsx
<div class={`myclass myclass2 ${niceScrollbarsClass()}`} />
```

<ShelterDemo demo="scrollbar" />

### `use:focusring`

Adds a visible ring around your element when focused via keyboard (tab key),
to aid with accessibility.

Optionally takes a border radius.

`focusring` must be in scope, either via an import from shelter-ui,
or otherwise (e.g. `const { focusring } = shelter.ui`).

::: warning
Be careful - some tooling incorrectly tree shakes this if imported using ESM.
You can use `false && focusring` to prevent the tree shaking (it will be minified away).
If getting via destructuring in shelter, you should be fine.
:::

The focusring is included for you on interactive shelter-ui components,
so if you are using those, this is not necessary.

```jsx
<button use:focusring>do a thing</button>
<input use:focusring={6} type="checkbox" />
```

<ShelterDemo demo="focusring" />

### `use:tooltip`

Shows a Discord-style tooltip when you hover over the element.

Same scope rules apply as focusring.

You can pass any JSX element type, including strings and elements.

If you pass undefined, it will do nothing.

You can pass an array of the form `[true, JSX.Element]` to render it underneath instead of on top of the element.

```jsx
<button use:tooltip="Delete"><DeleteIcon /></button>
<button use:tooltip={[true, "Delete but underneath"]}><DeleteIcon /></button>
```

<ShelterDemo demo="tooltip" />

### `<ErrorBoundary />`

::: details Type Signature
```ts
solid.Component<{ children: JSX.Element }>
```
:::

Safely catches any errors that occur during rendering, displays the error, and has a button to retry.

<ShelterDemo demo="error-boundary" />

### `<Space />`

::: details Type Signature
```ts
solid.Component
```
:::

A spacebar character that will never be collapsed out of your JSX. Useful in flexboxes etc.


### `<ReactInSolidBridge />` <Pill col="shelter">shelter only</Pill>

::: details Type Signature
```ts
solid.Component<{ comp: React.ComponentType<TProps>, props: TProps }>
```
:::

Renders a React component in Solid. Prop updates cause rerenders as expected.

```jsx
const ComponentFromDiscord = webpack.findByProps("...").default;

<ReactInSolidBridge comp={ComponentFromDiscord} props={{ className: "reactelem", tag: "H1" }} />;
```

### `renderSolidInReact` <Pill col="shelter">shelter only</Pill>

::: details Type Signature
```ts
(solid.Component<TProps>, TProps) => React.ElementType
````
:::

Renders a Solid component in React. This component will *never* be rerendered by React,
however prop or component updates passed in from the React host will be applied to the Solid child via reactivity.

```jsx
function MyCoolComponent(props) {
  const [count, setCount] = solid.createSignal(0);
  return <button class={props.className} onClick={() => setCount(count() + 1)}>yep {count()}</button>;
}

// Get a Discord component using React fiber or something

component.render = () => renderSolidInReact(MyCoolComponent, { className: "solidelem" });
```

::: warning
Previously, a React component called `SolidInReactBridge` was exposed. This has been removed from the shelter-ui API.
Use this function instead.
:::

### `injectInternalStyles` <Pill col="red">standalone only</Pill>

::: details Type Signature
```ts
() => void
```
:::

Inserts internal shelter-ui styles onto the page. If you are not using shelter and do not call this,
components will be unstyled.

Only call this once.

You should use `injectInternalStyles()` if you are using shelter-ui in the main document, and you should inject
`<InternalStyles />` in style-isolated contexts like Shadow DOMs.


### `InternalStyles` <Pill col="red">standalone only</Pill>

::: details Type Signature
```ts
solid.Component<{}>
```
:::

Internal shelter-ui styles as a `<style>`. If you are not using shelter and do not use this,
components will be unstyled.

You should use `injectInternalStyles()` if you are using shelter-ui in the main document, and you should inject
`<InternalStyles />` (this component) in style-isolated contexts like Shadow DOMs.

### `initToasts` <Pill col="red">standalone only</Pill>

::: details Type Signature
```ts
(mountPoint: HTMLElement) => () => void
```
:::

Sets up necessary things for toasts to work. You must call this if you are using toasts and are not using shelter.

Pass the element where toasts should be mounted. Returns a cleanup function.

### `cleanupCss` <Pill col="red">standalone only</Pill>

::: details Type Signature
```ts
() => void
```
:::

Removes all injected css.
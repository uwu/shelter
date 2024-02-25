---
outline: [2, 3]
---

<script setup>
  import "@uwu/shelter-ui/compat.css";
  import { injectInternalStyles } from "@uwu/shelter-ui";
  injectInternalStyles();

  import Pill from "./components/Pill.vue";

  import ButtonDemo from "./components/shelter-ui-demos/ButtonDemo.vue";
  import HeaderDemo from "./components/shelter-ui-demos/HeaderDemo.vue";
  import SwitchDemo from "./components/shelter-ui-demos/SwitchDemo.vue";
  import SwitchItemDemo from "./components/shelter-ui-demos/SwitchItemDemo.vue"
</script>

# shelter UI Documentation

shelter UI is a set of UI components designed to look identical to Discord's, built entirely in Solid.

The API signatures are _not_ identical to Discord's React components.

If you are using shelter, these are exposed to you on `shelter.ui`, and if not, you can get it at
[`@uwu/shelter-ui`](https://npm.im/@uwu/shelter-ui), and please read the [relevant docs](#standalone-usage).

## Accessibility

All efforts are taken to support users of
[accessibility technologies](https://developer.mozilla.org/en-US/docs/Web/Accessibility),
including screen readers and keyboard navigation.

This entails a few blanket behaviours across shelter-ui:
- All interactive elements (button, link, switch, etc.) have a [focus ring](#use-focusring)
- All interactive elements take an `aria-label` prop to override the default label
  * Labels are usually sensibly picked, eg the button and switchitem children prop
- Relevant interactive elements (checkboxes, switches, textboxes) take an id prop to use with a `<label>`.

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

### `cleanupCss`

<Pill col="red">standalone only</Pill>

::: details Type Signature
```ts
() => void
```
:::

Removes all injected css.

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
const remove = openModal((p) => <button onclick={p}>Hi!</button>);
remove();
```

::: tip
You can use the [modal components](#modal-components) to style your modals like Discord easily.
:::

::: tip
You can listen for your modal being closed using [onCleanup](https://www.solidjs.com/tutorial/lifecycles_oncleanup).
:::

<video src="/ui/openModal.webm" loop autoplay controls></video>

### `<ReactInSolidBridge />`

<Pill col="shelter">shelter only</Pill>

::: details Type Signature
```ts
solid.Component<{ comp: React.ComponentType<TProps>, props: TProps }>
```
:::

Renders a React component in Solid.

```jsx
const ComponentFromDiscord = webpack.findByProps("...").default;

<ReactInSolidBridge comp={ComponentFromDiscord} props={{ className: "reactelem", tag: "H1" }} />;
```

### `SolidInReactBridge`

<Pill col="shelter">shelter only</Pill>

::: details Type Signature
```ts
React.ComponentType<{ comp: solid.Component<TProps>, props: TProps }>
```
:::

Renders a Solid component in React.
Using this directly is not recommended as you will need to provide your own React instance.

```jsx
function SolidCounter(props) {
  const [count, setCount] = solid.createSignal(0);
  return <button class={props.className} onClick={() => setCount(count() + 1)}>yep {count()}</button>;
}

React.createElement(SolidInReactBridge, {
  comp: SolidCounter,
  props: {className: "solidelem"},
});
// if you were using React JSX: <SolidInReactBridge comp={SolidCounter} props={{className: "solidelem"}} />
```

### `renderSolidInReact`

<Pill col="shelter">shelter only</Pill>

::: details Type Signature
```ts
(solid.Component<TProps>, TProps) => React.ElementType
````
:::

Just a wrapper to `React.createElement(SolidInReactBridge, {comp, props})`

```jsx
function Component(props) {
  const [count, setCount] = solid.createSignal(0);
  return <button class={props.className} onClick={() => setCount(count() + 1)}>yep {count()}</button>;
}

// Get a Discord component using React fiber or something

component.render = () => renderSolidInReact(Component, { className: "solidelem" });
```

### `<ErrorBoundary />`

::: details Type Signature
```ts
solid.Component<{ children: JSX.Element }>
```
:::

Safely catches any errors that occur during rendering, displays the error, and has a button to retry.

### `showToast`

::: details Type Signature
```ts
({
  title?: string,
  content?: string,
  onClick?(): void,
  class?: string,
  duration?: number
}) => () => void
```
:::

Shows a toast notification.
Returns a function to remove it instantly.

The default duration is `3000`.

```js
// all of these props are optional
showToast({
  title: "title!",
  content: "a cool toast",
  onClick() {},
  class: "my-cool-toast",
  duration: 3000,
});
```

![](/ui/showToast.webp)

### `initToasts`

<Pill col="red">standalone only</Pill>

::: details Type Signature
```ts
() => void
```
:::

Sets up necessary things for toasts to work. You must call this if you are using toasts and are not using shelter.

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

![](/ui/niceScrollbarsClass.webp)

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

![](/ui/focusring.webp)

### `use:tooltip`

Shows a Discord-style tooltip when you hover over the element.

Same scope rules apply as focusring.

You can pass any JSX element type, including strings and elements.

If you pass undefined, it will do nothing.

You can pass an of the form `[true, JSX.Element]` to render it underneath instead of on top of the element.

```jsx
<button use:tooltip="Delete"><DeleteIcon /></button>
<button use:tooltip={[true, "Delete but underneath"]}><DeleteIcon /></button>
```

![](/ui/tooltip.webp)

### `<Space />`

::: details Type Signature
```ts
solid.Component
```
:::

A spacebar character that will never be collapsed out of your JSX. Useful in flexboxes etc.

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

![](/ui/confirmmodal.webp)

## Components

### `<Text>`

::: details Type Signature
```ts
solid.Component<{ children: JSX.Element }>
```
:::

Text just renders some text, _using Discord's current text colour_, instead of just black or whatever.

```jsx
<Text>This is some text</Text>
```

### `<Header>`

::: details Type Signature
```ts
solid.Component<{
  tag: string,
  children: JSX.Element,
  class?: string,
  id?: string
}>
```
:::

Header is, well, a header. It has a few styles, chosen by the `tag` prop.

```jsx
<Header tag={HeaderTags.H1}>My cool page</Header>
```

![](/ui/headers.webp)

::: info Demo
<HeaderDemo />
:::

#### `HeaderTags`

- `HeaderTags.H1`: A nice big header - like the ones at the top of user settings sections.
- `HeaderTags.H2`: A slightly smaller header, with allcaps text.
- `HeaderTags.H3`: A smaller again header - like "Gifts you purchased" in settings.
- `HeaderTags.H4`: Smaller again, allcaps text.
- `HeaderTags.H5`: Small, allcaps text, default - like "sms backup authentication" in settings.

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

![](/ui/divider.webp)

### `<Button>`

::: details Type Signature
```ts
solid.Component<{
  look?: string,       // default ButtonLooks.FILLED
  color?: ButtonColor, // default ButtonColors.BRAND
  size?: ButtonSize,   // default ButtonSizes.SMALL
  grow?: boolean,      // default false, adds width: auto
  disabled?: boolean,
  type?: "button" | "reset" | "submit",
  style?: JSX.CSSProperties,
  class?: string,
  onClick?(): void,
  onDoubleClick?(): void,
  children?: JSX.Element
  tooltip?: string
}>
```
:::

Button is a, well, button, using Discord's styles.

![](/ui/buttoncolors.webp)
![](/ui/buttonlooks.webp)
![](/ui/buttonsizes.webp)

::: info Demo
<ButtonDemo />
:::

#### `ButtonLooks`

Type: `Record<string, string>`

- `ButtonLooks.FILLED`: the standard Discord button like you see all over user settings
- `ButtonLooks.INVERTED`: swaps the bg and fg colours
- `ButtonLooks.OUTLINED`: only outline and text is coloured, until hover when bg fills in
- `ButtonLooks.LINK`: removes the background and unsets the colour - looks like text!

#### `ButtonColors`

Type: `Record<string, ButtonColor>`

- `ButtonColors.BRAND`: blurple / primary button
- `ButtonColors.RED`
- `ButtonColors.GREEN`
- `ButtonColors.SECONDARY`: gray background
- `ButtonColors.LINK`: blue like a proper `<a>`-style link.
- `ButtonColors.WHITE`: looks inverted
- `ButtonColors.BLACK`
- `ButtonColors.TRANSPARENT`

#### `ButtonSizes`

Type: `Record<string, ButtonSize>`

- `ButtonSizes.NONE`: does not attempt to set sizing on the button
- `ButtonSizes.TINY`: 53x24
- `ButtonSizes.SMALL`: 50x32
- `ButtonSizes.MEDIUM`: 96x38
- `ButtonSizes.LARGE`: 130x44
- `ButtonSizes.XLARGE`: 148x50, increases font size & padding
- `ButtonSizes.MIN`: as small as the content allows, increases padding, `display: inline`
- `ButtonSizes.MAX`: as large as the container allows, increases font size
- `ButtonSizes.ICON`: unset width, as high as the container allows, increases padding

### `<LinkButton>`

::: details Type Signature
```ts
solid.Component<{
  style?: JSX.CSSProperties,
  class?: string,
  href?: string,
  "aria-label"?: string,
  tooltip?: string,
  children?: JSX.Element
}>
```
:::

A link (`<a>`) that fits with Discord's UI.

It will open the href in a new tab / in your system browser.

![](/ui/linkbutton.webp)

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
<Switch checked={switchState} onChange={setSwitchState} />;
```

::: info Demo
<SwitchDemo />
:::

### `<SwitchItem>`

::: details Type Signature
```ts
solid.Component<{
  value: boolean,
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

`value` sets the value of the switch, `disabled` and `onChange` work as you'd expect.

`note`, if passed, sets the extra info to be displayed under the title and switch.

Unless `hideBorder` is set, a `<Divider />` is rendered under the component.

The child elements of the component is the title displayed next to the switch.

`tooltip`, if set, adds a tooltip.

```jsx
<SwitchItem note="Does cool things" value={/*...*/}>A cool option</SwitchItem>
```

::: info Demo
<SwitchItemDemo />
:::

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

[//]: # (TODO: once the styles are fixed, add an img)

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

[//]: # (TODO: as above)

### Modal Components

Components for Discord-styled modals.
Also see [`openModal()`](#openmodal)

```jsx
<ModalRoot size={ModalSizes.SMALL}>
  <ModalHeader /* noClose */ close={closeFn}>My cool modal</ModalHeader>
  <ModalBody>Look mom! I'm on the shelter-ui modal!</ModalBody>
  <ModalFooter>Uhhhhh idk this is the footer ig, its a good place for buttons!</ModalFooter>
</ModalRoot>
```

![](/ui/modal.webp)

#### `<ModalRoot>`

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

- `ModalSizes.SMALL`: 440 wide, 200~720 tall
- `ModalSizes.MEDIUM`: 600 wide, 400~800 tall

#### `<ModalHeader>`

Type: `solid.Component<{ noClose?: boolean, close(): void, children?: JSX.Element }>`

The header of a discord-styled modal.

Takes a prop, `close`, which is the function that closes the modal.

Also has an optional boolean prop `noClose` which hides the close button.

#### `<ModalBody>`

Type: `solid.Component<{ children?: JSX.Element }>`

The body of a discord-styled modal.

Has nice discord scrollbars and plays well with the header and footer when overflowed.

#### `<ModalFooter>`

Type: `solid.Component<{ children: JSX.Element }>`

The footer of a Discord-styled modal, good for buttons!

#### `<ModalConfirmFooter />`

::: details Type Signature
```ts
solid.Component<{
  close(): void,
  confirmText?: string,                    // default "Confirm"
  cancelText?: string,                     // default "Cancel"
  type?: "neutral" | "danger" | "confirm", // default "neutral"
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

![](/ui/confirmfooter.webp)

### `<TextBox />`

::: details Type Signature
```ts
solid.Component<{
  value?: string,
  placeholder?: string,
  maxLength?: number,
  id?: string,
  "aria-label"?: string,
  onInput?(string): void
}>
```
:::

A discord style textbox.

Takes value, placeholder, maxLength, and onInput.

All optional. onInput called every keystroke and passed the full current value.

![](/ui/textbox.webp)

### `<TextArea />`

::: details Type Signature
```ts
solid.Component<{
  value?: string,
  placeholder?: string,
  maxLength?: number,
  id?: string,
  "aria-label"?: string,
  onInput?(string): void
  width?: string,
  height?: string,
  "resize-x"?: boolean,
  "resize-y"?: boolean,
  mono?: boolean
}>
```
:::

Like `<TextBox />` but its a textarea.

The size can be set, user resizing can be toggled, and you can apply a monospace font.

![](/ui/textarea.webp)

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
<Slider value={val()} onChange={setVal}
        min={0} max={10}
        step={2} tick
/>
```

![](/ui/slider.webp)

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
If you want to use toasts, you must call `initToasts()`.

If you are using shelter UI within a shadow root or some other isolated context where this won't work, you should import
and render `<InternalStyles />` somewhere within the relevant context.

APIs that are only available in shelter will have this badge next to them in these
docs: <Pill col="shelter">shelter only</Pill>,
and the APIs only available standalone will have this one: <Pill col="red">standalone only</Pill>

They are also listed here:

shelter-only:
 - `ReactInSolidBridge`
 - `SolidInReactBridge`
 - `renderSolidInReact`

standalone-only:
 - `cleanupCss`
 - `initToasts`
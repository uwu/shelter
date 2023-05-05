# shelter UI

A set of UI components designed to look identical to Discord's, built entirely in solid.

The API signatures are not identical to Discord's react components.

These components are only expected to work inside Discord.
For use outside of Discord, a solution may or may not be implemented.

## ToC:

- [Utils](#utils)
  - [`<ReactiveRoot>`](#reactiveroot)
  - [`injectCss`](#injectcss)
  - [`genId`](#genid)
  - [`openModal`](#openmodal)
  - [`<ReactInSolidBridge />`](#reactinsolidbridge-)
  - [`SolidInReactBridge`](#solidinreactbridge)
  - [`<ErrorBoundary />`](#errorboundary-)
  - [`niceScrollbarsClass`](#nicescrollbarsclass)
  - [`use:focusring`](#usefocusring)
  - [`use:tooltip`](#usetooltip)
- [Components](#components)
  - [`<Text>`](#text)
  - [`<Header>`](#header)
  - [`<Divider />`](#divider-)
  - [`<Button>`](#button)
  - [`<Switch />`](#switch-)
  - [`<SwitchItem>`](#switchitem)
  - [`<ModalRoot>`](#modalroot)
  - [`<ModalHeader>`](#modalheader)
  - [`<ModalBody>`](#modalbody)
  - [`<ModalFooter>`](#modalfooter)
  - [`<TextBox />`](#textbox-)
  - [`<TextArea />`](#textarea-)
  - [`<Space />`](#space-)

## Accessibility

All efforts are taken to support users of
[accessibility technologies](https://developer.mozilla.org/en-US/docs/Web/Accessibility),
including screen readers and keyboard navigation.

This entails a few blanket behaviours across shelter-ui:
 - All interactive elements (button, link, switch, etc.) have a [focus ring](#usefocusring)
 - All interactive elements take an `aria-label` prop to override the default label
   * Labels are usually sensibly picked, eg the button and switchitem children prop
 - Relevant interactive elements (checkboxes, switches, textboxes) take an id prop to use with a `<label>`.

## Utils

Not components, but UI utils used in shelter.

### `<ReactiveRoot>`

`ReactiveRoot` creates a solid reactive root, to ensure that `onCleanup` works, and fix some reactivity bugs.

```jsx
elem.append(<ReactiveRoot>{/* ... */}</ReactiveRoot>);
```

### `injectCss`

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

`cleanupCss` is also exported, which removes all injected css.

### `genId`

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

`openModal` opens the given component in a fullscreen popup modal.

It passes your component one prop, `close`, which is a function that closes the modal.

It returns a function that removes your modal.

```js
const remove = openModal((p) => <button onclick={p}>Hi!</button>);
remove();
```

### `<ReactInSolidBridge />`

Renders a React component in Solid.

```jsx
// this function comes from discord
function Component({ className }) {
  return React.createElement("div", { className }, "yeah uh its a div");
}

<ReactInSolidBridge comp={Component} props={{ className: "reactelem" }} />;
```

### `SolidInReactBridge`

Renders a Solid component in React.
Using this is not recommended as you will need to provide your own React.

```jsx
function Component(props) {
  return <div class={props.className}>yeah uh its a div</div>;
}

React.createElement(SolidInReactBridge, {
  comp: Component,
  props: { className: "solidelem" },
});
```

### `renderSolidInReact`

Just a wrapper to `React.createElement(SolidInReactBridge, {comp, props})`

```jsx
function Component(props) {
  return <div class={props.className}>yeah uh its a div</div>;
}

// Get a Discord component using React fiber

component.render = () => {
  return renderSolidInReact(Component, { className: "solidelem" });
};
```

### `<ErrorBoundary />`

Safely catches any errors that occur, displays the error, and has a button to retry.

### `showToast`

Shows a toast.

```js
// all of these props are optional!
showToast({
  title: "title!",
  content: "a cool toast",
  onClick() {},
  class: "my-cool-toast",
  duration: 3000,
});
```

### `niceScrollbarsClass`

A getter that gets a class to add to an element to give it a nice scrollbar.

```jsx
<div class={`myclass myclass2 ${niceScrollbarsClass()}`} />
```

### `use:focusring`

Adds a visible ring around your element when focused via keyboard (tab key),
to aid with accessibility.

Optionally takes a border radius.

!!! Be careful - some tooling incorrectly tree shakes this if imported using ESM.
You can use `false && focusring` to prevent the tree shaking (it will be minified away).

The focusring is included for you on interactive shelter-ui components,
so if you are using those this is not necessary.

`focusring` must be in scope, either via an import from shelter-ui,
or otherwise (e.g. `const { focusring } = shelter.ui`).

```jsx
<button use:focusring>do a thing</button>
<input use:focusring={6} type="checkbox" />
```

### `use:tooltip`

Shows a Discord-style tooltip when you hover over the element.

Same scope rules apply as focusring.

You can pass any JSX element type, including strings and elements.

If you pass undefined, it will do nothing.

```jsx
<button use:tooltip="Delete"><DeleteIcon /></button>
```

## Components

### `<Text>`

Text just renders some text, using Discord's current text colour.

```jsx
<Text>This is some text</Text>
```

### `<Header>`

Header is, well, a header. It has three styles, chosen by the `tag` prop.

- **H1**: A nice big header - like the ones at the top of user settings sections.
- **H2**: A slightly smaller header, with allcaps text.
- **H3**: A smaller again header - like "Gifts you purchased" in settings.
- **H4**: Smaller again, allcaps text.
- **H5**: Small, allcaps text, default - like "sms backup authentication" in settings.

```jsx
<Header tag={HeaderTags.H1}>My cool page</Header>
```

### `<Divider />`

Divider renders a grey horizontal divider line.

The `mt` and `mb` props control the top and bottom margin.

By default, there are no margins.
When a string is provided, that is the margin value.
When set true, `20px` is used.

```jsx
<Divider mt mb="30px" />
```

### `<Button>`

Button is a, well, button, using Discord's styles. The props are as follows:

- **look**: A button style from `ButtonLooks` - filled/inverted/outlined - defaults to filled
- **color**: The colour of the button from `ButtonColors` - defaults to brand
- **size**: The size of the button from `ButtonSizes` - defaults to small
- **grow**: When set true, width: auto
- **disabled**: When true, the button cannot be clicked and is greyed out
- **type**: button, reset, submit - defaults to button
- **style**: optionally an object of custom styles to apply
- **class**: optionally some classes to apply
- **onClick**: callback when button is clicked
- **onDoubleClick**: callback when button is double-clicked
- **children**: the button text
- **tooltip**: the tooltip text, if any

### `<LinkButton>`

A link (`<a>`) that fits with Discord's UI.

It will open the href in a new tab / in your system browser.

### `<Switch />`

A toggle switch.

The `id` prop sets the id of the `<input>`.

`checked`, `disabled`, `onChange` should be pretty self-explanatory.

`tooltip`, if set, adds a tooltip.

```jsx
const [switchState, setSwitchState] = createSignal(false);
<Switch checked={switchState} onChange={setSwitchState} />;
```

### `<SwitchItem>`

An item with an option name, a switch, and optionally some extra info.

`value` sets the value of the switch, `disabled` and `onChange` work as you'd expect.

`note`, if passed, sets the extra info to be displayed under the title and switch.

Unless `hideBorder` is set, a `<Divider />` is rendered under the component.

The child elements of the component is the title displayed next to the switch.

`tooltip`, if set, adds a tooltip.

```jsx
<SwitchItem note="Does cool things" value={/*...*/}>A cool option</SwitchItem>
```

### `<Checkbox />`

Like `<Switch />` but its a checkbox.

### `<CheckboxItem>`

Like `<SwitchItem>` but its a checkbox.

### `<ModalRoot>`

The root component of a discord-styled modal.

Takes a `size` from `ModalSizes` and some child elements.

`size` defaults to `ModalSizes.SMALL`.

All provided child parts of the modal (header, body, footer) are optional.

```jsx
<ModalRoot size={ModalSizes.SMALL}>
  <ModalHeader /* noClose */ close={closeFn}>My cool modal</ModalHeader>
  <ModalBody>Look mom! I'm on the shelter-ui modal!</ModalBody>
  <ModalFooter>Uhhhhh idk this is the footer ig, its a good place for buttons!</ModalFooter>
</ModalRoot>
```

### `<ModalHeader>`

The header of a discord-styled modal.

Takes a prop, `close`, which is the function that closes the modal.

Also has an optional boolean prop `noClose` which hides the close button.

### `<ModalBody>`

The body of a discord-styled modal.

Has nice discord scrollbars and plays well with the header and footer when overflowed.

### `<ModalFooter>`

Takes no props.

The footer of a discord-styled-modal, good for buttons!

### `<TextBox />`

A discord style textbox.

Takes value, placeholder, maxLength, and onInput.

All optional. onInput called every keystroke and passed the full current value.

### `<TextArea />`

Like `<TextBox />` but its a textarea.

Also takes width, height, resize-x, resize-y, and mono.

### `<Space />`

A spacebar character that will never be collapsed. Useful in flexboxes etc.

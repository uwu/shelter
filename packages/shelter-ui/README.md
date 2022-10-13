# shelter UI

A set of UI components designed to look identical to Discord's, built entirely in solid.

The API signatures are not identical to Discord's react components.

These components are only expected to work inside Discord.
For use outside of Discord, a solution may or may not be implemented.

## ToC:

- [Utils](#utils)
  - [`withCleanup`](#withcleanup)
  - [`injectCss`](#injectcss)
  - [`genId`](#genid)
- [Components](#components)
  - [`<Text>`](#text)
  - [`<Header>`](#header)
  - [`<Divider />`](#divider-)
  - [`<Button>`](#button)
  - [`<Switch />`](#switch-)
  - [`<SwitchItem>`](#switchitem)

## Utils

Not components, but UI utils used in shelter.

### `withCleanup`

`withCleanup` is a higher-order component that introduces a replacement for solid's onCleanup.

Throughout shelter and shelter-ui, required onCleanup functions must be passed in by the user.
This is because shelter uses components in ways that make solid's onCleanup unable to detect unmounts.

To get around this use this custom implementation:

```jsx
const myComponent = withCleanup((onCleanup, props) => {
  onCleanup(() => console.log("component unmounted from DOM!"));

  return <div>My cool component</div>;
});
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
- **aria-label**: accessibility helper
- **children**: the button text

### `<Switch />`

A toggle switch.

The `id` prop sets the id of the `<input>`.

`checked`, `disabled`, `onChange` should be pretty self-explanatory.

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

```jsx
<SwitchItem note="Does cool things" value={/*...*/}>A cool option</SwitchItem>
```

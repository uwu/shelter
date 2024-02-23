import { createSignal, For, JSX } from "solid-js";

import * as SU from "shelter-ui";
import { focusring, tooltip } from "shelter-ui";

false && focusring;
false && tooltip;

const doToast = () =>
  SU.showToast({
    title: "Hi there!",
    content: "I am a shelter-ui toast!",
  });

function Flex(props: { children: JSX.Element }) {
  return <div style="display: flex; gap: 1rem; flex-wrap: wrap">{props.children}</div>;
}

function Thrower(_props: {}) {
  if (Math.random() > 0.5) throw new Error("whoopsies!");

  return "You got lucky! - reload the page ;)";
}

export default function App() {
  const [toggle, setToggle] = createSignal(false);
  const [slide, setSlide] = createSignal(40);
  const [tbox, setTbox] = createSignal("");

  return (
    <>
      <h1>shelter-ui test outside of Discord.</h1>

      <h2>Toasts 'n' Buttons</h2>
      <h3>ButtonLooks.XXX</h3>
      <Flex>
        <For each={Object.entries(SU.ButtonLooks)}>
          {([name, look]) => (
            <SU.Button look={look} onClick={doToast} grow>
              {name}
            </SU.Button>
          )}
        </For>
      </Flex>

      <h3>ButtonColors.XXX</h3>
      <Flex>
        <For each={Object.entries(SU.ButtonColors)}>
          {([name, color]) => (
            <SU.Button color={color} onClick={doToast} grow>
              {name}
            </SU.Button>
          )}
        </For>
      </Flex>

      <h3>ButtonSizes.XXX</h3>
      <Flex>
        <For each={Object.entries(SU.ButtonSizes).filter(([k]) => !["MIN", "MAX", "ICON"].includes(k))}>
          {([name, size]) => (
            <SU.Button size={size} onClick={doToast}>
              {name}
            </SU.Button>
          )}
        </For>
      </Flex>

      <Flex>
        <div style="resize: both; overflow: scroll; border: 1px solid white; width: 6rem">
          <SU.Button size={SU.ButtonSizes.MIN}>
            <div style="width: 3rem; height: 3rem; resize: both; overflow: hidden; border: 1px solid white">MIN</div>
          </SU.Button>
        </div>

        <div style="resize: both; overflow: scroll; border: 1px solid white; width: 6rem">
          <SU.Button size={SU.ButtonSizes.MAX}>
            <div style="width: 3rem; height: 3rem; resize: both; overflow: hidden; border: 1px solid white">MAX</div>
          </SU.Button>
        </div>
      </Flex>

      <h2>Checkbox</h2>
      <p>on: {toggle() ? "yes" : "no"}</p>
      <SU.Checkbox onChange={setToggle} checked={toggle()} />
      <br />
      <SU.CheckboxItem checked={toggle()} onChange={setToggle}>
        This is a <code>CheckboxItem</code>!
      </SU.CheckboxItem>

      <h2>Error Boundary</h2>
      <p>This houses a component which throws 1/2 of the time</p>
      <SU.ErrorBoundary>
        <Thrower />
      </SU.ErrorBoundary>

      <h2>Focus Ring</h2>
      <button use:focusring>
        This should have a focus ring - focus it <em>with the keyboard</em>
      </button>

      <h2>Tooltip</h2>
      <button use:tooltip={[true, "Bottom tooltip"]}>This button has a bottom tooltip!</button>
      <button use:tooltip="tooltip">This button has a tooltip!</button>

      <h2>Header</h2>
      <For each={Object.entries(SU.HeaderTags)}>
        {([name, tag]) => (
          <>
            <SU.Header tag={tag}>HeaderTags.{name}</SU.Header>
            <SU.Text>Some content</SU.Text>
          </>
        )}
      </For>

      <h2>Icons</h2>
      <Flex>
        <SU.IconAdd />
        <SU.IconCog />
        <SU.IconBin />
        <SU.IconClose />
      </Flex>

      <h2>Modals</h2>
      <button
        onClick={() =>
          SU.openModal((props) => (
            <SU.ModalRoot>
              <SU.ModalHeader close={props.close}>This is a modal!</SU.ModalHeader>
              <SU.ModalBody>This one ain't so big.</SU.ModalBody>
              <SU.ModalFooter>This sure is a footer...</SU.ModalFooter>
            </SU.ModalRoot>
          ))
        }
      >
        open smol modal
      </button>
      <button
        onClick={() =>
          SU.openModal((props) => (
            <SU.ModalRoot>
              <SU.ModalHeader close={props.close}>This is a modal!</SU.ModalHeader>
              <SU.ModalBody>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip
                ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
                fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia
                deserunt mollit anim id est laborum.
                <br />
                <br />
                <br />
                <br />
                <br />
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip
                ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
                fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia
                deserunt mollit anim id est laborum.
                <br />
                <br />
                <br />
                <br />
                <br />
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip
                ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
                fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia
                deserunt mollit anim id est laborum.
              </SU.ModalBody>
              <SU.ModalFooter>This sure is a footer...</SU.ModalFooter>
            </SU.ModalRoot>
          ))
        }
      >
        open big modal
      </button>

      <button
        onclick={() =>
          SU.openConfirmationModal({
            header: () => "Sure?",
            body: () => "This is your last chance...",
            type: "danger",
          })
        }
      >
        open confirmation modal
      </button>

      <h2>Slider</h2>
      <p>value: {slide()}</p>
      <SU.Slider
        min={0}
        max={120}
        step={5}
        steps={[0, 20, 40, 60, 80, 100, 120] as any}
        value={slide()}
        onInput={setSlide}
      />

      <h2>Switch</h2>
      <p>on: {toggle() ? "yes" : "no"}</p>
      <SU.Switch onChange={setToggle} checked={toggle()} />
      <br />
      <SU.SwitchItem value={toggle()} onChange={setToggle} note="This is the note!">
        This is a <code>SwitchItem</code>!
      </SU.SwitchItem>

      <h2>Textbox</h2>
      <p>Value: {tbox()}</p>
      <SU.TextBox value={tbox()} onInput={setTbox} placeholder="text box" />
      <br />
      <br />
      <SU.TextArea value={tbox()} onInput={setTbox} placeholder="text area" resize-x resize-y mono />
    </>
  );
}

<script setup lang="jsx">
import {watchEffect, reactive} from "vue";
import {createSignal} from "solid-js";
import {SwitchItem} from "@uwu/shelter-ui";
import MountBox from "../MountBox.vue";
import Codeblock from "../Codeblock.vue";

// prevent unwrapping refs when passed to codeblock
const ref = (value) => reactive({ value });

const children = ref("Turn the thing on");
const hideBorder = ref(false);
const note = ref("Does cool things");

function comp() {
  const [sigChecked, setSigChecked] = createSignal();
  const [sigChildren, setSigChildren] = createSignal();
  const [sigHideBorder, setSigHideBorder] = createSignal();
  const [sigNote, setSigNote] = createSignal();

  watchEffect(() => {
    setSigChildren(children.value);
    setSigHideBorder(hideBorder.value);
    setSigNote(note.value);
  });

  return <SwitchItem value={sigChecked()}
                     onChange={setSigChecked}
                     note={sigNote()}
                     hideBorder={sigHideBorder()}
  >{sigChildren()}</SwitchItem>;
}
</script>

<template>
  <MountBox :component="comp">
    <Codeblock code="<SwitchItem
  note={`/*$$SHDOCS-1*/`}
  hideBorder={/*$$SHDOCS-2*/}
>
  /*$$SHDOCS-3*/
</SwitchItem>
<p>Some content</p>"
    :enrichments="[
      ['text', note],
      ['select', hideBorder, [false, true], ''],
      ['text', children]
    ]" />
  </MountBox>
</template>

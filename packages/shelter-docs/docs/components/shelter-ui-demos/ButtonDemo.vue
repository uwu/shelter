<script setup lang="jsx">
import MountBox from "../MountBox.vue";
import {Button, ButtonColors, ButtonLooks, ButtonSizes} from "@uwu/shelter-ui";
import {watchEffect, reactive} from "vue";
import {createSignal} from "solid-js";
import Codeblock from "../Codeblock.vue";
import Picker from "../Picker.vue";

// prevent unwrapping refs when passed to codeblock
const ref = (value) => reactive({ value });

const selectedLook = ref("FILLED");
const selectedSize = ref("SMALL");
const selectedGrow = ref(false);
const selectedColor = ref("BRAND");
const content = ref("Hi!");

function comp() {
  const [sigLook, setSigLook] = createSignal();
  const [sigSize, setSigSize] = createSignal();
  const [sigGrow, setSigGrow] = createSignal();
  const [sigColor, setSigColor] = createSignal();
  const [sigContent, setSigContent] = createSignal();

  const [clicks, setClicks] = createSignal(0);

  watchEffect(() => {
    setSigLook(selectedLook.value);
    setSigSize(selectedSize.value);
    setSigGrow(selectedGrow.value);
    setSigColor(selectedColor.value);
    setSigContent(content.value);
  });

  return <>
      <Button
        look={ButtonLooks[sigLook()]}
        size={ButtonSizes[sigSize()]}
        grow={sigGrow()}
        color={ButtonColors[sigColor()]}
        onClick={() => setClicks(clicks() + 1)}
      >{sigContent()}</Button>
      <p>button clicked {clicks()} times!</p>
    </>;
}
</script>

<template>
  <MountBox :component="comp">
    <Codeblock code="const [count, setCount] = createSignal(0);

<Button
  look={/*$$SHDOCS-1*/}
  color={/*$$SHDOCS-2*/}
  size={/*$$SHDOCS-3*/}
  grow={/*$$SHDOCS-4*/}
  onClick={() => setCount(count() + 1)}
>
  /*$$SHDOCS-5*/
</Button>
<p>button clicked {count()} times!</p>"
    :enrichments="[
      ['select', selectedLook, Object.keys(ButtonLooks), 'ButtonLooks.'],
      ['select', selectedColor, Object.keys(ButtonColors), 'ButtonColors.'],
      ['select', selectedSize, Object.keys(ButtonSizes), 'ButtonSizes.'],
      ['select', selectedGrow, [false, true], ''],
      ['text', content]
    ]"/>
  </MountBox>
</template>

<script setup lang="tsx">
import MountBox from "./MountBox.vue";
import Picker from "./Picker.vue";
import {Button, ButtonColors, ButtonLooks, ButtonSizes} from "@uwu/shelter-ui";
import {ref, watchEffect} from "vue";
import {createSignal} from "solid-js";

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
    <pre class="shui-code"><code>const [count, setCount] = createSignal(0);

&lt;Button
  look={<Picker :options="Object.keys(ButtonLooks)" prefix="ButtonLooks." v-model="selectedLook" />}
  color={<Picker :options="Object.keys(ButtonColors)" prefix="ButtonColors." v-model="selectedColor" />}
  size={<Picker :options="Object.keys(ButtonSizes)" prefix="ButtonSizes." v-model="selectedSize" />}
  grow={<Picker :options="[false, true]" prefix="" v-model="selectedGrow" />}
  onClick={() => setCount(count() + 1)}
>
  <input v-model="content" style="background: rgb(43, 42, 51)" />
&lt;/Button>
&lt;p>button clicked {count()} times!&lt;/p></code></pre>
  </MountBox>
</template>

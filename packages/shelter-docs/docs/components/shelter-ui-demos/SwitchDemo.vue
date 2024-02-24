<script setup lang="jsx">
import {createSignal, onCleanup} from "solid-js";
import {Switch} from "@uwu/shelter-ui";
import MountBox from "../MountBox.vue";

function comp() {
  const [sig, setSig] = createSignal(false);

  const intcode = setInterval(() => setSig(v => !v), 3000);
  onCleanup(() => clearInterval(intcode))

  return <Switch checked={sig()} onChange={setSig} />;
}
</script>

<template>
  <MountBox :component="comp" />
</template>

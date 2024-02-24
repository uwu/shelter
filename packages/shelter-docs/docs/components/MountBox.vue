<script setup lang="ts">
import {defineProps, onMounted, ref} from "vue";
import {JSX} from "solid-js";
import h from "solid-js/h";
import {render} from "solid-js/web";
import {InternalStyles} from "@uwu/shelter-ui"
// @ts-expect-error vite feature
import compatCss from "@uwu/shelter-ui/compat.css?inline";

const props = defineProps<{
  component: () => JSX.Element;
  noisolate?: boolean;
}>();

const divref = ref<HTMLDivElement>(null);
onMounted(() => {
  const root = !props.noisolate ? divref.value.attachShadow({mode: "open"}) : divref.value;

  render(() => [
    h(props.component)(),
    !props.noisolate ? [
      h(InternalStyles)(),
      h("style", {}, compatCss)()
    ] : undefined
  ], root);
});

</script>

<template>
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: .75rem">
    <div v-if="$slots.default">
      <slot />
    </div>
    <div style="background: var(--background-primary); color: var(--text-normal); font-family: var(--font-primary); margin: .5rem 0; padding: 1rem; border-radius: 8px">
      <div ref="divref" />
    </div>
  </div>
</template>
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
  <div class="grid grid-cols-[1fr_1fr] gap-3">
    <div v-if="$slots.default">
      <slot />
    </div>
    <div class="my-2 p-4 rounded-8px bg-[var(--background-primary)] text-[var(--text-normal)] font-[var(--font-primary)]">
      <div ref="divref" />
    </div>
  </div>
</template>
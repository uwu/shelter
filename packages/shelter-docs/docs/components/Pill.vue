<script setup lang="ts">
import {computed} from "vue";

const props = defineProps<{ col: "red" | "green" | "blue" }>();

const colour = computed(
  () => ({
    red: "lch(34.44% 60.47 31.97)",
    green: "lch(34.44% 60.47 131.97)",
    blue: "lch(34.44% 60.47 231.97)",
    shelter: "-webkit-linear-gradient(-90deg, #2a3b4b, #2a7267)",
  }[props.col ?? "blue"])
);
</script>

<template>
  <div class="inline-block text-sm px-1.5 pb-0.5 rounded-9999" :style="{background: colour, /*'--content': `'${$slots.default()[0].children}'`*/}">
    <slot />
  </div>
</template>

<!--
<style scoped>
  div::after {
    content: var(&#45;&#45;content);
  }
</style>-->

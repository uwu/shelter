<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{ col: "red" | "green" | "blue" | "shelter" }>();

const colour = computed(
  () =>
    ({
      red: "lch(34.44% 60.47 31.97)",
      green: "lch(34.44% 60.47 131.97)",
      blue: "lch(34.44% 60.47 231.97)",
      shelter: "-webkit-linear-gradient(-90deg, #2a3b4b, #2a7267)",
    })[props.col ?? "blue"],
);
</script>

<template>
  <div class="inline-block text-sm mx-2 px-2.5 py-1 font-semibold rounded-full" :style="{ background: colour }">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted, computed } from "vue";

const props = defineProps<{
  demo: string;
  margin?: string;
}>();

const containerRef = ref<HTMLElement | null>(null);
let dispose: (() => void) | null = null;

const containerStyle = computed(() => ({
  padding: "1rem",
  marginTop: props.margin ?? "0px",
  borderRadius: "8px",
  backgroundColor: "var(--background-surface-high)",
  border: "1px solid var(--border-subtle)",
}));

watch(containerRef, async (el) => {
  if (!el) return;

  const { renderDemo } = await import("./demos");
  dispose = renderDemo(props.demo, el);
});

onUnmounted(() => {
  if (dispose) dispose();
});
</script>

<template>
  <ClientOnly>
    <div ref="containerRef" :style="containerStyle" class="shelter-demo"></div>
  </ClientOnly>
</template>

<style id="#shltr-styles">
@import "@uwu/shelter-ui/compat.css";
</style>

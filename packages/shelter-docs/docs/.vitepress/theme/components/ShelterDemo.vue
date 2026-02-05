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

  // Dynamically import the pre-built demos bundle
  const { mountDemo } = await import("../../../../demos/dist/demos.js");
  dispose = mountDemo(props.demo, el);
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

<style>
@import "@uwu/shelter-ui/compat.css";
.shltr-modal-rroot {
  color: var(--text-default);
  font-family: var(--font-primary);
}
</style>

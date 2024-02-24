<script setup lang="ts">
import {defineProps, onMounted, ref} from "vue";
import {JSX} from "solid-js";
import {render} from "solid-js/web";

const props = defineProps<{
  component: () => JSX.Element;
}>();

const divref = ref(null);
onMounted(() => {
  render(props.component, divref.value);
});

</script>

<template>
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: .75rem">
    <div>
      <slot />
    </div>
    <div style="background: var(--background-primary); color: var(--text-normal); font-family: var(--font-primary); margin: .5rem 0; padding: 1rem; border-radius: 8px">
      <div ref="divref" />
    </div>
  </div>
</template>
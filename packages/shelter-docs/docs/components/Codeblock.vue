<script setup lang="ts">
import {Ref, ref} from "vue";
import {getHighlight} from "../util/shiki";
import Picker from "./Picker.vue";

const divref = ref(null);
const renderEnrichments = ref(false);

export type Enrichment<T = any> =
  | ["text", Ref<string>]
  | ["select", Ref<T>, T[], string];

const props = defineProps<{
  code: string,
  enrichments?: Enrichment[]
}>();

getHighlight().then(highlighter => {
  divref.value.replaceChildren(highlighter(props.code, "jsx", "", props.enrichments));
  renderEnrichments.value = true;
});

const enrichmentStyle = {
  background: "var(--background-primary)", //"rgba(168, 168, 223, 0.15)"
  borderRadius: "3px",
  margin: "0 .1rem",
  padding: "0 .25rem",
  font: "inherit",
  color: "#E1E4E8",
};
</script>

<template>
  <div class="language-tsx vp-adaptive-theme" ref="divref"/>

  <template v-if="renderEnrichments">
    <Teleport v-for="(en, idx) in props.enrichments" :to="`[data-shdocs-enrichment='${idx}']`">

      <input :style="enrichmentStyle" v-if="en[0] === 'text'" v-model="en[1].value" />

      <Picker :style="enrichmentStyle" v-else v-model="en[1].value" :options="en[2]" :prefix="en[3]" />
    </Teleport>
  </template>
</template>
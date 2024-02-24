<script setup lang="ts">
import {computed} from "vue";

const props = defineProps<{
  options: any[];
  prefix: string;
}>();

const model = defineModel();

const selModel = computed({
  get() {
    return props.options.indexOf(model.value as any);
  },
  set(value) {
    model.value = props.options[value];
  }
});
</script>

<template>
  <select v-model="selModel">
    <option v-for="(k, idx) in options" :value="idx">{{props.prefix + k}}</option>
  </select>
</template>

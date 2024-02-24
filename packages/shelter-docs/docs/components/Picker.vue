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
  <div class="wrap">
    <select v-model="selModel">
      <option v-for="(k, idx) in options" :value="idx">{{props.prefix + k}}</option>
    </select>
    <div class="icon"></div>
  </div>
</template>

<style scoped>
  select { background: none; font: unset; }

  .wrap {
    display: inline-flex;
    align-items: center;
  }

  .icon {
    width: .3rem;
    height: .3rem;
    border: 1px solid white;
    border-top: none;
    border-left: none;
    transform: rotate(45deg) translateY(-.15rem);
    margin: .25rem;
  }
</style>
<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import { useFuse } from "@vueuse/integrations/useFuse";
import { useClipboard } from "@vueuse/core";

interface PluginManifest {
  name: string;
  description: string;
  author: string;
  url: string;
}

const data: PluginManifest[] = reactive([]);
fetch("https://shindex.uwu.network/data")
  .then((r) => r.json())
  .then((j) => data.push(...j.flatMap((r) => r.plugins)));
const search = ref("");

const { results } = useFuse(search, data, {
  fuseOptions: {
    keys: ["name", "description"],
    threshold: 0.5,
    useExtendedSearch: true,
  },
});

const { copy, copied } = useClipboard();

const plugins = computed(() => (results.value.length ? results.value.map((i) => i.item) : data));
</script>

<template>
  <div h="1px" bg="$vp-c-divider" m="t-4" />
  <div flex="~" class="children:my-auto" p="2">
    <i i-carbon-search m="r-2" opacity="50" />
    <input class="w-full" v-model="search" type="text" role="search" placeholder="Search..." />
  </div>
  <div h="1px" bg="$vp-c-divider" m="b-4" />

  <div flex="~ wrap" items-center gap-3>
    <div v-for="plugin in plugins" :key="plugin" w-20rem h-42 px-4 py-3 border="1 solid $vp-c-divider" rounded-md
      important-transition-all duration-400 hover="shadow-md bg-$vp-c-bg-soft" flex="~ col" justify-between>
      <div font-semibold dark="text-gray-200" text-gray-900 text-16px>
        {{ plugin.name }}
      </div>

      <div dark="text-gray-400" text-gray-500 text-14px>by {{ plugin.author }}</div>

      <div text-gray-500 dark="text-gray-400" flex-auto mt-2 text-14px>
        <span line-clamp-2>
          {{ plugin.description }}
        </span>
      </div>

      <div flex gap-5>
        <div flex items-center gap-1>
          <button @click="copy(plugin.url)" inline-flex justify-center whitespace-nowrap text-sm font-medium
            cursor-pointer bg="$vp-badge-tip-bg" text="$vp-badge-tip-text" px2 py2 rounded-md block mt2 flex items-center
            gap2>
            <span v-if="!copied">Copy Plugin Link</span>
            <span v-else>Copied!</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

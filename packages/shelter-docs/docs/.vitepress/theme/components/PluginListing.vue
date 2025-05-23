<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import { useFuse } from "@vueuse/integrations/useFuse";
import { useClipboard } from "@vueuse/core";

interface PluginManifest {
  name: string;
  description: string;
  author: string;
  url: string;
  repoName: string;
}

type PluginItem = PluginManifest & { isCopied: boolean; repoOwner: string };

const data: PluginItem[] = reactive([]);
let isLoading = ref(true);

fetch("https://shindex.uwu.network/data")
  .then((r) => r.json())
  .then((items) => {
    items.forEach((item: { name: string; plugins: PluginManifest[] }) => {
      item.plugins.forEach((plugin: PluginManifest) =>
        data.push({
          name: plugin.name,
          description: plugin.description,
          author: plugin.author,
          url: plugin.url,
          repoName: item.name,
          repoOwner: item.name.split("/")[0],
          isCopied: false,
        }),
      );
    });
  })
  .then(() => (isLoading.value = false));

const search = ref("");

const { results } = useFuse(search, data, {
  fuseOptions: {
    keys: ["name", "description", "author", "repoOwner"],
    threshold: 0.5,
    useExtendedSearch: true,
  },
});

const { copy } = useClipboard();

const copyUrl = (plugin: PluginItem) => {
  copy(plugin.url);
  plugin.isCopied = true;

  setTimeout(() => (plugin.isCopied = false), 1500);
};

// fuse returns an empty array when the search query is empty
// so use data instead to show all plugins
const plugins = computed(() => (search.value ? results.value.map((i) => i.item) : data));
</script>

<template>
  <div h="1px" bg="$vp-c-divider" m="t-4" />
  <div flex="~" class="children:my-auto" p="2">
    <i i-carbon-search m="r-2" opacity="50" />
    <input class="w-full" v-model="search" type="text" role="search" placeholder="Search..." />
  </div>
  <div h="1px" bg="$vp-c-divider" m="b-4" />

  <div text-center v-if="isLoading">Loading plugins...</div>
  <div text-center v-else-if="plugins.length === 0">
    No plugins found.. <span font-mono tracking-tight ml-2>( • ᴖ • ｡)</span>
  </div>
  <div v-else flex="~ wrap" gap-3 items-center justify-center>
    <div
      v-for="plugin in plugins"
      w-20rem
      h-44
      px-4
      py-3
      border="1 solid $vp-c-divider"
      rounded-md
      important-transition-all
      duration-400
      hover="shadow-md bg-$vp-c-bg-soft"
      flex="~ col"
      justify-between
    >
      <div font-semibold dark="text-gray-200" line-clamp-1 overflow-hidden text-gray-900 text-16px>
        {{ plugin.name }}
      </div>

      <div dark="text-gray-400" text-gray-500 text-14px>
        by
        <a text-gray-500 inline line-clamp-1 overflow-hidden :href="`https://github.com/` + plugin.repoOwner">{{
          plugin.repoOwner
        }}</a>
      </div>
      <div text-gray-500 dark="text-gray-400" flex-auto mt-2 text-14px>
        <span line-clamp-2>
          {{ plugin.description }}
        </span>
      </div>

      <div flex justify-between items-end>
        <div flex items-center gap-1>
          <button
            @click="copyUrl(plugin)"
            w-32
            inline-flex
            justify-center
            whitespace-nowrap
            text-sm
            font-medium
            cursor-pointer
            bg="$vp-badge-tip-bg"
            text="$vp-badge-tip-text"
            px2
            py2
            rounded-md
            block
            mt2
            flex
            items-center
            gap2
          >
            <span v-if="!plugin.isCopied">Copy Plugin Link</span>
            <span v-else>Copied!</span>
          </button>
        </div>
        <div flex>
          <a :href="`https://github.com/` + plugin.repoName" i-carbon-logo-github w-8 h-8 bg-dark dark:bg-light> </a>
        </div>
      </div>
    </div>
  </div>
</template>

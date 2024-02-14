<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { useFuse } from "@vueuse/integrations/useFuse";
import { useClipboard } from "@vueuse/core";

interface PluginManifest {
  name: string;
  description: string;
  author: string;
  url: string;
}

interface PluginsData {
  name: string;
  plugins: PluginManifest[];
}

const data: PluginsData[] = reactive([]);
let isLoading = ref(true);

fetch("https://shindex.uwu.network/data")
  .then((r) => r.json())
  .then((items) => {
    items.forEach((item) => {
      data.push({
        name: item.name,
        plugins: item.plugins.map((plugin: PluginManifest) => ({
          name: plugin.name,
          description: plugin.description,
          author: plugin.author,
          url: plugin.url,
        })),
      });
    });
  })
  .then(() => (isLoading.value = false));

const search = ref("");

const { results } = useFuse(search, data, {
  fuseOptions: {
    keys: ["name", "description"],
    threshold: 0.5,
    useExtendedSearch: true,
  },
});

const { copy } = useClipboard();
const isCopied = ref(new Array(data.length).fill(false));

const copyUrl = (url: string, idx: number) => {
  copy(url);
  isCopied.value[idx] = true;
  setTimeout(() => {
    resetCopyState();
  }, 1500);
};

const resetCopyState = () => {
  isCopied.value.fill(false);
};

onMounted(() => {
  resetCopyState();
});

const plugins = computed(() => (results.value.length ? results.value.map((i) => i.item) : data));
</script>

<template>
  <div h="1px" bg="$vp-c-divider" m="t-4" />
  <div flex="~" class="children:my-auto" p="2">
    <i i-carbon-search m="r-2" opacity="50" />
    <input class="w-full" v-model="search" type="text" role="search" placeholder="Search..." />
  </div>
  <div h="1px" bg="$vp-c-divider" m="b-4" />

  <div text-center v-if="isLoading">Loading plugins...</div>
  <template v-else v-for="(repo, index) in plugins" :key="index">
    <div flex="~ wrap" items-center gap-3>
      <div
        v-for="(item, idx) in repo.plugins"
        :key="idx"
        w-20rem
        h-42
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
        <div font-semibold dark="text-gray-200" text-gray-900 text-16px>
          {{ item.name }}
        </div>

        <div dark="text-gray-400" text-gray-500 text-14px>by {{ item.author }}</div>

        <div text-gray-500 dark="text-gray-400" flex-auto mt-2 text-14px>
          <span line-clamp-2>
            {{ item.description }}
          </span>
        </div>

        <div flex gap-5 justify-between items-end>
          <div flex items-center gap-1>
            <button
              @click="copyUrl(item.url, idx)"
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
              <span v-if="!isCopied[idx]">Copy Plugin Link</span>
              <span v-else>Copied!</span>
            </button>
          </div>
          <div flex items-center gap-1>
            <a
              :href="`https://github.com/` + repo.name"
              i-carbon-logo-github
              w-8
              h-8
              bg-dark
              dark:bg-light
              right-a
              justify-right
              px2
              ml-28
              mt-2
              flex
              items-center
            >
            </a>
          </div>
        </div>
      </div>
    </div>
  </template>
</template>
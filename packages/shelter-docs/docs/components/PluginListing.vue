<script setup lang="ts">
import { ref, reactive, watchEffect, computed } from "vue";
import { useFuse } from "@vueuse/integrations/useFuse";

interface PluginManifest {
    name: string;
    description: string;
    author: string;
    url: string;
}

const data: PluginManifest[] = reactive([]);
fetch("https://shindex.uwu.network/data").then((r) => r.json()).then((j) => data.push(...j.flatMap((r) => r.plugins)));
const search = ref("");

const { results } = useFuse(search, data, {
    fuseOptions: {
        keys: ["name", "description"],
        threshold: 0.5,
        useExtendedSearch: true,
    },
});

const plugins = computed(() => results.value.length ? results.value.map((i) => i.item) : data);
</script>

<template>
    <input type="text" placeholder="Search..." v-model="search" />
    <div v-for="plugin in plugins">
        <h2>{{ plugin.name }}</h2>
        <p>{{ plugin.description }}</p>
        <code>{{ plugin.url }}</code>
    </div>
</template>

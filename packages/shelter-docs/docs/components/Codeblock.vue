<script setup lang="ts">
import {Ref, ref, watchEffect} from "vue";
import {getHighlighter, ShikiTransformer} from "shiki";

const divref = ref(null);

// based on these to match the whole vitepress look
// https://github.com/vuejs/vitepress/blob/1d16a85/src/node/markdown/plugins/highlight.ts#L50
// https://github.com/vuejs/vitepress/blob/8f8a6fe/src/node/markdown/markdown.ts#L196

export type Enrichment<T = any> =
  | ["text", Ref<string>]
  | ["select", Ref<T>, T[], string];

const props = defineProps<{
  code: string,
  enrichments?: Enrichment[]
}>();

async function getHighlight() {
  const highlighter = await getHighlighter({
    themes: ['github-light', 'github-dark'],
    langs: ['jsx'],
  });

  const transformers: ShikiTransformer[] = [
    // these two copied from highlight.ts:79
    {
      name: 'vitepress:add-class',
      pre(node) {
        this.addClassToHast(node, 'vp-code')
      }
    },
    {
      name: 'vitepress:clean-up',
      pre(node) {
        delete node.properties.tabindex
        delete node.properties.style
      }
    },
    // does all the actually cool stuff we are doing this for
    {
      name: 'shelterdoc:interactives',
      // mark comments matching the pattern
      span(node) {
        const children = node.children?.[0];
        if (children?.type !== "text") return;
        const match = children.value.match(/\/\*\$\$SHDOCS-(\d+)\*\//);
        if (!match?.[1]) return;
        node.properties["data-shdocs-enrichment"] = match[1];
      }
    }
  ];

  return (str: string, lang: string, _attrs: string, enrichments: Enrichment[] = []) => {
    console.assert(["js", "jsx", "ts", "tsx"].indexOf(lang) !== -1);

    const highlighted = highlighter.codeToHtml(str, {
      lang,
      transformers,
      themes: { light: 'github-light', dark: 'github-dark' },
      defaultColor: false,

      // these three just to make typescript SHUT UP
      colorReplacements: undefined, tokenizeMaxLineLength: undefined, tokenizeTimeLimit: undefined,
    });

    // parse
    const root = document.createElement("_");
    root.innerHTML = highlighted; // lol i hope shiki is escaping stuff!
    const tree = root.firstElementChild; // pre.shiki.shiki-themes.github-light.github-dark.vp-code

    // perform enrichments
    const holes = tree.querySelectorAll("[data-shdocs-enrichment]") as NodeListOf<HTMLElement>; // not SVG lol

    for (const hole of holes) {
      const k = parseInt(hole.dataset.shdocsEnrichment) - 1;
      const enrichmentObj = enrichments[k];
      if (!enrichmentObj) continue;
      const [etype, eref] = enrichmentObj;

      // i tried using vue here with h and render and reactivity just *does not work*
      const eelem = document.createElement(etype === "text" ? "input" : "select");
      eelem.style.background = "var(--background-primary)"; //"rgba(168, 168, 223, 0.15)";
      eelem.style.borderRadius = "3px";
      eelem.style.margin = "0 .1rem";
      eelem.style.padding = "0 .25rem";
      eelem.style.fontSize = "1em";
      eelem.style.fontFamily = "inherit";
      eelem.style.color = "#E1E4E8";

      if (etype === "text") {
        watchEffect(() => eelem.value = eref.value);
        eelem.oninput = () => eref.value = eelem.value;
      }
      else {
        const [, , choices, prefix] = enrichmentObj;
        eelem.append(
          ...choices.map((c, idx) => {
            const e = document.createElement("option");
            e.value = idx;
            e.innerText = prefix + c;
            return e;
          })
        );
        watchEffect(() => eelem.value = choices.indexOf(eref.value));
        eelem.oninput = () => eref.value = choices[eelem.value];
      }

      hole.replaceWith(eelem);
    }

    return tree;
  }
}

getHighlight().then(highlighter => {
  divref.value.replaceChildren(highlighter(props.code, "jsx", "", props.enrichments));
})
</script>

<template>
  <div class="language-tsx vp-adaptive-theme" ref="divref"/>
</template>
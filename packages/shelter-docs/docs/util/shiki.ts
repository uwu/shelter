import { getHighlighter, ShikiTransformer } from "shiki";
import { Ref } from "vue";

// based on these to match the whole vitepress look
// https://github.com/vuejs/vitepress/blob/1d16a85/src/node/markdown/plugins/highlight.ts#L50
// https://github.com/vuejs/vitepress/blob/8f8a6fe/src/node/markdown/markdown.ts#L196

export async function getHighlight() {
  const highlighter = await getHighlighter({
    themes: ["github-light", "github-dark"],
    langs: ["jsx"],
  });

  const transformers: ShikiTransformer[] = [
    // these two copied from highlight.ts:79
    {
      name: "vitepress:add-class",
      pre(node) {
        this.addClassToHast(node, "vp-code");
      },
    },
    {
      name: "vitepress:clean-up",
      pre(node) {
        delete node.properties.tabindex;
        delete node.properties.style;
      },
    },
    // does all the actually cool stuff we are doing this for
    {
      name: "shelterdoc:interactives",
      // mark comments matching the pattern
      span(node) {
        const children = node.children?.[0];
        if (children?.type !== "text") return;
        const match = children.value.match(/\/\*\$\$SHDOCS-(\d+)\*\//);
        if (!match?.[1]) return;
        node.properties["data-shdocs-enrichment"] = match[1];
      },
    },
  ];

  return (str: string, lang: string, _attrs: string, enrichments: unknown[] = []) => {
    console.assert(["js", "jsx", "ts", "tsx"].indexOf(lang) !== -1);

    const highlighted = highlighter.codeToHtml(str, {
      lang,
      transformers,
      themes: { light: "github-light", dark: "github-dark" },
      defaultColor: false,

      // these three just to make typescript SHUT UP
      colorReplacements: undefined,
      tokenizeMaxLineLength: undefined,
      tokenizeTimeLimit: undefined,
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

      const replacement = document.createElement("div");
      replacement.dataset.shdocsEnrichment = k + "";
      replacement.style.display = "contents";
      hole.replaceWith(replacement);
    }

    return tree;
  };
}

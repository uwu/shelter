<script setup lang="jsx">
import {watchEffect, reactive} from "vue";
import {createSignal} from "solid-js";
import {Header, HeaderTags} from "@uwu/shelter-ui";
import MountBox from "../MountBox.vue";
import Codeblock from "../Codeblock.vue";

// prevent unwrapping refs when passed to codeblock
const ref = (value) => reactive({ value });

const selectedTag = ref("H1");
const content = ref("This is a header");

function comp() {
  const [sigTag, setSigTag] = createSignal();
  const [sigContent, setSigContent] = createSignal();

  watchEffect(() => {
    setSigTag(selectedTag.value);
    setSigContent(content.value);
  });

  return <>
      <Header tag={HeaderTags[sigTag()]}>{sigContent()}</Header>
      <p>Some content</p>
    </>;
}
</script>

<template>
  <MountBox :component="comp" isolate>
    <Codeblock code="<Header tag={/*$$SHDOCS-1*/}>
  /*$$SHDOCS-2*/
</Header>
<p>Some content</p>"
    :enrichments="[
      ['select', selectedTag, Object.keys(HeaderTags), 'HeaderTags.'],
      ['text', content]
    ]" />
  </MountBox>
</template>

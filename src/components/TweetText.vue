<script setup lang="ts">
import { computed } from 'vue';
import type { Annotation } from '../types';
import TweetAnnotation from './TweetAnnotation.vue';

const props = defineProps<{
  text: string;
  lang: 'ja' | 'zh-CN';
  annotations?: Record<string, Annotation>;
  showAnnotations?: boolean;
}>();

type TextPart = {
  type: 'text' | 'hashtag';
  content: string;
} | {
  type: 'annotation';
  content: string;
  annotation: Annotation;
};

const HASHTAG_REGEX = /#\S+/g;

const parts = computed(() => {
  let parts: TextPart[] = [{ type: 'text', content: props.text }];
  for (const [term, annotation] of Object.entries(props.annotations ?? {})) {
    const newParts: TextPart[] = [];
    for (const part of parts) {
      if (part.type !== 'text') {
        newParts.push(part);
        continue;
      }
      const index = part.content.indexOf(term);
      if (index === -1) {
        newParts.push(part);
      } else {
        const before = part.content.slice(0, index);
        const after = part.content.slice(index + term.length);
        if (before) newParts.push({ type: 'text', content: before });
        newParts.push({
          type: 'annotation',
          content: term,
          annotation,
        });
        if (after) newParts.push({ type: 'text', content: after });
      }
    }
    parts = newParts;
  }
  const newParts: TextPart[] = [];
  for (const part of parts) {
    if (part.type !== 'text') {
      newParts.push(part);
      continue;
    }
    let { content } = part;
    const matches = content.match(HASHTAG_REGEX);
    for (const match of matches ?? []) {
      const index = content.indexOf(match);
      if (index === -1) continue;
      const before = content.slice(0, index);
      if (before) newParts.push({ type: 'text', content: before });
      newParts.push({ type: 'hashtag', content: match });
      content = content.slice(index + match.length);
    }
    if (content) newParts.push({ type: 'text', content });
  }
  return newParts;
});
</script>

<template>
  <div
    class="text-lines"
    :lang
  >
    <template
      v-for="(part, index) of parts"
      :key="index"
    >
      <span v-if="part.type === 'text'">{{ part.content }}</span>
      <a
        v-else-if="part.type === 'hashtag' && lang === 'ja'"
        :href="`https://x.com/hashtag/${part.content.slice(1)}`"
        target="_blank"
        rel="noopener noreferrer"
        :aria-label="`查看话题 ${part.content}`"
        class="hashtag-link"
      >{{ part.content }}</a>
      <span
        v-else-if="part.type === 'hashtag'"
        class="hashtag-link"
      >{{ part.content }}</span>
      <tweet-annotation
        v-else-if="part.type === 'annotation'"
        :part
        :show-annotations
      />
    </template>
  </div>
</template>

<style scoped>
.text-lines {
  font-size: 15px;
  line-height: 20px;
  color: rgb(15, 20, 25);
  white-space: pre-wrap;
  word-wrap: break-word;
}

.dark .text-lines {
  color: rgb(231, 233, 234);
}

.hashtag-link {
  color: rgb(29, 155, 240);
  text-decoration: none;
  transition: color 0.2s;
}

.hashtag-link:link:hover {
  text-decoration: underline;
}
</style>

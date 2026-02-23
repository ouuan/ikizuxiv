<script setup lang="ts">
import { NTooltip } from 'naive-ui';
import { computed } from 'vue';

const props = defineProps<{
  text: string;
  lang: 'ja' | 'zh-CN';
  annotations?: Record<string, string>;
}>();

interface TextPart {
  type: 'text' | 'hashtag' | 'annotation';
  content: string;
  annotation?: string;
}

const HASHTAG_REGEX = /#\S+/g;

const parts = computed(() => {
  let parts: TextPart[] = [{ type: 'text', content: props.text }];
  for (const [item, def] of Object.entries(props.annotations ?? {})) {
    const newParts: TextPart[] = [];
    for (const part of parts) {
      if (part.type !== 'text') {
        newParts.push(part);
        continue;
      }
      const index = part.content.indexOf(item);
      if (index === -1) {
        newParts.push(part);
      } else {
        const before = part.content.slice(0, index);
        const after = part.content.slice(index + item.length);
        if (before) newParts.push({ type: 'text', content: before });
        newParts.push({
          type: 'annotation',
          content: item,
          annotation: def,
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
      const [before, after] = content.split(match, 1);
      if (before) newParts.push({ type: 'text', content: before });
      newParts.push({ type: 'hashtag', content: match });
      content = after ?? '';
    }
    if (content) newParts.push({ type: 'text', content });
  }
  return newParts;
});
</script>

<template>
  <div
    class="text-lines"
    :lang="lang"
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
        class="hashtag-link"
      >{{ part.content }}</a>
      <span
        v-else-if="part.type === 'hashtag'"
        class="hashtag-link"
      >{{ part.content }}</span>
      <n-tooltip
        v-else-if="part.type === 'annotation'"
        style="max-width: min(calc(90vw - 50px), 400px);"
      >
        <template #trigger>
          <span class="annotation">{{ part.content }}</span>
        </template>
        {{ part.annotation }}
      </n-tooltip>
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

.annotation {
  border-bottom: 1px dashed rgb(29, 155, 240);
  cursor: help;
}

.annotation::after {
  content: '*';
  color: rgb(29, 155, 240);
  vertical-align: super;
}
</style>

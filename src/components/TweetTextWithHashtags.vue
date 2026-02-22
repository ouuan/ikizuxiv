<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  text: string;
  lang: 'ja' | 'zh-CN';
  specialHashtagLink?: string;
}>();

interface TextPart {
  type: 'text' | 'hashtag' | 'special-hashtag';
  content: string;
}

const parseJapaneseHashtags = (text: string): TextPart[] => {
  const parts: TextPart[] = [];
  const hashtagRegex = /#[\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]+/g;
  let lastIndex = 0;
  let match;

  while ((match = hashtagRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: text.slice(lastIndex, match.index) });
    }
    parts.push({ type: 'hashtag', content: match[0] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push({ type: 'text', content: text.slice(lastIndex) });
  }

  return parts.length > 0 ? parts : [{ type: 'text', content: text }];
};

const parseChineseHashtags = (text: string): TextPart[] => {
  const parts: TextPart[] = [];
  const hashtagRegex = /#[\w\u4E00-\u9FFF]+/g;
  let lastIndex = 0;
  let match;

  while ((match = hashtagRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: text.slice(lastIndex, match.index) });
    }
    const isSpecialHashtag = match[0] === '#生活好难部';
    parts.push({
      type: isSpecialHashtag ? 'special-hashtag' : 'hashtag',
      content: match[0],
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push({ type: 'text', content: text.slice(lastIndex) });
  }

  return parts.length > 0 ? parts : [{ type: 'text', content: text }];
};

const getHashtagUrl = (hashtag: string) => {
  const tag = hashtag.startsWith('#') ? hashtag.slice(1) : hashtag;
  return `https://x.com/search?q=%23${encodeURIComponent(tag)}`;
};

const parts = computed(() => {
  return props.lang === 'ja'
    ? parseJapaneseHashtags(props.text)
    : parseChineseHashtags(props.text);
});
</script>

<template>
  <div
    class="text-lines"
    :lang="lang"
  >
    <template
      v-for="part of parts"
      :key="part.content"
    >
      <span v-if="part.type === 'text'">{{ part.content }}</span>
      <a
        v-else-if="part.type === 'special-hashtag'"
        :href="getHashtagUrl(specialHashtagLink || part.content)"
        target="_blank"
        rel="noopener noreferrer"
        class="hashtag-link"
      >{{ part.content }}</a>
      <a
        v-else-if="part.type === 'hashtag' && lang === 'ja'"
        :href="getHashtagUrl(part.content)"
        target="_blank"
        rel="noopener noreferrer"
        class="hashtag-link"
      >{{ part.content }}</a>
      <span
        v-else
        class="hashtag-link"
      >{{ part.content }}</span>
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

.hashtag-link:hover {
  text-decoration: underline;
}

.dark .hashtag-link {
  color: rgb(29, 155, 240);
}
</style>

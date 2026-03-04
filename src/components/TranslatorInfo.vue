<script setup lang="ts">
import { computed } from 'vue';
import type { Translation } from '../types';

const props = defineProps<{
  translation: Translation;
}>();

const translator = computed(() => props.translation.pikapaca ? '羊驼' : props.translation.translator);
const source = computed(() => props.translation.pikapaca ? 'https://ikizutwizh.pikapaca.cc/' : props.translation.source);
</script>

<template>
  <div>
    <div class="translator-info">
      翻译来自：<a
        :href="source"
        target="_blank"
        rel="noopener noreferrer"
        :aria-label="`查看翻译来源：${translator}`"
      >{{ translator }}</a>
    </div>
  </div>
</template>

<style scoped>
.translator-info {
  margin-top: 8px;
  font-size: 13px;
  color: rgb(83, 100, 113);
}

.dark .translator-info {
  color: rgb(113, 118, 123);
}

.translator-info a {
  color: rgb(29, 155, 240);
  text-decoration: none;
}

.translator-info a:hover {
  text-decoration: underline;
}

.translation-comments {
  margin-top: 8px;
  padding: 8px 12px;
  font-size: 13px;
  color: rgb(83, 100, 113);
  background-color: rgb(247, 249, 249);
  border-left: 3px solid rgb(29, 155, 240);
  border-radius: 4px;
}

.dark .translation-comments {
  color: rgb(113, 118, 123);
  background-color: rgba(29, 155, 240, 0.05);
}
</style>

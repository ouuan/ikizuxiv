<script setup lang="ts">
import { NImage, NImageGroup, NTooltip } from 'naive-ui';
import { ref } from 'vue';
import type { Annotation } from '../types';

const props = defineProps<{
  part: {
    content: string;
    annotation: Annotation;
  };
  showAnnotations?: boolean;
}>();

const showImage = ref(false);
</script>

<template>
  <n-tooltip
    style="max-width: min(calc(90vw - 60px), 400px);"
    :show="showImage || props.showAnnotations"
  >
    <template #trigger>
      <span class="annotation">{{ part.content }}</span>
    </template>
    <span>{{ part.annotation.text }}</span>
    <n-image-group
      v-if="part.annotation.images"
      v-model:show="showImage"
    >
      <n-image
        v-for="img of part.annotation.images"
        :key="img"
        :src="`/assets/annotations/${img}`"
        object-fit="cover"
        width="100%"
      />
    </n-image-group>
  </n-tooltip>
</template>

<style scoped>
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

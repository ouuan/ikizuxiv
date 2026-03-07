<script setup lang="ts">
import { NImage, NImageGroup, NTooltip } from 'naive-ui';
import { nextTick, ref, watch } from 'vue';
import type { Annotation } from '../types';

const props = defineProps<{
  part: {
    content: string;
    annotation: Annotation;
  };
  showAnnotation?: boolean;
}>();

const showImage = ref(false);
const forceShow = ref<boolean>();

watch(() => props.showAnnotation, async (show) => {
  if (show) {
    forceShow.value = true;
  } else if (forceShow.value) {
    forceShow.value = false;
    await nextTick(() => forceShow.value = undefined);
  }
});
</script>

<template>
  <n-tooltip
    style="max-width: min(calc(200vw / 3 + 15px), 400px);"
    :show="showImage || forceShow"
  >
    <template #trigger>
      <span class="annotation">{{ part.content }}</span>
    </template>
    <div>{{ part.annotation.text }}</div>
    <div
      v-if="part.annotation.images"
      style="margin-top: 6px;"
    >
      <n-image-group v-model:show="showImage">
        <n-image
          v-for="img of part.annotation.images"
          :key="img"
          :src="`/assets/annotations/${img}`"
          :alt="`${part.content} 注释图片`"
          object-fit="cover"
          width="100%"
        />
      </n-image-group>
    </div>
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

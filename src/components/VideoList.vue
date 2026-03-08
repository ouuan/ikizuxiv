<script setup lang="ts">
import { NCard } from 'naive-ui';
import type { VideoList } from '../types';

defineProps<{
  videos: VideoList[];
}>();
</script>

<template>
  <n-card
    title="相关视频"
    size="small"
  >
    <div
      v-for="{ website, id } of videos"
      :key="`${website}:${id}`"
    >
      <iframe
        v-if="website === 'bilibili'"
        :src="`https://player.bilibili.com/player.html?poster=true&autoplay=false&aid=${id}`"
        allowfullscreen
        :title="`Bilibili 视频 ${id}`"
      />
      <iframe
        v-else-if="website === 'youtube'"
        :src="`https://www.youtube.com/embed/${id}`"
        allowfullscreen
        :title="`YouTube 视频 ${id}`"
      />
    </div>
  </n-card>
</template>

<style scoped>
iframe {
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 9;
  border: none;
}
</style>

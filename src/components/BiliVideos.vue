<script setup lang="ts">
import { NCard } from 'naive-ui';

defineProps<{
  aids: string[];
}>();
</script>

<template>
  <n-card
    title="本日视频"
    size="small"
  >
    <div
      v-for="aid of aids"
      :key="aid"
    >
      <iframe
        :src="`https://player.bilibili.com/player.html?poster=true&autoplay=false&aid=${aid}`"
        scrolling="no"
        border="0"
        frameborder="no"
        framespacing="0"
        allowfullscreen="true"
        :title="`Bilibili 视频 ${aid}`"
      />
    </div>
  </n-card>
</template>

<style scoped>
iframe {
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 9;
}
</style>

<script setup lang="ts">
import { NIcon } from 'naive-ui';
import type { Component } from 'vue';
import { computed } from 'vue';

interface Props {
  icon: Component;
  count: number;
}

const props = defineProps<Props>();

const formattedCount = computed(() => {
  if (props.count >= 1000000) {
    return `${(props.count / 1000000).toFixed(1)}M`;
  }
  if (props.count >= 1000) {
    return `${(props.count / 1000).toFixed(1)}K`;
  }
  return props.count.toString();
});

const exactCount = computed(() => {
  return props.count.toLocaleString();
});
</script>

<template>
  <div
    class="metric-item"
    :title="exactCount"
  >
    <n-icon :size="18">
      <component :is="icon" />
    </n-icon>
    <span>{{ formattedCount }}</span>
  </div>
</template>

<style scoped>
.metric-item {
    display: flex;
    align-items: center;
    gap: 4px;
    color: rgb(83, 100, 113);
    font-size: 13px;
}

.dark .metric-item {
    color: rgb(113, 118, 123);
}
</style>

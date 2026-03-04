<script setup lang="ts">
import {
  NButton,
  NCollapse,
  NCollapseItem,
  NHeatmap,
  NScrollbar,
} from 'naive-ui';
import { computed } from 'vue';
import type { DateIndex } from '../types';
import { toDateString } from '../utils';

const props = defineProps<{
  dateIndex: DateIndex | undefined;
  displayMembers: string[];
}>();

const emit = defineEmits<{
  selectDate: [date: string];
}>();

const data = computed(() => {
  if (!props.dateIndex) return [];
  const data = [];
  for (const [date, counts] of Object.entries(props.dateIndex)) {
    const value = props.displayMembers.reduce((sum, member) => sum + (counts[member] ?? 0), 0);
    data.push({ timestamp: new Date(date).getTime(), value });
  }
  return data;
});
</script>

<template>
  <n-collapse>
    <n-collapse-item
      title="推文数量热力图"
      aria-label="推文数量热力图"
    >
      <n-scrollbar x-scrollable>
        <n-heatmap
          :data
          color-theme="blue"
          size="small"
          :first-day-of-week="6"
          tooltip
        >
          <template #tooltip="{ timestamp, value }">
            <span>
              {{ toDateString(new Date(timestamp)) }}：{{ value || 0 }} 条推文
            </span>
            <n-button
              v-if="value"
              type="primary"
              size="small"
              @click="emit('selectDate', toDateString(new Date(timestamp)))"
            >
              跳转
            </n-button>
          </template>
        </n-heatmap>
      </n-scrollbar>
    </n-collapse-item>
  </n-collapse>
</template>

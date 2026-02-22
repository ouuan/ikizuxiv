<script setup lang="ts">
import {
  ChevronBackOutline, ChevronForwardOutline, InformationCircleOutline, SettingsOutline,
} from '@vicons/ionicons5';
import {
  NButton, NDatePicker, NIcon,
} from 'naive-ui';
import { computed } from 'vue';

const props = defineProps<{
  currentDate: string;
  dates: string[];
  hasPrev: boolean;
  hasNext: boolean;
}>();

const emit = defineEmits<{
  prev: [];
  next: [];
  prefetchPrev: [];
  dateChange: [date: string];
  settings: [];
  about: [];
}>();

const yearRange = computed<[number, number] | undefined>(() => {
  const years = props.dates
    .map((date) => Number(date.split('-')[0]))
    .filter((year) => !Number.isNaN(year));
  if (years.length === 0) return undefined;
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);
  return [minYear, maxYear + 1];
});

const dateShortcuts = computed(() => {
  const firstDate = props.dates[0];
  const lastDate = props.dates[props.dates.length - 1];
  if (!firstDate || !lastDate) return;
  return {
    第一天: new Date(firstDate).valueOf(),
    最新推文: new Date(lastDate).valueOf(),
  };
});

function toDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const datePickerValue = computed({
  get: () => props.currentDate ? new Date(props.currentDate).getTime() : null,
  set: (value: number | null) => {
    if (value) {
      const date = new Date(value);
      const dateStr = toDateString(date);
      if (dateStr) {
        emit('dateChange', dateStr);
      }
    }
  },
});

const isDateDisabled = (ts: number) => {
  const date = new Date(ts);
  const dateStr = toDateString(date);
  return dateStr ? !props.dates.includes(dateStr) : true;
};
</script>

<template>
  <header class="nav-bar">
    <div class="nav-content">
      <n-button
        quaternary
        circle
        :disabled="!hasPrev"
        @click="emit('prev')"
        @mouseenter="hasPrev && emit('prefetchPrev')"
        @focus="hasPrev && emit('prefetchPrev')"
      >
        <n-icon :size="20">
          <chevron-back-outline />
        </n-icon>
      </n-button>

      <n-date-picker
        v-model:value="datePickerValue"
        type="date"
        size="large"
        format="PPPP"
        input-readonly
        :is-date-disabled="isDateDisabled"
        :year-range="yearRange"
        :first-day-of-week="6"
        :actions="[]"
        :shortcuts="dateShortcuts"
        title="东京时间 0 点至 6 点的推文会被归为前一天"
      />

      <n-button
        quaternary
        circle
        :disabled="!hasNext"
        @click="emit('next')"
      >
        <n-icon :size="20">
          <chevron-forward-outline />
        </n-icon>
      </n-button>

      <div class="nav-spacer" />

      <n-button
        quaternary
        circle
        @click="emit('settings')"
      >
        <n-icon :size="20">
          <settings-outline />
        </n-icon>
      </n-button>

      <n-button
        quaternary
        circle
        @click="emit('about')"
      >
        <n-icon :size="20">
          <information-circle-outline />
        </n-icon>
      </n-button>
    </div>
  </header>
</template>

<style scoped>
.nav-bar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 53px;
    background-color: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid rgb(239, 243, 244);
    z-index: 1000;
}

.dark .nav-bar {
  background-color: rgba(15, 20, 25, 0.85);
    border-bottom-color: rgb(47, 51, 54);
}

.nav-content {
    max-width: 600px;
    margin: 0 auto;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
}

.nav-spacer {
    flex: 1;
}

@media (max-width: 600px) {
    .nav-content {
        max-width: 100%;
    }
}
</style>

<script setup lang="ts">
import { useHead } from '@unhead/vue';
import {
  useLocalStorage,
  usePreferredDark,
  useUrlSearchParams,
} from '@vueuse/core';
import {
  NConfigProvider,
  darkTheme,
  dateZhCN,
  zhCN,
} from 'naive-ui';
import type { GlobalTheme } from 'naive-ui';
import {
  computed,
  nextTick,
  onMounted,
  ref,
  toRef,
  watch,
} from 'vue';
import AboutDialog from './components/AboutDialog.vue';
import NavigationBar from './components/NavigationBar.vue';
import SettingsDialog from './components/SettingsDialog.vue';
import TweetList from './components/TweetList.vue';
import { THEMES } from './constants';
import { initTracking } from './track';
import type {
  DayData,
  DisplayMode,
  PrimaryColorScheme,
  ThemeMode,
} from './types';
import { loadDates, loadDayData } from './utils';

const dates = ref<string[]>([]);
const primaryColorScheme = useLocalStorage<PrimaryColorScheme>('primaryColorScheme', 'bluebird');

const currentDateParam = toRef(useUrlSearchParams('hash'), 'date');
const currentDateStorage = useLocalStorage<string>('currentDate', '');
const currentDate = ref('');

function isValidDate(dateStr: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
}

const dayData = ref<DayData | null>(null);
const nextDayData = ref<DayData | null>(null);
const loading = ref(false);
const showSettings = ref(false);
const showAbout = ref(false);

// Settings - stored in localStorage automatically with VueUse
const displayMode = useLocalStorage<DisplayMode>('displayMode', 'zh-ja');
const themeMode = useLocalStorage<ThemeMode>('themeMode', 'system');

// Theme - use VueUse's usePreferredDark
const prefersDark = usePreferredDark();

const theme = computed<GlobalTheme | null>(() => {
  if (themeMode.value === 'dark') return darkTheme;
  if (themeMode.value === 'light') return null;
  return prefersDark.value ? darkTheme : null;
});

onMounted(async () => {
  initTracking();

  dates.value = await loadDates();

  // Load the first date by default, or use saved progress
  if (dates.value.length > 0) {
    if (!currentDate.value || !dates.value.includes(currentDate.value)) {
      const firstDate = dates.value[0];
      if (firstDate) currentDate.value = firstDate;
    }
  }

  if (typeof currentDateParam.value === 'string' && isValidDate(currentDateParam.value)) {
    currentDate.value = currentDateParam.value;
  } else if (currentDateStorage.value && isValidDate(currentDateStorage.value)) {
    currentDate.value = currentDateStorage.value;
  } else if (dates.value[0]) {
    // eslint-disable-next-line prefer-destructuring
    currentDate.value = dates.value[0];
  }
});

// Load day data when date changes
watch(currentDate, async (newDate) => {
  if (!newDate) return;
  loading.value = true;
  dayData.value = await loadDayData(newDate);
  loading.value = false;
  currentDateParam.value = newDate;
  currentDateStorage.value = newDate;
  await nextTick();
  window.scrollTo({ top: 0, behavior: 'auto' });
}, { immediate: true });

const lowerBoundIndex = computed(() => {
  if (!currentDate.value) return 0;
  const index = dates.value.findIndex((date) => date >= currentDate.value);
  return index === -1 ? dates.value.length : index;
});

const prevDate = computed(() => {
  if (!currentDate.value) return null;
  const index = lowerBoundIndex.value;
  if (index === 0) return null;
  return dates.value[index - 1] ?? null;
});

const nextDate = computed(() => {
  if (!currentDate.value) return null;
  const index = lowerBoundIndex.value;
  const isExactMatch = dates.value[index] === currentDate.value;
  const nextIndex = isExactMatch ? index + 1 : index;
  return dates.value[nextIndex] ?? null;
});

// Load next day data when nextDate changes
watch(nextDate, async (newNextDate) => {
  if (!newNextDate) {
    nextDayData.value = null;
    return;
  }
  nextDayData.value = await loadDayData(newNextDate);
});

const prefetchedDates = new Set<string>();

const prefetchDayData = async (date: string | null) => {
  if (!date) return;
  if (prefetchedDates.has(date)) return;
  const [year, month] = date.split('-');
  if (!year || !month) return;
  prefetchedDates.add(date);
  try {
    await fetch(`/tweets/${year}/${month}/${date}.json`);
  } catch {
    prefetchedDates.delete(date);
  }
};

const hasPrev = computed(() => prevDate.value !== null);
const hasNext = computed(() => nextDate.value !== null);

const goToPrev = () => {
  if (prevDate.value) {
    currentDate.value = prevDate.value;
  }
};

const goToNext = () => {
  if (nextDate.value) {
    currentDate.value = nextDate.value;
  }
};

const prefetchPrev = () => {
  void prefetchDayData(prevDate.value);
};

const onDateChange = (date: string) => {
  currentDate.value = date;
};

useHead({
  title: computed(() => `ikizuXiv - いきづらい部！推文存档 (${currentDate.value})`),
});
</script>

<template>
  <n-config-provider
    :theme="theme"
    :theme-overrides="THEMES[primaryColorScheme]"
    :locale="zhCN"
    :date-locale="dateZhCN"
  >
    <div
      class="app-container"
      :class="{ dark: theme === darkTheme }"
    >
      <navigation-bar
        :current-date="currentDate"
        :dates="dates"
        :has-prev="hasPrev"
        :has-next="hasNext"
        @prev="goToPrev"
        @next="goToNext"
        @prefetch-prev="prefetchPrev"
        @date-change="onDateChange"
        @settings="showSettings = true"
        @about="showAbout = true"
      />

      <settings-dialog
        v-model="showSettings"
        v-model:display-mode="displayMode"
        v-model:theme-mode="themeMode"
        v-model:primary-color-scheme="primaryColorScheme"
      />
      <about-dialog v-model="showAbout" />

      <main class="main-content">
        <tweet-list
          :day-data="dayData"
          :next-day-data="nextDayData"
          :loading="loading"
          :display-mode="displayMode"
          :current-date="currentDate"
          :has-next="hasNext"
          @next="goToNext"
        />
      </main>
    </div>
  </n-config-provider>
</template>

<style scoped>
.app-container {
    min-height: 100vh;
    background-color: #ffffff;
    transition: background-color 0.3s;
}

.app-container.dark {
  background-color: #0f1419;
}

.main-content {
    max-width: 600px;
    margin: 0 auto;
    padding-top: 53px;
    /* Height of nav bar */
}

@media (max-width: 600px) {
    .main-content {
        max-width: 100%;
    }
}
</style>

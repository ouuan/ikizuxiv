<script setup lang="ts">
import { useHead } from '@unhead/vue';
import { useLocalStorage, usePreferredDark } from '@vueuse/core';
import {
  NConfigProvider,
  NMessageProvider,
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
  watch,
} from 'vue';
import AboutDialog from './components/AboutDialog.vue';
import NavigationBar from './components/NavigationBar.vue';
import SearchDialog from './components/SearchDialog.vue';
import SettingsDialog from './components/SettingsDialog.vue';
import TweetList from './components/TweetList.vue';
import useStoredParam from './composables/useStoredParam';
import { GROUPS, NAMES, THEMES } from './constants';
import { initTracking } from './track';
import type {
  DateIndex,
  DayData,
  DisplayMode,
  PrimaryColorScheme,
  ThemeMode,
} from './types';
import { dayTweets, loadDateIndex, loadDayData } from './utils';

const dateIndex = ref<DateIndex>();
const primaryColorScheme = useLocalStorage<PrimaryColorScheme>('primaryColorScheme', 'bluebird');

const { value: currentDate, init: initCurrentDate } = useStoredParam('date');

function isValidDate(dateStr: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
}

const dayData = ref<DayData | null>(null);
const nextDayData = ref<DayData | null>(null);
const loading = ref(false);
const showSettings = ref(false);
const showSearch = ref(false);
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

const { value: memberFilter, init: initMemberFilter } = useStoredParam('filter');

function isValidMemberFilter(filter: string): boolean {
  if (filter === 'all') return true;
  if (Object.keys(NAMES).includes(filter)) return true;
  if (Object.keys(GROUPS).includes(filter)) return true;
  return false;
}

const filterName = computed(() => {
  if (memberFilter.value === 'all') return '';
  return NAMES[memberFilter.value]?.new
    ?? GROUPS[memberFilter.value]?.name
    ?? '未知成员';
});

const displayMembers = computed(() => {
  if (memberFilter.value === 'all') return Object.keys(NAMES);
  for (const member of Object.keys(NAMES)) {
    if (memberFilter.value === member) return [member];
  }
  for (const group of Object.keys(GROUPS)) {
    if (memberFilter.value === group) return GROUPS[group]?.members ?? [];
  }
  return [];
});

const dates = computed(() => {
  if (!dateIndex.value) return [];
  const dates = [];
  for (const [date, authorMap] of Object.entries(dateIndex.value)) {
    for (const member of displayMembers.value) {
      if (authorMap[member]) {
        dates.push(date);
        break;
      }
    }
  }
  dates.sort();
  return dates;
});

onMounted(async () => {
  initTracking();
  await initMemberFilter(isValidMemberFilter, 'all');
  dateIndex.value = await loadDateIndex();
  await initCurrentDate(isValidDate, dates.value[0] ?? '');
});

// Load day data when date changes
watch(currentDate, async (newDate) => {
  if (!newDate) return;
  loading.value = true;
  dayData.value = await loadDayData(newDate);
  loading.value = false;
  await nextTick();
  window.scrollTo({ top: 0, behavior: 'auto' });
}, { immediate: true });

const currentDayTweets = computed(() => {
  return dayData.value ? dayTweets(dayData.value, displayMembers.value) : [];
});

const nextDayTweets = computed(() => {
  return nextDayData.value ? dayTweets(nextDayData.value, displayMembers.value) : [];
});

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

function onSelectMember(member: string) {
  if (memberFilter.value === member)
    memberFilter.value = 'all';
  else
    memberFilter.value = member;
}

function onSearch() {
  showSearch.value = true;
}

useHead({
  title: computed(() => `ikizuXiv - いきづらい部！推文存档 (${currentDate.value})`),
  bodyAttrs: {
    class: computed(() => theme.value ? 'dark' : 'light'),
  },
});
</script>

<template>
  <n-config-provider
    :theme="theme"
    :theme-overrides="THEMES[primaryColorScheme]"
    :locale="zhCN"
    :date-locale="dateZhCN"
  >
    <n-message-provider>
      <div class="app-container">
        <navigation-bar
          :current-date="currentDate"
          :dates="dates"
          :has-prev="hasPrev"
          :has-next="hasNext"
          :member-filter="memberFilter"
          :filter-name="filterName"
          @prev="goToPrev"
          @next="goToNext"
          @prefetch-prev="prefetchPrev"
          @date-change="onDateChange"
          @clear-filter="memberFilter = 'all'"
          @search="onSearch"
          @settings="showSettings = true"
          @about="showAbout = true"
        />

        <settings-dialog
          v-model:show="showSettings"
          v-model:filter="memberFilter"
          v-model:display-mode="displayMode"
          v-model:theme-mode="themeMode"
          v-model:primary-color-scheme="primaryColorScheme"
          :date-index
          :display-members
          @select-date="onDateChange"
        />
        <search-dialog
          v-model:show="showSearch"
          :display-mode="displayMode"
          :display-members="displayMembers"
          :member-filter="memberFilter"
          @select-member="onSelectMember"
        />
        <about-dialog v-model="showAbout" />

        <main class="main-content">
          <tweet-list
            :current-day-tweets
            :loading
            :display-mode
            :member-filter
            :filter-name
            :has-next
            :next-day-tweets
            @next="goToNext"
            @select-member="onSelectMember"
          />
        </main>
      </div>
    </n-message-provider>
  </n-config-provider>
</template>

<style scoped>
.app-container {
    min-height: 100vh;
    background-color: #ffffff;
    transition: background-color 0.3s;
}

.dark .app-container {
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

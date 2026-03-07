import { useLocalStorage, usePreferredDark } from '@vueuse/core';
import { computed } from 'vue';
import type { ThemeMode } from '../types';

const prefersDark = usePreferredDark();
const themeModeStore = useLocalStorage<ThemeMode>('themeMode', 'system');
const themeMode = computed<'dark' | 'light', ThemeMode>({
  get() {
    if (themeModeStore.value === 'system') return prefersDark.value ? 'dark' : 'light';
    return themeModeStore.value;
  },
  set(mode) {
    themeModeStore.value = mode;
  },
});

export default function useThemeMode() {
  return { themeMode, themeModeStore };
}

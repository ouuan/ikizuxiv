<script setup lang="ts">
import { NConfigProvider, NRadio } from 'naive-ui';
import { computed } from 'vue';

const props = defineProps<{
  value: string;
  name: string;
  color: string;
}>();

const themeOverrides = computed(() => ({
  common: {
    primaryColor: props.color,
    primaryColorHover: props.color,
    primaryColorPressed: props.color,
    primaryColorSuppl: props.color,
  },
}));
</script>

<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <n-radio :value="value">
      {{ name }}
    </n-radio>
  </n-config-provider>
</template>

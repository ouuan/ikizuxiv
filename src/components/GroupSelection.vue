<script setup lang="ts">
import { NAvatar, NButton, NSpace } from 'naive-ui';
import { GROUPS, NAMES } from '../constants';
import { getAvatarUrl } from '../utils';

defineProps<{
  group: string;
}>();

const filter = defineModel<string>();

function onClick(value: string) {
  if (filter.value === value) filter.value = 'all';
  else filter.value = value;
}
</script>

<template>
  <div
    :style="{
      border: 'solid 1px var(--n-border-color)',
      borderRadius: 'var(--n-border-radius)',
      padding: '8px',
    }"
  >
    <n-space size="small">
      <n-button
        circle
        @click="() => onClick(group)"
      >
        <n-avatar
          round
          :class="{ selected: filter === group }"
        >
          {{ GROUPS[group]?.name }}
        </n-avatar>
      </n-button>
      <n-button
        v-for="member of GROUPS[group]?.members"
        :key="member"
        circle
        @click="() => onClick(member)"
      >
        <n-avatar
          round
          :src="getAvatarUrl(member, false)"
          :class="{ selected: filter === member }"
          :title="NAMES[member]?.new"
        />
      </n-button>
    </n-space>
  </div>
</template>

<style scoped>
.n-button {
  vertical-align: top;
}

.selected {
  outline: 3px solid var(--n-color-target);
}
</style>

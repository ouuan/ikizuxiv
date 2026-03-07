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
    role="group"
    :aria-label="`${GROUPS[group]?.name} 成员筛选`"
    :style="{
      border: 'solid 1px var(--n-border-color)',
      borderRadius: 'var(--n-border-radius)',
      padding: '8px',
    }"
  >
    <n-space size="small">
      <n-button
        text
        :aria-label="`筛选 ${GROUPS[group]?.name}`"
        :aria-pressed="filter === group"
        @click="() => onClick(group)"
      >
        <n-avatar
          :src="getAvatarUrl(group, 'group')"
          :class="{ selected: filter === group }"
          :title="GROUPS[group]?.name"
        />
      </n-button>
      <n-button
        v-for="member of GROUPS[group]?.members"
        :key="member"
        text
        :aria-label="`筛选 ${NAMES[member]?.new ?? member}`"
        :aria-pressed="filter === member"
        @click="() => onClick(member)"
      >
        <n-avatar
          round
          :src="getAvatarUrl(member, 'new')"
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

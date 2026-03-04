<script setup lang="ts">
import { SearchOutline } from '@vicons/ionicons5';
import { useDebounceFn } from '@vueuse/core';
import {
  NEmpty,
  NFormItem,
  NIcon,
  NInput,
  NModal,
  NRadioButton,
  NRadioGroup,
  NScrollbar,
  NSpace,
  NSpin,
  NText,
} from 'naive-ui';
import { ref, watch } from 'vue';
import { useSearch, type SortOrder } from '../composables/useSearch';
import type { DisplayMode } from '../types';
import TweetList from './TweetList.vue';

const props = defineProps<{
  displayMode: DisplayMode;
  displayMembers: string[];
  memberFilter: string;
}>();

const emit = defineEmits<{
  selectMember: [member: string];
}>();

const show = defineModel<boolean>('show', { required: true });

const {
  search, clearSearch, searchResults, isSearching,
} = useSearch();

const searchInput = ref('');
const sortOrder = ref<SortOrder>('');

const doSearch = async () => {
  if (searchInput.value.trim()) {
    const members = props.memberFilter === 'all' ? null : props.displayMembers;
    await search(searchInput.value, members, sortOrder.value);
  } else {
    clearSearch();
  }
};

const debouncedSearch = useDebounceFn(doSearch, 300, { maxWait: 2000 });

watch(
  show,
  (newShow) => {
    if (!newShow) {
      searchInput.value = '';
      clearSearch();
    }
  },
);

watch(
  () => props.displayMembers,
  () => void doSearch(),
);

watch(sortOrder, () => void doSearch());
</script>

<template>
  <n-modal
    v-model:show="show"
    title="搜索推文"
    preset="card"
    :style="{ maxWidth: '600px' }"
  >
    <n-space
      vertical
      size="large"
    >
      <n-space justify="space-between">
        <n-input
          v-model:value="searchInput"
          type="text"
          placeholder="输入关键词搜索..."
          clearable
          :loading="isSearching"
          @update:value="debouncedSearch"
          @keyup.enter="doSearch"
        >
          <template #prefix>
            <n-icon :size="18">
              <search-outline />
            </n-icon>
          </template>
        </n-input>
        <n-form-item
          label="排序"
          label-placement="left"
          :show-feedback="false"
        >
          <n-radio-group v-model:value="sortOrder">
            <n-radio-button value="">
              相关度
            </n-radio-button>
            <n-radio-button value="desc">
              最新
            </n-radio-button>
            <n-radio-button value="asc">
              最早
            </n-radio-button>
          </n-radio-group>
        </n-form-item>
      </n-space>
      <div>
        <n-space
          v-if="isSearching"
          justify="center"
        >
          <n-spin>
            <template #description>
              正在搜索…
            </template>
          </n-spin>
        </n-space>
        <n-space
          v-else-if="searchResults === null"
          justify="center"
          style="margin: 16px auto;"
        >
          <n-text depth="3">
            输入关键词开始搜索
          </n-text>
        </n-space>
        <n-empty
          v-else-if="searchResults.length === 0"
          description="没有找到匹配的推文"
          size="large"
        />
        <n-scrollbar
          v-else
          :style="{ maxHeight: 'calc(90vh - 120px)' }"
        >
          <tweet-list
            :current-day-tweets="searchResults"
            :loading="false"
            :display-mode="displayMode"
            :member-filter="memberFilter"
            filter-name="搜索结果"
            :has-next="false"
            :next-day-tweets="null"
            is-search
            @select-member="(member) => emit('selectMember', member)"
          />
        </n-scrollbar>
      </div>
    </n-space>
  </n-modal>
</template>

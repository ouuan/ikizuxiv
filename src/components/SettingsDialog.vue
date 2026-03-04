<script setup lang="ts">
import {
  NForm,
  NFormItemGi,
  NGrid,
  NModal,
  NRadioButton,
  NRadioGroup,
  NSpace,
} from 'naive-ui';
import type {
  DateIndex,
  DisplayMode,
  PrimaryColorScheme,
  ThemeMode,
} from '../types';
import GroupSelection from './GroupSelection.vue';
import PostHeatmap from './PostHeatmap.vue';

defineProps<{
  dateIndex: DateIndex | undefined;
  displayMembers: string[];
}>();

const showDialog = defineModel<boolean>('show', { required: true });
const filter = defineModel<string>('filter', { required: true });
const displayMode = defineModel<DisplayMode>('displayMode', { required: true });
const themeMode = defineModel<ThemeMode>('themeMode', { required: true });
const primaryColorScheme = defineModel<PrimaryColorScheme>(
  'primaryColorScheme',
  { required: true },
);

const emit = defineEmits<{
  selectDate: [date: string];
}>();

function selectDate(date: string) {
  emit('selectDate', date);
  showDialog.value = false;
}
</script>

<template>
  <n-modal
    v-model:show="showDialog"
    title="设置"
    preset="card"
    size="small"
    :auto-focus="false"
    :style="{ width: '100%', maxWidth: '520px', margin: '0 auto' }"
  >
    <n-form
      label-placement="left"
      label-width="auto"
      :show-feedback="false"
      :show-require-mark="false"
    >
      <n-grid
        :cols="1"
        :y-gap="12"
      >
        <n-form-item-gi
          label="筛选显示"
          :label-props="{ title: '点击头像筛选/取消筛选推文显示' }"
        >
          <n-space wrap>
            <group-selection
              v-model="filter"
              group="asakusa"
            />
            <group-selection
              v-model="filter"
              group="sendai"
            />
            <group-selection
              v-model="filter"
              group="fukuiken"
            />
            <group-selection
              v-model="filter"
              group="umeda"
            />
          </n-space>
        </n-form-item-gi>

        <n-form-item-gi>
          <post-heatmap
            :date-index
            :display-members
            @select-date="selectDate"
          />
        </n-form-item-gi>

        <n-form-item-gi label="翻译显示">
          <n-radio-group
            v-model:value="displayMode"
            size="small"
          >
            <n-space
              wrap
              :size="8"
            >
              <n-radio-button value="ja">
                仅日语
              </n-radio-button>
              <n-radio-button value="zh">
                仅中文
              </n-radio-button>
              <n-radio-button value="zh-ja">
                中文在上
              </n-radio-button>
              <n-radio-button value="ja-zh">
                日语在上
              </n-radio-button>
              <n-radio-button value="zh-ja-horizontal">
                中文在左
              </n-radio-button>
              <n-radio-button value="ja-zh-horizontal">
                日语在左
              </n-radio-button>
            </n-space>
          </n-radio-group>
        </n-form-item-gi>

        <n-form-item-gi label="主题">
          <n-radio-group
            v-model:value="themeMode"
            size="small"
          >
            <n-radio-button value="light">
              浅色
            </n-radio-button>
            <n-radio-button value="dark">
              深色
            </n-radio-button>
            <n-radio-button value="system">
              跟随系统
            </n-radio-button>
          </n-radio-group>
        </n-form-item-gi>

        <n-form-item-gi label="主题色">
          <n-radio-group
            v-model:value="primaryColorScheme"
            size="small"
          >
            <n-radio-button value="bluebird">
              BLUEBIRD
            </n-radio-button>
            <n-radio-button value="ikizuraibu">
              いきづらい部！
            </n-radio-button>
          </n-radio-group>
        </n-form-item-gi>
      </n-grid>
    </n-form>
  </n-modal>
</template>

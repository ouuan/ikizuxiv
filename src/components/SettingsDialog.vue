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
import type { DisplayMode, PrimaryColorScheme, ThemeMode } from '../types';

const showDialog = defineModel<boolean>({ required: true });
const displayMode = defineModel<DisplayMode>('displayMode', { required: true });
const themeMode = defineModel<ThemeMode>('themeMode', { required: true });
const primaryColorScheme = defineModel<PrimaryColorScheme>(
  'primaryColorScheme',
  { required: true },
);
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
        <n-form-item-gi label="翻译显示模式">
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

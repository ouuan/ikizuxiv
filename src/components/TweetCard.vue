<script setup lang="ts">
import {
  BookmarkOutline,
  ChatbubbleOutline,
  HeartOutline,
  PlayOutline,
  PlaySkipForwardOutline,
  RepeatOutline,
  StatsChart,
  StopOutline,
} from '@vicons/ionicons5';
import {
  NButton,
  NEmpty,
  NIcon,
  NImage,
  NImageGroup,
} from 'naive-ui';
import {
  computed, nextTick,
  ref, watch,
} from 'vue';
import {
  COLOR, MEMBER_SUFFIX, NAMES, NOT_MEMBER_LABEL, RELEASE_DATE,
} from '../constants';
import { trackEvent } from '../track';
import type {
  DisplayMode, Translation,
  Tweet,
} from '../types';
import { formatTime, getAudioUrl } from '../utils';
import MetricItem from './MetricItem.vue';
import TranslatorInfo from './TranslatorInfo.vue';
import TweetText from './TweetText.vue';

const props = defineProps<{
  tweet: Tweet;
  translation?: Translation;
  labels?: string[];
  hasAudio: boolean;
  displayMode: DisplayMode;
  isAutoPlaying: boolean;
  isGroupedWithPrev: boolean;
  isGroupedWithNext: boolean;
  audioPreload?: 'none' | 'auto';
}>();

const emit = defineEmits<{
  autoPlayStart: [tweetId: string];
  autoPlayNext: [tweetId: string];
  preloadAudio: [tweetId: string];
}>();

const cardRef = ref<HTMLElement>();
const audioRef = ref<HTMLAudioElement>();
const isPlaying = ref(false);

const memberName = computed(() => {
  const names = NAMES[props.tweet.screen_name];
  if (!names) return props.tweet.screen_name;
  if (new Date(props.tweet.created_at) < RELEASE_DATE) return names.old;
  if (props.labels?.includes(NOT_MEMBER_LABEL)) return names.new;
  return names.new + MEMBER_SUFFIX;
});

const memberColor = computed(() => COLOR[props.tweet.screen_name] || '#249fde');

const audioUrl = computed(() => getAudioUrl(props.tweet));

const handlePreloadAudio = () => {
  emit('preloadAudio', props.tweet.id);
};

const avatarUrl = computed(() => {
  if (new Date(props.tweet.created_at) < RELEASE_DATE)
    return `/assets/avatar/old/${props.tweet.screen_name}.webp`;
  return `/assets/avatar/new/${props.tweet.screen_name}.png`;
});

const profileUrl = computed(() => {
  return `https://x.com/${props.tweet.screen_name}`;
});

const statusUrl = computed(() => {
  return `https://x.com/${props.tweet.screen_name}/status/${props.tweet.id}`;
});

const showJapanese = computed(() => {
  return props.displayMode === 'ja'
    || props.displayMode === 'ja-zh'
    || props.displayMode === 'zh-ja'
    || props.displayMode === 'ja-zh-horizontal'
    || props.displayMode === 'zh-ja-horizontal';
});

const showChinese = computed(() => {
  return props.translation && (
    props.displayMode === 'zh'
    || props.displayMode === 'ja-zh'
    || props.displayMode === 'zh-ja'
    || props.displayMode === 'ja-zh-horizontal'
    || props.displayMode === 'zh-ja-horizontal'
  );
});

const showTranslationEmpty = computed(() => {
  const expectsChinese = props.displayMode !== 'ja';
  return expectsChinese && !props.translation;
});

// Determine flex-direction based on display mode
const flexDirection = computed(() => {
  const isHorizontal = props.displayMode === 'zh-ja-horizontal'
    || props.displayMode === 'ja-zh-horizontal';
  const chineseFirst = props.displayMode === 'zh-ja'
    || props.displayMode === 'zh-ja-horizontal';

  if (isHorizontal) {
    return chineseFirst ? 'row-reverse' : 'row';
  }
  return chineseFirst ? 'column-reverse' : 'column';
});

const isHorizontalLayout = computed(() => {
  return props.displayMode === 'zh-ja-horizontal' || props.displayMode === 'ja-zh-horizontal';
});

const playAudio = (e?: MouseEvent) => {
  if (!audioRef.value) return;
  void audioRef.value.play();
  isPlaying.value = true;
  const eventName = e ? 'Manual Play' : 'Auto Play';
  trackEvent(eventName, {
    props: {
      id: props.tweet.id,
      date: props.tweet.created_at,
      from: props.tweet.screen_name,
    },
  });
};

const stopAudio = () => {
  if (!audioRef.value) return;
  audioRef.value.pause();
  audioRef.value.currentTime = 0;
  isPlaying.value = false;
};

const startAutoPlay = (e?: Event) => {
  if (e) e.stopPropagation();
  emit('autoPlayStart', props.tweet.id);
  playAudio();
};

const handleAudioEnded = () => {
  isPlaying.value = false;
  if (props.isAutoPlaying) {
    const delay = props.isGroupedWithNext ? 300 : 1000;
    setTimeout(() => {
      emit('autoPlayNext', props.tweet.id);
    }, delay);
  }
};

// Auto-play when prop changes
watch(() => props.isAutoPlaying, async (newVal) => {
  if (newVal) {
    await nextTick();
    cardRef.value?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    playAudio();
  } else {
    if (audioRef.value && isPlaying.value) {
      audioRef.value.pause();
      audioRef.value.currentTime = 0;
      isPlaying.value = false;
    }
  }
}, { immediate: true });
</script>

<!-- eslint-disable vuejs-accessibility/media-has-caption -->
<template>
  <article
    ref="cardRef"
    class="tweet-card"
    :class="{
      'auto-playing': isAutoPlaying,
      'grouped-prev': isGroupedWithPrev,
      'grouped-next': isGroupedWithNext,
    }"
    :style="{
      '--member-color': memberColor,
    } as any"
  >
    <div class="tweet-container">
      <div
        class="avatar-column"
        :class="{ 'grouped-prev': isGroupedWithPrev, 'grouped-next': isGroupedWithNext }"
      >
        <a
          :href="profileUrl"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            :src="avatarUrl"
            :alt="memberName"
            class="avatar"
          >
        </a>
      </div>

      <div class="tweet-main">
        <div class="tweet-header">
          <a
            :href="profileUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="user-link user-name-link"
          >
            <span class="user-name">
              {{ memberName }}
            </span>
          </a>
          <div class="user-meta">
            <a
              :href="profileUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="user-link user-handle-link"
            >
              <span class="user-handle">
                @{{ tweet.screen_name }}
              </span>
            </a>
            <span class="user-separator">·</span>
            <a
              :href="statusUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="user-time"
              :title="tweet.created_at"
            >{{ formatTime(tweet.created_at) }}</a>
          </div>
        </div>

        <div class="tweet-content">
          <div
            v-if="showJapanese && showChinese"
            class="text-content dual-language"
            :class="{ horizontal: isHorizontalLayout }"
            :style="{ flexDirection }"
          >
            <div class="text-block japanese-text">
              <tweet-text
                :text="tweet.full_text"
                lang="ja"
              />
            </div>
            <div class="text-separator" />
            <div class="text-block chinese-text">
              <tweet-text
                :text="translation!.translation"
                lang="zh-CN"
                :annotations="translation!.annotations"
              />
              <translator-info :translation="translation!" />
            </div>
          </div>

          <div
            v-else-if="showJapanese && showTranslationEmpty"
            class="text-content dual-language"
            :class="{ horizontal: isHorizontalLayout }"
            :style="{ flexDirection }"
          >
            <div class="text-block japanese-text">
              <tweet-text
                :text="tweet.full_text"
                lang="ja"
              />
            </div>
            <div class="text-separator" />
            <div class="text-block chinese-text">
              <div class="empty-translation">
                <n-empty description="暂无翻译" />
              </div>
            </div>
          </div>

          <div
            v-else-if="showJapanese"
            class="text-content"
          >
            <div class="text-block">
              <tweet-text
                :text="tweet.full_text"
                lang="ja"
              />
            </div>
          </div>

          <div
            v-else-if="showChinese"
            class="text-content"
          >
            <div class="text-block">
              <tweet-text
                :text="translation!.translation"
                lang="zh-CN"
                :annotations="translation!.annotations"
              />
              <translator-info :translation="translation!" />
            </div>
          </div>

          <div
            v-else-if="showTranslationEmpty"
            class="text-content"
          >
            <div class="empty-translation">
              <n-empty description="暂无翻译" />
            </div>
          </div>

          <!-- Media Grid -->
          <n-image-group>
            <div
              v-if="tweet.media.length > 0"
              class="media-grid"
              :class="`media-count-${tweet.media.length}`"
            >
              <n-image
                v-for="(media, index) of tweet.media"
                :key="index"
                :src="`/assets/media/${media}`"
                object-fit="cover"
                width="100%"
              />
            </div>
          </n-image-group>

          <!-- Quoted Status -->
          <div
            v-if="tweet.quoted_status"
            class="quoted-status"
          >
            <iframe
              :src="`https://platform.twitter.com/embed/Tweet.html?id=${tweet.quoted_status}`"
              :title="`Quoted Tweet ${tweet.quoted_status}`"
              class="quoted-status-iframe"
            />
          </div>

          <!-- Audio Controls -->
          <div
            v-if="hasAudio"
            class="audio-controls"
          >
            <n-button
              v-if="!isPlaying"
              secondary
              size="small"
              :disabled="isAutoPlaying"
              @click="playAudio"
              @mouseenter="handlePreloadAudio"
              @focus="handlePreloadAudio"
            >
              <template #icon>
                <n-icon :size="16">
                  <play-outline />
                </n-icon>
              </template>
              播放
            </n-button>
            <n-button
              v-else
              secondary
              size="small"
              @click="stopAudio"
            >
              <template #icon>
                <n-icon :size="16">
                  <stop-outline />
                </n-icon>
              </template>
              停止
            </n-button>
            <n-button
              secondary
              size="small"
              :disabled="isAutoPlaying"
              @click="startAutoPlay"
              @mouseenter="handlePreloadAudio"
              @focus="handlePreloadAudio"
            >
              <template #icon>
                <n-icon :size="16">
                  <play-skip-forward-outline />
                </n-icon>
              </template>
              自动播放
            </n-button>
          </div>

          <!-- Metrics -->
          <a
            :href="statusUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="tweet-metrics"
            aria-label="View tweet on X"
          >
            <metric-item
              :icon="ChatbubbleOutline"
              :count="tweet.reply_count"
            />
            <metric-item
              :icon="RepeatOutline"
              :count="tweet.retweet_count + tweet.quote_count"
            />
            <metric-item
              :icon="HeartOutline"
              :count="tweet.favorite_count"
            />
            <metric-item
              :icon="StatsChart"
              :count="tweet.views_count"
            />
            <metric-item
              :icon="BookmarkOutline"
              :count="tweet.bookmark_count"
            />
          </a>

          <audio
            v-if="hasAudio"
            ref="audioRef"
            :src="audioUrl"
            :preload="audioPreload || 'none'"
            @ended="handleAudioEnded"
          />
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped>
.tweet-card {
    background-color: #ffffff;
    border-bottom: 1px solid rgb(239, 243, 244);
    padding: 12px 16px;
    transition: background-color 0.2s, border 0.2s;
}

.tweet-card.grouped-next {
  border-bottom-color: transparent;
}

.tweet-card.auto-playing {
  outline: 2px solid var(--member-color);
  outline-offset: -2px;
    background-color: color-mix(in srgb, var(--member-color) 5%, rgb(255, 255, 255));
}

.dark .tweet-card {
  background-color: #0f1419;
    border-bottom-color: rgb(47, 51, 54);
}

.dark .tweet-card.grouped-next {
  border-bottom-color: transparent;
}

.dark .tweet-card.auto-playing {
  outline-color: var(--member-color);
    background-color: color-mix(in srgb, var(--member-color) 10%, rgb(15, 20, 25));
}

.tweet-container {
    display: flex;
    gap: 12px;
}

.avatar-column {
    flex-shrink: 0;
  position: relative;
  width: 48px;
}

.avatar-column::before,
.avatar-column::after {
  content: '';
  position: absolute;
  left: 50%;
  width: 2px;
  background-color: rgb(239, 243, 244);
  transform: translateX(-50%);
  z-index: 0;
}

.avatar-column::before {
  top: -13px;
  bottom: calc(100% - 48px);
  opacity: 0;
}

.avatar-column::after {
  top: 48px;
  bottom: -13px;
  opacity: 0;
}

.avatar-column.grouped-prev::before {
  opacity: 1;
}

.avatar-column.grouped-next::after {
  opacity: 1;
}

.dark .avatar-column::before,
.dark .avatar-column::after {
  background-color: rgb(47, 51, 54);
}

.avatar-column a {
    text-decoration: none;
}

.avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    object-fit: cover;
  position: relative;
  z-index: 1;
  background-color: #ffffff;
}

.dark .avatar {
  background-color: #0f1419;
}

.tweet-main {
    flex: 1;
    min-width: 0;
}

.tweet-header {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: nowrap;
    margin-bottom: 6px;
}

.user-link {
    text-decoration: none;
    color: inherit;
  display: inline-flex;
  align-items: center;
  gap: 6px;
   min-width: 0;
   max-width: 100%;
}

.user-name-link {
  flex: 0 1 auto;
}

.user-meta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  min-width: 0;
}

.user-link:hover .user-name {
    text-decoration: underline;
}

.user-name {
    font-size: 15px;
    font-weight: 700;
    color: rgb(15, 20, 25);
    line-height: 20px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
  max-width: 100%;
}

.dark .user-name {
    color: rgb(231, 233, 234);
}

.user-handle {
    font-size: 15px;
    color: rgb(83, 100, 113);
    line-height: 20px;
  white-space: nowrap;
  flex-shrink: 0;
}

.dark .user-handle {
    color: rgb(113, 118, 123);
}

.user-separator,
.user-time {
  font-size: 15px;
  line-height: 20px;
  color: rgb(83, 100, 113);
  flex-shrink: 0;
  text-decoration: none;
}

.dark .user-separator,
.dark .user-time {
  color: rgb(113, 118, 123);
}

@media (max-width: 420px) {
  .tweet-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
  }

  .user-name-link {
    max-width: 100%;
  }
}

.text-content {
    margin-bottom: 12px;
}

.text-content.dual-language {
    display: flex;
    gap: 16px;
}

.text-content.dual-language.horizontal .text-block {
    flex: 1;
    min-width: 0;
}

.text-block {
    min-width: 0;
}

.text-separator {
    background-color: rgb(239, 243, 244);
}

.empty-translation :deep(.n-empty) {
  padding: 12px 0;
}

/* For column layout (vertical) */
.text-content.dual-language:not(.horizontal) .text-separator {
    width: 100%;
    height: 1px;
}

/* For row layout (horizontal) */
.text-content.dual-language.horizontal .text-separator {
    width: 1px;
    height: auto;
    margin: 0;
}

.dark .text-separator {
    background-color: rgb(47, 51, 54);
}

.media-grid {
    margin-bottom: 12px;
    display: grid;
    gap: 2px;
    border-radius: 16px;
    overflow: hidden;
    max-width: 100%;
}

.media-count-1 {
    grid-template-columns: 1fr;
}

.media-count-2 {
    grid-template-columns: 1fr 1fr;
}

.media-count-3 {
    grid-template-columns: 1fr 1fr;
}

.media-count-3 :deep(.n-image:first-child) {
    grid-column: 1 / -1;
}

.media-count-4 {
    grid-template-columns: 1fr 1fr;
}

.quoted-status {
    margin-bottom: 12px;
}

.quoted-status-iframe {
    width: 100%;
    min-height: 300px;
    border: 1px solid rgb(239, 243, 244);
    border-radius: 16px;
}

.dark .quoted-status-iframe {
    border-color: rgb(47, 51, 54);
}

.tweet-time {
    font-size: 15px;
    color: rgb(83, 100, 113);
    margin-bottom: 12px;
  text-decoration: none;
}

.dark .tweet-time {
    color: rgb(113, 118, 123);
}

.tweet-metrics {
    display: flex;
    justify-content: space-between;
    padding: 12px 0;
  margin-bottom: 12px;
  text-decoration: none;
}

.audio-controls {
    display: flex;
    gap: 8px;
  margin-bottom: 6px;
    flex-wrap: wrap;
}

.tweet-metrics {
  padding: 8px 0;
  margin-bottom: 0px;
}
</style>

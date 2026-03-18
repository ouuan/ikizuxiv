<script setup lang="ts">
import {
  BookmarkOutline,
  ChatbubbleOutline,
  HeartOutline,
  LanguageOutline,
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
import useAvatarSrc from '../composables/useAvatarSrc';
import useThemeMode from '../composables/useThemeMode';
import {
  COLOR, MEMBER_SUFFIX, NAMES, NOT_MEMBER_LABEL, RELEASE_DATE,
} from '../constants';
import { trackEvent } from '../track';
import type { DisplayMode, ExtendedTweet } from '../types';
import { formatTime, getAudioUrl, toDateString } from '../utils';
import MetricItem from './MetricItem.vue';
import TranslatorInfo from './TranslatorInfo.vue';
import TweetText from './TweetText.vue';

const props = defineProps<{
  tweet: ExtendedTweet;
  displayMode: DisplayMode;
  isAutoPlaying: boolean;
  isGroupedWithPrev: boolean;
  isGroupedWithNext: boolean;
  audioPreload?: 'none' | 'auto';
  memberFilter: string;
  isSearch?: boolean;
  quotedTweet?: ExtendedTweet;
}>();

const emit = defineEmits<{
  autoPlayStart: [tweetId: string];
  autoPlayNext: [tweetId: string];
  autoPlayStop: [];
  preloadAudio: [tweetId: string];
  selectMember: [member: string];
}>();

const cardRef = ref<HTMLElement>();
const audioRef = ref<HTMLAudioElement>();
const isPlaying = ref(false);
const showAnnotation = ref<string>();
const isDisplayModeToggled = ref(false);

const isSingleLanguageMode = computed(
  () => props.displayMode === 'ja' || props.displayMode === 'zh',
);

const effectiveDisplayMode = computed(() => {
  if (!isDisplayModeToggled.value) return props.displayMode;
  return props.displayMode === 'ja' ? 'zh' : 'ja';
});

const toggleDisplayModeTooltip = computed(() => {
  return props.displayMode === 'ja' ? '切换为显示中文' : '切换为显示日语';
});

const toggleDisplayMode = () => {
  if (!isSingleLanguageMode.value) return;
  isDisplayModeToggled.value = !isDisplayModeToggled.value;
};

const memberName = computed(() => {
  const names = NAMES[props.tweet.screen_name];
  if (!names) return props.tweet.screen_name;
  if (new Date(props.tweet.created_at) < RELEASE_DATE) return names.old;
  if (props.tweet.labels?.includes(NOT_MEMBER_LABEL)) return names.new;
  return names.new + MEMBER_SUFFIX;
});

const memberColor = computed(() => COLOR[props.tweet.screen_name] || '#249fde');

const audioUrl = computed(() => getAudioUrl(props.tweet));

const handlePreloadAudio = () => {
  emit('preloadAudio', props.tweet.id);
};

const avatarSrc = useAvatarSrc(props.tweet);

const statusUrl = computed(() => {
  if (props.isSearch) {
    const params = new URLSearchParams();
    params.set('date', toDateString(new Date(props.tweet.created_at)));
    params.set('filter', props.tweet.screen_name);
    return `#?${params}`;
  }
  return `https://x.com/${props.tweet.screen_name}/status/${props.tweet.id}`;
});

const showJapanese = computed(() => effectiveDisplayMode.value !== 'zh');

const showChinese = computed(() => effectiveDisplayMode.value !== 'ja');

// Determine flex-direction based on display mode
const flexDirection = computed(() => {
  const isHorizontal = effectiveDisplayMode.value === 'zh-ja-horizontal'
    || effectiveDisplayMode.value === 'ja-zh-horizontal';
  const chineseFirst = effectiveDisplayMode.value === 'zh-ja'
    || effectiveDisplayMode.value === 'zh-ja-horizontal';

  if (isHorizontal) {
    return chineseFirst ? 'row-reverse' : 'row';
  }
  return chineseFirst ? 'column-reverse' : 'column';
});

const isHorizontalLayout = computed(() => {
  return effectiveDisplayMode.value === 'zh-ja-horizontal'
    || effectiveDisplayMode.value === 'ja-zh-horizontal';
});

const { themeMode } = useThemeMode();

const playAudio = (e?: MouseEvent) => {
  if (!audioRef.value) return;
  if (e) emit('autoPlayStop');
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
  emit('autoPlayStop');
};

const startAutoPlay = (e?: Event) => {
  if (e) e.stopPropagation();
  emit('autoPlayStart', props.tweet.id);
  playAudio();
};

const handleAudioEnded = () => {
  isPlaying.value = false;
  if (props.isAutoPlaying) {
    // Check if there are annotations to display
    const annotationEntries = Object.entries(props.tweet.translation?.annotations ?? {});

    if (annotationEntries.length > 0) {
      let cumulativeDelay = 0;

      // Sort annotations by their occurrence position in the text
      const translationText = props.tweet.translation?.translation ?? '';
      const sortedAnnotationEntries = annotationEntries.sort(([termA], [termB]) => {
        const posA = translationText.indexOf(termA);
        const posB = translationText.indexOf(termB);
        return posA - posB;
      });

      // Show annotations one by one
      sortedAnnotationEntries.forEach(([term, annotation], index) => {
        const annotationLength = annotation.text.length + (annotation.images ?? []).length * 5;
        const displayDuration = annotationLength * 80 + 500;

        setTimeout(() => {
          showAnnotation.value = term;
          if (index === sortedAnnotationEntries.length - 1) {
            setTimeout(() => {
              showAnnotation.value = undefined;
              emit('autoPlayNext', props.tweet.id);
            }, displayDuration);
          }
        }, cumulativeDelay);

        cumulativeDelay += displayDuration;
      });
    } else {
      // No annotations, proceed to next tweet immediately
      const delay = props.isGroupedWithNext ? 300 : 1000;
      setTimeout(() => {
        emit('autoPlayNext', props.tweet.id);
      }, delay);
    }
  }
};

watch(() => props.displayMode, () => {
  isDisplayModeToggled.value = false;
});

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

const toggleFilterTooltip = computed(
  () => props.memberFilter === props.tweet.screen_name
    ? '取消筛选'
    : `筛选${NAMES[props.tweet.screen_name]?.new ?? props.tweet.screen_name}的推文`,
);
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
        <n-button
          text
          :aria-label="toggleFilterTooltip"
          :title="toggleFilterTooltip"
          @click="emit('selectMember', tweet.screen_name)"
        >
          <img
            :src="avatarSrc"
            :alt="memberName"
            class="avatar"
          >
        </n-button>
      </div>

      <div class="tweet-main">
        <div
          class="tweet-header"
          :class="{ 'has-display-mode-toggle': isSingleLanguageMode }"
        >
          <n-button
            v-if="isSingleLanguageMode"
            text
            circle
            size="small"
            class="display-mode-button"
            :aria-label="toggleDisplayModeTooltip"
            :title="toggleDisplayModeTooltip"
            @click="toggleDisplayMode"
          >
            <template #icon>
              <n-icon :size="16">
                <language-outline />
              </n-icon>
            </template>
          </n-button>
          <n-button
            text
            class="user-link user-name-link"
            :aria-label="toggleFilterTooltip"
            :title="toggleFilterTooltip"
            @click="emit('selectMember', tweet.screen_name)"
          >
            <span class="user-name">
              {{ memberName }}
            </span>
          </n-button>
          <div class="user-meta">
            <n-button
              text
              class="user-link user-handle-link"
              :aria-label="toggleFilterTooltip"
              :title="toggleFilterTooltip"
              @click="emit('selectMember', tweet.screen_name)"
            >
              <span class="user-handle">
                @{{ tweet.screen_name }}
              </span>
            </n-button>
            <span class="user-separator">·</span>
            <a
              :href="statusUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="user-time"
              aria-label="在 X 查看原始推文"
              :title="tweet.created_at"
            >{{ formatTime(tweet.created_at, props.isSearch) }}</a>
          </div>
        </div>

        <div>
          <div
            v-if="showJapanese && showChinese"
            class="text-content dual-language"
            :class="{ horizontal: isHorizontalLayout }"
            :style="{ flexDirection }"
          >
            <div class="text-block">
              <tweet-text
                :text="tweet.full_text"
                lang="ja"
              />
            </div>
            <div class="text-separator" />
            <div
              v-if="tweet.translation"
              class="text-block"
            >
              <tweet-text
                :text="tweet.translation.translation"
                lang="zh-CN"
                :annotations="tweet.translation.annotations"
                :show-annotation
              />
              <translator-info :translation="tweet.translation" />
            </div>
            <div v-else>
              <n-empty description="暂无翻译" />
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
            v-else
            class="text-content"
          >
            <div
              v-if="tweet.translation"
              class="text-block"
            >
              <tweet-text
                :text="tweet.translation.translation"
                lang="zh-CN"
                :annotations="tweet.translation.annotations"
                :show-annotation
              />
              <translator-info :translation="tweet.translation" />
            </div>
            <div v-else>
              <n-empty description="暂无翻译" />
            </div>
          </div>

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
                :alt="`${memberName} 的推文图片 ${index + 1}`"
                object-fit="cover"
                width="100%"
              />
            </div>
          </n-image-group>

          <div
            v-if="tweet.quoted_status"
            :style="{ marginBottom: '12px' }"
          >
            <tweet-card
              v-if="quotedTweet"
              :tweet="quotedTweet"
              :display-mode
              :is-auto-playing="false"
              :is-grouped-with-prev="false"
              :is-grouped-with-next="false"
              :member-filter
              class="quoted-status"
              @select-member="emit('selectMember', $event)"
            />
            <iframe
              v-else
              :src="`https://platform.twitter.com/embed/Tweet.html?id=${tweet.quoted_status}&theme=${themeMode}`"
              :title="`Quoted Tweet ${tweet.quoted_status}`"
              loading="lazy"
              referrerpolicy="no-referrer"
              class="quoted-status"
            />
          </div>

          <div
            v-if="tweet.hasAudio"
            class="audio-controls"
          >
            <n-button
              v-if="!isPlaying"
              secondary
              size="small"
              aria-label="播放配音"
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
              aria-label="停止播放配音"
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
              aria-label="自动播放后续配音"
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

          <a
            :href="statusUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="tweet-metrics"
            aria-label="在 X 查看推文"
          >
            <metric-item
              :icon="ChatbubbleOutline"
              :count="tweet.reply_count"
              name="回复数"
            />
            <metric-item
              :icon="RepeatOutline"
              :count="tweet.retweet_count + tweet.quote_count"
              name="转发数"
            />
            <metric-item
              :icon="HeartOutline"
              :count="tweet.favorite_count"
              name="点赞数"
            />
            <metric-item
              :icon="StatsChart"
              :count="tweet.views_count"
              name="浏览量"
            />
            <metric-item
              :icon="BookmarkOutline"
              :count="tweet.bookmark_count"
              name="收藏数"
            />
          </a>

          <audio
            v-if="tweet.hasAudio"
            ref="audioRef"
            :src="audioUrl"
            :preload="audioPreload || 'none'"
            aria-label="推文配音播放"
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

.avatar-column :deep(button) {
  padding: 0;
  border-radius: 50%;
}

.avatar-column :deep(button:hover) {
  background-color: black;
}

.avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    object-fit: cover;
  position: relative;
  z-index: 1;
  background-color: #ffffff;
  transition: opacity 0.2s ease;
}

.avatar-column :deep(button:hover) .avatar {
  opacity: 0.9;
}

.dark .avatar-column :deep(button:hover) .avatar {
  opacity: 0.8;
}

.tweet-main {
    flex: 1;
    min-width: 0;
    position: relative;
}

.tweet-header {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: nowrap;
    margin-bottom: 6px;
}

.tweet-header.has-display-mode-toggle {
    padding-right: 36px;
}

.display-mode-button {
  position: absolute;
  top: 0;
  right: 0;
  color: rgb(83, 100, 113);
}

.display-mode-button:hover {
  color: rgb(15, 20, 25);
}

.dark .display-mode-button {
  color: rgb(113, 118, 123);
}

.dark .display-mode-button:hover {
  color: rgb(231, 233, 234);
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

iframe.quoted-status {
    width: 100%;
    min-height: 300px;
}

.quoted-status {
    border: 1px solid rgb(239, 243, 244);
    border-radius: 16px;
}

.dark .quoted-status {
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

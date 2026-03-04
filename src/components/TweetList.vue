<script setup lang="ts">
import { NButton, NEmpty, NSpin } from 'naive-ui';
import { ref, watch } from 'vue';
import type { DisplayMode, ExtendedTweet } from '../types';
import { getAudioUrl } from '../utils';
import TweetCard from './TweetCard.vue';

const props = defineProps<{
  currentDayTweets: ExtendedTweet[] | null;
  loading: boolean;
  displayMode: DisplayMode;
  memberFilter: string;
  filterName: string;
  hasNext: boolean;
  nextDayTweets: ExtendedTweet[] | null;
  isSearch?: boolean;
}>();

const emit = defineEmits<{
  next: [];
  selectMember: [member: string];
}>();

const autoPlayingTweetId = ref<string | null>(null);
const preloadAudioIds = ref(new Set<string>());
const nextDayFirstAudioUrl = ref<string | null>(null);

const isGrouped = (lhs?: ExtendedTweet, rhs?: ExtendedTweet) => {
  if (!lhs || !rhs) return false;
  if (lhs.screen_name !== rhs.screen_name) return false;
  const lhsTime = new Date(lhs.created_at).getTime();
  const rhsTime = new Date(rhs.created_at).getTime();
  return Math.abs(rhsTime - lhsTime) < 10 * 60 * 1000;
};

const stopAutoPlay = () => {
  autoPlayingTweetId.value = null;
};

const onPreloadAudio = (tweetId: string) => {
  preloadAudioIds.value.add(tweetId);
};

function preloadNextDayFirstAudio() {
  if (props.hasNext) {
    const firstAudioTweet = props.nextDayTweets?.find((t) => t.hasAudio);
    if (firstAudioTweet) {
      nextDayFirstAudioUrl.value = getAudioUrl(firstAudioTweet);
      return;
    }
  }
  nextDayFirstAudioUrl.value = null;
};

function getNextAudioTweet(id: string) {
  const currentIndex = props.currentDayTweets?.findIndex((t) => t.id === id) ?? -1;
  if (currentIndex < 0) return null;
  return props.currentDayTweets?.slice(currentIndex + 1).find((t) => t.hasAudio) ?? null;
}

const autoPlayTweet = (tweetId: string) => {
  autoPlayingTweetId.value = tweetId;
  const nextAudioTweet = getNextAudioTweet(tweetId);
  if (nextAudioTweet) preloadAudioIds.value.add(nextAudioTweet.id);
  else preloadNextDayFirstAudio();
};

const onAutoPlayNext = (currentId: string) => {
  const nextAudioTweet = getNextAudioTweet(currentId);
  if (nextAudioTweet) {
    autoPlayTweet(nextAudioTweet.id);
  } else if (nextDayFirstAudioUrl.value) {
    emit('next');
  } else {
    autoPlayingTweetId.value = null;
  }
};

watch(() => props.currentDayTweets, (newTweets) => {
  if (autoPlayingTweetId.value) {
    const firstAudioTweet = newTweets?.find((t) => t.hasAudio);
    if (firstAudioTweet) autoPlayTweet(firstAudioTweet.id);
  }
});
</script>

<!-- eslint-disable vuejs-accessibility/media-has-caption -->
<template>
  <div>
    <n-spin :show="loading">
      <div
        v-if="!currentDayTweets?.length"
        :style="{ padding: '16px' }"
      >
        <n-empty :description="`这一天${filterName}没有推文`" />
      </div>
      <div v-else>
        <tweet-card
          v-for="(tweet, index) of currentDayTweets"
          :key="tweet.id"
          :tweet
          :display-mode
          :is-auto-playing="autoPlayingTweetId === tweet.id"
          :is-grouped-with-prev="isGrouped(tweet, currentDayTweets[index - 1])"
          :is-grouped-with-next="isGrouped(tweet, currentDayTweets[index + 1])"
          :audio-preload="preloadAudioIds.has(tweet.id) ? 'auto' : 'none'"
          :member-filter
          :is-search
          @auto-play-start="autoPlayTweet"
          @auto-play-next="onAutoPlayNext"
          @auto-play-stop="stopAutoPlay"
          @preload-audio="onPreloadAudio"
          @select-member="emit('selectMember', $event)"
        />
        <n-button
          v-if="hasNext"
          quaternary
          type="info"
          size="large"
          style="width: 100%;"
          @click="emit('next')"
        >
          下一天
        </n-button>
      </div>
    </n-spin>
    <!-- Hidden audio element for preloading next day's first audio -->
    <audio
      v-if="nextDayFirstAudioUrl"
      :src="nextDayFirstAudioUrl"
      preload="auto"
      style="display: none;"
    />
  </div>
</template>

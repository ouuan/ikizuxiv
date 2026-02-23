<script setup lang="ts">
import { useEventListener } from '@vueuse/core';
import { NButton, NEmpty, NSpin } from 'naive-ui';
import { computed, ref, watch } from 'vue';
import type { DayData, DisplayMode, Tweet } from '../types';
import { getAudioUrl } from '../utils';
import TweetCard from './TweetCard.vue';

const props = defineProps<{
  dayData: DayData | null;
  loading: boolean;
  displayMode: DisplayMode;
  currentDate: string;
  hasNext: boolean;
  nextDayData: DayData | null;
}>();

const emit = defineEmits<{
  next: [];
}>();

const autoPlayingTweetId = ref<string | null>(null);
const pendingAutoPlay = ref(false);
const preloadAudioIds = ref<Set<string>>(new Set());
const nextDayFirstAudioUrl = ref<string | null>(null);
const tweetsArray = computed(() => {
  if (!props.dayData?.tweets) return [];
  return Object.values(props.dayData.tweets).sort((a, b) => {
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });
});

const isGrouped = (current: Tweet, next: Tweet | undefined) => {
  if (!next) return false;
  if (current.screen_name !== next.screen_name) return false;
  const currentTime = new Date(current.created_at).getTime();
  const nextTime = new Date(next.created_at).getTime();
  return nextTime - currentTime < 10 * 60 * 1000;
};

const stopAutoPlay = () => {
  autoPlayingTweetId.value = null;
};

const onPreloadAudio = (tweetId: string) => {
  preloadAudioIds.value.add(tweetId);
};

const preloadNextDayFirstAudio = () => {
  if (!props.hasNext || !props.nextDayData?.audio || props.nextDayData.audio.length === 0) {
    return;
  }
  const firstAudioId = props.nextDayData.audio[0];
  if (firstAudioId) {
    const tweets = Object.values(props.nextDayData.tweets);
    const firstAudioTweet = tweets.find((t) => t.id === firstAudioId);
    if (firstAudioTweet) {
      nextDayFirstAudioUrl.value = getAudioUrl(firstAudioTweet);
    }
  }
};

const onAutoPlayStart = (tweetId: string) => {
  pendingAutoPlay.value = false;
  autoPlayingTweetId.value = tweetId;
  const currentIndex = tweetsArray.value.findIndex((t) => t.id === tweetId);
  if (currentIndex >= 0 && currentIndex < tweetsArray.value.length - 1) {
    const nextTweet = tweetsArray.value[currentIndex + 1];
    if (nextTweet) preloadAudioIds.value.add(nextTweet.id);
  }
  // Preload next day's first audio when starting the last tweet
  if (currentIndex === tweetsArray.value.length - 1) {
    preloadNextDayFirstAudio();
  }
};

const onAutoPlayNext = (currentId: string) => {
  const currentIndex = tweetsArray.value.findIndex((t) => t.id === currentId);
  if (currentIndex >= 0 && currentIndex < tweetsArray.value.length - 1) {
    const nextTweet = tweetsArray.value[currentIndex + 1];
    if (nextTweet) {
      autoPlayingTweetId.value = nextTweet.id;
      // Enable preload for next tweet
      preloadAudioIds.value.add(nextTweet.id);
      // Also preload the one after next
      if (currentIndex + 2 < tweetsArray.value.length) {
        const nextNextTweet = tweetsArray.value[currentIndex + 2];
        if (nextNextTweet) preloadAudioIds.value.add(nextNextTweet.id);
      }
      // Preload next day's first audio when finishing the second-to-last tweet
      if (currentIndex === tweetsArray.value.length - 2) {
        preloadNextDayFirstAudio();
      }
    }
  } else if (props.hasNext) {
    pendingAutoPlay.value = true;
    emit('next');
  } else {
    autoPlayingTweetId.value = null;
  }
};

// Stop auto-play on click - using VueUse's useEventListener
useEventListener(window, 'click', () => {
  if (autoPlayingTweetId.value) {
    stopAutoPlay();
  }
});

// Reset auto-play when date changes
watch(() => props.currentDate, () => {
  if (!pendingAutoPlay.value) {
    autoPlayingTweetId.value = null;
  }
});

watch(tweetsArray, (newTweets) => {
  if (!pendingAutoPlay.value) return;
  const firstTweet = newTweets[0];
  if (firstTweet) onAutoPlayStart(firstTweet.id);
});
</script>

<!-- eslint-disable vuejs-accessibility/media-has-caption -->
<template>
  <div class="tweet-list">
    <n-spin :show="loading">
      <div
        v-if="!dayData?.tweets || Object.keys(dayData.tweets).length === 0"
        class="empty-container"
      >
        <n-empty description="这一天没有推文" />
      </div>
      <div v-else>
        <tweet-card
          v-for="(tweet, index) of tweetsArray"
          :key="tweet.id"
          :tweet="tweet"
          :translation="dayData.translations?.[tweet.id]"
          :labels="dayData.labels?.[tweet.id]"
          :has-audio="dayData.audio?.includes(tweet.id) || false"
          :display-mode="displayMode"
          :is-auto-playing="autoPlayingTweetId === tweet.id"
          :is-grouped-with-prev="
            index > 0 && isGrouped(tweetsArray[index - 1]!, tweet)
          "
          :is-grouped-with-next="
            index < tweetsArray.length - 1 && isGrouped(tweet, tweetsArray[index + 1]!)
          "
          :audio-preload="preloadAudioIds.has(tweet.id) ? 'auto' : 'none'"
          @auto-play-start="onAutoPlayStart"
          @auto-play-next="onAutoPlayNext"
          @preload-audio="onPreloadAudio"
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

<style scoped>
.tweet-list {
    min-height: calc(100vh - 200px);
}

.empty-container {
    padding: 60px 20px;
}
</style>

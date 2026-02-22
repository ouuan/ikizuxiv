<script setup lang="ts">
import { useEventListener } from '@vueuse/core';
import { NButton, NEmpty, NSpin } from 'naive-ui';
import { computed, ref, watch } from 'vue';
import type { DayData, DisplayMode, Tweet } from '../types';
import TweetCard from './TweetCard.vue';

const props = defineProps<{
  dayData: DayData | null;
  loading: boolean;
  displayMode: DisplayMode;
  currentDate: string;
  hasNext: boolean;
}>();

const emit = defineEmits<{
  next: [];
  prefetchNext: [];
}>();

const autoPlayingTweetId = ref<string | null>(null);
const pendingAutoPlay = ref(false);
const tweetsArray = computed(() => {
  if (!props.dayData?.tweets) return [];
  return Object.values(props.dayData.tweets).sort((a, b) => {
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });
});

const lastTweetId = computed(() => {
  const lastTweet = tweetsArray.value[tweetsArray.value.length - 1];
  return lastTweet?.id ?? null;
});

const audioIdSet = computed(() => new Set(props.dayData?.audio ?? []));

const getAudioUrl = (tweet: Tweet | undefined) => {
  if (!tweet) return null;
  if (!audioIdSet.value.has(tweet.id)) return null;
  const date = new Date(tweet.created_at);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `/assets/audio/${year}/${month}/${tweet.id}.mp3`;
};

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

const onAutoPlayStart = (tweetId: string) => {
  pendingAutoPlay.value = false;
  autoPlayingTweetId.value = tweetId;
  if (props.hasNext && lastTweetId.value === tweetId) {
    emit('prefetchNext');
  }
};

const onAutoPlayNext = (currentId: string) => {
  const currentIndex = tweetsArray.value.findIndex((t) => t.id === currentId);
  if (currentIndex >= 0 && currentIndex < tweetsArray.value.length - 1) {
    const nextTweet = tweetsArray.value[currentIndex + 1];
    if (nextTweet) autoPlayingTweetId.value = nextTweet.id;
    if (currentIndex === tweetsArray.value.length - 2 && props.hasNext) {
      emit('prefetchNext');
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
  if (!firstTweet) return;
  autoPlayingTweetId.value = firstTweet.id;
  pendingAutoPlay.value = false;
});
</script>

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
          :has-audio="dayData.audio?.includes(tweet.id) || false"
          :next-audio-url="getAudioUrl(tweetsArray[index + 1])"
          :display-mode="displayMode"
          :is-auto-playing="autoPlayingTweetId === tweet.id"
          :is-grouped-with-prev="
            index > 0 && isGrouped(tweetsArray[index - 1]!, tweet)
          "
          :is-grouped-with-next="
            index < tweetsArray.length - 1 && isGrouped(tweet, tweetsArray[index + 1]!)
          "
          @auto-play-start="onAutoPlayStart"
          @auto-play-next="onAutoPlayNext"
        />
        <n-button
          v-if="hasNext"
          quaternary
          type="info"
          size="large"
          style="width: 100%;"
          @click="emit('next')"
          @mouseenter="emit('prefetchNext')"
          @focus="emit('prefetchNext')"
        >
          下一天
        </n-button>
      </div>
    </n-spin>
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

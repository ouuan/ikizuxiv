import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import { RELEASE_DATE } from '../constants';
import type { Tweet } from '../types';
import { getAvatarUrl } from '../utils';

export default function useAvatarSrc(tweet: MaybeRefOrGetter<Tweet>) {
  return computed(() => {
    const t = toValue(tweet);
    return getAvatarUrl(t.screen_name, new Date(t.created_at) < RELEASE_DATE);
  });
}

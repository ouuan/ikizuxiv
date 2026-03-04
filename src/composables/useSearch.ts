import { useMessage } from 'naive-ui';
import { ref } from 'vue';
import type { ExtendedTweet } from '../types';

export interface MeilisearchResponse {
  hits: ExtendedTweet[];
  offset?: number;
  limit?: number;
  estimatedTotalHits?: number;
  processingTimeMs?: number;
}

export type SortOrder = 'asc' | 'desc' | '';
const SEARCH_PAGE_SIZE = 20;

export function useSearch() {
  const searchPattern = ref('');
  const searchResults = ref<ExtendedTweet[] | null>(null);
  const isSearching = ref(false);
  const isLoadingMore = ref(false);
  const hasMore = ref(false);

  const currentDisplayMembers = ref<string[] | null>(null);
  const currentSortOrder = ref<SortOrder>('');
  const currentOffset = ref(0);
  const message = useMessage();

  async function requestSearch(offset: number, append: boolean) {
    const meiliUrl = import.meta.env.VITE_MEILI_URL;
    const meiliKey = import.meta.env.VITE_MEILI_SEARCH_KEY;

    const searchBody: Record<string, unknown> = {
      q: searchPattern.value,
      offset,
      limit: SEARCH_PAGE_SIZE,
    };

    if (currentDisplayMembers.value && currentDisplayMembers.value.length > 0) {
      const filterStr = currentDisplayMembers.value
        .map((member) => `screen_name = "${member}"`)
        .join(' OR ');
      searchBody.filter = filterStr;
    }

    if (currentSortOrder.value) searchBody.sort = [`created_at:${currentSortOrder.value}`];

    const response = await fetch(
      new URL('/indexes/ikizuxiv/search', meiliUrl),
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${meiliKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchBody),
      },
    );

    if (!response.ok) {
      throw new Error(`Search failed with status ${response.status}`);
    }

    const { hits, estimatedTotalHits } = await response.json() as MeilisearchResponse;
    const total = estimatedTotalHits ?? 0;

    searchResults.value = append
      ? [...(searchResults.value ?? []), ...hits]
      : hits;
    currentOffset.value = offset + hits.length;
    hasMore.value = currentOffset.value < total;
  }

  async function search(
    pattern: string,
    displayMembers: string[] | null,
    sortOrder: SortOrder,
  ) {
    if (!pattern.trim()) {
      searchResults.value = null;
      hasMore.value = false;
      currentOffset.value = 0;
      return;
    }

    searchPattern.value = pattern;
    currentDisplayMembers.value = displayMembers;
    currentSortOrder.value = sortOrder;
    isSearching.value = true;

    try {
      await requestSearch(0, false);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Search error:', error);
      message.error('搜索出错');
      searchResults.value = null;
      hasMore.value = false;
    } finally {
      isSearching.value = false;
    }
  }

  async function loadMore() {
    if (!searchPattern.value.trim()) return;
    if (!hasMore.value || isSearching.value || isLoadingMore.value) return;

    isLoadingMore.value = true;
    try {
      await requestSearch(currentOffset.value, true);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Load more search error:', error);
      message.error('加载更多搜索结果失败');
    } finally {
      isLoadingMore.value = false;
    }
  }

  function clearSearch() {
    searchPattern.value = '';
    searchResults.value = null;
    hasMore.value = false;
    currentOffset.value = 0;
  }

  return {
    searchPattern,
    searchResults,
    isSearching,
    isLoadingMore,
    hasMore,
    search,
    loadMore,
    clearSearch,
  };
}

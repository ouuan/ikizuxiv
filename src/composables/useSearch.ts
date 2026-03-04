import { useMessage } from 'naive-ui';
import { ref } from 'vue';
import type { ExtendedTweet } from '../types';

export interface MeilisearchResponse {
  results: ExtendedTweet[];
  offset?: number;
  limit?: number;
  estimatedTotalHits?: number;
  processingTimeMs?: number;
}

export type SortOrder = 'asc' | 'desc' | '';

export function useSearch() {
  const searchPattern = ref('');
  const searchResults = ref<ExtendedTweet[] | null>(null);
  const isSearching = ref(false);
  const message = useMessage();

  async function search(
    pattern: string,
    displayMembers: string[] | null,
    sortOrder: SortOrder,
  ) {
    if (!pattern.trim()) {
      searchResults.value = null;
      return;
    }

    searchPattern.value = pattern;
    isSearching.value = true;

    try {
      const meiliUrl = import.meta.env.VITE_MEILI_URL;
      const meiliKey = import.meta.env.VITE_MEILI_SEARCH_KEY;

      const searchBody: Record<string, unknown> = {
        q: pattern,
      };

      // Add member filter if provided
      if (displayMembers && displayMembers.length > 0) {
        const filterStr = displayMembers
          .map((member) => `screen_name = "${member}"`)
          .join(' OR ');
        searchBody.filter = filterStr;
      }

      if (sortOrder) searchBody.sort = [`created_at:${sortOrder}`];

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

      const data = await response.json();
      searchResults.value = data.hits || null;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Search error:', error);
      message.error('搜索出错');
      searchResults.value = null;
    } finally {
      isSearching.value = false;
    }
  }

  function clearSearch() {
    searchPattern.value = '';
    searchResults.value = null;
  }

  return {
    searchPattern,
    searchResults,
    isSearching,
    search,
    clearSearch,
  };
}

export interface Tweet {
  id: string;
  created_at: string;
  full_text: string;
  screen_name: string;
  favorite_count: number;
  retweet_count: number;
  bookmark_count: number;
  quoted_status: string | null;
  quote_count: number;
  reply_count: number;
  views_count: number;
  media: string[];
}

export interface Translation {
  translator: string;
  source: string;
  translation: string;
  comments?: string;
}

export interface DayData {
  tweets: Record<string, Tweet>;
  translations?: Record<string, Translation>;
  audio?: string[];
}

export type DisplayMode = 'ja' | 'zh' | 'zh-ja' | 'ja-zh' | 'zh-ja-horizontal' | 'ja-zh-horizontal';
export type ThemeMode = 'light' | 'dark' | 'system';
export type PrimaryColorScheme = 'bluebird' | 'ikizuraibu';

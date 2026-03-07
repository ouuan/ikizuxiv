export interface Tweet {
  id: string;
  created_at: string;
  date: string;
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

export type TranslationSource = {
  pikapaca: true;
} | {
  pikapaca?: false;
  translator: string;
  source: string;
};

export interface Annotation {
  text: string;
  images?: string[];
};

export type Translation = TranslationSource & {
  translation: string;
  annotations?: Record<string, Annotation>;
};

export interface DayData {
  tweets: Record<string, Tweet>;
  translations?: Record<string, Translation>;
  labels?: Record<string, string[]>;
  audio?: string[];
  bilibili?: string[];
}

export interface ExtendedTweet extends Tweet {
  translation?: Translation;
  labels?: string[];
  hasAudio: boolean;
}

export type DateIndex = Record<string, Record<string, number>>;

export type DisplayMode = 'ja' | 'zh' | 'zh-ja' | 'ja-zh' | 'zh-ja-horizontal' | 'ja-zh-horizontal';
export type ThemeMode = 'light' | 'dark' | 'system';
export type PrimaryColorScheme = 'bluebird' | 'ikizuraibu';

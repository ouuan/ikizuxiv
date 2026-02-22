import type { DayData, Tweet } from './types';

export async function loadDates(): Promise<string[]> {
  const response = await fetch('/tweets/dates.json');
  return response.json();
}

export async function loadDayData(date: string): Promise<DayData | null> {
  try {
    const [year, month] = date.split('-');
    if (!year || !month) return null;
    const response = await fetch(`/tweets/${year}/${month}/${date}.json`);
    if (!response.ok) return null;
    const data: DayData = await response.json();
    for (const tweet of Object.values(data.tweets)) {
      tweet.date = date;
    }
    return data;
  } catch {
    return null;
  }
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });
}

export function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Tokyo',
  });
}

export function getAudioUrl(tweet: Tweet): string {
  const [year, month] = tweet.date.split('-');
  if (!year || !month) return '';
  return `/assets/audio/${year}/${month}/${tweet.id}.mp3`;
}

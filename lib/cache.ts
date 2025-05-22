interface CachedData<T> {
  data: T;
  timestamp: number;
}

const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds
const STATIONS_CACHE_KEY = 'stations_cache';

export async function getCachedStations<T>(): Promise<T | null> {
  try {
    const cached = localStorage.getItem(STATIONS_CACHE_KEY);
    if (!cached) return null;

    const { data, timestamp }: CachedData<T> = JSON.parse(cached);
    const now = Date.now();

    // Check if cache is still valid (within 30 minutes)
    if (now - timestamp < CACHE_DURATION) {
      return data;
    }

    // Cache expired, remove it
    localStorage.removeItem(STATIONS_CACHE_KEY);
    return null;
  } catch (error) {
    console.error('Error reading from cache:', error);
    return null;
  }
}

export function setCachedStations<T>(data: T): void {
  try {
    const cacheData: CachedData<T> = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(STATIONS_CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Error writing to cache:', error);
  }
} 
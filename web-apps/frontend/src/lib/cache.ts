/**
 * Phase 1: In-memory caching utility for API routes
 *
 * This implementation provides a simple Map-based cache for development
 * and testing. It's designed to be easily replaceable with Vercel KV
 * in Phase 2 without changing the API surface.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class InMemoryCache {
  private cache = new Map<string, CacheEntry<any>>();

  /**
   * Store data in cache with TTL
   */
  set<T>(key: string, data: T, ttlMs: number = 3600000): void {
    // Default 1 hour
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    });
  }

  /**
   * Retrieve data from cache, returns null if expired or not found
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    const now = Date.now();
    const isExpired = now - entry.timestamp > entry.ttl;

    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Remove specific cache entry
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Remove expired entries (manual cleanup)
   */
  cleanup(): void {
    const now = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      const isExpired = now - entry.timestamp > entry.ttl;
      if (isExpired) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Singleton instance for the application
export const apiCache = new InMemoryCache();

/**
 * Cache configuration for different API endpoints
 */
export const CACHE_CONFIG = {
  // Gemini API responses - longer TTL due to API costs
  AI_SUGGESTIONS: {
    ttl: 24 * 60 * 60 * 1000, // 24 hours
    keyPrefix: "ai_suggestions",
  },

  // Word vocabulary data - shorter TTL for real-time updates
  WORDS_LIST: {
    ttl: 5 * 60 * 1000, // 5 minutes
    keyPrefix: "words",
  },

  // Statistics data - medium TTL
  DATE_STATS: {
    ttl: 15 * 60 * 1000, // 15 minutes
    keyPrefix: "stats",
  },

  // User-specific data
  USER_DATA: {
    ttl: 10 * 60 * 1000, // 10 minutes
    keyPrefix: "user",
  },
} as const;

/**
 * Generate consistent cache keys
 */
export function generateCacheKey(
  prefix: string,
  identifier: string | object,
): string {
  const suffix =
    typeof identifier === "string"
      ? identifier
      : Buffer.from(JSON.stringify(identifier)).toString("base64");

  return `${prefix}:${suffix}`;
}

/**
 * Cache wrapper for async functions with automatic key generation
 */
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number,
): Promise<T> {
  // Check cache first
  const cached = apiCache.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Execute fetcher and cache result
  const result = await fetcher();
  apiCache.set(key, result, ttlMs);

  return result;
}

/**
 * Invalidate cache entries by pattern or exact key
 */
export function invalidateCache(pattern: string | RegExp): number {
  const stats = apiCache.getStats();
  let deletedCount = 0;

  for (const key of stats.keys) {
    const shouldDelete =
      typeof pattern === "string" ? key.startsWith(pattern) : pattern.test(key);

    if (shouldDelete) {
      apiCache.delete(key);
      deletedCount++;
    }
  }

  return deletedCount;
}

// Auto-cleanup expired entries every 10 minutes
if (typeof setInterval !== "undefined") {
  setInterval(
    () => {
      apiCache.cleanup();
    },
    10 * 60 * 1000,
  );
}

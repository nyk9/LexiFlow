/**
 * Phase 2: Vercel KV (Redis) caching implementation
 * 
 * This file provides the same interface as the in-memory cache but uses
 * Vercel KV for persistent, distributed caching across serverless functions.
 * 
 * To migrate from Phase 1 to Phase 2:
 * 1. Install @vercel/kv package
 * 2. Set VERCEL_KV environment variables
 * 3. Replace imports in cache.ts
 */

import { kv } from '@vercel/kv';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class VercelKVCache {
  private keyPrefix = 'lexiflow_cache';

  /**
   * Generate Redis key with namespace
   */
  private getRedisKey(key: string): string {
    return `${this.keyPrefix}:${key}`;
  }

  /**
   * Store data in Vercel KV with TTL
   */
  async set<T>(key: string, data: T, ttlMs: number = 3600000): Promise<void> {
    const redisKey = this.getRedisKey(key);
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
    };

    // Convert TTL from milliseconds to seconds for Redis
    const ttlSeconds = Math.ceil(ttlMs / 1000);
    
    await kv.setex(redisKey, ttlSeconds, JSON.stringify(entry));
  }

  /**
   * Retrieve data from Vercel KV
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const redisKey = this.getRedisKey(key);
      const result = await kv.get(redisKey);
      
      if (!result) {
        return null;
      }

      const entry: CacheEntry<T> = JSON.parse(result as string);
      return entry.data;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Remove specific cache entry
   */
  async delete(key: string): Promise<boolean> {
    try {
      const redisKey = this.getRedisKey(key);
      const deleted = await kv.del(redisKey);
      return deleted > 0;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  /**
   * Clear entries matching pattern
   */
  async deleteByPattern(pattern: string): Promise<number> {
    try {
      const searchPattern = `${this.keyPrefix}:${pattern}*`;
      const keys = await kv.keys(searchPattern);
      
      if (keys.length === 0) {
        return 0;
      }

      const deleted = await kv.del(...keys);
      return deleted;
    } catch (error) {
      console.error('Cache delete by pattern error:', error);
      return 0;
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{ size: number; keys: string[] }> {
    try {
      const searchPattern = `${this.keyPrefix}:*`;
      const keys = await kv.keys(searchPattern);
      
      // Remove prefix from keys for consistency
      const cleanKeys = keys.map(key => key.replace(`${this.keyPrefix}:`, ''));
      
      return {
        size: keys.length,
        keys: cleanKeys,
      };
    } catch (error) {
      console.error('Cache stats error:', error);
      return { size: 0, keys: [] };
    }
  }
}

// Singleton instance for Vercel KV
export const vercelKVCache = new VercelKVCache();

/**
 * Cache wrapper for async functions with Vercel KV
 */
export async function withVercelKVCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number,
): Promise<T> {
  // Check cache first
  const cached = await vercelKVCache.get<T>(key);
  if (cached !== null) {
    return cached;
  }
  
  // Execute fetcher and cache result
  const result = await fetcher();
  await vercelKVCache.set(key, result, ttlMs);
  
  return result;
}

/**
 * Invalidate Vercel KV cache entries by pattern
 */
export async function invalidateVercelKVCache(pattern: string): Promise<number> {
  return await vercelKVCache.deleteByPattern(pattern);
}

/**
 * Migration utilities for moving from in-memory to Vercel KV
 */
export const migrationHelpers = {
  /**
   * Check if Vercel KV is available
   */
  isVercelKVAvailable(): boolean {
    return process.env.KV_REST_API_URL !== undefined;
  },

  /**
   * Get cache implementation based on environment
   */
  getCacheImplementation() {
    if (this.isVercelKVAvailable()) {
      return {
        cache: vercelKVCache,
        withCache: withVercelKVCache,
        invalidateCache: invalidateVercelKVCache,
      };
    } else {
      // Fallback to in-memory cache
      const { apiCache, withCache, invalidateCache } = require('./cache');
      return {
        cache: apiCache,
        withCache,
        invalidateCache,
      };
    }
  },
};

// Export type definitions for compatibility
export type CacheInterface = {
  set<T>(key: string, data: T, ttlMs?: number): Promise<void> | void;
  get<T>(key: string): Promise<T | null> | T | null;
  delete(key: string): Promise<boolean> | boolean;
  getStats(): Promise<{ size: number; keys: string[] }> | { size: number; keys: string[] };
};
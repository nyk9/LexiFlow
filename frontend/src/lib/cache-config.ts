/**
 * Centralized cache configuration for all phases
 *
 * This configuration file allows easy switching between caching strategies
 * and provides environment-based cache selection.
 */

/**
 * Cache TTL configurations (in milliseconds)
 */
export const CACHE_TTL = {
  // AI-related caches - longer TTL due to API costs
  AI_SUGGESTIONS: 24 * 60 * 60 * 1000, // 24 hours

  // Data caches - shorter TTL for real-time updates
  WORDS_LIST: 5 * 60 * 1000, // 5 minutes
  INDIVIDUAL_WORD: 15 * 60 * 1000, // 15 minutes

  // Analytics and statistics
  DATE_STATS: 15 * 60 * 1000, // 15 minutes
  USER_PROGRESS: 10 * 60 * 1000, // 10 minutes

  // Session-based caches
  USER_SESSION: 30 * 60 * 1000, // 30 minutes
} as const;

/**
 * Cache key prefixes for different data types
 */
export const CACHE_PREFIXES = {
  AI_SUGGESTIONS: "ai_suggestions",
  WORDS_LIST: "words_list",
  INDIVIDUAL_WORD: "word",
  DATE_STATS: "date_stats",
  USER_PROGRESS: "user_progress",
  USER_SESSION: "user_session",
} as const;

/**
 * Cache configuration object combining TTL and prefixes
 */
export const CACHE_CONFIG = {
  AI_SUGGESTIONS: {
    ttl: CACHE_TTL.AI_SUGGESTIONS,
    keyPrefix: CACHE_PREFIXES.AI_SUGGESTIONS,
  },
  WORDS_LIST: {
    ttl: CACHE_TTL.WORDS_LIST,
    keyPrefix: CACHE_PREFIXES.WORDS_LIST,
  },
  INDIVIDUAL_WORD: {
    ttl: CACHE_TTL.INDIVIDUAL_WORD,
    keyPrefix: CACHE_PREFIXES.INDIVIDUAL_WORD,
  },
  DATE_STATS: {
    ttl: CACHE_TTL.DATE_STATS,
    keyPrefix: CACHE_PREFIXES.DATE_STATS,
  },
  USER_PROGRESS: {
    ttl: CACHE_TTL.USER_PROGRESS,
    keyPrefix: CACHE_PREFIXES.USER_PROGRESS,
  },
  USER_SESSION: {
    ttl: CACHE_TTL.USER_SESSION,
    keyPrefix: CACHE_PREFIXES.USER_SESSION,
  },
} as const;

/**
 * Environment-based cache strategy selection
 */
export type CacheStrategy = "memory" | "vercel-kv" | "auto";

export const CACHE_STRATEGY: CacheStrategy =
  (process.env.CACHE_STRATEGY as CacheStrategy) || "auto";

/**
 * Cache invalidation patterns for related data
 */
export const CACHE_INVALIDATION_PATTERNS = {
  // When words change, invalidate related caches
  WORD_CHANGES: [
    CACHE_PREFIXES.WORDS_LIST,
    CACHE_PREFIXES.AI_SUGGESTIONS,
    CACHE_PREFIXES.DATE_STATS,
    CACHE_PREFIXES.USER_PROGRESS,
  ],

  // When user data changes
  USER_CHANGES: [CACHE_PREFIXES.USER_SESSION, CACHE_PREFIXES.USER_PROGRESS],

  // Daily statistics reset
  DAILY_RESET: [CACHE_PREFIXES.DATE_STATS],
} as const;

/**
 * Performance monitoring configuration
 */
export const CACHE_METRICS = {
  // Enable cache hit/miss tracking
  ENABLE_METRICS: process.env.NODE_ENV === "development",

  // Log cache operations
  ENABLE_LOGGING: process.env.CACHE_DEBUG === "true",

  // Cache warming strategies
  ENABLE_PRELOADING: process.env.NODE_ENV === "production",
} as const;

/**
 * Cache size limits for in-memory implementation
 */
export const MEMORY_CACHE_LIMITS = {
  // Maximum number of entries
  MAX_ENTRIES: 1000,

  // Maximum memory usage estimate (MB)
  MAX_MEMORY_MB: 50,

  // Cleanup interval (milliseconds)
  CLEANUP_INTERVAL: 10 * 60 * 1000, // 10 minutes
} as const;

/**
 * Vercel KV specific configuration
 */
export const VERCEL_KV_CONFIG = {
  // Connection retry settings
  MAX_RETRIES: 3,
  RETRY_DELAY: 100, // milliseconds

  // Batch operation limits
  MAX_BATCH_SIZE: 100,

  // Key naming convention
  KEY_SEPARATOR: ":",
  NAMESPACE: "lexiflow",
} as const;

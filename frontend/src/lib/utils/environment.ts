/**
 * Environment detection utilities for production vs development logic
 */

/**
 * Checks if the app is running in production environment
 * Excludes Vercel preview deployments from being treated as production
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production' && 
         process.env.VERCEL_ENV !== 'preview';
}

/**
 * Checks if the app is running in development environment
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Checks if the app is running in a Vercel preview deployment
 */
export function isPreview(): boolean {
  return process.env.VERCEL_ENV === 'preview';
}

/**
 * Gets the current environment name
 */
export function getEnvironment(): 'production' | 'preview' | 'development' {
  if (isProduction()) return 'production';
  if (isPreview()) return 'preview';
  return 'development';
}
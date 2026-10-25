/**
 * In-memory sliding-window rate limiter.
 *
 * It is per process, so with several app instances each one has its own count.
 * That is acceptable for a lead form. It is not a substitute for a shared limit.
 */

export interface RateLimitResult {
  ok: boolean;
  /** Seconds until the next request from this key is allowed. 0 when ok. */
  retryAfterSec: number;
}

export interface RateLimiterOptions {
  /** Requests allowed per key within the window. */
  limit: number;
  windowMs: number;
  /** Injectable clock for tests. */
  now?: () => number;
}

export function createRateLimiter({
  limit,
  windowMs,
  now = Date.now,
}: RateLimiterOptions) {
  const hits = new Map<string, number[]>();

  /** Drops timestamps outside the window and removes keys with none left. */
  function sweep(current: number) {
    for (const [key, times] of hits) {
      const fresh = times.filter((t) => t > current - windowMs);
      if (fresh.length === 0) {
        hits.delete(key);
      } else {
        hits.set(key, fresh);
      }
    }
  }

  return {
    check(key: string): RateLimitResult {
      const current = now();
      sweep(current);

      const times = hits.get(key) ?? [];
      if (times.length >= limit) {
        const retryAfterSec = Math.ceil((times[0] + windowMs - current) / 1000);
        return { ok: false, retryAfterSec };
      }

      times.push(current);
      hits.set(key, times);
      return { ok: true, retryAfterSec: 0 };
    },

    /** Number of keys currently tracked. Exposed for tests. */
    size(): number {
      return hits.size;
    },
  };
}

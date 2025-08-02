/**
 * ServerSideCache - A server-side caching implementation with efficient lookup
 * Supports various key types: string, number, array of strings/numbers
 * Uses Map for O(1) lookup performance
 */
export class ServerSideCache {
  private cache: Map<string, any>;
  private maxSize: number;
  private ttl: number; // Time to live in milliseconds
  private timestamps: Map<string, number>;

  constructor(maxSize: number = 1000, ttl: number = 24 * 60 * 60 * 1000) {
    // Default 5 minutes TTL
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
    this.timestamps = new Map();
  }

  /**
   * Converts various key types to a string representation
   * @param key - The key to stringify (string, number, array of strings/numbers)
   * @returns A string representation of the key
   * @throws Error if key is null, undefined, or invalid type
   */
  private stringifyKey(key: string | number | (string | number)[]): string {
    if (key === null || key === undefined) {
      throw new Error("Cache key cannot be null or undefined");
    }

    if (typeof key === "string" || typeof key === "number") {
      return String(key);
    }

    if (Array.isArray(key)) {
      if (key.length === 0) {
        throw new Error("Cache key array cannot be empty");
      }

      // Validate array elements
      for (const item of key) {
        if (item === null || item === undefined) {
          throw new Error(
            "Cache key array cannot contain null or undefined values"
          );
        }
        if (typeof item !== "string" && typeof item !== "number") {
          throw new Error(
            "Cache key array can only contain strings or numbers"
          );
        }
      }

      return JSON.stringify(key);
    }

    throw new Error(
      "Cache key must be a string, number, or array of strings/numbers"
    );
  }

  /**
   * Checks if a cache entry has expired
   * @param key - The cache key
   * @returns true if expired, false otherwise
   */
  private isExpired(key: string): boolean {
    const timestamp = this.timestamps.get(key);
    if (!timestamp) return true;

    return Date.now() - timestamp > this.ttl;
  }

  /**
   * Removes expired entries from the cache
   */
  private cleanupExpired(): void {
    const now = Date.now();
    for (const [key, timestamp] of this.timestamps.entries()) {
      if (now - timestamp > this.ttl) {
        this.cache.delete(key);
        this.timestamps.delete(key);
      }
    }
  }

  /**
   * Ensures cache doesn't exceed max size by removing oldest entries
   */
  private enforceMaxSize(): void {
    if (this.cache.size <= this.maxSize) return;

    // Remove oldest entries (based on timestamp)
    const entries = Array.from(this.timestamps.entries()).sort(
      ([, a], [, b]) => a - b
    );

    const toRemove = this.cache.size - this.maxSize;
    for (let i = 0; i < toRemove; i++) {
      const [key] = entries[i];
      this.cache.delete(key);
      this.timestamps.delete(key);
    }
  }

  /**
   * Sets a value in the cache
   * @param key - The cache key (string, number, or array of strings/numbers)
   * @param value - The value to cache
   * @returns true if successfully set, false otherwise
   */
  set(key: string | number | (string | number)[], value: any): boolean {
    try {
      const stringKey = this.stringifyKey(key);

      // Cleanup expired entries before setting
      this.cleanupExpired();

      // Set the value and timestamp
      this.cache.set(stringKey, value);
      this.timestamps.set(stringKey, Date.now());

      // Enforce max size
      this.enforceMaxSize();

      return true;
    } catch (error) {
      console.error("Error setting cache value:", error);
      return false;
    }
  }

  /**
   * Gets a value from the cache
   * @param key - The cache key (string, number, or array of strings/numbers)
   * @returns The cached value or undefined if not found/expired
   */
  get(key: string | number | (string | number)[]): any {
    try {
      const stringKey = this.stringifyKey(key);

      // Check if key exists and is not expired
      if (!this.cache.has(stringKey) || this.isExpired(stringKey)) {
        return undefined;
      }

      return this.cache.get(stringKey);
    } catch (error) {
      console.error("Error getting cache value:", error);
      return undefined;
    }
  }

  /**
   * Removes a specific key from the cache
   * @param key - The cache key to remove
   * @returns true if removed, false if not found
   */
  delete(key: string | number | (string | number)[]): boolean {
    try {
      const stringKey = this.stringifyKey(key);
      const deleted = this.cache.delete(stringKey);
      this.timestamps.delete(stringKey);
      return deleted;
    } catch (error) {
      console.error("Error deleting cache value:", error);
      return false;
    }
  }

  /**
   * Clears all entries from the cache
   */
  clear(): void {
    this.cache.clear();
    this.timestamps.clear();
  }

  /**
   * Gets the current size of the cache
   * @returns Number of entries in the cache
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Checks if a key exists in the cache (not expired)
   * @param key - The cache key to check
   * @returns true if exists and not expired, false otherwise
   */
  has(key: string | number | (string | number)[]): boolean {
    try {
      const stringKey = this.stringifyKey(key);
      return this.cache.has(stringKey) && !this.isExpired(stringKey);
    } catch (error) {
      console.error("Error checking cache key:", error);
      return false;
    }
  }

  /**
   * Gets cache statistics
   * @returns Object with cache statistics
   */
  getStats(): {
    size: number;
    maxSize: number;
    ttl: number;
    hitRate?: number;
  } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      ttl: this.ttl,
    };
  }
}

// Export a singleton instance for common use
export const serverSideCache = new ServerSideCache();

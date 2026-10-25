// @vitest-environment node
import { describe, it, expect } from "vitest";
import { createRateLimiter } from "../rate-limit";

function clock(start = 1_000_000) {
  let now = start;
  return {
    now: () => now,
    advance: (ms: number) => {
      now += ms;
    },
  };
}

const TEN_MINUTES = 10 * 60_000;

describe("createRateLimiter", () => {
  it("allows up to the limit within the window", () => {
    const time = clock();
    const limiter = createRateLimiter({ limit: 5, windowMs: TEN_MINUTES, now: time.now });

    for (let i = 0; i < 5; i++) {
      expect(limiter.check("1.2.3.4").ok).toBe(true);
    }
  });

  it("blocks the request after the limit, with a positive retry time", () => {
    const time = clock();
    const limiter = createRateLimiter({ limit: 5, windowMs: TEN_MINUTES, now: time.now });
    for (let i = 0; i < 5; i++) limiter.check("1.2.3.4");

    const result = limiter.check("1.2.3.4");
    expect(result.ok).toBe(false);
    expect(result.retryAfterSec).toBeGreaterThan(0);
    expect(result.retryAfterSec).toBeLessThanOrEqual(600);
  });

  it("counts retry time from the oldest request in the window", () => {
    const time = clock();
    const limiter = createRateLimiter({ limit: 2, windowMs: 60_000, now: time.now });
    limiter.check("ip");
    time.advance(30_000);
    limiter.check("ip");

    // The first request expires in 30s, so that is when the next one is allowed.
    expect(limiter.check("ip")).toEqual({ ok: false, retryAfterSec: 30 });
  });

  it("allows requests again once the window has passed", () => {
    const time = clock();
    const limiter = createRateLimiter({ limit: 5, windowMs: TEN_MINUTES, now: time.now });
    for (let i = 0; i < 5; i++) limiter.check("ip");
    expect(limiter.check("ip").ok).toBe(false);

    time.advance(TEN_MINUTES + 1);
    expect(limiter.check("ip").ok).toBe(true);
  });

  it("tracks each key independently", () => {
    const time = clock();
    const limiter = createRateLimiter({ limit: 1, windowMs: TEN_MINUTES, now: time.now });

    expect(limiter.check("a").ok).toBe(true);
    expect(limiter.check("a").ok).toBe(false);
    expect(limiter.check("b").ok).toBe(true);
  });

  it("drops keys whose requests have all expired", () => {
    const time = clock();
    const limiter = createRateLimiter({ limit: 1, windowMs: 60_000, now: time.now });
    limiter.check("a");
    limiter.check("b");
    expect(limiter.size()).toBe(2);

    time.advance(60_001);
    limiter.check("c");
    expect(limiter.size()).toBe(1);
  });
});

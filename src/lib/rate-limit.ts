// Basic in-memory rate limiter for MVP phase
// In production on Vercel, this should be replaced with @upstash/redis or @vercel/kv
// because in-memory state is not shared across serverless function instances.

type TokenBucket = {
  tokens: number;
  lastRefill: number;
}

const store = new Map<string, TokenBucket>();

export function rateLimit(
  identifier: string,
  limit: number = 3, // 3 requests
  windowMs: number = 60000 // per minute
): { success: boolean; limit: number; remaining: number; reset: number } {
  const now = Date.now();
  const defaultBucket = { tokens: limit, lastRefill: now };
  
  const bucket = store.get(identifier) || defaultBucket;

  // Refill tokens based on time passed
  const timePassed = now - bucket.lastRefill;
  const refillRate = limit / windowMs;
  const tokensToAdd = timePassed * refillRate;
  
  if (tokensToAdd > 0) {
    bucket.tokens = Math.min(limit, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;
  }

  // Check if we can consume a token
  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    store.set(identifier, bucket);
    return {
      success: true,
      limit,
      remaining: Math.floor(bucket.tokens),
      reset: now + (limit - bucket.tokens) / refillRate
    };
  }

  // Rate limited
  return {
    success: false,
    limit,
    remaining: 0,
    reset: now + (1 - bucket.tokens) / refillRate
  };
}

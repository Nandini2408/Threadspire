import { NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

const RATE_LIMIT = {
  window: 60, // 1 minute
  max: 5, // 5 requests per minute
}

export async function rateLimit(identifier: string) {
  const key = `rate-limit:${identifier}`
  const current = await redis.incr(key)

  if (current === 1) {
    await redis.expire(key, RATE_LIMIT.window)
  }

  if (current > RATE_LIMIT.max) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    )
  }

  return null
} 
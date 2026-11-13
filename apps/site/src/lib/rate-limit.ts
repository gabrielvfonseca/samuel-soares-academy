import { Ratelimit, type RatelimitConfig } from "@upstash/ratelimit";
import { redis } from "./redis";

export const createRateLimiter = (props: Omit<RatelimitConfig, "redis">) =>
  new Ratelimit({
    limiter: props.limiter ?? Ratelimit.slidingWindow(10, "10 s"),
    prefix: props.prefix ?? "samuel-soares-academy",
    redis,
  });

export const { slidingWindow } = Ratelimit;

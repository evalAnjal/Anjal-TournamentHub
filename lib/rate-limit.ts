import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export const redis = Redis.fromEnv();

export const limiter = new Ratelimit({
    redis,
    limiter:Ratelimit.fixedWindow(2,'10 m'),
    // 5 request per 10 minuyte fir each IP
    analytics:true,
});

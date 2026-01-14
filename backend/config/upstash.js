// 这个文件用于配置 Upstash Redis 和速率限制器

// 你可以在 .env 文件中设置 UPSTASH_REDIS_REST_URL 和 UPSTASH_REDIS_REST_TOKEN
// 然后通过 Redis.fromEnv() 来创建 Redis 实例

import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

dotenv.config({ path: path.resolve(__dirname, '../.env') })

// 速率限制器配置为每个用户每分钟最多允许 10 次请求
// 你可以根据需要调整这个限制
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '60 s'),
})

export default ratelimit

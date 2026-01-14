import ratelimit from '../config/upstash.js'

const rateLimiter = async (req, res, next) => {
  try {
    const { success, remaining, limit, reset } = await ratelimit.limit('global') // 全局限速，可以根据需要改为基于用户的限速
    console.log('rate limit', { success, remaining, limit, reset })

    // 如果请求超过限制，返回 429 状态码
    if (!success) {
      return res.status(429).json({ message: '请求过于频繁，请稍后再试' })
    }

    next()
  } catch (error) {
    console.log('限速失败', error)
    next(error)
  }
}

export default rateLimiter

import express from 'express'
import dotenv from 'dotenv'
import { sql } from './config/db.js'
import rateLimiter from './middleware/rateLimiter.js'
import transactionRoute from './routes/transactionRoute.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5001

// 中间件配置
app.use(rateLimiter)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 初始化数据库表
async function initDB() {
  try {
    await sql`CREATE TABLE IF NOT EXISTS transactions(
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    category VARCHAR(255) NOT NULL,
    create_at DATE NOT NULL DEFAULT CURRENT_DATE
    )`

    console.log('数据库初始化成功')
  } catch (error) {
    console.error('数据库初始化失败:', error)
    process.exit(1) // 状态码为1表示异常退出，0表示正常退出
  }
}

app.use('/api/transactions', transactionRoute)

initDB().then(() => {
  app.listen(PORT, () => {
    console.log('服务正在监听 端口:', PORT)
  })
})

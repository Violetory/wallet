import express from 'express'
import dotenv from 'dotenv'
import { sql } from './config/db.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5001

// 中间件配置
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

// 查询交易
app.get('/api/transactions/get/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params

    // 输入校验
    if (!user_id) {
      return res.status(400).json({ error: '缺少用户ID' })
    }

    // 查询交易记录
    const transactions = await sql`
      SELECT * FROM transactions
      WHERE user_id = ${user_id}
      ORDER BY create_at DESC
    `

    res.status(200).json(transactions)
  } catch (error) {
    console.log('交易查询失败', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// 创建交易
app.post('/api/transactions/create', async (req, res) => {
  try {
    const { user_id, title, amount, category } = req.body

    // 输入校验
    if (!user_id || !title || !category || amount === undefined) {
      return res.status(400).json({ error: '缺少必要的交易信息' })
    }

    // 插入新交易记录
    const transaction = await sql`
      INSERT INTO transactions (user_id, title, amount, category)
      VALUES (${user_id}, ${title}, ${amount}, ${category})
      RETURNING *
    `

    console.log('交易创建成功！', transaction)
    res.status(201).json(transaction[0]) // 返回新创建的交易记录
  } catch (error) {
    console.log('交易创建失败', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// 删除交易
app.delete('/api/transactions/delete/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)

    // 输入校验
    if (!Number.isFinite(id)) {
      return res.status(400).json({ error: '缺少交易ID' })
    }

    // ID类型校验
    if (id <= 0) {
      return res.status(400).json({ error: '交易ID必须为数字' })
    }

    // 删除交易记录
    const result = await sql.query(
      'DELETE FROM transactions WHERE id = $1',
      [id],
      { fullResults: true }
    )

    // 检查是否有记录被删除
    if (result.rowCount === 0) {
      return res.status(404).json({ error: '交易未找到' })
    }

    res.status(200).json({ message: '交易删除成功' })
  } catch (error) {
    console.log('交易删除失败', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

initDB().then(() => {
  app.listen(PORT, () => {
    console.log('服务正在监听 端口:', PORT)
  })
})

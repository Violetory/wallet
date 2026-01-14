import { sql } from '../config/db.js'

// 查询交易金额汇总
export async function getSummaryByUserId(req, res) {
  try {
    const { user_id } = req.params

    const balanceResult = await sql`
          SELECT COALESCE(SUM(amount), 0) as balance
          FROM transactions
          WHERE user_id = ${user_id}
        `

    const incomeResult = await sql`
          SELECT COALESCE(SUM(amount), 0) as income
          FROM transactions
          WHERE user_id = ${user_id} AND amount > 0 
        `

    const expensesResult = await sql`
          SELECT COALESCE(SUM(amount), 0) as expenses
          FROM transactions
          WHERE user_id = ${user_id} AND amount < 0
        `

    res.status(200).json({
      balance: balanceResult[0].balance,
      income: incomeResult[0].income,
      expenses: expensesResult[0].expenses
    })
  } catch (error) {
    console.log('获取交易金额汇总失败', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// 查询交易
export async function getTransactionsByUserId(req, res) {
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
}

// 创建交易
export async function createTransaction(req, res) {
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
}

// 删除交易
export async function deleteTransactionById(req, res) {
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
}

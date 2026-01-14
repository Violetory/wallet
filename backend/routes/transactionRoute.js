import express from 'express'
import {
  getSummaryByUserId,
  getTransactionsByUserId,
  createTransaction,
  deleteTransactionById
} from '../controllers/transactionsController.js'

const router = express.Router()

router.get('/summary/:user_id', getSummaryByUserId)     // 查询交易金额汇总
router.get('/get/:user_id', getTransactionsByUserId)    // 查询交易
router.post('/create', createTransaction)               // 创建交易
router.delete('/delete/:id', deleteTransactionById)     // 删除交易

export default router

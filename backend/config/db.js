import {neon} from "@neondatabase/serverless";

import "dotenv/config"

// 使用环境变量中的 DATABASE_URL 建立数据库连接
export const sql = neon(process.env.DATABASE_URL);
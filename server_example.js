
/**
 * 这是一个本地 Node.js 后端示例代码。
 * 运行前请执行: 
 * npm install express pg cors
 * node server_example.js
 */
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// PostgreSQL 连接配置
const pool = new Pool({
  user: 'postgres',         // 替换为你的数据库用户名
  host: 'localhost',
  database: 'surgery_db',   // 替换为你的数据库名
  password: 'password',     // 替换为你的密码
  port: 5432,
});

// 获取所有手术记录
app.get('/api/operations', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM operation_record ORDER BY operation_date DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// 获取特定手术的异常数据
app.get('/api/anomalies/:opNo', async (req, res) => {
  const { opNo } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM dws_surgery_duration_anomaly WHERE operation_no = $1',
      [opNo]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Surgery Monitoring Backend running at http://localhost:${PORT}`);
});

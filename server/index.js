
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// PostgreSQL 连接配置
const pool = new Pool({
  user: 'wilf',         
  host: 'localhost',
  database: 'postgres',   
  password: 'postgres',     
  port: 5431,
});

pool.connect((err, client, release) => {
  if (err) {
    return console.error('【数据库】连接失败:', err.stack);
  }
  console.log('【数据库】连接成功，等待请求...');
  release();
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// 获取所有实时手术记录 (仅限术中状态)
app.get('/api/operations', async (req, res) => {
  try {
    // 关键过滤：WHERE status = '术中'
    const queryText = "SELECT * FROM operation_record WHERE status = '术中' ORDER BY operation_start_time DESC";
    const result = await pool.query(queryText);
    
    console.log(`[API] 查询到术中记录数: ${result.rows.length}`);
    res.json(result.rows);
  } catch (err) {
    console.error('查询手术记录失败:', err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

app.get('/api/anomalies/:opNo', async (req, res) => {
  const { opNo } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM dws_surgery_duration_anomaly WHERE operation_no = $1',
      [opNo]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: '未找到该手术的异常数据' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('查询异常数据失败:', err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`-----------------------------------------------`);
  console.log(`手术监测系统后端已启动: http://localhost:${PORT}`);
  console.log(`请确保数据库中状态字段值为 '术中'`);
  console.log(`-----------------------------------------------`);
});

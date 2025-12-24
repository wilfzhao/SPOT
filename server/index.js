
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// PostgreSQL 连接配置
// 请根据你的本地实际情况修改以下参数
const pool = new Pool({
  user: 'wilf',         
  host: 'localhost',
  database: 'postgres',   
  password: 'postgres',     
  port: 5431,
});

// 测试数据库连接
pool.connect((err, client, release) => {
  if (err) {
    return console.error('【数据库】连接失败:', err.stack);
  }
  console.log('【数据库】连接成功，等待请求...');
  release();
});

// 健康检查接口
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// 获取所有手术记录
app.get('/api/operations', async (req, res) => {
  console.log('GET /api/operations - 正在查询记录...');
  try {
    const result = await pool.query('SELECT * FROM operation_record ORDER BY operation_date DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('查询手术记录失败:', err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

// 获取特定手术的异常数据
app.get('/api/anomalies/:opNo', async (req, res) => {
  const { opNo } = req.params;
  console.log(`GET /api/anomalies/${opNo} - 正在查询异常数据...`);
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
  console.log(`API 基础路径: http://localhost:${PORT}/api`);
  console.log(`-----------------------------------------------`);
});

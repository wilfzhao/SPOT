
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
    const queryText = "SELECT * FROM operation_record WHERE status = '术中' ORDER BY operation_start_time DESC";
    const result = await pool.query(queryText);
    res.json(result.rows);
  } catch (err) {
    console.error('查询手术记录失败:', err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

// 获取异常详情
app.get('/api/anomalies/:opNo', async (req, res) => {
  const { opNo } = req.params;
  try {
    // 优先读取异常表中的 baseline_median 和 baseline_std_dev
    const queryText = `
      SELECT 
        a.operation_no,
        a.operation_name,
        a.actual_duration,
        a.baseline_p80,
        a.baseline_p90,
        a.deviation_rate,
        a.anomaly_level,
        a.anomaly_reason,
        COALESCE(a.baseline_median, b.median_duration) as baseline_median,
        COALESCE(a.baseline_std_dev, b.std_dev, 0) as baseline_std_dev
      FROM dws_surgery_duration_anomaly a
      LEFT JOIN operation_record o ON a.operation_no = o.operation_no
      LEFT JOIN surgery_baseline_model b ON (
        o.operation_name = b.operation_name 
        AND o.surgen_name = b.surgen_name
      )
      WHERE a.operation_no = $1
    `;
    const result = await pool.query(queryText, [opNo]);
    
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
  console.log(`数据同步策略：优先读取 anomaly 表 baseline_* 字段`);
  console.log(`-----------------------------------------------`);
});

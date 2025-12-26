
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const VERSION = "1.0.8-FIX-PANORAMIC-DATA";

// PostgreSQL 连接配置
const dbConfig = {
  user: 'wilf',         
  host: 'localhost',
  database: 'postgres',   
  password: 'postgres',     
  port: 5431,
};

const pool = new Pool(dbConfig);

// 启动诊断
async function runDiagnostics() {
  console.log(`\n\x1b[35m[SYSTEM] >>> 正在启动手术监测平台后端 v${VERSION} <<<\x1b[0m`);
  try {
    const client = await pool.connect();
    console.log('✅ [DB] 数据库物理连接成功 (Port: 5431)');
    
    const res = await client.query(`SELECT table_name FROM information_schema.views WHERE table_name = 'view_surgery_timeline_simulation'`);
    if (res.rows.length > 0) {
      console.log('✅ [DB] 视图 view_surgery_timeline_simulation 已就绪');
    } else {
      console.error('❌ [DB] 视图丢失：请确认 view_surgery_timeline_simulation 已创建');
    }
    client.release();
  } catch (err) {
    console.error('❌ [DB] 致命错误：数据库连接失败 ->', err.message);
  }
}

// 请求日志
app.use((req, res, next) => {
  console.log(`\x1b[36m[TRACE]\x1b[0m ${new Date().toLocaleTimeString()} ${req.method} ${req.url}`);
  next();
});

// --- 核心路由修复：直接挂载在 app 上，避免 Router 偏差 ---

// 全景推演数据接口
app.get('/api/surgery-simulation', async (req, res) => {
  console.log('📊 [ACTION] 正在拉取全景推演视图数据...');
  try {
    const result = await pool.query("SELECT * FROM view_surgery_timeline_simulation ORDER BY operation_room, est_start_time");
    console.log(`✅ [SUCCESS] 成功从数据库获取 ${result.rows.length} 条推演记录`);
    res.json(result.rows);
  } catch (err) {
    console.error('❌ [ERROR] 获取推演数据失败:', err.message);
    res.status(500).json({ error: 'DATABASE_QUERY_ERROR', message: err.message });
  }
});

// 其他 API 依然保留在 /api 路径下
const apiRouter = express.Router();
apiRouter.get('/health', (req, res) => res.json({ status: 'ok', version: VERSION }));
apiRouter.get('/operations', async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM operation_record WHERE status = '术中' ORDER BY operation_start_time DESC");
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
apiRouter.get('/anomalies/:opNo', async (req, res) => {
  try {
    const queryText = `
      SELECT a.*, COALESCE(b.median_duration, 0) as baseline_median, COALESCE(b.std_dev, 0) as baseline_std_dev
      FROM dws_surgery_duration_anomaly a
      LEFT JOIN operation_record o ON a.operation_no = o.operation_no
      LEFT JOIN surgery_baseline_model b ON (o.operation_name = b.operation_name AND o.surgen_name = b.surgen_name)
      WHERE a.operation_no = $1
    `;
    const result = await pool.query(queryText, [req.params.opNo]);
    res.json(result.rows[0] || { error: 'Not found' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.use('/api', apiRouter);

// 增强 404 反馈
app.use((req, res) => {
  console.warn(`\x1b[33m[WARN]\x1b[0m 未知路径请求: ${req.url}`);
  res.status(404).json({ error: 'ROUTE_NOT_FOUND', requested: req.url });
});

const PORT = 3000;
app.listen(PORT, async () => {
  await runDiagnostics();
  console.log(`\n\x1b[32m==============================================`);
  console.log(`🚀 后端已启动: http://localhost:${PORT}`);
  console.log(`📡 核心端点: /api/surgery-simulation [GET]`);
  console.log(`==============================================\x1b[0m\n`);
});

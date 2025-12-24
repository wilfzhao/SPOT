
import { OperationRecord, SurgeryAnomaly } from '../types';
import { DB_OPERATION_RECORDS, DB_ANOMALIES } from '../constants';

/**
 * 模拟从 Postgres 后端 API 获取数据
 * 在真实环境中，您可以使用 fetch(`${API_BASE}/anomalies`)
 */
export const DataService = {
  // 获取所有手术记录 (operation_record)
  async getOperationRecords(): Promise<OperationRecord[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(DB_OPERATION_RECORDS), 300);
    });
  },

  // 获取特定手术的异常分析 (dws_surgery_duration_anomaly)
  async getAnomalyByNo(opNo: string): Promise<SurgeryAnomaly | undefined> {
    return new Promise((resolve) => {
      const anomaly = DB_ANOMALIES.find(a => a.operation_no === opNo);
      setTimeout(() => resolve(anomaly), 200);
    });
  }
};

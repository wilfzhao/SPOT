
import { OperationRecord, SurgeryAnomaly } from '../types';
import { DB_OPERATION_RECORDS, DB_ANOMALIES, API_BASE_URL } from '../constants';

export const DataService = {
  // 获取所有手术记录
  async getOperationRecords(): Promise<OperationRecord[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/operations`);
      if (!response.ok) throw new Error('API Response Error');
      return await response.json();
    } catch (error) {
      console.warn("无法连接到后端 API，正在使用模拟数据:", error);
      return new Promise((resolve) => {
        setTimeout(() => resolve(DB_OPERATION_RECORDS), 300);
      });
    }
  },

  // 获取特定手术的异常分析
  async getAnomalyByNo(opNo: string): Promise<SurgeryAnomaly | undefined> {
    try {
      const response = await fetch(`${API_BASE_URL}/anomalies/${opNo}`);
      if (!response.ok) throw new Error('API Response Error');
      return await response.json();
    } catch (error) {
      console.warn(`无法获取手术 ${opNo} 的真实分析，正在使用模拟数据`);
      return new Promise((resolve) => {
        const anomaly = DB_ANOMALIES.find(a => a.operation_no === opNo);
        setTimeout(() => resolve(anomaly), 200);
      });
    }
  }
};

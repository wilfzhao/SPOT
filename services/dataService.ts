
import { OperationRecord, SurgeryAnomaly, SurgeryTimelineSimulation } from '../types';
import { DB_OPERATION_RECORDS, DB_ANOMALIES, DB_SIMULATION_DATA, API_BASE_URL } from '../constants';

const FETCH_TIMEOUT = 5000;

function getFullUrl(path: string): string {
  const base = API_BASE_URL.replace(/\/+$/, '');
  const sub = path.replace(/^\/+/, '');
  return `${base}/${sub}`;
}

async function safeFetch<T>(path: string, mockData: T): Promise<T> {
  const url = getFullUrl(path);
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(id);

    if (!response.ok) {
      console.error(`[DataService] -> 接口失败 (${response.status}): ${url}`);
      throw new Error(`HTTP_${response.status}`);
    }

    const data = await response.json();
    console.log(`[DataService] -> 接口成功 (${path}), 数据量: ${Array.isArray(data) ? data.length : 'Object'}`);
    return data;
  } catch (err: any) {
    clearTimeout(id);
    console.warn(`[DataService] -> 降级策略触发 (${path}):`, err.message);
    return mockData;
  }
}

export const DataService = {
  async getOperationRecords(): Promise<OperationRecord[]> {
    return safeFetch('/operations', DB_OPERATION_RECORDS);
  },

  async getAnomalyByNo(opNo: string): Promise<SurgeryAnomaly | undefined> {
    const result = await safeFetch(`/anomalies/${opNo}`, null);
    if (!result) return DB_ANOMALIES.find(a => a.operation_no === opNo);
    return result as any;
  },

  async getTimelineSimulation(): Promise<SurgeryTimelineSimulation[]> {
    console.log('[DataService] 正在同步手术推演大模型数据...');
    const result = await safeFetch('/surgery-simulation', DB_SIMULATION_DATA);
    return result;
  }
};

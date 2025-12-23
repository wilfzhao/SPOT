
export enum SurgeryStatus {
  NORMAL = '正常',
  WARNING = '预警',
  CRITICAL = '危急',
  COMPLETED = '已完成'
}

export interface Phase {
  id: string;
  name: string;
  actualDuration: number; // 分钟
  baselineDuration: number; // 分钟
  status: SurgeryStatus;
}

export interface Surgery {
  id: string;
  patientName: string;
  procedureType: string;
  surgeon: string;
  operatingRoom: string;
  startTime: string;
  phases: Phase[];
  overallStatus: SurgeryStatus;
}

export interface AIAnalysis {
  riskLevel: '低' | '中' | '高';
  riskReasons: string[];
  interventions: string[];
  summary: string;
}

export interface HistoricalBaseline {
  procedureType: string;
  phases: {
    name: string;
    avgDuration: number;
    stdDev: number;
  }[];
}

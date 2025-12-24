
export enum SurgeryStatus {
  NORMAL = '正常',
  WARNING = '预警',
  CRITICAL = '危急',
  COMPLETED = '已完成'
}

export interface Phase {
  id: string;
  name: string;
  actualDuration: number;
  baselineDuration: number;
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
  riskScore?: number; // 0-100
  predictedPostOpStay?: number; // 天
}

export type ModuleType = 
  | 'dashboard' 
  | 'efficiency' 
  | 'duration' 
  | 'preop' 
  | 'postop' 
  | 'risk' 
  | 'doctor' 
  | 'specialty';

export interface AIAnalysis {
  riskLevel: '低' | '中' | '高';
  riskReasons: string[];
  interventions: string[];
  summary: string;
}

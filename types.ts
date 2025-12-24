
export enum SurgeryStatus {
  NORMAL = '正常',
  WARNING = '预警',
  CRITICAL = '危急',
  COMPLETED = '已完成'
}

// 对应 public.operation_record
export interface OperationRecord {
  operation_no: string;
  operation_date: string;
  operation_room: string;
  operation_name: string;
  diagnosis_name: string;
  surgen_name: string;
  patient_in_time: string;
  operation_start_time: string;
  operation_end_time: string | null;
  status: string;
}

// 对应 public.surgery_baseline_model
export interface SurgeryBaseline {
  operation_name: string;
  surgen_name: string;
  avg_duration: number;
  warning_threshold_p80: number;
  alert_threshold_p90: number;
}

// 对应 public.dws_surgery_duration_anomaly
export interface SurgeryAnomaly {
  operation_no: string;
  operation_name: string;
  actual_duration: number;
  baseline_avg: number;
  baseline_p80: number;
  baseline_p90: number;
  deviation_rate: number;
  anomaly_level: string;
  anomaly_reason: string;
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

// Added Phase type for timeline and rule engine
export interface Phase {
  name: string;
  actualDuration: number;
  baselineDuration: number;
}

// Added Surgery type for timeline components
export interface Surgery {
  id: string;
  name: string;
  phases: Phase[];
}

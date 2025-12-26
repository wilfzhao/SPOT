
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
  dept_name: string;
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
  median_duration: number;
  std_dev: number;
  warning_threshold_p80: number;
  alert_threshold_p90: number;
}

// 对应 public.dws_surgery_duration_anomaly
export interface SurgeryAnomaly {
  operation_no: string;
  operation_name: string;
  actual_duration: number;
  baseline_median: number; // 更新字段名
  baseline_std_dev: number; // 更新字段名
  baseline_p80: number;
  baseline_p90: number;
  deviation_rate: number;
  anomaly_level: string;
  anomaly_reason: string;
}

// 对应 view_surgery_timeline_simulation
export interface SurgeryTimelineSimulation {
  operation_no: string;
  operation_room: string;
  operation_name: string;
  surgen_name: string;
  sequence_no: number;
  est_start_time: string;
  est_end_time: string;
  status_type: 'CURRENT' | 'PENDING';
  patient_tags: string[];
  risk_tags: string[];
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
  reasoning?: string;
}

export interface Phase {
  name: string;
  actualDuration: number;
  baselineDuration: number;
}

export interface Surgery {
  id: string;
  name: string;
  phases: Phase[];
}

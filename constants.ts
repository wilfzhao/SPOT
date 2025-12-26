
import { OperationRecord, SurgeryAnomaly } from './types';

export const HOSPITAL_NAME = "联通数智医疗";
export const PLATFORM_NAME = "手术全流程精准管理与分析预测平台";

export const API_BASE_URL = "http://localhost:3000/api";

export const DB_OPERATION_RECORDS: OperationRecord[] = [
  {
    operation_no: '20241024-001',
    operation_date: '2024-10-24',
    operation_room: '1号手术室',
    operation_name: '腹腔镜下胆囊切除术',
    dept_name: '普外科',
    diagnosis_name: '胆囊结石伴急性胆囊炎',
    surgen_name: '赵伟峰',
    patient_in_time: '2024-10-24 08:30:00',
    operation_start_time: '2024-10-24 09:00:00',
    operation_end_time: null,
    status: '术中'
  },
  {
    operation_no: '20241024-002',
    operation_date: '2024-10-24',
    operation_room: '3号手术室',
    operation_name: '全髋关节置换术',
    dept_name: '骨科',
    diagnosis_name: '双侧股骨头坏死',
    surgen_name: '林泽宏',
    patient_in_time: '2024-10-24 08:45:00',
    operation_start_time: '2024-10-24 09:15:00',
    operation_end_time: null,
    status: '术中'
  }
];

export const DB_ANOMALIES: SurgeryAnomaly[] = [
  {
    operation_no: '20241024-001',
    operation_name: '腹腔镜下胆囊切除术',
    actual_duration: 125,
    baseline_median: 55,
    baseline_std_dev: 12,
    baseline_p80: 75,
    baseline_p90: 90,
    deviation_rate: 127.27,
    anomaly_level: '红灯',
    anomaly_reason: '术中发现严重粘连，解剖结构辨识困难'
  },
  {
    operation_no: '20241024-002',
    operation_name: '全髋关节置换术',
    actual_duration: 85,
    baseline_median: 78,
    baseline_std_dev: 15,
    baseline_p80: 95,
    baseline_p90: 110,
    deviation_rate: 8.97,
    anomaly_level: '正常',
    anomaly_reason: '进度符合预期'
  }
];

export const DEPT_RANKING = [
  { name: '心血管科', count: 375, ratio: '10.21%', tier4: 6, tier4Ratio: '1.60%' },
  { name: '眼科中心', count: 341, ratio: '9.29%', tier4: 8, tier4Ratio: '2.35%' },
  { name: '骨科', count: 272, ratio: '7.41%', tier4: 42, tier4Ratio: '15.44%' },
  { name: '泌尿外科', count: 227, ratio: '6.18%', tier4: 6, tier4Ratio: '2.64%' },
];

export const PREDICTION_DATA = [
  { or: '1号', surgeon: '赵伟峰', procedure: '胆囊切除术', et: '11:45' },
  { or: '3号', surgeon: '林泽宏', procedure: '髋关节置换', et: '12:30' },
];

export const OPERATIONAL_STATS = {
  utilization: 73.7,
  onTimeRate: 81.25,
  tier4Ratio: 41.3,
  totalMonth: 2503,
  avgDaily: 166.9,
  totalHours: 5045.5
};

export const DOCTOR_SKILLS = [
  { subject: '手术速度', score: 85 },
  { subject: '质量安全', score: 92 },
  { subject: '技术难度', score: 78 },
  { subject: '规范化率', score: 88 },
  { subject: '协作能力', score: 80 },
  { subject: '并发症控制', score: 90 },
];

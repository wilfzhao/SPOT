
import { Surgery, SurgeryStatus } from './types';

export const HOSPITAL_NAME = "联通数智医疗";
export const PLATFORM_NAME = "手术全流程精准管理与分析预测平台";

export const MOCK_SURGERIES: Surgery[] = [
  {
    id: 'OR-101',
    patientName: '张三',
    procedureType: '阑尾切除术',
    surgeon: '赵伟峰',
    operatingRoom: '1号手术室',
    startTime: '08:00',
    overallStatus: SurgeryStatus.WARNING,
    phases: [
      { id: 'p1', name: '麻醉诱导', actualDuration: 18, baselineDuration: 15, status: SurgeryStatus.NORMAL },
      { id: 'p2', name: '切开', actualDuration: 25, baselineDuration: 10, status: SurgeryStatus.CRITICAL },
    ]
  },
  {
    id: 'OR-102',
    patientName: '李四',
    procedureType: '甲状腺癌根治术',
    surgeon: '林泽宏',
    operatingRoom: '2号手术室',
    startTime: '09:00',
    overallStatus: SurgeryStatus.NORMAL,
    phases: []
  }
];

export const DEPT_RANKING = [
  { name: '心血管科', count: 375, ratio: '10.21%', tier4: 6, tier4Ratio: '1.60%' },
  { name: '眼科中心', count: 341, ratio: '9.29%', tier4: 8, tier4Ratio: '2.35%' },
  { name: '骨科', count: 272, ratio: '7.41%', tier4: 42, tier4Ratio: '15.44%' },
  { name: '泌尿外科', count: 227, ratio: '6.18%', tier4: 6, tier4Ratio: '2.64%' },
  { name: '血管外科', count: 194, ratio: '5.28%', tier4: 2, tier4Ratio: '1.03%' },
  { name: '乳腺外科', count: 135, ratio: '3.68%', tier4: 3, tier4Ratio: '2.22%' },
  { name: '肝胆胰外科', count: 132, ratio: '3.59%', tier4: 12, tier4Ratio: '9.09%' },
  { name: '肛肠外科', count: 125, ratio: '3.40%', tier4: 13, tier4Ratio: '10.40%' },
];

export const PREDICTION_DATA = [
  { or: '1号', surgeon: '赵伟峰', procedure: '肩关节镜下修复术', et: '18:05' },
  { or: '5号', surgeon: '林泽宏', procedure: '甲状腺病损切除术', et: '22:25' },
  { or: '3号', surgeon: '杨应麟', procedure: '静脉输液港植入术', et: '16:55' },
  { or: '8号', surgeon: '余楠', procedure: '鞍区病损切除术', et: '17:20' },
  { or: '2号', surgeon: '周亚冰', procedure: '后入路颈椎融合术', et: '18:00' },
  { or: '12号', surgeon: '陈冠军', procedure: '腹腔镜胰体尾切除', et: '15:20' },
];

export const OPERATIONAL_STATS = {
  utilization: 73.7,
  onTimeRate: 81.25,
  tier4Ratio: 41.3,
  totalMonth: 2503,
  avgDaily: 166.9,
  totalHours: 5045.5
};

// Add missing DOCTOR_SKILLS constant for CompetenceModule.tsx
export const DOCTOR_SKILLS = [
  { subject: '手术速度', score: 85 },
  { subject: '质量安全', score: 92 },
  { subject: '技术难度', score: 78 },
  { subject: '规范化率', score: 88 },
  { subject: '协作能力', score: 80 },
  { subject: '并发症控制', score: 90 },
];

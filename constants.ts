
import { Surgery, SurgeryStatus, HistoricalBaseline } from './types';

export const HISTORICAL_BASELINES: HistoricalBaseline[] = [
  {
    procedureType: '阑尾切除术',
    phases: [
      { name: '麻醉诱导', avgDuration: 15, stdDev: 5 },
      { name: '体位摆放', avgDuration: 10, stdDev: 3 },
      { name: '切开', avgDuration: 10, stdDev: 4 },
      { name: '手术主体', avgDuration: 45, stdDev: 15 },
      { name: '缝合', avgDuration: 20, stdDev: 5 },
      { name: '拔管', avgDuration: 15, stdDev: 5 },
    ]
  },
  {
    procedureType: '全膝关节置换术',
    phases: [
      { name: '麻醉诱导', avgDuration: 25, stdDev: 8 },
      { name: '体位摆放', avgDuration: 20, stdDev: 5 },
      { name: '切开', avgDuration: 15, stdDev: 5 },
      { name: '手术主体', avgDuration: 90, stdDev: 20 },
      { name: '缝合', avgDuration: 30, stdDev: 10 },
      { name: '拔管', avgDuration: 20, stdDev: 6 },
    ]
  }
];

export const MOCK_SURGERIES: Surgery[] = [
  {
    id: 'OR-101',
    patientName: '张三',
    procedureType: '阑尾切除术',
    surgeon: '史密斯医生',
    operatingRoom: '1号手术室',
    startTime: '08:00 AM',
    overallStatus: SurgeryStatus.WARNING,
    phases: [
      { id: 'p1', name: '麻醉诱导', actualDuration: 18, baselineDuration: 15, status: SurgeryStatus.NORMAL },
      { id: 'p2', name: '体位摆放', actualDuration: 12, baselineDuration: 10, status: SurgeryStatus.NORMAL },
      { id: 'p3', name: '切开', actualDuration: 25, baselineDuration: 10, status: SurgeryStatus.CRITICAL },
      { id: 'p4', name: '手术主体', actualDuration: 30, baselineDuration: 45, status: SurgeryStatus.NORMAL },
    ]
  },
  {
    id: 'OR-205',
    patientName: '李华',
    procedureType: '全膝关节置换术',
    surgeon: '王医生',
    operatingRoom: '5号手术室',
    startTime: '09:15 AM',
    overallStatus: SurgeryStatus.NORMAL,
    phases: [
      { id: 'p1', name: '麻醉诱导', actualDuration: 24, baselineDuration: 25, status: SurgeryStatus.NORMAL },
      { id: 'p2', name: '体位摆放', actualDuration: 19, baselineDuration: 20, status: SurgeryStatus.NORMAL },
    ]
  },
  {
    id: 'OR-302',
    patientName: '赵铁柱',
    procedureType: '阑尾切除术',
    surgeon: '加西亚医生',
    operatingRoom: '2号手术室',
    startTime: '07:30 AM',
    overallStatus: SurgeryStatus.COMPLETED,
    phases: [
      { id: 'p1', name: '麻醉诱导', actualDuration: 14, baselineDuration: 15, status: SurgeryStatus.NORMAL },
      { id: 'p2', name: '体位摆放', actualDuration: 9, baselineDuration: 10, status: SurgeryStatus.NORMAL },
      { id: 'p3', name: '切开', actualDuration: 8, baselineDuration: 10, status: SurgeryStatus.NORMAL },
      { id: 'p4', name: '手术主体', actualDuration: 42, baselineDuration: 45, status: SurgeryStatus.NORMAL },
      { id: 'p5', name: '缝合', actualDuration: 18, baselineDuration: 20, status: SurgeryStatus.NORMAL },
      { id: 'p6', name: '拔管', actualDuration: 12, baselineDuration: 15, status: SurgeryStatus.NORMAL },
    ]
  }
];

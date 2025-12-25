
import { SurgeryStatus } from '../types';

/**
 * 手术时长风险判定规则 (对齐数据库结构)
 * 正常: 偏差 < 10%
 * 黄灯: 10% <= 偏差 < 25%
 * 红灯: 偏差 >= 25%
 */
export const identifyPhaseStatusLabel = (actual: number, baseline: number): string => {
  if (baseline === 0) return '正常';
  const deviation = (actual - baseline) / baseline;

  if (deviation >= 0.25) return '红灯';
  if (deviation >= 0.10) return '黄灯';
  return '正常';
};

export const getStatusColor = (level: string): string => {
  switch (level) {
    case '红灯': return 'text-rose-500';
    case '黄灯': return 'text-amber-500';
    default: return 'text-emerald-500';
  }
};

export const formatDuration = (mins: number): string => {
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

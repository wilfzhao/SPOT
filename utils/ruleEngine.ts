
import { SurgeryStatus, Phase } from '../types';

/**
 * 手术时长风险判定规则
 * 1. 偏差 < 10%: 正常
 * 2. 10% <= 偏差 < 25%: 预警 (Warning)
 * 3. 偏差 >= 25%: 危急 (Critical)
 */
export const identifyPhaseStatus = (actual: number, baseline: number): SurgeryStatus => {
  if (baseline === 0) return SurgeryStatus.NORMAL;
  const deviation = (actual - baseline) / baseline;

  if (deviation >= 0.25) return SurgeryStatus.CRITICAL;
  if (deviation >= 0.10) return SurgeryStatus.WARNING;
  return SurgeryStatus.NORMAL;
};

export const getDeviationColor = (status: SurgeryStatus): string => {
  switch (status) {
    case SurgeryStatus.CRITICAL: return 'text-rose-500';
    case SurgeryStatus.WARNING: return 'text-amber-500';
    default: return 'text-emerald-500';
  }
};

export const formatDuration = (mins: number): string => {
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

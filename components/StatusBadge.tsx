
import React from 'react';
import { SurgeryStatus } from '../types';

interface StatusBadgeProps {
  status: SurgeryStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStyles = () => {
    switch (status) {
      case SurgeryStatus.NORMAL:
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case SurgeryStatus.WARNING:
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case SurgeryStatus.CRITICAL:
        return 'bg-rose-100 text-rose-700 border-rose-200';
      case SurgeryStatus.COMPLETED:
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStyles()}`}>
      {status}
    </span>
  );
};

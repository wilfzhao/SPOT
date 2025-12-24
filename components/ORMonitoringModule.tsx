
import React, { useState } from 'react';
import { MOCK_SURGERIES } from '../constants';
import { Surgery, SurgeryStatus } from '../types';
import { StatusBadge } from './StatusBadge';
import { SurgeryTimeline } from './SurgeryTimeline';
import { AIAssistant } from './AIAssistant';
import { identifyPhaseStatus, getDeviationColor, formatDuration } from '../utils/ruleEngine';

export const ORMonitoringModule: React.FC = () => {
  const [selectedSurgery, setSelectedSurgery] = useState<Surgery>(MOCK_SURGERIES[0]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-right duration-500">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl backdrop-blur-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="font-bold text-white text-xl">{selectedSurgery.operatingRoom}</h3>
                <StatusBadge status={selectedSurgery.overallStatus} />
              </div>
              <p className="text-sm text-slate-400">{selectedSurgery.procedureType} · 主刀: {selectedSurgery.surgeon}</p>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">手术开始时间</div>
              <div className="text-lg font-digital text-indigo-400">{selectedSurgery.startTime}</div>
            </div>
          </div>
          <SurgeryTimeline surgery={selectedSurgery} />
        </div>

        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl overflow-hidden">
          <h3 className="font-bold text-white text-lg mb-6 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
            全流程阶段量化分析
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                  <th className="pb-4">流程节点</th>
                  <th className="pb-4">实际耗时</th>
                  <th className="pb-4">历史基线</th>
                  <th className="pb-4 text-right">规则判定</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {selectedSurgery.phases.map((phase) => {
                  const status = identifyPhaseStatus(phase.actualDuration, phase.baselineDuration);
                  return (
                    <tr key={phase.id} className="group hover:bg-slate-800/20 transition-colors">
                      <td className="py-4 font-bold text-slate-300 group-hover:text-white transition-colors">
                        {phase.name}
                      </td>
                      <td className="py-4 font-digital text-slate-300">
                        {formatDuration(phase.actualDuration)}
                      </td>
                      <td className="py-4 font-digital text-slate-500">
                        {formatDuration(phase.baselineDuration)}
                      </td>
                      <td className="py-4 text-right">
                        <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                          status === SurgeryStatus.CRITICAL ? 'bg-rose-500/10 text-rose-500' :
                          status === SurgeryStatus.WARNING ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'
                        }`}>
                          {status} ({( (phase.actualDuration - phase.baselineDuration) / phase.baselineDuration * 100).toFixed(0)}%)
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="space-y-6 flex flex-col">
        <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800 shadow-sm">
          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">进行中手术队列</h4>
          <div className="space-y-3">
            {MOCK_SURGERIES.map(s => (
              <button 
                key={s.id}
                onClick={() => setSelectedSurgery(s)}
                className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 ${
                  selectedSurgery.id === s.id 
                    ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/10 scale-[1.02]' 
                    : 'border-slate-800 hover:border-slate-700 bg-slate-900/20'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-white text-sm">{s.operatingRoom}</span>
                  <StatusBadge status={s.overallStatus} />
                </div>
                <div className="text-[10px] text-slate-500 truncate">{s.procedureType}</div>
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex-1">
          <AIAssistant surgery={selectedSurgery} />
        </div>
      </div>
    </div>
  );
};

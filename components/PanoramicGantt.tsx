
import React, { useState, useEffect } from 'react';
import { SurgeryTimelineSimulation } from '../types';

interface PanoramicGanttProps {
  data: SurgeryTimelineSimulation[];
}

export const PanoramicGantt: React.FC<PanoramicGanttProps> = ({ data }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // 定时更新当前时间线
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // 定义时间轴范围: 08:00 - 20:00 (12小时)
  const START_HOUR = 8;
  const END_HOUR = 20;
  const TOTAL_MINUTES = (END_HOUR - START_HOUR) * 60;

  // 稳健的时间转换函数
  const getMinuteOffset = (timeStrOrDate: string | Date) => {
    try {
      const date = typeof timeStrOrDate === 'string' 
        ? new Date(timeStrOrDate.replace(' ', 'T')) 
        : timeStrOrDate;
      
      const hour = date.getHours();
      const min = date.getMinutes();
      // 计算相对于 08:00 的偏移量
      const offset = (hour - START_HOUR) * 60 + min;
      // 限制在 0 - TOTAL_MINUTES 范围内
      return Math.max(0, Math.min(TOTAL_MINUTES, offset));
    } catch (e) {
      return 0;
    }
  };

  const nowOffset = getMinuteOffset(currentTime);
  const rooms = Array.from(new Set(data.map(d => d.operation_room))).sort();

  return (
    <div className="w-full bg-slate-900/60 border border-slate-800 rounded-[2.5rem] p-8 backdrop-blur-xl shadow-2xl overflow-hidden mb-10 relative">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
            手术全景推演甘特图
            <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded-full border border-cyan-500/30 uppercase tracking-widest font-black">AI Prediction Engine</span>
          </h3>
          <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-bold">Panoramic Simulation View · Data-Driven Reasoning</p>
        </div>
        <div className="flex items-center gap-6">
          <LegendItem color="bg-emerald-500" label="术中 (Actual)" />
          <LegendItem color="bg-indigo-600" label="等待 (Est.)" />
          <LegendItem color="bg-rose-500 border-white border" label="风险识别" />
        </div>
      </div>

      <div className="relative border border-white/5 rounded-2xl bg-black/40 overflow-x-auto custom-scrollbar">
        {/* 时间刻度线 */}
        <div className="flex ml-24 border-b border-white/10 relative">
          {Array.from({ length: END_HOUR - START_HOUR + 1 }).map((_, i) => (
            <div 
              key={i} 
              className="flex-1 text-center py-2 text-[10px] font-black text-slate-500 border-r border-white/5 last:border-r-0"
              style={{ minWidth: '80px' }}
            >
              {String(START_HOUR + i).padStart(2, '0')}:00
            </div>
          ))}
        </div>

        {/* 动态内容区域 */}
        <div className="min-w-[1000px] relative">
          {/* 实时时间红线 (Now Line) */}
          {nowOffset > 0 && nowOffset < TOTAL_MINUTES && (
            <div 
              className="absolute top-0 bottom-0 z-40 w-px bg-rose-500 pointer-events-none"
              style={{ left: `calc(6rem + ${(nowOffset / TOTAL_MINUTES) * 100}%)` }}
            >
              <div className="absolute top-0 -translate-x-1/2 bg-rose-500 text-[8px] text-white px-1.5 py-0.5 rounded font-black shadow-lg">
                NOW
              </div>
            </div>
          )}

          {rooms.map(room => (
            <div key={room} className="flex border-b border-white/5 last:border-b-0 group">
              {/* Y轴手术间 */}
              <div className="w-24 shrink-0 flex items-center justify-center border-r border-white/10 bg-slate-900/40 text-[11px] font-black text-slate-400 group-hover:text-cyan-400 transition-colors">
                {room}
              </div>
              
              {/* 手术块绘制区 */}
              <div className="flex-1 h-14 relative bg-slate-800/10">
                {data.filter(d => d.operation_room === room).map(item => {
                  const startOffset = getMinuteOffset(item.est_start_time);
                  const endOffset = getMinuteOffset(item.est_end_time);
                  const duration = endOffset - startOffset;
                  
                  const leftPercent = (startOffset / TOTAL_MINUTES) * 100;
                  const widthPercent = (duration / TOTAL_MINUTES) * 100;
                  const hasRisk = item.risk_tags && item.risk_tags.length > 0;
                  const isCurrent = item.status_type === 'CURRENT';

                  return (
                    <div 
                      key={item.operation_no}
                      className={`absolute top-2 bottom-2 rounded-lg cursor-help transition-all hover:scale-[1.02] hover:z-50 flex flex-col justify-center px-3 group/block ${
                        isCurrent ? 'bg-emerald-500/80 shadow-lg shadow-emerald-500/10' : 'bg-indigo-600/80'
                      } ${hasRisk ? 'border-2 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)] animate-pulse-subtle' : ''}`}
                      style={{ 
                        left: `${leftPercent}%`, 
                        width: `${widthPercent}%`,
                        minWidth: '40px'
                      }}
                    >
                      <div className="text-[9px] font-black text-white truncate leading-tight">{item.operation_name}</div>
                      <div className="text-[8px] font-bold text-white/70 truncate uppercase tracking-tighter">{item.surgen_name}</div>
                      
                      {/* 气泡详情 */}
                      <div className="invisible group-hover/block:visible absolute bottom-full mb-3 left-0 z-[100] w-64 bg-slate-950/95 border border-slate-700 rounded-2xl p-4 shadow-2xl pointer-events-none backdrop-blur-2xl">
                        <div className="flex justify-between items-start mb-2">
                           <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Surgery Profile</div>
                           <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${isCurrent ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                             {isCurrent ? '术中 (Current)' : '排队 (Pending)'}
                           </span>
                        </div>
                        
                        <div className="text-sm font-black text-white mb-3">{item.operation_name}</div>
                        
                        <div className="space-y-2 border-t border-white/5 pt-3">
                           <div className="flex justify-between text-[10px]">
                              <span className="text-slate-500 font-bold">主刀医生:</span>
                              <span className="text-slate-200 font-black">{item.surgen_name}</span>
                           </div>
                           <div className="flex justify-between text-[10px]">
                              <span className="text-slate-500 font-bold">
                                {isCurrent ? '实际开始:' : '预计开始:'}
                              </span>
                              <span className="text-cyan-400 font-digital font-bold">{item.est_start_time.split(' ')[1].slice(0,5)}</span>
                           </div>
                           <div className="flex justify-between text-[10px]">
                              <span className="text-slate-500 font-bold">预计结束:</span>
                              <span className="text-amber-400 font-digital font-bold">{item.est_end_time.split(' ')[1].slice(0,5)}</span>
                           </div>
                           
                           {item.patient_tags.length > 0 && (
                             <div className="pt-2">
                                <div className="text-[9px] text-slate-500 mb-1 uppercase font-black">患者特征:</div>
                                <div className="flex flex-wrap gap-1">
                                   {item.patient_tags.map(tag => (
                                     <span key={tag} className="px-1.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded text-[9px] text-indigo-300 font-black">{tag}</span>
                                   ))}
                                </div>
                             </div>
                           )}

                           {hasRisk && (
                             <div className="pt-2 mt-1 bg-rose-500/5 p-2 rounded-lg border border-rose-500/10">
                                <div className="text-[9px] text-rose-400 mb-1 uppercase font-black flex items-center gap-1">
                                   <span className="animate-pulse">⚠️</span> 风险推演结果:
                                </div>
                                <div className="space-y-1">
                                   {item.risk_tags.map(tag => (
                                     <div key={tag} className="text-[9px] text-rose-200 font-bold leading-tight">
                                        · {tag}
                                     </div>
                                   ))}
                                </div>
                             </div>
                           )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <style>{`
        @keyframes pulse-subtle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.85; transform: scale(0.99); }
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
};

const LegendItem = ({ color, label }: { color: string, label: string }) => (
  <div className="flex items-center gap-2">
    <div className={`w-3 h-3 rounded-full ${color}`}></div>
    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
  </div>
);

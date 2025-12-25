
import React, { useState, useEffect } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer 
} from 'recharts';
import { 
  HOSPITAL_NAME, PLATFORM_NAME, DEPT_RANKING, 
  PREDICTION_DATA, OPERATIONAL_STATS, DB_ANOMALIES, DB_OPERATION_RECORDS 
} from '../constants';
import { ModuleType } from '../types';

interface BigScreenDashboardProps {
  onNavigate: (module: ModuleType) => void;
}

export const BigScreenDashboard: React.FC<BigScreenDashboardProps> = ({ onNavigate }) => {
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  const getDynamicAlert = () => {
    const redAnomaly = DB_ANOMALIES.find(a => a.anomaly_level === '红灯');
    if (redAnomaly) {
      const record = DB_OPERATION_RECORDS.find(r => r.operation_no === redAnomaly.operation_no);
      return {
        room: record?.operation_room || '未知手术室',
        text: `紧急预警：${record?.operation_room || ''}正在进行的 ${redAnomaly.operation_name} 已超出历史基线 ${redAnomaly.deviation_rate}%。已标记为“红灯”危急状态，请协调台次。`,
        isCritical: true
      };
    }
    return {
      room: '系统监控中',
      text: '当前全院手术室运行平稳，各项指标均在历史基线 P80 阈值内。',
      isCritical: false
    };
  };

  const alertInfo = getDynamicAlert();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 p-6 space-y-4 overflow-hidden relative">
      <header className="flex justify-between items-center shrink-0 border-b border-slate-800/50 pb-3">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 p-2 rounded-xl shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-widest text-white">{HOSPITAL_NAME}</h1>
            <h2 className="text-[10px] font-medium text-slate-500 uppercase tracking-[0.3em]">{PLATFORM_NAME}</h2>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-2xl font-digital text-cyan-400">{time}</span>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">2024年10月24日</span>
          </div>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-4 gap-4 overflow-hidden">
        {/* 第一列 */}
        <div className="space-y-4 flex flex-col overflow-hidden">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2">资源负载状况</h3>
          <div className="grid grid-cols-2 gap-3 shrink-0">
            <BigStatCard label="总手术间" value="44" unit="间" color="text-cyan-400" />
            <BigStatCard label="正在进行" value="38" unit="间" color="text-emerald-400" />
            <BigStatCard label="异常红灯" value="1" unit="间" color="text-rose-500" />
            <BigStatCard label="异常黄灯" value="1" unit="间" color="text-amber-400" />
          </div>
          <div className="flex-1 bg-slate-900/40 rounded-2xl border border-slate-800/50 p-4 overflow-y-auto">
             <div className="grid grid-cols-4 gap-2">
                {Array.from({length: 24}).map((_, i) => (
                  <div key={i} className={`aspect-square rounded-lg border flex items-center justify-center ${
                    i === 0 ? 'bg-rose-500/20 border-rose-500 animate-pulse' : 
                    i === 2 ? 'bg-amber-500/20 border-amber-500' : 'bg-slate-800/40 border-slate-700'
                  }`}>
                    <span className="text-[10px] font-bold text-slate-400">{i+1}</span>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* 中间大列 */}
        <div className="col-span-2 space-y-4 flex flex-col overflow-hidden">
          <div className="grid grid-cols-3 gap-4 shrink-0">
            <MetricBox label="已结束台次" value="36" color="text-white" />
            <MetricBox label="今日剩余台次" value="143" color="text-slate-400" />
            <MetricBox label="准点启动率" value="82%" color="text-emerald-400" />
          </div>

          <div className={`p-6 rounded-3xl border transition-all ${alertInfo.isCritical ? 'bg-rose-900/20 border-rose-500/50 shadow-lg shadow-rose-500/10' : 'bg-slate-900/60 border-indigo-500/30'}`}>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xl">{alertInfo.isCritical ? '🚨' : '👩‍⚕️'}</span>
              <h4 className={`font-black text-[11px] uppercase tracking-widest ${alertInfo.isCritical ? 'text-rose-400' : 'text-indigo-400'}`}>
                AI 监控分析报告 · 系统自检
              </h4>
            </div>
            <p className="text-slate-200 text-lg font-medium leading-relaxed">{alertInfo.text}</p>
          </div>

          <div className="flex-1 bg-slate-900/40 rounded-3xl border border-slate-800 p-6 overflow-hidden flex flex-col">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">末台结束时间预测 (AI-Engine)</h3>
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[9px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800">
                    <th className="pb-3 px-2">手术间</th>
                    <th className="pb-3">主刀医生</th>
                    <th className="pb-3">当前项目</th>
                    <th className="pb-3 text-right">预计结束</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/30">
                  {PREDICTION_DATA.map((row, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors">
                      <td className="py-4 px-2 font-bold text-cyan-400">{row.or}</td>
                      <td className="py-4 text-slate-300 text-sm">{row.surgeon}</td>
                      <td className="py-4 text-slate-400 text-xs">{row.procedure}</td>
                      <td className="py-4 text-right pr-2 text-white font-digital">{row.et}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 第四列 */}
        <div className="space-y-4 flex flex-col overflow-hidden">
           <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2">科室效能排行</h3>
           <div className="flex-1 bg-slate-900/40 rounded-2xl border border-slate-800/50 p-4 space-y-4 overflow-y-auto">
              {DEPT_RANKING.map((dept, i) => (
                <div key={i} className="p-3 bg-black/30 rounded-xl border border-white/5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate-200">{dept.name}</span>
                    <span className="text-[10px] text-indigo-400 font-bold">{dept.ratio}</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1 rounded-full">
                    <div className="bg-indigo-500 h-1 rounded-full" style={{width: dept.ratio}}></div>
                  </div>
                </div>
              ))}
           </div>
        </div>
      </div>

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-slate-900/80 backdrop-blur-xl p-2 rounded-full border border-white/10 shadow-2xl z-50">
        <NavButton label="首页" active onClick={() => onNavigate('dashboard')} />
        <NavButton label="时长监测" onClick={() => onNavigate('duration')} />
        <NavButton label="能力画像" onClick={() => onNavigate('doctor')} />
      </nav>
    </div>
  );
};

const BigStatCard = ({ label, value, unit, color }: any) => (
  <div className="bg-slate-900/40 p-3 rounded-2xl border border-slate-800/50">
    <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">{label}</div>
    <div className="flex items-baseline gap-1">
      <span className={`text-2xl font-digital font-bold ${color}`}>{value}</span>
      <span className="text-[8px] text-slate-600 font-bold uppercase">{unit}</span>
    </div>
  </div>
);

const MetricBox = ({ label, value, color }: any) => (
  <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-3xl text-center">
    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</div>
    <div className={`text-4xl font-digital font-bold ${color}`}>{value}</div>
  </div>
);

const NavButton = ({ label, active, onClick }: any) => (
  <button onClick={onClick} className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
    active ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
  }`}>{label}</button>
);

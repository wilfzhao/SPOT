
import React, { useState, useEffect } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  LineChart, Line 
} from 'recharts';
import { 
  HOSPITAL_NAME, PLATFORM_NAME, DEPT_RANKING, 
  PREDICTION_DATA, OPERATIONAL_STATS 
} from '../constants';
import { ModuleType, SurgeryStatus } from '../types';

interface BigScreenDashboardProps {
  onNavigate: (module: ModuleType) => void;
}

export const BigScreenDashboard: React.FC<BigScreenDashboardProps> = ({ onNavigate }) => {
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 p-6 space-y-4 overflow-hidden relative">
      <header className="flex justify-between items-center shrink-0 border-b border-slate-800/50 pb-3">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-500/20">
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
            <span className="text-2xl font-digital text-cyan-400 leading-none">{time}</span>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">2024年10月24日 | 第一季度</span>
          </div>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-4 gap-4 overflow-hidden pb-20">
        <div className="space-y-4 flex flex-col overflow-hidden">
          <SectionTitle title="资源实时负载" />
          <div className="grid grid-cols-2 gap-3 shrink-0">
            <BigStatCard label="额定手术间" value="44" unit="间" color="text-cyan-400" />
            <BigStatCard label="正在使用" value="38" unit="间" color="text-emerald-400" />
            <BigStatCard label="周转预警" value="4" unit="间" color="text-amber-400" />
            <BigStatCard label="手术科室" value="38" unit="个" color="text-indigo-400" />
          </div>

          <SectionTitle title="流程预警看板" />
          <div className="flex-1 bg-slate-900/40 rounded-2xl border border-slate-800/50 p-4 overflow-y-auto scrollbar-hide">
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className={`aspect-square rounded-lg border flex flex-col items-center justify-center p-1 ${
                  i === 3 ? 'bg-rose-500/20 border-rose-500 animate-pulse' : 
                  i % 7 === 0 ? 'bg-amber-500/20 border-amber-500' : 'bg-slate-800/40 border-slate-700'
                }`}>
                  <span className="text-[8px] text-slate-500 font-bold">{i+1}号</span>
                  {i === 3 && <span className="text-[8px] text-rose-500 font-bold">⚠️危急</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-2 space-y-4 flex flex-col overflow-hidden">
          <div className="grid grid-cols-3 gap-4 shrink-0">
            <div className="bg-indigo-600/10 border border-indigo-500/20 p-5 rounded-3xl flex flex-col items-center justify-center">
               <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">已完成台次</div>
               <div className="text-5xl font-digital font-bold text-white">36</div>
            </div>
            <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-3xl flex flex-col items-center justify-center">
               <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">今日择期</div>
               <div className="text-5xl font-digital font-bold text-white">179</div>
            </div>
            <div className="bg-emerald-600/10 border border-emerald-500/20 p-5 rounded-3xl flex flex-col items-center justify-center">
               <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">准点率</div>
               <div className="text-5xl font-digital font-bold text-white">82%</div>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-indigo-500/30 p-6 rounded-3xl animate-pulse-cyan relative shrink-0">
            <div className="absolute -top-3 -left-3 w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/40">
               <span className="text-lg">👩‍⚕️</span>
            </div>
            <h4 className="text-indigo-400 font-bold text-[10px] mb-1">智能助手 · 小依</h4>
            <p className="text-slate-300 leading-relaxed text-base">
              识别到异常：1号手术室当前阶段已耗时 25min，超出历史基线 150%。规则引擎已将其标记为“危急”风险，建议立即查看该手术间的实时麻醉体征。
            </p>
          </div>

          <div className="flex-1 bg-slate-900/40 rounded-3xl border border-slate-800 p-5 flex flex-col overflow-hidden">
            <div className="flex justify-between items-center mb-4 shrink-0">
              <SectionTitle title="末台结束时间预测" />
              <div className="bg-indigo-500/20 px-2 py-0.5 rounded-full text-[9px] font-bold text-indigo-400">AI 增强算法</div>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-slate-950 z-10">
                  <tr className="text-[9px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800">
                    <th className="pb-2 px-2">手术间</th>
                    <th className="pb-2">主刀</th>
                    <th className="pb-2">项目</th>
                    <th className="pb-2 text-right pr-2">预计</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/30">
                  {PREDICTION_DATA.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-800/20 transition-colors">
                      <td className="py-3 px-2 font-bold text-cyan-400 text-sm">{row.or}</td>
                      <td className="py-3 text-slate-300 text-xs">{row.surgeon}</td>
                      <td className="py-3 text-slate-400 text-[11px] truncate max-w-[150px]">{row.procedure}</td>
                      <td className="py-3 text-right pr-2 font-digital text-amber-500 text-xs">{row.et}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-4 flex flex-col overflow-hidden">
          <SectionTitle title="核心运营效率" />
          <div className="grid grid-cols-3 gap-2 shrink-0">
            <RingStat label="周转率" value={OPERATIONAL_STATS.onTimeRate} color="#06b6d4" />
            <RingStat label="利用率" value={OPERATIONAL_STATS.utilization} color="#10b981" />
            <RingStat label="RW标化" value={78} color="#8b5cf6" />
          </div>

          <SectionTitle title="流转效率监控" />
          <div className="space-y-3 shrink-0">
             <EfficiencyCard label="准备室" value="4" time="15.3" />
             <EfficiencyCard label="复苏室" value="3" time="12.5" />
          </div>

          <div className="flex-1 bg-slate-900/40 rounded-3xl border border-slate-800 p-5 flex flex-col overflow-hidden">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase mb-3 tracking-widest">手术科室排行榜</h3>
            <div className="flex-1 space-y-4 overflow-y-auto pr-2 scrollbar-hide">
              {DEPT_RANKING.map((dept, i) => (
                <div key={i} className="group">
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">#{i+1} {dept.name}</span>
                    <span className="text-[10px] font-digital text-cyan-400">{dept.count}台</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${(dept.count / 400) * 100}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-slate-900/70 backdrop-blur-2xl border border-slate-700/50 px-6 py-3 rounded-3xl flex gap-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <ModuleDockBtn id="dashboard" active label="管理大屏" onNavigate={onNavigate} icon="💎" />
          <div className="w-px h-8 bg-slate-700/50 self-center"></div>
          <ModuleDockBtn id="duration" label="时长监测" onNavigate={onNavigate} icon="⏰" />
          <ModuleDockBtn id="efficiency" label="效率评估" onNavigate={onNavigate} icon="📈" />
          <ModuleDockBtn id="risk" label="高风险" onNavigate={onNavigate} icon="⚠️" />
          <ModuleDockBtn id="doctor" label="能力画像" onNavigate={onNavigate} icon="🎓" />
        </div>
      </div>
    </div>
  );
};

const SectionTitle = ({ title }: { title: string }) => (
  <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2 shrink-0">
    <div className="w-0.5 h-3 bg-indigo-500 rounded-full"></div>
    {title}
  </h2>
);

const BigStatCard = ({ label, value, unit, color }: any) => (
  <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
    <div className="text-[9px] font-bold text-slate-600 uppercase mb-1">{label}</div>
    <div className="flex items-baseline gap-1">
      <span className={`text-2xl font-digital font-bold ${color}`}>{value}</span>
      <span className="text-[8px] text-slate-600 font-bold uppercase">{unit}</span>
    </div>
  </div>
);

const MiniStatCard = ({ label, value, icon }: any) => (
  <div className="bg-slate-900/40 border border-slate-800/50 p-3 rounded-xl flex justify-between items-center">
    <div>
      <div className="text-[9px] font-bold text-slate-600 mb-0.5">{label}</div>
      <div className="text-lg font-digital text-slate-200 leading-none">{value}</div>
    </div>
    <div className="text-xl opacity-20">{icon}</div>
  </div>
);

const RingStat = ({ label, value, color }: any) => (
  <div className="bg-slate-900/60 p-3 rounded-2xl flex flex-col items-center border border-slate-800/30">
    <div className="h-12 w-12 mb-2 relative flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={[{v: value}, {v: 100-value}]} innerRadius={18} outerRadius={23} dataKey="v" stroke="none">
            <Cell fill={color} />
            <Cell fill="#1e293b" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <span className="absolute text-[8px] font-digital text-white">{value}%</span>
    </div>
    <div className="text-[8px] font-bold text-slate-500 uppercase">{label}</div>
  </div>
);

const EfficiencyCard = ({ label, value, time }: any) => (
  <div className="bg-slate-900/40 border border-slate-800/50 p-4 rounded-2xl flex justify-between items-center">
    <div>
      <div className="text-[9px] font-bold text-slate-600 uppercase mb-1">{label}</div>
      <div className="text-xl font-digital text-white leading-none">{value}<span className="text-[8px] text-slate-600 ml-1">人</span></div>
    </div>
    <div className="text-right">
      <div className="text-[8px] font-bold text-slate-600 uppercase mb-1">均耗时</div>
      <div className="text-base font-digital text-indigo-400 leading-none">{time}<span className="text-[8px] text-slate-600 ml-1">MIN</span></div>
    </div>
  </div>
);

const ModuleDockBtn = ({ id, label, onNavigate, icon, active }: any) => (
  <button 
    onClick={() => onNavigate(id)}
    className="flex flex-col items-center gap-1 group relative"
  >
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all duration-300 transform group-hover:-translate-y-2 ${
      active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/50 scale-110' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
    }`}>
      {icon}
    </div>
    <span className={`text-[8px] font-bold uppercase transition-colors ${active ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
      {label}
    </span>
    {active && <div className="absolute -bottom-1 w-1 h-1 bg-indigo-500 rounded-full"></div>}
  </button>
);

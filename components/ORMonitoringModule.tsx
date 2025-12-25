
import React, { useState, useEffect } from 'react';
import { DataService } from '../services/dataService';
import { OperationRecord, SurgeryAnomaly } from '../types';
import { AIAssistant } from './AIAssistant';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, ReferenceLine 
} from 'recharts';

export const ORMonitoringModule: React.FC = () => {
  const [allRecords, setAllRecords] = useState<OperationRecord[]>([]);
  const [records, setRecords] = useState<OperationRecord[]>([]);
  const [anomalyMap, setAnomalyMap] = useState<Record<string, SurgeryAnomaly>>({});
  const [selectedOpNo, setSelectedOpNo] = useState<string>('');
  const [currentAnomaly, setCurrentAnomaly] = useState<SurgeryAnomaly | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const getLevelDisplay = (level?: string) => {
    if (level === '红灯') return '严重超时';
    if (level === '黄灯') return '进度滞后';
    return '进行中';
  };

  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      try {
        const liveRecords = await DataService.getOperationRecords();
        setAllRecords(liveRecords);
        
        const filteredRecords = liveRecords.filter(r => r.status?.trim() === '术中');
        
        const anomalyData: Record<string, SurgeryAnomaly> = {};
        await Promise.all(liveRecords.map(async (r) => {
          const a = await DataService.getAnomalyByNo(r.operation_no);
          if (a) anomalyData[r.operation_no] = a;
        }));
        setAnomalyMap(anomalyData);

        // 核心排序逻辑：术中优先，且红灯 > 黄灯 > 正常
        const sortedLive = [...filteredRecords].sort((a, b) => {
          const levelA = anomalyData[a.operation_no]?.anomaly_level || '正常';
          const levelB = anomalyData[b.operation_no]?.anomaly_level || '正常';
          const weights: Record<string, number> = { '红灯': 100, '黄灯': 50, '正常': 10 };
          return (weights[levelB] || 0) - (weights[levelA] || 0);
        });

        setRecords(sortedLive);
        if (sortedLive.length > 0) setSelectedOpNo(sortedLive[0].operation_no);
        else if (liveRecords.length > 0) setSelectedOpNo(liveRecords[0].operation_no);
        
      } catch (err) {
        console.error("Init data error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    initData();
  }, []);

  useEffect(() => {
    if (!selectedOpNo) return;
    const fetchDetail = async () => {
      try {
        const data = await DataService.getAnomalyByNo(selectedOpNo);
        if (data) {
          setCurrentAnomaly(data);
          setAnomalyMap(prev => ({ ...prev, [selectedOpNo]: data }));
        }
      } catch (err) {
        console.error("Fetch anomaly error:", err);
      }
    };
    fetchDetail();
  }, [selectedOpNo]);

  const selectedRecord = allRecords.find(r => r.operation_no === selectedOpNo);

  const chartData = currentAnomaly ? [
    { name: '当前进度', 时长: Number(currentAnomaly.actual_duration) || 0, color: currentAnomaly.anomaly_level === '红灯' ? '#f43f5e' : (currentAnomaly.anomaly_level === '黄灯' ? '#f59e0b' : '#10b981') },
    { name: '平均基准', 时长: Number(currentAnomaly.baseline_avg) || 0, color: '#94a3b8' },
    { name: 'P80阈值', 时长: Number(currentAnomaly.baseline_p80) || 0, color: '#f59e0b' },
    { name: 'P90阈值', 时长: Number(currentAnomaly.baseline_p90) || 0, color: '#f43f5e' },
  ] : [];

  return (
    <div className="flex flex-col gap-10 animate-in slide-in-from-right duration-500 pb-32">
      {/* 顶部：实时监测与列表 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 左侧详情卡片 */}
        <div className="lg:col-span-2 min-w-0 bg-slate-900/40 border border-slate-800 p-8 rounded-[3rem] backdrop-blur-md relative shadow-2xl">
          <div className="flex justify-between items-start mb-8">
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <h3 className="font-black text-white text-3xl tracking-tight">{selectedRecord?.operation_room}</h3>
                <span className={`px-5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                  currentAnomaly?.anomaly_level === '红灯' ? 'bg-rose-500 text-white animate-pulse' :
                  currentAnomaly?.anomaly_level === '黄灯' ? 'bg-amber-500 text-white' : 
                  'bg-emerald-500 text-white'
                }`}>
                  {selectedRecord?.status === '已完成' ? '手术结束' : getLevelDisplay(currentAnomaly?.anomaly_level)}
                </span>
              </div>
              <p className="text-slate-300 font-bold text-xl">{selectedRecord?.operation_name}</p>
            </div>
            <div className="bg-black/60 p-6 rounded-[2rem] border border-white/5 text-right">
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">DEVIATION %</div>
              <div className={`text-5xl font-digital ${
                currentAnomaly && currentAnomaly.deviation_rate > 20 ? 'text-rose-500' : 'text-emerald-500'
              }`}>
                {currentAnomaly ? Number(currentAnomaly.deviation_rate).toFixed(1) : '0.0'}
              </div>
            </div>
          </div>

          <div className="h-[400px] w-full min-h-0 min-w-0 bg-black/40 rounded-[2.5rem] p-8 border border-white/5">
            <ResponsiveContainer width="100%" height="100%" debounce={1}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 80, right: 40, top: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#1e293b" />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13, fontWeight: '900' }} />
                <XAxis type="number" hide />
                <Tooltip 
                  cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                  contentStyle={{ backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '24px' }}
                  itemStyle={{ color: '#f8fafc', fontWeight: '900' }}
                />
                <Bar dataKey="时长" radius={[0, 15, 15, 0]} barSize={42}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
                {currentAnomaly && (
                  <ReferenceLine x={Number(currentAnomaly.baseline_p90)} stroke="#f43f5e" strokeWidth={2} strokeDasharray="8 6" />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 右侧列表 */}
        <div className="bg-slate-900/40 rounded-[3rem] border border-slate-800 flex flex-col overflow-hidden h-[600px]">
          <div className="p-8 border-b border-white/5 bg-white/[0.02]">
            <h4 className="text-[12px] font-black text-slate-400 uppercase tracking-widest flex justify-between items-center">
              <span>术中监测库</span>
              <span className="bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full font-black">{records.length} LIVE</span>
            </h4>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            {records.length > 0 ? records.map(r => {
              const anomaly = anomalyMap[r.operation_no];
              const level = anomaly?.anomaly_level || '正常';
              const isSelected = selectedOpNo === r.operation_no;
              return (
                <button 
                  key={r.operation_no}
                  onClick={() => setSelectedOpNo(r.operation_no)}
                  className={`w-full text-left p-6 rounded-[2rem] border transition-all transform active:scale-[0.98] ${
                    isSelected ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_10px_30px_rgba(79,70,229,0.2)]' : 
                    level === '红灯' ? 'border-rose-500/40 bg-rose-500/[0.05]' : 'border-slate-800 bg-slate-900/40 hover:border-slate-600'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className={`font-black text-base tracking-tight ${isSelected ? 'text-white' : level === '红灯' ? 'text-rose-400' : 'text-slate-300'}`}>{r.operation_room}</span>
                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                      level === '红灯' ? 'bg-rose-500 text-white animate-pulse' : 
                      level === '黄灯' ? 'bg-amber-500/20 text-amber-500' : 'bg-emerald-500/20 text-emerald-500'
                    }`}>{level}</span>
                  </div>
                  <div className="text-[11px] font-bold text-slate-500 truncate uppercase tracking-tighter opacity-80">{r.operation_name}</div>
                </button>
              )
            }) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-2">
                <span className="text-4xl opacity-20">🏥</span>
                <span className="text-xs font-black uppercase tracking-widest">暂无术中手术</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI 助手 */}
      <div className="w-full">
        {selectedRecord && <AIAssistant surgery={selectedRecord} />}
      </div>

      {/* 底部：手术历史时长全量对比表 */}
      <div className="bg-slate-900/40 rounded-[3rem] border border-slate-800 p-10 shadow-2xl overflow-hidden backdrop-blur-md">
        <div className="flex justify-between items-center mb-10">
          <div className="space-y-1">
            <h3 className="text-2xl font-black text-white tracking-tight">手术时长全流程全量对比表</h3>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em]">Integrated Surgical Process History & Benchmarking</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-rose-500/20 border border-rose-500/50 rounded-sm"></span>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">时长超标 / Outlier</span>
            </div>
            <div className="px-4 py-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
              <span className="text-xs font-black text-indigo-400">TOTAL: {allRecords.length} RECORDS</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-[2rem] border border-white/5 bg-black/20">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.03] text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-white/5">
                <th className="px-6 py-5">手术编号</th>
                <th className="px-6 py-5">状态</th>
                <th className="px-6 py-5">手术间</th>
                <th className="px-6 py-5">申请科室</th>
                <th className="px-6 py-5">手术名称</th>
                <th className="px-6 py-5">主刀医生</th>
                <th className="px-6 py-5">预计时长</th>
                <th className="px-6 py-5 text-right">实际时长</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {allRecords.map((r) => {
                const anomaly = anomalyMap[r.operation_no];
                const isOvertime = anomaly && anomaly.actual_duration > anomaly.baseline_avg;
                const isOngoing = r.status === '术中';
                
                return (
                  <tr 
                    key={r.operation_no} 
                    onClick={() => setSelectedOpNo(r.operation_no)}
                    className={`group cursor-pointer transition-colors ${
                      isOvertime ? 'bg-rose-500/[0.07] hover:bg-rose-500/[0.1]' : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    <td className="px-6 py-6 font-mono text-xs text-slate-400 group-hover:text-white transition-colors">#{r.operation_no}</td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${isOngoing ? 'bg-indigo-400 animate-pulse shadow-[0_0_8px_rgba(129,140,248,0.8)]' : 'bg-emerald-400'}`}></span>
                        <span className={`text-[11px] font-black uppercase tracking-widest ${isOngoing ? 'text-indigo-400' : 'text-emerald-400'}`}>{r.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6 font-bold text-white text-sm tracking-tight">{r.operation_room}</td>
                    <td className="px-6 py-6 text-slate-400 text-xs font-bold">{r.dept_name || '未知科室'}</td>
                    <td className="px-6 py-6 text-slate-300 text-sm font-medium truncate max-w-[200px]">{r.operation_name}</td>
                    <td className="px-6 py-6 text-slate-400 text-sm font-bold">{r.surgen_name}</td>
                    <td className="px-6 py-6 text-slate-500 text-xs font-black uppercase tracking-tighter">
                      {anomaly ? `${anomaly.baseline_avg} MIN` : '--'}
                    </td>
                    <td className="px-6 py-6 text-right">
                      <span className={`text-base font-digital ${isOvertime ? 'text-rose-500 font-black' : 'text-emerald-400'}`}>
                        {anomaly ? anomaly.actual_duration : '--'}
                      </span>
                      <span className="text-[10px] text-slate-600 font-bold ml-1 uppercase">min</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

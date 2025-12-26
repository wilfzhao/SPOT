
import React, { useState, useEffect, useMemo } from 'react';
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
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 格式化时间的辅助函数
  const formatStartTime = (startTimeStr: string) => {
    if (!startTimeStr) return '--:--';
    try {
      const date = new Date(startTimeStr.replace(' ', 'T'));
      if (isNaN(date.getTime())) {
        const fallbackDate = new Date(startTimeStr);
        if (isNaN(fallbackDate.getTime())) return startTimeStr.split(' ')[1] || startTimeStr;
        return fallbackDate.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
      }
      return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch (e) {
      return '--:--';
    }
  };

  // 状态显示逻辑
  const getLevelDisplay = (anomaly?: SurgeryAnomaly) => {
    if (!anomaly || anomaly.actual_duration === 0) return '尚未开始';
    if (anomaly.anomaly_level === '红灯') return '严重超时';
    if (anomaly.anomaly_level === '黄灯') return '进度滞后';
    if (anomaly.anomaly_level === '无基准') return '无参考基准';
    return '正常进行中';
  };

  const getListStatusLabel = (anomaly?: SurgeryAnomaly) => {
    if (!anomaly || anomaly.actual_duration === 0) return '等候中';
    if (anomaly.anomaly_level === '红灯') return '严重超时';
    if (anomaly.anomaly_level === '黄灯') return '进度滞后';
    return '正常进行中';
  };

  const getListStatusColor = (anomaly?: SurgeryAnomaly) => {
    if (!anomaly || anomaly.actual_duration === 0) return 'bg-slate-700/50 text-slate-400';
    if (anomaly.anomaly_level === '红灯') return 'bg-rose-500 text-white animate-pulse';
    if (anomaly.anomaly_level === '黄灯') return 'bg-amber-500/20 text-amber-500';
    return 'bg-emerald-500/20 text-emerald-500';
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

        const sortedLive = [...filteredRecords].sort((a, b) => {
          const anomalyA = anomalyData[a.operation_no];
          const anomalyB = anomalyData[b.operation_no];
          
          const getPriority = (anom?: SurgeryAnomaly) => {
            if (!anom) return 0;
            if (anom.anomaly_level === '红灯') return 3;
            if (anom.anomaly_level === '黄灯') return 2;
            return 1;
          };

          const pA = getPriority(anomalyA);
          const pB = getPriority(anomalyB);

          if (pA !== pB) return pB - pA;
          const timeA = new Date(a.operation_start_time.replace(' ', 'T')).getTime();
          const timeB = new Date(b.operation_start_time.replace(' ', 'T')).getTime();
          return timeA - timeB;
        });

        setRecords(sortedLive);
        if (sortedLive.length > 0) setSelectedOpNo(sortedLive[0].operation_no);
      } catch (err) {
        console.error("Init data error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    initData();
  }, []);

  const selectedRecord = useMemo(() => allRecords.find(r => r.operation_no === selectedOpNo), [allRecords, selectedOpNo]);
  const currentAnomaly = useMemo(() => selectedOpNo ? anomalyMap[selectedOpNo] : null, [anomalyMap, selectedOpNo]);

  const chartData = useMemo(() => {
    if (!currentAnomaly) return [];
    const isNoBaseline = currentAnomaly.anomaly_level === '无基准';
    return [
      { 
        name: '当前进度', 
        时长: Number(currentAnomaly.actual_duration) || 0, 
        color: currentAnomaly.actual_duration === 0 ? '#1e293b' : 
               (currentAnomaly.anomaly_level === '红灯' ? '#f43f5e' : 
               (currentAnomaly.anomaly_level === '黄灯' ? '#f59e0b' : 
               (currentAnomaly.anomaly_level === '无基准' ? '#6366f1' : '#10b981')))
      },
      { name: '中位数', 时长: isNoBaseline ? 0 : (Number(currentAnomaly.baseline_median) || 0), color: '#475569' },
      { name: '中位数+1σ', 时长: isNoBaseline ? 0 : (Number(currentAnomaly.baseline_median || 0) + Number(currentAnomaly.baseline_std_dev || 0)), color: '#818cf8' },
      { name: 'P80阈值', 时长: isNoBaseline ? 0 : (Number(currentAnomaly.baseline_p80) || 0), color: '#fbbf24' },
      { name: 'P90阈值', 时长: isNoBaseline ? 0 : (Number(currentAnomaly.baseline_p90) || 0), color: '#ef4444' },
    ];
  }, [currentAnomaly]);

  return (
    <div className="flex flex-col gap-10 animate-in slide-in-from-right duration-500 pb-32">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 数据核心看板 */}
        <div className="lg:col-span-2 min-w-0 bg-slate-900/40 border border-slate-800 p-8 rounded-[3rem] backdrop-blur-md relative shadow-2xl">
          <div className="flex justify-between items-start mb-8">
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <h3 className="font-black text-white text-3xl tracking-tight">{selectedRecord?.operation_room || '--'}</h3>
                <span className={`px-5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                  currentAnomaly?.actual_duration === 0 ? 'bg-slate-700 text-slate-400' :
                  currentAnomaly?.anomaly_level === '红灯' ? 'bg-rose-500 text-white animate-pulse' :
                  currentAnomaly?.anomaly_level === '黄灯' ? 'bg-amber-500 text-white' : 
                  'bg-emerald-500 text-white'
                }`}>
                  {getLevelDisplay(currentAnomaly || undefined)}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-slate-100 font-bold text-xl">{selectedRecord?.operation_name || '未选中'}</p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">主刀医生:</span>
                  <span className="text-indigo-400 font-black text-sm tracking-tight">{selectedRecord?.surgen_name || '--'}</span>
                </div>
              </div>
            </div>
            <div className="bg-black/60 p-6 rounded-[2rem] border border-white/5 text-right">
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                {currentAnomaly?.anomaly_level === '无基准' ? 'REFERENCE' : 'DEVIATION %'}
              </div>
              <div className={`text-5xl font-digital ${
                currentAnomaly?.anomaly_level === '无基准' || currentAnomaly?.actual_duration === 0 ? 'text-slate-600' :
                (currentAnomaly && currentAnomaly.deviation_rate > 20 ? 'text-rose-500' : 'text-emerald-500')
              }`}>
                {currentAnomaly?.actual_duration === 0 ? '0.0' : 
                 (currentAnomaly?.anomaly_level === '无基准' ? 'N/A' : (currentAnomaly ? Number(currentAnomaly.deviation_rate).toFixed(1) : '0.0'))}
              </div>
            </div>
          </div>

          <div className="h-[400px] w-full min-h-0 bg-black/40 rounded-[2.5rem] p-8 border border-white/5 relative">
            {currentAnomaly?.actual_duration === 0 ? (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-[2.5rem]">
                <div className="text-center space-y-3">
                  <span className="text-4xl">⏳</span>
                  <p className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">手术尚未正式开始 / Awaiting Start</p>
                </div>
              </div>
            ) : currentAnomaly?.anomaly_level === '无基准' && (
              <div className="absolute bottom-10 right-10 z-10">
                <div className="bg-indigo-500/10 px-6 py-3 rounded-2xl border border-indigo-500/20 backdrop-blur-md">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-relaxed text-right">
                    该术式组合暂无历史基线数据<br/>
                    <span className="opacity-50 text-[8px]">NON-BASELINE PROCEDURE</span>
                  </p>
                </div>
              </div>
            )}
            
            <ResponsiveContainer width="100%" height="100%" debounce={1}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 100, right: 40, top: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#1e293b" />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#f8fafc', fontSize: 12, fontWeight: '700' }} />
                <XAxis type="number" hide domain={[0, 'auto']} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                  contentStyle={{ backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '12px', padding: '12px 16px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.8)' }}
                  itemStyle={{ color: '#ffffff', fontWeight: '900', fontSize: '14px' }}
                  labelStyle={{ color: '#94a3b8', marginBottom: '4px', fontWeight: '900', fontSize: '10px', textTransform: 'uppercase' }}
                  formatter={(value: number, name: string) => [`${value} 分钟`, name]}
                />
                <Bar dataKey="时长" radius={[0, 15, 15, 0]} barSize={36}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
                {currentAnomaly && currentAnomaly.anomaly_level !== '无基准' && currentAnomaly.actual_duration > 0 && (
                  <ReferenceLine x={Number(currentAnomaly.baseline_p90)} stroke="#f43f5e" strokeWidth={2} strokeDasharray="8 6" label={{ position: 'top', value: 'P90 CRITICAL', fill: '#f43f5e', fontSize: 10, fontWeight: '900' }} />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 术中监测库列表 */}
        <div className="bg-slate-900/40 rounded-[3rem] border border-slate-800 flex flex-col overflow-hidden h-[600px]">
          <div className="p-8 border-b border-white/5 bg-white/[0.02]">
            <h4 className="text-[12px] font-black text-slate-400 uppercase tracking-widest flex justify-between items-center">
              <span>术中监测库</span>
              <span className="bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full font-black">{records.length} LIVE</span>
            </h4>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            {records.map(r => {
              const anomaly = anomalyMap[r.operation_no];
              const isSelected = selectedOpNo === r.operation_no;
              return (
                <button 
                  key={r.operation_no}
                  onClick={() => setSelectedOpNo(r.operation_no)}
                  className={`w-full text-left p-6 rounded-[2rem] border transition-all ${
                    isSelected ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_0_20px_rgba(99,102,241,0.1)]' : 
                    (anomaly?.anomaly_level === '红灯' ? 'border-rose-500/40 bg-rose-500/[0.05]' : 'border-slate-800 bg-slate-900/40 hover:border-slate-600')
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`font-black text-base tracking-tight ${isSelected ? 'text-white' : 'text-slate-300'}`}>{r.operation_room}</span>
                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${getListStatusColor(anomaly)}`}>
                      {getListStatusLabel(anomaly)}
                    </span>
                  </div>
                  <div className="text-[11px] font-bold text-slate-500 truncate uppercase tracking-tighter opacity-80">{r.operation_name}</div>
                  
                  <div className="mt-3 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-black text-slate-600 uppercase">Surgeon:</span>
                      <span className="text-[11px] font-black text-indigo-400 tracking-tight">{r.surgen_name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-[9px] text-slate-500 font-mono flex items-center gap-1">
                        <span className="opacity-50 font-black">START:</span> 
                        <span className="font-bold text-slate-300">{formatStartTime(r.operation_start_time)}</span>
                      </div>
                      {anomaly && anomaly.actual_duration > 0 && (
                        <div className="text-[9px] text-slate-400 font-black tracking-widest">
                          {anomaly.actual_duration} MIN
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="w-full">
        {selectedRecord && (
          <AIAssistant 
            key={selectedOpNo} 
            surgery={selectedRecord} 
            anomaly={currentAnomaly || undefined} 
          />
        )}
      </div>
    </div>
  );
};

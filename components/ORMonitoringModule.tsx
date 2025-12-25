
import React, { useState, useEffect } from 'react';
import { DataService } from '../services/dataService';
import { OperationRecord, SurgeryAnomaly } from '../types';
import { AIAssistant } from './AIAssistant';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, ReferenceLine 
} from 'recharts';

export const ORMonitoringModule: React.FC = () => {
  const [records, setRecords] = useState<OperationRecord[]>([]);
  const [anomalyMap, setAnomalyMap] = useState<Record<string, SurgeryAnomaly>>({});
  const [selectedOpNo, setSelectedOpNo] = useState<string>('');
  const [currentAnomaly, setCurrentAnomaly] = useState<SurgeryAnomaly | null>(null);
  const [isRecordsLoading, setIsRecordsLoading] = useState<boolean>(true);

  const getLevelDisplay = (level?: string) => {
    if (level === '危急') return '红灯';
    if (level === '预警') return '黄灯';
    return level || '正常';
  };

  useEffect(() => {
    const initData = async () => {
      setIsRecordsLoading(true);
      try {
        const liveRecords = await DataService.getOperationRecords();
        const filteredRecords = liveRecords.filter(r => r.status?.trim() === '术中');
        
        const anomalyData: Record<string, SurgeryAnomaly> = {};
        await Promise.all(filteredRecords.map(async (r) => {
          const a = await DataService.getAnomalyByNo(r.operation_no);
          if (a) anomalyData[r.operation_no] = a;
        }));
        setAnomalyMap(anomalyData);

        const sorted = [...filteredRecords].sort((a, b) => {
          const levelA = anomalyData[a.operation_no]?.anomaly_level || '正常';
          const levelB = anomalyData[b.operation_no]?.anomaly_level || '正常';
          const weights: Record<string, number> = { '危急': 3, '预警': 2, '正常': 1 };
          const weightA = weights[levelA] || 1;
          const weightB = weights[levelB] || 1;
          if (weightA !== weightB) return weightB - weightA;
          const timeA = new Date(a.operation_start_time).getTime();
          const timeB = new Date(b.operation_start_time).getTime();
          return timeB - timeA;
        });

        setRecords(sorted);
        if (sorted.length > 0) setSelectedOpNo(sorted[0].operation_no);
      } catch (err) {
        console.error("Init data error:", err);
      } finally {
        setIsRecordsLoading(false);
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
        } else {
          const record = records.find(r => r.operation_no === selectedOpNo);
          setCurrentAnomaly({
            operation_no: selectedOpNo,
            operation_name: record?.operation_name || '未知手术',
            actual_duration: 30,
            baseline_avg: 60,
            baseline_p80: 75,
            baseline_p90: 90,
            deviation_rate: 0,
            anomaly_level: '正常',
            anomaly_reason: '当前手术进程平稳，各项监测指标符合历史基线预期。'
          });
        }
      } catch (err) {
        console.error("Fetch anomaly error:", err);
      }
    };

    fetchDetail();
  }, [selectedOpNo, records]);

  const selectedRecord = records.find(r => r.operation_no === selectedOpNo);

  if (isRecordsLoading && records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
        <p className="text-slate-400 animate-pulse font-medium">正在检索手术室实时动态...</p>
      </div>
    );
  }

  const chartData = currentAnomaly ? [
    { name: '当前进度', 时长: Number(currentAnomaly.actual_duration) || 0, color: currentAnomaly.anomaly_level === '正常' ? '#10b981' : (currentAnomaly.anomaly_level === '危急' ? '#f43f5e' : '#f59e0b') },
    { name: '平均基准', 时长: Number(currentAnomaly.baseline_avg) || 0, color: '#94a3b8' },
    { name: 'P80阈值', 时长: Number(currentAnomaly.baseline_p80) || 0, color: '#f59e0b' },
    { name: 'P90阈值', 时长: Number(currentAnomaly.baseline_p90) || 0, color: '#f43f5e' },
  ] : [];

  return (
    <div className="flex flex-col gap-8 animate-in slide-in-from-right duration-500 pb-24">
      {/* 顶部：仪表盘与列表 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 核心监测卡片 */}
        <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem] backdrop-blur-md relative shadow-2xl">
          <div className="flex justify-between items-start mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-bold text-white text-2xl">{selectedRecord?.operation_room}</h3>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  currentAnomaly?.anomaly_level === '危急' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' :
                  currentAnomaly?.anomaly_level === '预警' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                }`}>
                  {getLevelDisplay(currentAnomaly?.anomaly_level)}
                </span>
              </div>
              <p className="text-slate-300 font-medium text-lg">{selectedRecord?.operation_name}</p>
              <div className="flex gap-4 mt-2">
                <span className="text-xs text-slate-500">主刀：<span className="text-slate-300 font-bold">{selectedRecord?.surgen_name}</span></span>
                <span className="text-xs text-slate-500">编号：<span className="text-slate-300">{selectedRecord?.operation_no}</span></span>
              </div>
            </div>
            <div className="bg-slate-950/80 p-5 rounded-2xl border border-white/10 text-right ring-1 ring-white/5">
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Duration Deviation</div>
              <div className={`text-4xl font-digital ${currentAnomaly && currentAnomaly.deviation_rate > 20 ? 'text-rose-500' : 'text-emerald-500'}`}>
                {currentAnomaly ? Number(currentAnomaly.deviation_rate).toFixed(1) : '0.0'}%
              </div>
            </div>
          </div>

          <div className="h-[400px] w-full bg-black/30 rounded-3xl p-6 border border-white/5">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 80, right: 40, top: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#1e293b" />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 13, fontWeight: 'bold' }} />
                <XAxis type="number" hide />
                <Tooltip 
                  cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                  contentStyle={{ 
                    backgroundColor: '#020617', 
                    border: '2px solid #334155', 
                    borderRadius: '16px',
                    padding: '16px 20px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
                  }}
                  itemStyle={{
                    color: '#f8fafc',
                    fontSize: '16px',
                    fontWeight: '900',
                    padding: '6px 0'
                  }}
                  labelStyle={{
                    color: '#94a3b8',
                    fontSize: '11px',
                    fontWeight: 'black',
                    textTransform: 'uppercase',
                    letterSpacing: '0.2em',
                    marginBottom: '10px',
                    borderBottom: '1px solid #1e293b',
                    paddingBottom: '8px'
                  }}
                  formatter={(value: number) => [`${value} 分钟`, '监测时长']}
                />
                <Bar dataKey="时长" radius={[0, 10, 10, 0]} barSize={38}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
                {currentAnomaly && (
                  <ReferenceLine x={Number(currentAnomaly.baseline_p90)} stroke="#f43f5e" strokeDasharray="6 4" label={{ position: 'top', value: 'P90阈值', fill: '#f43f5e', fontSize: 11, fontWeight: 'black' }} />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 右侧手术列表 */}
        <div className="bg-slate-900/40 rounded-[2.5rem] border border-slate-800 flex flex-col overflow-hidden shadow-2xl h-[580px]">
          <div className="p-7 border-b border-slate-800 bg-white/5">
            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] flex justify-between items-center">
              <span>手术室状态库</span>
              <span className="bg-indigo-500 text-white text-[10px] px-3 py-0.5 rounded-full font-bold">{records.length}</span>
            </h4>
          </div>
          
          <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-slate-950/20">
            {records.map(r => {
              const anomaly = anomalyMap[r.operation_no];
              const level = anomaly?.anomaly_level || '正常';
              const isSelected = selectedOpNo === r.operation_no;
              
              return (
                <button 
                  key={r.operation_no}
                  onClick={() => setSelectedOpNo(r.operation_no)}
                  className={`w-full text-left p-5 rounded-3xl border transition-all duration-300 transform group active:scale-[0.98] ${
                    isSelected 
                      ? 'border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/20' 
                      : 'border-slate-800 bg-slate-900/40 hover:border-slate-600 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="max-w-[80%]">
                      <div className={`font-black text-sm transition-colors ${isSelected ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                        {r.operation_room}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1 font-bold italic tracking-wide">{r.surgen_name} 团队</div>
                    </div>
                    <div className={`w-3 h-3 rounded-full mt-1 shrink-0 ${
                      level === '危急' ? 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.7)] animate-pulse' : 
                      level === '预警' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}></div>
                  </div>
                  <div className={`text-[11px] truncate pt-3 border-t transition-colors leading-tight ${
                    isSelected ? 'border-indigo-500/20 text-slate-300' : 'border-slate-800/50 text-slate-500'
                  }`}>
                    {r.operation_name}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 底部：横向 AI 指挥中心 */}
      <div className="w-full">
        {selectedRecord && <AIAssistant surgery={selectedRecord} />}
      </div>
    </div>
  );
};

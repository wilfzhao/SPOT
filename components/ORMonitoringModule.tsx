
import React, { useState, useEffect } from 'react';
import { DataService } from '../services/dataService';
import { OperationRecord, SurgeryAnomaly } from '../types';
import { DB_ANOMALIES } from '../constants';
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
  const [isAnomalyLoading, setIsAnomalyLoading] = useState<boolean>(false);

  // 内部转换函数：统一 UI 标签名称
  const getLevelDisplay = (level?: string) => {
    if (level === '危急') return '红灯';
    if (level === '预警') return '黄灯';
    return level || '正常';
  };

  // 1. 初始化：加载手术列表
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

  // 2. 当选中项改变时，更新主面板数据
  useEffect(() => {
    if (!selectedOpNo) return;

    const fetchDetail = async () => {
      setIsAnomalyLoading(true);
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
      } finally {
        setIsAnomalyLoading(false);
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
    { name: 'P80黄灯线', 时长: Number(currentAnomaly.baseline_p80) || 0, color: '#f59e0b' },
    { name: 'P90红灯线', 时长: Number(currentAnomaly.baseline_p90) || 0, color: '#f43f5e' },
  ] : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-right duration-500 pb-20">
      {/* 左侧及中间：主要图表和详情 */}
      <div className="lg:col-span-2 space-y-6 h-fit">
        <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2rem] backdrop-blur-md relative">
          <div className="flex justify-between items-start mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-bold text-white text-2xl">{selectedRecord?.operation_room}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  currentAnomaly?.anomaly_level === '危急' ? 'bg-rose-500 text-white' :
                  currentAnomaly?.anomaly_level === '预警' ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'
                }`}>
                  {getLevelDisplay(currentAnomaly?.anomaly_level)}
                </span>
              </div>
              <p className="text-slate-400 font-medium">{selectedRecord?.operation_name}</p>
              <p className="text-xs text-slate-500 mt-1">主刀：{selectedRecord?.surgen_name} | 编号：{selectedRecord?.operation_no}</p>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">偏差率 (Deviation)</div>
              <div className={`text-3xl font-digital ${currentAnomaly && currentAnomaly.deviation_rate > 20 ? 'text-rose-500' : 'text-emerald-500'}`}>
                {currentAnomaly ? Number(currentAnomaly.deviation_rate).toFixed(1) : '0.0'}%
              </div>
            </div>
          </div>

          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 80, right: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#1e293b" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    border: '1px solid #334155', 
                    borderRadius: '14px',
                    padding: '12px 16px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4)'
                  }}
                  itemStyle={{
                    color: '#f8fafc',
                    fontSize: '14px',
                    fontWeight: '700',
                    padding: '2px 0'
                  }}
                  labelStyle={{
                    color: '#94a3b8',
                    fontSize: '12px',
                    fontWeight: '600',
                    marginBottom: '4px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                  formatter={(value: number) => [`${value} 分钟`, '时长']}
                />
                <Bar dataKey="时长" radius={[0, 8, 8, 0]} barSize={35}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
                {currentAnomaly && (
                  <ReferenceLine x={Number(currentAnomaly.baseline_p90)} stroke="#f43f5e" strokeDasharray="5 5" label={{ position: 'top', value: 'P90红灯线', fill: '#f43f5e', fontSize: 10 }} />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2rem]">
          <h3 className="font-bold text-white text-lg mb-6 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
            实时风险因素及建议 (Contextual Analysis)
          </h3>
          <div className="p-6 bg-slate-950/50 border border-slate-800 rounded-2xl min-h-[100px] flex items-center">
            <p className="text-slate-300 leading-relaxed italic">
              {currentAnomaly?.anomaly_reason}
            </p>
          </div>
        </div>
      </div>

      {/* 右侧列：手术列表 + AI 助手 */}
      <div className="space-y-6 h-fit">
        <div className="bg-slate-900/40 rounded-3xl border border-slate-800 flex flex-col overflow-hidden shadow-2xl">
          <div className="p-6 pb-4 border-b border-slate-800">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex justify-between items-center">
              <span>当前正在进行的手术库</span>
              <span className="bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full">{records.length}</span>
            </h4>
          </div>
          
          <div className="max-h-[300px] overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {records.map(r => {
              const anomaly = anomalyMap[r.operation_no];
              const level = anomaly?.anomaly_level || '正常';
              const displayLevel = getLevelDisplay(level);
              
              return (
                <button 
                  key={r.operation_no}
                  onClick={() => setSelectedOpNo(r.operation_no)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 transform active:scale-95 ${
                    selectedOpNo === r.operation_no 
                      ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/10' 
                      : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="max-w-[70%]">
                      <div className="font-bold text-white text-sm leading-tight truncate">{r.operation_room}</div>
                      <div className="text-[10px] text-slate-500 mt-1">{r.surgen_name}</div>
                    </div>
                    <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase ${
                      level === '危急' ? 'bg-rose-500/20 text-rose-500' : 
                      level === '预警' ? 'bg-amber-500/20 text-amber-500' : 'bg-emerald-500/20 text-emerald-500'
                    }`}>
                      {displayLevel}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-3 pt-2 border-t border-slate-800/50">
                    {r.operation_name}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        
        {/* AI 助手部分 - 让它自然高度展开 */}
        <div className="h-fit">
          {selectedRecord && <AIAssistant surgery={selectedRecord} />}
        </div>
      </div>
    </div>
  );
};

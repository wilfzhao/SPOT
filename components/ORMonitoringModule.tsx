
import React, { useState, useEffect } from 'react';
import { DataService } from '../services/dataService';
import { OperationRecord, SurgeryAnomaly, SurgeryStatus } from '../types';
// Fixed: Added missing import for DB_ANOMALIES
import { DB_ANOMALIES } from '../constants';
import { StatusBadge } from './StatusBadge';
import { AIAssistant } from './AIAssistant';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell, ReferenceLine 
} from 'recharts';

export const ORMonitoringModule: React.FC = () => {
  const [records, setRecords] = useState<OperationRecord[]>([]);
  const [selectedOpNo, setSelectedOpNo] = useState<string>('');
  const [currentAnomaly, setCurrentAnomaly] = useState<SurgeryAnomaly | null>(null);

  useEffect(() => {
    DataService.getOperationRecords().then(data => {
      setRecords(data);
      if (data.length > 0) setSelectedOpNo(data[0].operation_no);
    });
  }, []);

  useEffect(() => {
    if (selectedOpNo) {
      DataService.getAnomalyByNo(selectedOpNo).then(data => {
        if (data) setCurrentAnomaly(data);
      });
    }
  }, [selectedOpNo]);

  const selectedRecord = records.find(r => r.operation_no === selectedOpNo);

  if (!selectedRecord || !currentAnomaly) return <div className="p-20 text-center text-slate-500">正在加载数据库实时数据...</div>;

  const chartData = [
    { name: '当前进度', 时长: currentAnomaly.actual_duration, color: '#6366f1' },
    { name: '平均基准', 时长: currentAnomaly.baseline_avg, color: '#94a3b8' },
    { name: 'P80预警线', 时长: currentAnomaly.baseline_p80, color: '#f59e0b' },
    { name: 'P90危急线', 时长: currentAnomaly.baseline_p90, color: '#f43f5e' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-right duration-500">
      <div className="lg:col-span-2 space-y-6">
        {/* 核心监控面板 */}
        <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2rem] backdrop-blur-md">
          <div className="flex justify-between items-start mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-bold text-white text-2xl">{selectedRecord.operation_room}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  currentAnomaly.anomaly_level === '危急' ? 'bg-rose-500 text-white' :
                  currentAnomaly.anomaly_level === '预警' ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'
                }`}>
                  {currentAnomaly.anomaly_level}
                </span>
              </div>
              <p className="text-slate-400 font-medium">{selectedRecord.operation_name}</p>
              <p className="text-xs text-slate-500 mt-1">主刀：{selectedRecord.surgen_name} | 手术编号：{selectedRecord.operation_no}</p>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">偏离率 (Deviation)</div>
              <div className={`text-3xl font-digital ${currentAnomaly.deviation_rate > 25 ? 'text-rose-500' : 'text-emerald-500'}`}>
                {currentAnomaly.deviation_rate}%
              </div>
            </div>
          </div>

          {/* 阈值对比图表 */}
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 40, right: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#1e293b" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                />
                <Bar dataKey="时长" radius={[0, 8, 8, 0]} barSize={35}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
                <ReferenceLine x={currentAnomaly.baseline_p90} stroke="#f43f5e" strokeDasharray="5 5" label={{ position: 'top', value: '极限界', fill: '#f43f5e', fontSize: 10 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 数据库记录详情 */}
        <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2rem]">
          <h3 className="font-bold text-white text-lg mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            异常根因分析 (Anomaly Reason)
          </h3>
          <div className="p-6 bg-slate-950/50 border border-slate-800 rounded-2xl">
            <p className="text-slate-300 leading-relaxed italic">
              "{currentAnomaly.anomaly_reason}"
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6 flex flex-col">
        {/* 列表切换 */}
        <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800">
          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">实时库记录 (operation_record)</h4>
          <div className="space-y-3">
            {records.map(r => {
              const anomaly = DB_ANOMALIES.find(a => a.operation_no === r.operation_no);
              return (
                <button 
                  key={r.operation_no}
                  onClick={() => setSelectedOpNo(r.operation_no)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 ${
                    selectedOpNo === r.operation_no 
                      ? 'border-indigo-500 bg-indigo-500/10 shadow-lg' 
                      : 'border-slate-800 bg-slate-900/20 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-white text-sm">{r.operation_room}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      anomaly?.anomaly_level === '危急' ? 'bg-rose-500/20 text-rose-500' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {anomaly?.anomaly_level || '正常'}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">{r.operation_name}</div>
                </button>
              );
            })}
          </div>
        </div>
        
        {/* AI 助手接入最新的数据库字段 */}
        <div className="flex-1">
          <AIAssistant surgery={selectedRecord} />
        </div>
      </div>
    </div>
  );
};

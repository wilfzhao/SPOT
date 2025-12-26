
import React, { useState, useEffect } from 'react';
import { analyzeSurgery, getPreferredEngine } from '../services/aiService';
import { OperationRecord, AIAnalysis, SurgeryAnomaly } from '../types';

interface AIAssistantProps {
  surgery: OperationRecord;
  anomaly?: SurgeryAnomaly;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ surgery, anomaly }) => {
  const [analysis, setAnalysis] = useState<(AIAnalysis & { reasoning?: string }) | null>(null);
  const [loading, setLoading] = useState(true);
  
  const activeEngine = getPreferredEngine();

  useEffect(() => {
    setAnalysis(null);
    setLoading(true);

    if (!anomaly) return;

    // 手术尚未开始时，不调用 API，直接显示准备状态
    if (anomaly.actual_duration === 0) {
      setAnalysis({
        riskLevel: '低',
        riskReasons: ['手术尚未正式开始', '等待生命体征监测入场'],
        interventions: ['核对手术器械及耗材', '确认麻醉诱导准备就绪', '各岗位人员签到完毕'],
        summary: '当前手术处于等候/准备阶段，AI 引擎正在实时接入生命体征及术前核对数据。'
      });
      setLoading(false);
      return;
    }

    const fetchAnalysis = async () => {
      try {
        const result = await analyzeSurgery(surgery, anomaly);
        if (anomaly.anomaly_level === '无基准') {
          result.summary = `【初次记录】${result.summary}（注：该手术组合暂无历史数据参考）`;
        }
        setAnalysis(result);
      } catch (err) {
        console.error("AI Analysis failed:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalysis();
  }, [surgery.operation_no, anomaly]); 

  return (
    <div className={`rounded-[2.5rem] border transition-all duration-700 shadow-2xl relative w-full overflow-hidden ${
      activeEngine === 'deepseek' ? 'bg-slate-900/90 border-cyan-500/30 ring-1 ring-cyan-500/20' : 'bg-slate-900/60 border-slate-800'
    }`}>
      <div className="px-10 py-6 border-b border-white/5 flex justify-between items-center bg-white/5 backdrop-blur-xl">
        <div className="flex items-center gap-5">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black ${
            activeEngine === 'deepseek' ? 'bg-cyan-600 text-white shadow-cyan-500/30' : 'bg-indigo-600 text-white shadow-indigo-500/30'
          }`}>
            {activeEngine === 'deepseek' ? 'R1' : 'G'}
          </div>
          <div>
            <h3 className="font-black text-white text-lg leading-none flex items-center gap-3">
              AI 智能决策指挥中心
              {anomaly?.actual_duration === 0 && (
                <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2.5 py-1 rounded border border-indigo-500/30 font-black uppercase tracking-widest">
                  Ready Mode
                </span>
              )}
            </h3>
            <p className="text-[10px] text-slate-500 mt-1.5 uppercase tracking-[0.3em] font-black opacity-80">
              Surgical Intelligence Strategy Hub
            </p>
          </div>
        </div>
      </div>

      <div className="p-12 min-h-[400px]">
        {loading || !analysis ? (
          <div className="grid grid-cols-3 gap-12 animate-pulse">
            <div className="space-y-6"><div className="h-8 bg-white/5 rounded-full w-3/4"></div><div className="h-48 bg-white/5 rounded-[2rem] w-full"></div></div>
            <div className="space-y-6"><div className="h-8 bg-white/5 rounded-full w-1/2"></div><div className="h-48 bg-white/5 rounded-[2rem] w-full"></div></div>
            <div className="space-y-6"><div className="h-8 bg-white/5 rounded-full w-2/3"></div><div className="h-48 bg-white/5 rounded-[2rem] w-full"></div></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-stretch animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <div className="space-y-10 flex flex-col">
              <div className="relative">
                <div className={`absolute -left-6 top-0 bottom-0 w-2 rounded-full ${
                  anomaly?.actual_duration === 0 ? 'bg-indigo-500' :
                  anomaly?.anomaly_level === '红灯' ? 'bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.6)]' :
                  'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.6)]'
                }`}></div>
                <h4 className="text-[12px] font-black text-slate-500 uppercase tracking-[0.4em] mb-6">决策核心摘要 / Conclusion</h4>
                <p className="text-white text-2xl leading-relaxed font-black tracking-tight">
                  {analysis?.summary}
                </p>
              </div>
            </div>

            <div className="bg-rose-500/[0.03] p-10 rounded-[3rem] border border-rose-500/10 shadow-2xl flex flex-col">
              <h4 className="text-[12px] font-black text-rose-400 uppercase tracking-[0.4em] mb-10 flex items-center gap-4">
                <span className="w-2.5 h-2.5 bg-rose-400 rounded-full"></span>
                深层风险因素识别
              </h4>
              <ul className="space-y-8 flex-1">
                {analysis?.riskReasons.map((r, i) => (
                  <li key={i} className="text-[14px] text-slate-200 flex gap-5 leading-relaxed">
                    <span className="text-rose-500/40 shrink-0 font-black">✕</span> 
                    <span className="font-medium">{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-emerald-500/[0.03] p-10 rounded-[3rem] border border-emerald-500/10 shadow-2xl flex flex-col">
              <h4 className="text-[12px] font-black text-emerald-400 uppercase tracking-[0.4em] mb-10 flex items-center gap-4">
                <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full"></span>
                临床协同干预建议
              </h4>
              <ul className="space-y-8 flex-1">
                {analysis?.interventions.map((r, i) => (
                  <li key={i} className="text-[14px] text-slate-200 flex gap-5 leading-relaxed">
                    <span className="text-emerald-500/40 shrink-0 font-black">→</span> 
                    <span className="font-medium">{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

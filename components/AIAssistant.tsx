
import React, { useState, useEffect } from 'react';
import { analyzeSurgery, AIEngine } from '../services/aiService';
import { OperationRecord, AIAnalysis } from '../types';

interface AIAssistantProps {
  surgery: OperationRecord;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ surgery }) => {
  const [analysis, setAnalysis] = useState<(AIAnalysis & { reasoning?: string }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [engine, setEngine] = useState<AIEngine>('gemini');

  useEffect(() => {
    const fetchAnalysis = async () => {
      setAnalysis(null);
      setLoading(true);
      try {
        const result = await analyzeSurgery(surgery, engine);
        setAnalysis(result);
      } catch (err) {
        console.error("AI Analysis failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, [surgery, engine]);

  return (
    <div className={`rounded-[2.5rem] border transition-all duration-700 shadow-[0_35px_60px_-15px_rgba(0,0,0,0.6)] relative w-full overflow-hidden ${
      engine === 'deepseek' 
        ? 'bg-slate-900/90 border-cyan-500/30 ring-1 ring-cyan-500/20' 
        : 'bg-slate-900/60 border-slate-800'
    }`}>
      {/* 装饰性背景 */}
      {engine === 'deepseek' && (
        <div className="absolute -top-60 -left-60 w-[500px] h-[500px] bg-cyan-600/5 blur-[150px] pointer-events-none rounded-full"></div>
      )}

      {/* 头部控制栏 */}
      <div className="px-10 py-6 border-b border-white/5 flex justify-between items-center bg-white/5 backdrop-blur-xl">
        <div className="flex items-center gap-5">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black shadow-2xl ${
            engine === 'deepseek' ? 'bg-cyan-600 text-white shadow-cyan-500/30' : 'bg-indigo-600 text-white shadow-indigo-500/30'
          }`}>
            {engine === 'deepseek' ? 'R1' : 'G'}
          </div>
          <div>
            <h3 className="font-black text-white text-lg leading-none flex items-center gap-3">
              AI 智能决策指挥中心
              {engine === 'deepseek' && (
                <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-2.5 py-1 rounded border border-cyan-500/30 font-black uppercase tracking-widest">
                  Deep Reasoning Active
                </span>
              )}
            </h3>
            <p className="text-[10px] text-slate-500 mt-1.5 uppercase tracking-[0.3em] font-black opacity-80">
              {engine === 'deepseek' ? 'DeepSeek R1 Logic Engine' : 'Google Gemini 3.0 Pro Reasoning'}
            </p>
          </div>
        </div>

        <div className="flex bg-slate-950 p-1.5 rounded-[1.5rem] border border-white/10 shadow-inner">
          <button 
            onClick={() => setEngine('gemini')}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
              engine === 'gemini' ? 'bg-white/10 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Gemini
          </button>
          <button 
            onClick={() => setEngine('deepseek')}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
              engine === 'deepseek' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/30' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            DeepSeek
          </button>
        </div>
      </div>

      <div className="p-12">
        {loading ? (
          <div className="grid grid-cols-3 gap-12 animate-pulse">
            <div className="space-y-6"><div className="h-8 bg-white/5 rounded-full w-3/4"></div><div className="h-48 bg-white/5 rounded-[2rem] w-full"></div></div>
            <div className="space-y-6"><div className="h-8 bg-white/5 rounded-full w-1/2"></div><div className="h-48 bg-white/5 rounded-[2rem] w-full"></div></div>
            <div className="space-y-6"><div className="h-8 bg-white/5 rounded-full w-2/3"></div><div className="h-48 bg-white/5 rounded-[2rem] w-full"></div></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-stretch animate-in fade-in slide-in-from-bottom-10 duration-1000">
            
            {/* 第一栏：结论与思维逻辑 */}
            <div className="space-y-10 flex flex-col">
              <div className="relative">
                <div className={`absolute -left-6 top-0 bottom-0 w-2 rounded-full ${
                  engine === 'deepseek' ? 'bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.6)]' : 'bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.6)]'
                }`}></div>
                <h4 className="text-[12px] font-black text-slate-500 uppercase tracking-[0.4em] mb-6">决策核心摘要 / Conclusion</h4>
                <p className="text-white text-2xl leading-relaxed font-black tracking-tight">
                  {analysis?.summary}
                </p>
              </div>

              {engine === 'deepseek' && analysis?.reasoning && (
                <div className="bg-black/50 border border-cyan-500/10 rounded-[2.5rem] p-8 flex-1 relative group overflow-hidden shadow-2xl">
                  <div className="text-[10px] font-black text-cyan-500/40 uppercase tracking-[0.4em] mb-5 flex items-center gap-4">
                    <span className="shrink-0">思维链推理日志 / Logic Chain</span>
                    <div className="h-px w-full bg-cyan-500/10"></div>
                  </div>
                  <div className="max-h-[220px] overflow-y-auto custom-scrollbar pr-4 text-[13px] text-slate-400 leading-loose italic font-medium">
                    {analysis.reasoning}
                  </div>
                </div>
              )}
            </div>

            {/* 第二栏：风险识别 */}
            <div className="bg-rose-500/[0.03] p-10 rounded-[3rem] border border-rose-500/10 shadow-2xl flex flex-col">
              <h4 className="text-[12px] font-black text-rose-400 uppercase tracking-[0.4em] mb-10 flex items-center gap-4">
                <span className="w-2.5 h-2.5 bg-rose-400 rounded-full shadow-[0_0_15px_rgba(244,63,94,0.6)] animate-pulse"></span>
                深层风险因素识别
              </h4>
              <ul className="space-y-8 flex-1">
                {analysis?.riskReasons.map((r, i) => (
                  <li key={i} className="text-[14px] text-slate-200 flex gap-5 leading-relaxed group">
                    <span className="text-rose-500/40 shrink-0 font-black group-hover:text-rose-500 transition-colors">✕</span> 
                    <span className="font-medium">{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 第三栏：干预建议 */}
            <div className="bg-emerald-500/[0.03] p-10 rounded-[3rem] border border-emerald-500/10 shadow-2xl flex flex-col">
              <h4 className="text-[12px] font-black text-emerald-400 uppercase tracking-[0.4em] mb-10 flex items-center gap-4">
                <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.6)]"></span>
                临床协同干预建议
              </h4>
              <ul className="space-y-8 flex-1">
                {analysis?.interventions.map((r, i) => (
                  <li key={i} className="text-[14px] text-slate-200 flex gap-5 leading-relaxed group">
                    <span className="text-emerald-500/40 shrink-0 font-black group-hover:text-emerald-400 transition-colors">→</span> 
                    <span className="font-medium">{r}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        )}
      </div>

      {/* 底部页脚 */}
      <div className="px-12 py-8 border-t border-white/5 flex items-center justify-between bg-black/40 backdrop-blur-3xl">
        <div className="flex items-center gap-10">
          <span className="text-[11px] font-black text-slate-600 uppercase tracking-[0.5em]">System Intelligence v3.5.2</span>
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Medical Logic Secure</span>
          </div>
        </div>
        <div className={`flex items-center gap-5 px-8 py-2.5 rounded-full border shadow-2xl ${
          analysis?.riskLevel === '高' 
            ? 'bg-rose-500/10 text-rose-500 border-rose-500/30' 
            : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
        }`}>
          <span className="text-[11px] font-black uppercase tracking-[0.3em]">{analysis?.riskLevel || '评估中'}风险响应分级</span>
        </div>
      </div>
    </div>
  );
};

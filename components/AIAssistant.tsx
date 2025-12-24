
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
    <div className={`rounded-[2.5rem] border transition-all duration-700 overflow-hidden shadow-2xl relative h-fit ${
      engine === 'deepseek' 
        ? 'bg-slate-900/90 border-cyan-500/30 ring-1 ring-cyan-500/20' 
        : 'bg-slate-900/40 border-slate-800'
    }`}>
      {/* Dynamic Background Glow for DeepSeek */}
      {engine === 'deepseek' && (
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-600/10 blur-[100px] pointer-events-none rounded-full"></div>
      )}

      {/* Control Header */}
      <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-white/5 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black shadow-lg transition-colors ${
            engine === 'deepseek' ? 'bg-cyan-600 text-white shadow-cyan-500/20' : 'bg-indigo-600 text-white shadow-indigo-500/20'
          }`}>
            {engine === 'deepseek' ? 'R1' : 'G'}
          </div>
          <div>
            <h3 className="font-bold text-white text-sm leading-none flex items-center gap-2">
              AI 智能辅助决策
              {engine === 'deepseek' && <span className="text-[8px] bg-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-500/30">深度推理</span>}
            </h3>
            <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-bold opacity-70">
              {engine === 'deepseek' ? 'DeepSeek R1 Engine' : 'Gemini Flash Core'}
            </p>
          </div>
        </div>

        <div className="flex bg-slate-950 p-1 rounded-2xl border border-white/10 shadow-inner">
          <button 
            onClick={() => setEngine('gemini')}
            className={`px-4 py-2 rounded-xl text-[10px] font-bold transition-all ${
              engine === 'gemini' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-slate-400'
            }`}
          >
            Gemini
          </button>
          <button 
            onClick={() => setEngine('deepseek')}
            className={`px-4 py-2 rounded-xl text-[10px] font-bold transition-all ${
              engine === 'deepseek' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/30' : 'text-slate-500 hover:text-slate-400'
            }`}
          >
            DeepSeek
          </button>
        </div>
      </div>

      <div className="p-8 space-y-6">
        {loading ? (
          <div className="space-y-6 animate-pulse">
            <div className="h-5 bg-white/5 rounded-full w-3/4"></div>
            <div className="h-4 bg-white/5 rounded-full w-full"></div>
            
            {engine === 'deepseek' && (
              <div className="mt-8 p-5 bg-cyan-500/5 border border-cyan-500/10 rounded-3xl relative overflow-hidden">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-2.5 h-2.5 bg-cyan-500 rounded-full animate-ping"></div>
                  <span className="text-[10px] font-bold text-cyan-500 uppercase tracking-[0.2em]">DeepSeek Thinking...</span>
                </div>
                <div className="space-y-2">
                  <div className="h-2 bg-white/5 rounded-full w-full opacity-50"></div>
                  <div className="h-2 bg-white/5 rounded-full w-5/6 opacity-30"></div>
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="h-28 bg-white/5 rounded-[2rem]"></div>
              <div className="h-28 bg-white/5 rounded-[2rem]"></div>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 h-fit">
            {/* Reasoning Block for DeepSeek R1 */}
            {engine === 'deepseek' && analysis?.reasoning && (
              <div className="mb-8 bg-slate-950/40 border border-cyan-500/10 rounded-[2rem] p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none text-2xl">🧠</div>
                <div className="text-[9px] font-black text-cyan-500/40 uppercase tracking-[0.3em] mb-3 flex justify-between items-center">
                  <span>Reasoning Log / 深度思维链</span>
                  <div className="h-px flex-1 mx-4 bg-cyan-500/10"></div>
                </div>
                {/* 增加最大高度，并启用自定义滚动条 */}
                <div className="max-h-[250px] overflow-y-auto custom-scrollbar pr-2">
                  <p className="text-[11px] text-slate-400 leading-relaxed italic font-medium">
                    {analysis.reasoning}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-8">
              <div className="relative">
                <div className={`absolute -left-4 top-0 bottom-0 w-1 rounded-full ${
                  engine === 'deepseek' ? 'bg-cyan-500' : 'bg-indigo-500'
                }`}></div>
                <p className="text-slate-200 text-lg leading-relaxed font-semibold pl-4">
                  {analysis?.summary}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 hover:bg-white/[0.07] transition-colors">
                  <h4 className="text-[10px] font-black text-rose-400 uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-rose-400 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.4)]"></span>
                    核心风险识别
                  </h4>
                  <ul className="space-y-4">
                    {analysis?.riskReasons.map((r, i) => (
                      <li key={i} className="text-xs text-slate-400 flex gap-3 leading-snug">
                        <span className="text-rose-500/40 shrink-0 select-none font-bold">×</span> {r}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 hover:bg-white/[0.07] transition-colors">
                  <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.4)]"></span>
                    干预决策建议
                  </h4>
                  <ul className="space-y-4">
                    {analysis?.interventions.map((r, i) => (
                      <li key={i} className="text-xs text-slate-400 flex gap-3 leading-snug">
                        <span className="text-emerald-500/40 shrink-0 select-none font-bold">→</span> {r}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-8 mt-4 border-t border-white/5">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Risk Index</span>
                <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border ${
                  analysis?.riskLevel === '高' 
                    ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' 
                    : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                }`}>
                  {analysis?.riskLevel}风险响应
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


import React, { useState, useEffect } from 'react';
// Fixed: analyzeSurgeryRisk was renamed to analyzeSurgeryRiskFromDB in geminiService
import { analyzeSurgeryRiskFromDB } from '../services/geminiService';
// Fixed: using OperationRecord to match service signature and actual data source
import { OperationRecord, AIAnalysis } from '../types';

interface AIAssistantProps {
  surgery: OperationRecord;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ surgery }) => {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalysis = async () => {
      setAnalysis(null);
      setLoading(true);
      // Fixed: calling corrected service function name
      const result = await analyzeSurgeryRiskFromDB(surgery);
      setAnalysis(result);
      setLoading(false);
    };
    fetchAnalysis();
  }, [surgery]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-pulse">
        <div className="h-6 w-32 bg-slate-200 rounded mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-slate-100 rounded w-full"></div>
          <div className="h-4 bg-slate-100 rounded w-5/6"></div>
          <div className="h-4 bg-slate-100 rounded w-4/6"></div>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          AI 辅助决策支持
        </h3>
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
          analysis.riskLevel === '高' ? 'bg-rose-100 text-rose-700' : 
          analysis.riskLevel === '中' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
        }`}>
          {analysis.riskLevel}风险
        </span>
      </div>
      
      <div className="p-6 space-y-6">
        <div>
          <p className="text-sm text-slate-600 italic mb-4">“{analysis.summary}”</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">识别到的风险</h4>
            <ul className="space-y-2">
              {analysis.riskReasons.map((reason, i) => (
                <li key={i} className="text-sm text-slate-700 flex gap-2">
                  <span className="text-rose-500 font-bold">•</span> {reason}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">建议干预措施</h4>
            <ul className="space-y-2">
              {analysis.interventions.map((action, i) => (
                <li key={i} className="text-sm text-slate-700 flex gap-2">
                  <span className="text-indigo-500 font-bold">→</span> {action}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

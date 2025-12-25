
import React, { useState, useEffect } from 'react';
import { AIEngine } from '../services/aiService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave }) => {
  const [key, setKey] = useState('');
  const [engine, setEngine] = useState<AIEngine>('gemini');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const savedKey = localStorage.getItem('DEEPSEEK_API_KEY');
      const savedEngine = localStorage.getItem('PREFERRED_AI_ENGINE') as AIEngine;
      
      if (savedKey) setKey(savedKey);
      if (savedEngine) setEngine(savedEngine);
      setShowSuccess(false);
    }
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem('DEEPSEEK_API_KEY', key);
    localStorage.setItem('PREFERRED_AI_ENGINE', engine);
    
    setShowSuccess(true);
    
    // 通知父组件配置已更改
    if (onSave) onSave();

    // 延迟关闭，让用户看到成功状态
    setTimeout(() => {
      onClose();
    }, 800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl relative">
        {showSuccess && (
          <div className="absolute inset-0 z-10 bg-indigo-600 flex flex-col items-center justify-center animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl mb-4 animate-bounce">
              ✅
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-widest">配置已同步</h3>
            <p className="text-indigo-200 text-xs mt-2 font-bold uppercase">正在应用新引擎策略...</p>
          </div>
        )}

        <div className="p-8 border-b border-white/5">
          <h3 className="text-xl font-black text-white flex items-center gap-3">
            <span className="text-2xl">⚙️</span> 系统集成配置
          </h3>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            在此管理 AI 引擎首选项及第三方服务密钥。
          </p>
        </div>
        
        <div className="p-8 space-y-8">
          {/* 引擎选择 */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
              首选 AI 决策引擎 / Engine Preference
            </label>
            <div className="flex bg-black/40 p-1.5 rounded-2xl border border-slate-800">
              <button 
                type="button"
                onClick={() => setEngine('gemini')}
                className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  engine === 'gemini' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Gemini
              </button>
              <button 
                type="button"
                onClick={() => setEngine('deepseek')}
                className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  engine === 'deepseek' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/30' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                DeepSeek R1
              </button>
            </div>
          </div>

          {/* Key 输入 */}
          <div className={engine === 'gemini' ? 'opacity-40 grayscale pointer-events-none' : ''}>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
              DeepSeek API Key
            </label>
            <input 
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="sk-..."
              autoComplete="off"
              className="w-full bg-black/40 border border-slate-800 rounded-2xl px-5 py-3 text-cyan-400 font-digital focus:border-indigo-500 outline-none transition-all placeholder:text-slate-700"
            />
            {engine === 'gemini' && (
              <p className="text-[9px] text-slate-600 mt-2 italic">* 使用 Gemini 引擎时由系统环境变量驱动</p>
            )}
          </div>
        </div>

        <div className="p-8 bg-black/20 flex gap-4">
          <button 
            type="button"
            onClick={onClose}
            className="flex-1 px-6 py-3 rounded-2xl text-slate-400 text-xs font-black uppercase tracking-widest hover:bg-white/5 transition-all"
          >
            取消
          </button>
          <button 
            type="button"
            onClick={handleSave}
            className="flex-1 px-6 py-3 rounded-2xl bg-indigo-600 text-white text-xs font-black uppercase tracking-widest hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all"
          >
            应用配置
          </button>
        </div>
      </div>
    </div>
  );
};


import React, { useState } from 'react';
import { MOCK_SURGERIES } from './constants';
import { Surgery, SurgeryStatus } from './types';
import { StatusBadge } from './components/StatusBadge';
import { SurgeryTimeline } from './components/SurgeryTimeline';
import { AIAssistant } from './components/AIAssistant';

const App: React.FC = () => {
  const [surgeries] = useState<Surgery[]>(MOCK_SURGERIES);
  const [selectedSurgery, setSelectedSurgery] = useState<Surgery>(MOCK_SURGERIES[0]);

  const activeSurgeries = surgeries.filter(s => s.overallStatus !== SurgeryStatus.COMPLETED);
  const completedSurgeries = surgeries.filter(s => s.overallStatus === SurgeryStatus.COMPLETED);

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* 侧边栏导航 */}
      <aside className="w-full md:w-80 bg-slate-900 text-white p-6 shrink-0">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight">SurgiTrack AI</h1>
            <p className="text-xs text-slate-400 font-medium uppercase">智能监测系统</p>
          </div>
        </div>

        <nav className="space-y-8">
          <div>
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">正在进行的手术</h2>
            <div className="space-y-2">
              {activeSurgeries.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSurgery(s)}
                  className={`w-full text-left p-3 rounded-xl transition-all ${
                    selectedSurgery.id === s.id ? 'bg-indigo-600 shadow-md translate-x-1' : 'hover:bg-slate-800'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-sm">{s.operatingRoom}</span>
                    <span className={`w-2 h-2 rounded-full ${
                      s.overallStatus === SurgeryStatus.CRITICAL ? 'bg-rose-400' : 
                      s.overallStatus === SurgeryStatus.WARNING ? 'bg-amber-400' : 'bg-emerald-400'
                    }`}></span>
                  </div>
                  <div className="text-xs text-slate-300 opacity-80">{s.procedureType}</div>
                  <div className="text-[10px] text-slate-400 mt-1">患者: {s.patientName}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">过去 24 小时已完成</h2>
            <div className="space-y-2 opacity-70">
              {completedSurgeries.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSurgery(s)}
                  className={`w-full text-left p-3 rounded-xl hover:bg-slate-800 ${
                    selectedSurgery.id === s.id ? 'bg-slate-800' : ''
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-sm">{s.operatingRoom}</span>
                    <StatusBadge status={s.overallStatus} />
                  </div>
                  <div className="text-xs text-slate-300">{s.procedureType}</div>
                </button>
              ))}
            </div>
          </div>
        </nav>

        <div className="mt-auto pt-10 sticky bottom-6">
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
            <div className="flex items-center gap-3 text-sm font-medium">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              系统运行中
            </div>
            <p className="text-[10px] text-slate-500 mt-1">最后同步: 刚刚</p>
          </div>
        </div>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto bg-slate-50">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-3xl font-bold text-slate-900">{selectedSurgery.operatingRoom} 监控看板</h2>
              <StatusBadge status={selectedSurgery.overallStatus} />
            </div>
            <p className="text-slate-500 font-medium">
              正在监测由 <span className="text-indigo-600">{selectedSurgery.surgeon}</span> 主刀的患者 <span className="text-indigo-600">{selectedSurgery.patientName}</span> 的{selectedSurgery.procedureType}
            </p>
          </div>
          
          <div className="flex gap-2">
            <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg font-semibold text-sm shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              导出报告
            </button>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-indigo-200 shadow-lg hover:bg-indigo-700 transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              通知医疗团队
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 时间轴与详情 */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800 text-lg">手术阶段时间轴</h3>
                <div className="flex gap-4 text-xs font-semibold text-slate-500">
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-slate-300"></span> 历史基线</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-indigo-500"></span> 实际耗时</span>
                </div>
              </div>
              <SurgeryTimeline surgery={selectedSurgery} />
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-800 text-lg mb-6">详细阶段分析</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-widest">阶段名称</th>
                      <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-widest">实际 (分钟)</th>
                      <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-widest">基线 (分钟)</th>
                      <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">偏差</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {selectedSurgery.phases.map((phase) => {
                      const diff = phase.actualDuration - phase.baselineDuration;
                      return (
                        <tr key={phase.id} className="group hover:bg-slate-50 transition-colors">
                          <td className="py-4 font-medium text-slate-700">{phase.name}</td>
                          <td className="py-4 text-slate-600">{phase.actualDuration}</td>
                          <td className="py-4 text-slate-400">{phase.baselineDuration}</td>
                          <td className="py-4 text-right">
                            <span className={`font-bold ${
                              diff > 5 ? 'text-rose-600' : diff > 0 ? 'text-amber-600' : 'text-emerald-600'
                            }`}>
                              {diff > 0 ? `+${diff}` : diff} 分钟
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 右侧面板 */}
          <div className="space-y-8">
            <AIAssistant surgery={selectedSurgery} />
            
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-6 rounded-2xl shadow-xl text-white">
              <h4 className="text-sm font-bold opacity-60 uppercase tracking-widest mb-4">患者个人资料</h4>
              <div className="space-y-4">
                <div>
                  <div className="text-[10px] uppercase font-bold text-indigo-300 opacity-80">全名</div>
                  <div className="text-lg font-semibold">{selectedSurgery.patientName}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-indigo-300 opacity-80">年龄/性别</div>
                    <div className="text-sm font-medium">62 / 男</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-indigo-300 opacity-80">血型</div>
                    <div className="text-sm font-medium">A型 (阳性)</div>
                  </div>
                </div>
                <div className="pt-4 border-t border-white/10">
                  <div className="text-[10px] uppercase font-bold text-indigo-300 opacity-80 mb-2">既往病史 / 风险因素</div>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-white/10 px-2 py-1 rounded text-[10px] font-bold">高血压</span>
                    <span className="bg-white/10 px-2 py-1 rounded text-[10px] font-bold">吸烟史</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h4 className="font-bold text-amber-900 text-sm uppercase tracking-tight">基于规则的警报</h4>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                当前阶段 <strong>{selectedSurgery.phases[selectedSurgery.phases.length-1].name}</strong> 已连续三次检测超出基线。若 5 分钟内无进度更新，建议启动升级响应流程。
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;

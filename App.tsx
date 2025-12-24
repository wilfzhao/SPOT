
import React, { useState } from 'react';
import { ModuleType } from './types';
import { BigScreenDashboard } from './components/BigScreenDashboard';
import { ORMonitoringModule } from './components/ORMonitoringModule';
import { CompetenceModule } from './components/CompetenceModule';

const App: React.FC = () => {
  const [currentModule, setCurrentModule] = useState<ModuleType>('dashboard');

  const renderModule = () => {
    switch (currentModule) {
      case 'dashboard':
        return <BigScreenDashboard onNavigate={setCurrentModule} />;
      case 'duration':
        return <ORMonitoringModule />;
      case 'doctor':
      case 'specialty':
        return <CompetenceModule />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400 bg-slate-900/50 rounded-3xl border border-dashed border-slate-700">
            <svg className="w-16 h-16 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="font-medium text-lg">该模块 ({currentModule}) 正在接入中...</p>
            <button 
              onClick={() => setCurrentModule('dashboard')}
              className="mt-6 text-indigo-400 font-bold text-sm hover:underline"
            >
              返回大屏主页
            </button>
          </div>
        );
    }
  };

  const getModuleTitle = () => {
    switch (currentModule) {
      case 'efficiency': return '运营效率评估及分析';
      case 'duration': return '手术时长监测及预警';
      case 'preop': return '术前等待时长分析';
      case 'postop': return '术后住院时长分析';
      case 'risk': return '高风险手术预测及预警';
      case 'doctor': return '医生技术能力评价';
      case 'specialty': return '外科专科能力评价';
      default: return '大屏总览';
    }
  };

  // 如果是大屏模式，不使用侧边栏，直接全屏渲染
  if (currentModule === 'dashboard') {
    return <BigScreenDashboard onNavigate={setCurrentModule} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 flex overflow-hidden">
      {/* 侧边栏 (仅在子模块显示) */}
      <aside className="w-20 lg:w-72 bg-slate-900 flex flex-col text-white transition-all duration-300 z-50 shrink-0 border-r border-slate-800">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/30">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
          </div>
          <span className="font-bold text-lg hidden lg:block truncate">SurgiTrack Pro</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto scrollbar-hide">
          <NavItem 
            active={false} 
            onClick={() => setCurrentModule('dashboard')} 
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" /></svg>}
            label="管理大屏"
          />
          <div className="pt-4 pb-2 px-2 text-[10px] font-bold text-slate-500 uppercase hidden lg:block tracking-widest">分析决策</div>
          {[
            { id: 'efficiency', label: '效率分析', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
            { id: 'duration', label: '时长监测', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
            { id: 'preop', label: '术前分析', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
            { id: 'postop', label: '术后预测', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
            { id: 'risk', label: '风险评估', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
            { id: 'doctor', label: '能力画像', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' }
          ].map(item => (
            <NavItem 
              key={item.id}
              active={currentModule === item.id}
              onClick={() => setCurrentModule(item.id as ModuleType)}
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} /></svg>}
              label={item.label}
            />
          ))}
        </nav>
      </aside>

      {/* 子模块主面板 */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-slate-900 border-b border-slate-800 px-8 flex items-center justify-between sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setCurrentModule('dashboard')}
              className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-white">{getModuleTitle()}</h1>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-[1400px] mx-auto">
            {renderModule()}
          </div>
        </div>
      </main>
    </div>
  );
};

const NavItem: React.FC<{ active: boolean, onClick: () => void, icon: React.ReactNode, label: string }> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-200 group ${
      active ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
    }`}
  >
    <div className={`shrink-0 ${active ? 'text-white' : 'group-hover:text-indigo-400'}`}>
      {icon}
    </div>
    <span className="text-sm font-bold hidden lg:block whitespace-nowrap">{label}</span>
  </button>
);

export default App;

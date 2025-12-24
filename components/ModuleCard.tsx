
import React from 'react';
import { ModuleType } from '../types';

interface ModuleCardProps {
  id: ModuleType;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  onClick: (id: ModuleType) => void;
}

export const ModuleCard: React.FC<ModuleCardProps> = ({ id, title, description, icon, color, onClick }) => {
  return (
    <button
      onClick={() => onClick(id)}
      className="group bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all text-left relative overflow-hidden"
    >
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${color}`}>
        {icon}
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </div>
    </button>
  );
};

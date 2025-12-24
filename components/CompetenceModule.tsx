
import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { DOCTOR_SKILLS } from '../constants';

export const CompetenceModule: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-bottom duration-500">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="text-xl font-bold text-slate-800 mb-2">医生技术能力综合评价</h3>
        <p className="text-sm text-slate-500 mb-8">基于最近 100 台手术数据的多维度量化分析</p>
        
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={DOCTOR_SKILLS}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <Radar
                name="史密斯医生"
                dataKey="score"
                stroke="#6366f1"
                strokeWidth={3}
                fill="#6366f1"
                fillOpacity={0.15}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
        <h3 className="text-xl font-bold text-slate-800 mb-6">评价指标解析</h3>
        <div className="space-y-6 flex-1">
          {[
            { label: '手术速度', score: 85, desc: '较同级别医生平均水平快 12%，效率极高。' },
            { label: '质量安全', score: 92, desc: '术后 30 天再入院率及并发症率处于科室前 5%。' },
            { label: '技术难度', score: 78, desc: '近期承接 IV 级手术占比稳步提升，处于成长期。' },
            { label: '规范化率', score: 88, desc: '手术路径遵循度高，病历文书书写规范。' },
          ].map((item, i) => (
            <div key={i}>
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-slate-700">{item.label}</span>
                <span className="text-indigo-600 font-bold">{item.score}</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full mb-2">
                <div className="bg-indigo-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${item.score}%` }}></div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


import { GoogleGenAI, Type } from "@google/genai";
import { Surgery, AIAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function analyzeSurgeryRisk(surgery: Surgery): Promise<AIAnalysis> {
  const currentPhase = surgery.phases[surgery.phases.length - 1];
  const delayPercent = ((currentPhase.actualDuration - currentPhase.baselineDuration) / currentPhase.baselineDuration) * 100;

  const prompt = `
    请分析以下手术过程数据，识别异常情况和潜在风险：
    手术类型: ${surgery.procedureType}
    主刀医生: ${surgery.surgeon}
    当前阶段: ${currentPhase.name}
    实际耗时: ${currentPhase.actualDuration} 分钟
    历史基线: ${currentPhase.baselineDuration} 分钟
    延时比例: ${delayPercent.toFixed(1)}%
    
    既往阶段回顾:
    ${surgery.phases.map(p => `- ${p.name}: 实际 ${p.actualDuration}分钟 (基线 ${p.baselineDuration}分钟)`).join('\n')}

    请提供专业的中文医学风险评估。
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riskLevel: { type: Type.STRING, enum: ['低', '中', '高'] },
            riskReasons: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "说明为何存在此类风险的要点"
            },
            interventions: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "可操作的医学或流程建议"
            },
            summary: { type: Type.STRING, description: "1-2句核心结论摘要" }
          },
          required: ["riskLevel", "riskReasons", "interventions", "summary"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("AI 分析失败:", error);
    return {
      riskLevel: '中',
      riskReasons: ['API 分析暂时不可用', '当前阶段耗时超出历史基线'],
      interventions: ['手动确认手术间实时状态', '确保麻醉支持人员在岗待命'],
      summary: '自动化 AI 分析受限。基线数据提示当前存在潜在延时。'
    };
  }
}

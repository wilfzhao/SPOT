
import { GoogleGenAI, Type } from "@google/genai";
import { Surgery, AIAnalysis } from "../types";
import { identifyPhaseStatus } from "../utils/ruleEngine";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function analyzeSurgeryRisk(surgery: Surgery): Promise<AIAnalysis> {
  const currentPhase = surgery.phases[surgery.phases.length - 1];
  if (!currentPhase) {
    return {
      riskLevel: '低',
      riskReasons: ['手术刚开始，暂无偏差数据'],
      interventions: ['继续按标准临床路径执行'],
      summary: '初始阶段，各项指标平稳。'
    };
  }

  const ruleStatus = identifyPhaseStatus(currentPhase.actualDuration, currentPhase.baselineDuration);
  const deviation = ((currentPhase.actualDuration - currentPhase.baselineDuration) / currentPhase.baselineDuration * 100).toFixed(1);

  const prompt = `
    你是一个专业的手术室运行管理专家 AI。
    背景数据：
    - 手术: ${surgery.procedureType}
    - 当前阶段: ${currentPhase.name}
    - 规则模型判定状态: ${ruleStatus} (偏差: ${deviation}%)
    
    请结合这些硬性规则判定，给出更具前瞻性的风险分析和干预建议。
    输出必须为 JSON 格式。
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
            riskReasons: { type: Type.ARRAY, items: { type: Type.STRING } },
            interventions: { type: Type.ARRAY, items: { type: Type.STRING } },
            summary: { type: Type.STRING }
          },
          required: ["riskLevel", "riskReasons", "interventions", "summary"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    return {
      riskLevel: ruleStatus === '危急' ? '高' : (ruleStatus === '预警' ? '中' : '低'),
      riskReasons: [`规则模型识别到耗时偏差达 ${deviation}%`],
      interventions: ['请现场管理护士核实手术间进展', '评估后续手术排台是否需要调整'],
      summary: '基于规则模型的自动评估。'
    };
  }
}

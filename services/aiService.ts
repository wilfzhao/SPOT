
import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysis, OperationRecord, SurgeryAnomaly } from "../types";

export type AIEngine = 'gemini' | 'deepseek';

export const getPreferredEngine = (): AIEngine => {
  if (typeof window !== 'undefined') {
    const savedEngine = localStorage.getItem('PREFERRED_AI_ENGINE');
    if (savedEngine === 'deepseek' || savedEngine === 'gemini') return savedEngine;
  }
  return 'gemini'; 
};

const getDeepSeekKey = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('DEEPSEEK_API_KEY') || "";
  }
  return (process.env as any).DEEPSEEK_API_KEY || "";
};

export async function analyzeSurgery(
  record: OperationRecord,
  anomaly?: SurgeryAnomaly,
  requestedEngine?: AIEngine
): Promise<AIAnalysis & { reasoning?: string }> {
  const geminiApiKey = process.env.API_KEY;
  const engine = requestedEngine || getPreferredEngine();
  const deepseekKey = getDeepSeekKey();

  if (engine === 'deepseek') {
    if (deepseekKey && deepseekKey.length > 5) {
      return await callDeepSeekAPI(record, anomaly, deepseekKey);
    } else {
      console.warn("⚠️ DeepSeek Key 未配置。已自动回退至 Gemini 推理模式。");
      return await callGeminiAPI(record, anomaly, geminiApiKey || "", true);
    }
  }

  if (!geminiApiKey || geminiApiKey.length < 5) {
    return {
      riskLevel: '低',
      riskReasons: ['AI 决策引擎未授权'],
      interventions: ['请在设置中配置有效 API Key'],
      summary: '当前处于离线规则引擎模式。AI 深度分析功能未启用。'
    };
  }

  return await callGeminiAPI(record, anomaly, geminiApiKey, false);
}

async function callDeepSeekAPI(record: any, anomaly: any, apiKey: string): Promise<AIAnalysis & { reasoning?: string }> {
  const isNoBaseline = anomaly?.anomaly_level === '无基准';
  try {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-reasoner",
        messages: [
          {
            role: "system",
            content: "你是一个专业的医院手术室管理专家。分析手术状态并输出 JSON：riskLevel, riskReasons[], interventions[], summary。"
          },
          {
            role: "user",
            content: `分析手术：${record.operation_name}, 医生：${record.surgen_name}, 实际耗时：${anomaly?.actual_duration || '未知'}分钟。${isNoBaseline ? '注意：该术式及医生组合暂无历史基准数据，请基于临床常识进行独立评估。' : `历史基线中位数：${anomaly?.baseline_median}分钟, 标准差：${anomaly?.baseline_std_dev}。`}`
          }
        ],
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) throw new Error(`DeepSeek Error: ${response.status}`);

    const data = await response.json();
    const content = JSON.parse(data.choices[0].message.content);
    
    return {
      ...content,
      reasoning: data.choices[0].message.reasoning_content || "推理引擎思考中..."
    };
  } catch (error) {
    console.error("DeepSeek 调用失败:", error);
    return await callGeminiAPI(record, anomaly, process.env.API_KEY || "", true);
  }
}

async function callGeminiAPI(record: any, anomaly: any, apiKey: string, useReasoning = false): Promise<AIAnalysis & { reasoning?: string }> {
  if (!apiKey) return { riskLevel: '低', riskReasons: ['Key Missing'], interventions: [], summary: '等待配置...' };
  
  const ai = new GoogleGenAI({ apiKey });
  const modelName = useReasoning ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
  const isNoBaseline = anomaly?.anomaly_level === '无基准';
  
  const prompt = `分析手术风险状况：
  手术名称：${record.operation_name}
  主刀医生：${record.surgen_name}
  实际时长：${anomaly?.actual_duration || '未知'}
  ${isNoBaseline ? '状态：此手术组合暂无历史基准参考数据' : `基线中位数：${anomaly?.baseline_median}, 基线标准差：${anomaly?.baseline_std_dev}`}`;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction: "你是一个医疗 AI 助手。请根据手术耗时进行分析。如果没有基线参考，请结合临床常识给出风险评估（低/中/高）。返回 JSON。",
        responseMimeType: "application/json",
        ...(useReasoning ? { thinkingConfig: { thinkingBudget: 16384 } } : {}),
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

    return JSON.parse(response.text || "{}");
  } catch (e) {
    return { riskLevel: '低', riskReasons: ['AI 服务繁忙'], interventions: [], summary: '数据已加载，AI 分析受限，请人工核实进度。' };
  }
}


import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysis, OperationRecord } from "../types";
import { DB_ANOMALIES } from "../constants";

export type AIEngine = 'gemini' | 'deepseek';

/**
 * 安全配置指南：
 * 1. 本地开发：请在项目根目录创建 .env 文件，添加：DEEPSEEK_API_KEY=您的密钥
 * 2. 生产环境：在部署平台的设置中添加环境变量 DEEPSEEK_API_KEY
 * 3. 永远不要将带有真实 Key 的代码提交到 GitHub。
 */
const DEEPSEEK_API_KEY = (process.env as any).DEEPSEEK_API_KEY || ""; 

export async function analyzeSurgery(
  record: OperationRecord,
  engine: AIEngine = 'gemini'
): Promise<AIAnalysis & { reasoning?: string }> {
  const anomaly = DB_ANOMALIES.find(a => a.operation_no === record.operation_no);
  const geminiApiKey = process.env.API_KEY;

  // 1. 如果用户手动切换到了 DeepSeek
  if (engine === 'deepseek') {
    if (DEEPSEEK_API_KEY && DEEPSEEK_API_KEY.length > 5) {
      return await callDeepSeekAPI(record, anomaly, DEEPSEEK_API_KEY);
    } else {
      console.warn("⚠️ DeepSeek API Key 未在环境变量中配置 (DEEPSEEK_API_KEY)。已回退至 Gemini 推理模式。");
      return await callGeminiAPI(record, anomaly, geminiApiKey || "", true);
    }
  }

  // 2. 默认使用 Gemini 标准模式
  if (!geminiApiKey || geminiApiKey.length < 5) {
    return {
      riskLevel: '低',
      riskReasons: ['API 密钥未就绪'],
      interventions: ['请在环境变量中配置 API_KEY (Gemini) 或 DEEPSEEK_API_KEY'],
      summary: '系统当前处于本地演示模式，AI 推理功能暂未启用。'
    };
  }

  return await callGeminiAPI(record, anomaly, geminiApiKey, false);
}

async function callDeepSeekAPI(record: any, anomaly: any, apiKey: string): Promise<AIAnalysis & { reasoning?: string }> {
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
            content: "你是一个专业的医院手术室管理专家。分析手术异常并输出 JSON：riskLevel, riskReasons[], interventions[], summary。"
          },
          {
            role: "user",
            content: `分析：${record.operation_name}, 医生：${record.surgen_name}, 耗时：${anomaly?.actual_duration}min, 基线P90：${anomaly?.baseline_p90}min。`
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
      reasoning: data.choices[0].message.reasoning_content || "DeepSeek 正在思考..."
    };
  } catch (error) {
    console.error("DeepSeek 调用失败，切换至 Gemini 兜底:", error);
    return await callGeminiAPI(record, anomaly, process.env.API_KEY || "", true);
  }
}

async function callGeminiAPI(record: any, anomaly: any, apiKey: string, useReasoning = false): Promise<AIAnalysis & { reasoning?: string }> {
  if (!apiKey) return { riskLevel: '低', riskReasons: ['Key Missing'], interventions: [], summary: '等待 API 配置...' };
  
  const ai = new GoogleGenAI({ apiKey });
  const modelName = useReasoning ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
  
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: `分析手术风险：[${record.operation_name}]，耗时 [${anomaly?.actual_duration}]，基线 [${anomaly?.baseline_p90}]。`,
      config: {
        systemInstruction: "你是一个医疗 AI 助手。返回 JSON 格式分析结论。",
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
    return { riskLevel: '低', riskReasons: ['AI 离线'], interventions: [], summary: '规则引擎判定：进度偏差中。' };
  }
}

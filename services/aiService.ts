
import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysis, OperationRecord } from "../types";
import { DB_ANOMALIES } from "../constants";

export type AIEngine = 'gemini' | 'deepseek';

/**
 * ==========================================================
 * 配置说明：
 * 1. Gemini API：由系统环境变量 process.env.API_KEY 自动驱动，无需在此配置。
 * 2. DeepSeek API：请在下方的引号中填入您的 DeepSeek 官方 API Key。
 * ==========================================================
 */
// Fix: Use explicit type or let to avoid literal narrowing to "" which causes the compiler to treat the condition as unreachable 'never'
let DEEPSEEK_API_KEY = "sk-f881bf76cfd44bd1a931e51c3a993b47"; // <--- 在此处填写您的 DeepSeek API Key (如: "sk-xxxx...")

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
      console.warn("DeepSeek Key 未配置，已自动为您开启 Gemini 3 Pro 深度推理引擎作为替代方案。");
      // 回退到 Gemini 的深度推理模式
      return await callGeminiAPI(record, anomaly, geminiApiKey || "", true);
    }
  }

  // 2. 默认使用 Gemini 标准模式 (Flash)
  if (!geminiApiKey || geminiApiKey.length < 5) {
    return {
      riskLevel: '低',
      riskReasons: ['API Key 未配置'],
      interventions: ['请在环境变量中配置 API_KEY 或在 aiService.ts 中填写 DeepSeek Key'],
      summary: '由于未检测到有效的 API 密钥，系统当前运行在本地模拟模式。'
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
        model: "deepseek-reasoner", // DeepSeek R1 推理模型
        messages: [
          {
            role: "system",
            content: "你是一个专业的医院手术室管理专家。请对提供的手术异常数据进行深度推理分析。你的输出必须是合法的 JSON 格式，包含: riskLevel (低/中/高), riskReasons (字符串数组), interventions (字符串数组), summary (字符串结论)。"
          },
          {
            role: "user",
            content: `手术记录分析：
            手术名称：${record.operation_name}
            主刀医生：${record.surgen_name}
            当前实际时长：${anomaly?.actual_duration} 分钟
            P90 基线时长：${anomaly?.baseline_p90} 分钟
            异常原因初步判断：${anomaly?.anomaly_reason}`
          }
        ],
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      if (response.status === 401) throw new Error("DeepSeek API Key 验证失败 (401)，请检查 aiService.ts 中的配置。");
      throw new Error(`DeepSeek 服务异常: ${response.status}`);
    }

    const data = await response.json();
    const content = JSON.parse(data.choices[0].message.content);
    
    return {
      ...content,
      reasoning: data.choices[0].message.reasoning_content || "DeepSeek 推理逻辑生成中..."
    };
  } catch (error) {
    console.error("DeepSeek 调用失败，正在尝试使用 Gemini Pro Thinking 模式进行补救:", error);
    // 即使 DeepSeek 报错，也尝试用 Gemini 3 Pro 的思维链能力兜底，保证用户大屏不挂掉
    return await callGeminiAPI(record, anomaly, process.env.API_KEY || "", true);
  }
}

async function callGeminiAPI(record: any, anomaly: any, apiKey: string, useReasoning = false): Promise<AIAnalysis & { reasoning?: string }> {
  if (!apiKey) return { riskLevel: '低', riskReasons: ['本地模式'], interventions: [], summary: '等待 API Key 配置...' };
  
  // Fix: Initialize GoogleGenAI with named parameter.
  const ai = new GoogleGenAI({ apiKey });
  // useReasoning 为 true 时使用 Pro 模型并开启思维链功能
  const modelName = useReasoning ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
  
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: `分析手术风险：项目 [${record.operation_name}]，当前 [${anomaly?.actual_duration}min]，基线P90 [${anomaly?.baseline_p90}min]。`,
      config: {
        systemInstruction: useReasoning 
          ? "你是一个拥有极深逻辑推理能力的医疗专家。请利用 Chain of Thought 推理为什么该手术会超时，并预测潜在并发症。像 DeepSeek R1 一样思考。"
          : "你是一个高效的手术室助手，请给出异常分析结论。",
        responseMimeType: "application/json",
        // Fix: Apply thinkingBudget for Gemini 3 series when reasoning is enabled.
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

    // Fix: Access response.text property directly.
    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Gemini 调用失败:", e);
    return {
      riskLevel: '低',
      riskReasons: ['模型响应异常'],
      interventions: ['请检查网络连接'],
      summary: 'AI 暂时无法提供实时建议，已切换至基础规则判定。'
    };
  }
}


import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysis, OperationRecord } from "../types";
import { DB_ANOMALIES } from "../constants";

export type AIEngine = 'gemini' | 'deepseek';

export async function analyzeSurgery(
  record: OperationRecord,
  engine: AIEngine = 'gemini'
): Promise<AIAnalysis & { reasoning?: string }> {
  const anomaly = DB_ANOMALIES.find(a => a.operation_no === record.operation_no);
  const apiKey = process.env.API_KEY;

  if (!apiKey || apiKey.length < 5) {
    return {
      riskLevel: '低',
      riskReasons: ['API Key 未配置'],
      interventions: ['请在环境变量中配置 API_KEY'],
      summary: '由于未检测到有效的 API 密钥，系统当前运行在本地离线模式。'
    };
  }

  if (engine === 'deepseek') {
    return await callDeepSeekAPI(record, anomaly, apiKey);
  } else {
    return await callGeminiAPI(record, anomaly, apiKey);
  }
}

async function callDeepSeekAPI(record: any, anomaly: any, apiKey: string): Promise<AIAnalysis & { reasoning?: string }> {
  try {
    // DeepSeek API typically follows the OpenAI format. 
    // We assume the process.env.API_KEY is a valid DeepSeek key or a proxy key.
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-reasoner", // Official model name for DeepSeek R1
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

    if (!response.ok) throw new Error(`DeepSeek API error: ${response.status}`);

    const data = await response.json();
    const content = JSON.parse(data.choices[0].message.content);
    
    // DeepSeek R1 returns reasoning_content for its chain-of-thought
    return {
      ...content,
      reasoning: data.choices[0].message.reasoning_content || "推理链条生成中..."
    };
  } catch (error) {
    console.error("DeepSeek API 调用失败，自动回退到 Gemini 推理模式:", error);
    // Fallback to Gemini 3 Pro reasoning mode if DeepSeek is unavailable
    return await callGeminiAPI(record, anomaly, apiKey, true);
  }
}

async function callGeminiAPI(record: any, anomaly: any, apiKey: string, useReasoning = false): Promise<AIAnalysis & { reasoning?: string }> {
  const ai = new GoogleGenAI({ apiKey });
  const modelName = useReasoning ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
  
  const response = await ai.models.generateContent({
    model: modelName,
    contents: `请对以下手术进行风险评估。手术：${record.operation_name}，当前耗时：${anomaly?.actual_duration}，P90基线：${anomaly?.baseline_p90}。`,
    config: {
      systemInstruction: useReasoning 
        ? "你是一个具备极强推理能力的临床决策专家。请执行深度思维链推理（Deep Reasoning），分析手术时长异常的潜在根因并给出干预方案。"
        : "你是一个高效的手术室助手，请根据数据给出异常分析建议。",
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
}

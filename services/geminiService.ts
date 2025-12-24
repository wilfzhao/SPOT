
import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysis, OperationRecord } from "../types";
import { DB_ANOMALIES } from "../constants";

export type AIEngine = 'gemini' | 'deepseek';

export async function analyzeSurgeryRiskFromDB(
  record: OperationRecord, 
  engine: AIEngine = 'gemini'
): Promise<AIAnalysis> {
  const anomaly = DB_ANOMALIES.find(a => a.operation_no === record.operation_no);
  
  // 本地兜底分析结论
  const localAnalysis: AIAnalysis = {
    riskLevel: anomaly?.anomaly_level === '危急' ? '高' : (anomaly?.anomaly_level === '预警' ? '中' : '低'),
    riskReasons: anomaly 
      ? [anomaly.anomaly_reason, `时长偏差率: ${Number(anomaly.deviation_rate || 0).toFixed(1)}%`] 
      : ['数据同步异常'],
    interventions: [
      '安排巡回护士核实术中情况',
      '同步更新排班看板，预警后续手术延时',
      '评估是否需要增派手术辅助人员'
    ],
    summary: anomaly 
      ? `【规则预警】检测到 ${record.operation_name} 耗时异常，已触发自动化干预流程。`
      : '暂无异常。'
  };

  const apiKey = typeof process !== 'undefined' ? process.env?.API_KEY : undefined;

  if (!apiKey || apiKey.length < 5) {
    return localAnalysis;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    // 配置模型：标准模式用 Flash，推理模式用 Pro 并开启思维链
    const modelName = engine === 'deepseek' ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
    
    const systemInstruction = engine === 'deepseek' 
      ? "你是一个拥有20年临床经验的手术管理专家。请利用深度推理能力（Chain of Thought），从手术复杂程度、团队配合、生理风险、资源保障等多个维度深度拆解异常原因，并给出具有极高参考价值的干预措施。"
      : "你是一个高效的手术室管理助手，请根据提供的数据给出简洁明了的异常分析。";

    const prompt = `
      手术数据分析请求：
      手术项目：${record.operation_name}
      主刀医生：${record.surgen_name}
      当前时长：${anomaly?.actual_duration}分钟
      历史基线(P90)：${anomaly?.baseline_p90}分钟
      初步异常描述：${anomaly?.anomaly_reason}

      请分析其深层风险并给出决策支持方案。返回 JSON。
    `;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        // 如果是深度推理引擎，设置 thinkingBudget
        ...(engine === 'deepseek' ? { thinkingConfig: { thinkingBudget: 16384 } } : {}),
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
  } catch (error) {
    console.error(`AI (${engine}) 调用失败:`, error);
    return localAnalysis;
  }
}

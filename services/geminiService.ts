
import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysis, OperationRecord } from "../types";
import { DB_ANOMALIES } from "../constants";

export async function analyzeSurgeryRiskFromDB(record: OperationRecord): Promise<AIAnalysis> {
  const anomaly = DB_ANOMALIES.find(a => a.operation_no === record.operation_no);
  
  // 本地兜底分析结论
  const localAnalysis: AIAnalysis = {
    riskLevel: anomaly?.anomaly_level === '危急' ? '高' : (anomaly?.anomaly_level === '预警' ? '中' : '低'),
    riskReasons: anomaly 
      ? [anomaly.anomaly_reason, `时长偏差率: ${anomaly.deviation_rate.toFixed(1)}%`] 
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

  // 安全获取 API Key
  const apiKey = typeof process !== 'undefined' ? process.env?.API_KEY : undefined;

  if (!apiKey || apiKey.length < 5) {
    console.log("Gemini: 未检测到有效的 API Key，系统切换至本地规则引擎模式。");
    return localAnalysis;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
      作为手术管理专家，分析此异常：
      手术：${record.operation_name}
      耗时：${anomaly?.actual_duration}min (基线P90: ${anomaly?.baseline_p90}min)
      原因：${anomaly?.anomaly_reason}
      请给出深层建议。返回 JSON。
    `;

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

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("AI 服务调用失败:", error);
    return localAnalysis;
  }
}

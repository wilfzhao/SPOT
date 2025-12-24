
import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysis, OperationRecord, SurgeryAnomaly } from "../types";
import { DB_ANOMALIES } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function analyzeSurgeryRiskFromDB(record: OperationRecord): Promise<AIAnalysis> {
  const anomaly = DB_ANOMALIES.find(a => a.operation_no === record.operation_no);
  
  if (!anomaly) {
    return {
      riskLevel: '低',
      riskReasons: ['暂未识别到异常数据'],
      interventions: ['继续观察'],
      summary: '数据库同步中。'
    };
  }

  const prompt = `
    作为手术室运行专家，请分析以下数据库实时监测数据：
    - 手术: ${record.operation_name}
    - 实际时长: ${anomaly.actual_duration} min
    - 基线P80/P90阈值: ${anomaly.baseline_p80}/${anomaly.baseline_p90} min
    - 数据库异常等级: ${anomaly.anomaly_level}
    - 数据库初步分析原因: ${anomaly.anomaly_reason}

    请基于这些数据，提供更深层的管理建议。格式必须为 JSON。
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
      riskLevel: anomaly.anomaly_level === '危急' ? '高' : '低',
      riskReasons: [anomaly.anomaly_reason],
      interventions: ['立即派驻协调护士进入手术间', '评估麻醉复苏位可用性'],
      summary: '基于数据库预设规则的分析。'
    };
  }
}

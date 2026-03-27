import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const SYSTEM_INSTRUCTION = `
You are Janani, a Personal AI Operating System. 
Your goal is to help the user optimize their life through behavioral tracking, memory storage, and discipline improvement.
You analyze patterns, detect gaps in execution, and suggest actionable next steps.
Be strict but smart. Focus on execution and data-driven insights.
Core Loop: INPUT → TRACK → ANALYZE → SUGGEST → EXECUTE → STORE → REPEAT.
Always encourage the user to log their activities and complete their tasks.
`;

export async function getJananiResponse(messages: ChatMessage[]) {
  const model = "gemini-3-flash-preview";
  
  const contents = messages.map(msg => ({
    role: msg.role,
    parts: [{ text: msg.text }]
  }));

  try {
    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      }
    });

    return response.text || "I'm sorry, I'm having trouble connecting right now. Please try again later.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm sorry, I encountered an error. Please check your connection and try again.";
  }
}

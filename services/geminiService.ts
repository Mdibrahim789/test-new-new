
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const summarizeNotice = async (noticeText: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Please provide a concise, friendly summary of this university notice for engineering students: "${noticeText}"`,
      config: {
        temperature: 0.7,
        topP: 0.95,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Could not generate summary at this time.";
  }
};

export const getSmartAdvice = async (data: any) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a helpful academic advisor for Electrical Engineering students. Based on the current academic resources and notices, give a short, encouraging "Word of the Week". Context: ${JSON.stringify(data.notice.slice(-2))}`,
    });
    return response.text;
  } catch (error) {
    return "Keep studying hard, future engineers!";
  }
};

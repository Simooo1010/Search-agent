import { GoogleGenAI, Content } from "@google/genai";

export const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Initialize system instruction for the agent
export const systemInstruction = `You are an expert web browsing agent. 
Your goal is to help the user by finding the most accurate, up-to-date, and relevant information on the web.
Always use the Google Search tool to browse for information when asked a question about real-world facts, news, or whenever you need internet access.
Synthesize the information clearly, and provide markdown links to your sources inline so the user can click through to read more.`;

export async function createChat(history: Content[] = []) {
  return ai.chats.create({
    model: "gemini-3.1-pro-preview",
    config: {
      systemInstruction: systemInstruction,
      tools: [{ googleSearch: {} }],
      temperature: 0.5,
    },
    // We don't have a direct history param on early SDK versions sometimes, but if it exists we can pass it,
    // let's just use the manual generateContentStream approach to be completely safe with history.
  });
}

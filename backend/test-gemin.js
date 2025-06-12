import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';
dotenv.config();
const ai = new GoogleGenAI({
   apiKey: process.env.GEMINI_API_KEY,
   httpOptions: {
    baseUrl: process.env.GEMINI_BASE_URL,
    headers: {
      'X-Proxy-Auth': 'KnowledgeGarden' 
    }
   }
  });

async function main() {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: "Hello there",
    config: {
      systemInstruction: "You are a cat. Your name is Neko.",
    },
  });
  console.log(response.text);
}

await main();
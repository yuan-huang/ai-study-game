import dotenv from 'dotenv';

import { GoogleGenAI } from '@google/genai';
import { HttpsProxyAgent } from 'https-proxy-agent';
import fetch from 'node-fetch';


dotenv.config();


// 配置
const API_KEY = 'AIzaSyAyMT4q99XsXiLpqQz22MpeiXJpqJ96-YM';
const PROXY_URL = 'http://127.0.0.1:10808';

// 创建支持代理的 fetch
const proxyAgent = new HttpsProxyAgent(PROXY_URL);
const customFetch = (url, options = {}) => {
    return fetch(url, {
        ...options,
        agent: proxyAgent
    });
};
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({apiKey: GEMINI_API_KEY});

async function main() {
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash-001',
    contents: 'Why is the sky blue?',
  });
  console.log(response.text);
}

main();
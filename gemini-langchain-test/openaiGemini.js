import OpenAI from "openai";
import { HttpsProxyAgent } from "https-proxy-agent";

// Define the proxy agent
const proxyUrl = 'http://127.0.0.1:10808';
const httpsAgent = new HttpsProxyAgent(proxyUrl);
// 代码中
import dotenv from 'dotenv';
dotenv.config();

console.log(process.env.GEMINI_API_KEY);

const openai = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
    httpAgent: httpsAgent,
    timeout: 60 * 1000, // Add a timeout of 60 seconds (in milliseconds)
});

async function main() {
    try {
        console.log("Sending request to API...");
        const response = await openai.chat.completions.create({
            model: "gemini-2.0-flash",
            reasoning_effort: "low",
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                {
                    role: "user",
                    content: "Explain to me how AI works",
                },
            ],
        });

        console.log("Response received:", response.choices[0].message);
    } catch (error) {
        console.error("Error fetching completion:", error);
    }
}

main();
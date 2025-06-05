import dotenv from 'dotenv';
import GeminiAPI from './utils/streamFetch.js';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyAyMT4q99XsXiLpqQz22MpeiXJpqJ96-YM';

// 创建API实例
const gemini = new GeminiAPI({
    apiKey: GEMINI_API_KEY,
    debug: true  // 开启调试日志
});

async function main() {
    try {
        console.log("测试流式响应：\n");
        
        // 创建流式聊天完成
        const completion = await gemini.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [
                { role: "user", content: "你好！请用简短的话介绍一下你自己。" }
            ],
            stream: true
        });

        // 处理流式响应
        for await (const chunk of completion) {
            if (chunk.choices[0].delta.content) {
                process.stdout.write(chunk.choices[0].delta.content);
            }
        }
        
        console.log("\n\n测试多轮对话：");
        
        // 测试多轮对话
        const response = await gemini.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [
                { role: "user", content: "1+1等于多少？" },
                { role: "assistant", content: "1+1等于2" },
                { role: "user", content: "为什么？" }
            ]
        });

        console.log("\nAI回答：", response.choices[0].message.content);

    } catch (error) {
        console.error("发生错误:", error);
    }
}

// 运行示例
main(); 
import dotenv from 'dotenv';
import { fairyTutor, curiosityTree } from './sys/chatRoles.js';
import { proxyFetch } from './utils/proxyFetch.js';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyAyMT4q99XsXiLpqQz22MpeiXJpqJ96-YM";
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

// 配置代理
proxyFetch.updateConfig({
    proxyUrl: 'http://127.0.0.1:10808',
    proxyType: 'http',
    debug: false,
    timeout: 60000
});

// 模拟流式输出的函数
async function simulateStreamingOutput(text, speed = 20) {
    const chars = text.split('');
    for (let i = 0; i < chars.length; i++) {
        process.stdout.write(chars[i]);
        await new Promise(resolve => setTimeout(resolve, speed));
    }
}

// 调用 Gemini API（使用普通方式，然后模拟流式输出）
async function callGeminiAPIWithStreaming(prompt, options = {}) {
    try {
        const response = await proxyFetch.post(
            `${API_BASE}/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                contents: [
                    {
                        parts: [
                            {
                                text: prompt
                            }
                        ]
                    }
                ],
                generationConfig: {
                    temperature: options.temperature || 0.9,
                    topK: 1,
                    topP: 1,
                    maxOutputTokens: options.maxTokens || 2048,
                }
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API调用失败: ${response.status} ${response.statusText}\n${errorText}`);
        }

        const data = await response.json();
        const text = data.candidates[0].content.parts[0].text;
        
        // 如果提供了 onChunk 回调，模拟流式输出
        if (options.onChunk) {
            const chars = text.split('');
            for (let i = 0; i < chars.length; i++) {
                options.onChunk(chars[i]);
                await new Promise(resolve => setTimeout(resolve, options.streamDelay || 15));
            }
        }
        
        return text;
    } catch (error) {
        console.error("API调用错误:", error);
        throw error;
    }
}

// 创建聊天会话
async function createChatSession(role) {
    try {
        console.log(`\n🔧 正在初始化${role.name}...`);
        await callGeminiAPIWithStreaming(role.initialPrompt);
        console.log(` ✓ 完成！`);
        return role;
    } catch (error) {
        console.error(`初始化${role.name}失败:`, error);
        throw error;
    }
}

// 发送消息并处理回复（流式输出）
async function handleChatWithStreaming(session, role, message) {
    try {
        // 构建完整的提示
        const fullPrompt = role.history
            .map(msg => `${msg.role === 'user' ? '用户' : 'AI'}: ${msg.parts[0].text}`)
            .join('\n') + `\n用户: ${message}`;

        // 添加用户消息到历史记录
        role.addToHistory("user", message);
        
        console.log(`\n🤖 [${role.name}]:`);
        
        let fullResponse = '';
        const startTime = Date.now();
        
        // 调用API并流式输出
        const response = await callGeminiAPIWithStreaming(fullPrompt, {
            onChunk: (chunk) => {
                process.stdout.write(chunk);
                fullResponse += chunk;
            },
            streamDelay: 15, // 调整速度
            temperature: 0.9,
            maxTokens: 2048
        });
        
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`\n\n⏱️  生成时间: ${elapsed}秒`);
        
        // 添加AI回复到历史记录
        role.addToHistory("model", fullResponse);
        
        return fullResponse;
    } catch (error) {
        console.error("聊天过程中发生错误:", error);
    }
}

// 打印分隔线
function printDivider() {
    console.log("\n" + "─".repeat(60) + "\n");
}

// 主函数
async function main() {
    try {
        console.log("\n");
        console.log("╔═══════════════════════════════════════════════════════╗");
        console.log("║          🌟 Gemini AI 流式聊天系统 🌟                  ║");
        console.log("╚═══════════════════════════════════════════════════════╝");
        
        // 精灵辅助老师对话
        printDivider();
        console.log("📚 === 与精灵辅助老师的对话 ===");
        const fairyChat = await createChatSession(fairyTutor);
        
        console.log("\n💭 用户: 我在做一道数学题，求解方程：2x + 5 = 13，但不知道怎么开始，能帮我吗？");
        await handleChatWithStreaming(fairyChat, fairyTutor, 
            "我在做一道数学题，求解方程：2x + 5 = 13，但不知道怎么开始，能帮我吗？");
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log("\n💭 用户: 我把5移到右边了，变成2x = 13 - 5，对吗？");
        await handleChatWithStreaming(fairyChat, fairyTutor, 
            "我把5移到右边了，变成2x = 13 - 5，对吗？");
        
        // 好奇树博士对话
        printDivider();
        console.log("🌳 === 与好奇树博士的对话 ===");
        const treeChat = await createChatSession(curiosityTree);
        
        console.log("\n💭 用户: 为什么天空是蓝色的？");
        await handleChatWithStreaming(treeChat, curiosityTree, 
            "为什么天空是蓝色的？");
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log("\n💭 用户: 那为什么日落时天空会变成红色呢？");
        await handleChatWithStreaming(treeChat, curiosityTree, 
            "那为什么日落时天空会变成红色呢？");
        
        printDivider();
        console.log("✨ 对话结束，感谢使用！\n");
        
    } catch (error) {
        console.error("\n❌ 程序发生错误:", error);
    }
}

// 运行主函数
main();
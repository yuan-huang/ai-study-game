import dotenv from 'dotenv';
import { fairyTutor, curiosityTree } from './sys/chatRoles.js';
import { proxyFetch } from './utils/proxyFetch.js';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

// 配置代理
proxyFetch.updateConfig({
    proxyUrl: 'http://127.0.0.1:10808',
    proxyType: 'http',
    debug: false,  // 开启调试日志
    timeout: 30000
});

// 直接调用Gemini API
async function callGeminiAPI(prompt) {
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
                ]
            }
        );

        if (!response.ok) {
            throw new Error(`API调用失败: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error("API调用错误:", error);
        if (error.response) {
            const errorText = await error.response.text();
            console.error("API错误详情:", errorText);
        }
        throw error;
    }
}

// 创建聊天会话
async function createChatSession(role) {
    try {
        console.log(`\n[初始化${role.name}]`);
        // 发送初始系统提示
        await callGeminiAPI(role.initialPrompt);
        return role;
    } catch (error) {
        console.error(`初始化${role.name}失败:`, error);
        throw error;
    }
}

// 发送消息并处理回复
async function handleChat(session, role, message) {
    try {
        // 构建完整的提示，包含历史记录
        const fullPrompt = role.history
            .map(msg => `${msg.role === 'user' ? '用户' : 'AI'}: ${msg.parts[0].text}`)
            .join('\n') + `\n用户: ${message}`;

        // 调用API
        const response = await callGeminiAPI(fullPrompt);
        
        // 添加用户消息和AI回复到历史记录
        role.addToHistory("user", message);
        role.addToHistory("model", response);
        
        // 输出结果
        console.log(`\n[${role.name}的回答]:`);
        console.log(response);
        
        return response;
    } catch (error) {
        console.error("聊天过程中发生错误:", error);
        if (error.response) {
            const errorText = await error.response.text();
            console.error("API错误详情:", errorText);
        }
    }
}

// 主函数
async function main() {
    try {
        // 创建精灵辅助老师的聊天会话
        console.log("\n=== 与精灵辅助老师的对话 ===");
        const fairyChat = await createChatSession(fairyTutor);
        await handleChat(fairyChat, fairyTutor, "我在做一道数学题，求解方程：2x + 5 = 13，但不知道怎么开始，能帮我吗？");
        await handleChat(fairyChat, fairyTutor, "我把5移到右边了，变成2x = 13 - 5，对吗？");
        
        // 创建好奇树博士的聊天会话
        console.log("\n=== 与好奇树博士的对话 ===");
        const treeChat = await createChatSession(curiosityTree);
        await handleChat(treeChat, curiosityTree, "为什么天空是蓝色的？");
        await handleChat(treeChat, curiosityTree, "那为什么日落时天空会变成红色呢？");
        
    } catch (error) {
        console.error("发生错误:", error);
    }
}

// 运行主函数
main(); 
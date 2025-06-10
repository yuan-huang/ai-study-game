import { GeminiService } from '../services/GeminiService';
import { fairyTutor, curiosityTree } from '../ai/roles/ChatRoles';

async function testChat() {
    try {
        const gemini = new GeminiService();

        // 测试精灵辅助老师
        console.log("\n=== 与精灵辅助老师的对话 ===");
        const fairyChat = await gemini.createChatSession(fairyTutor);
        
        console.log("\n[普通对话测试]");
        const response1 = await gemini.handleChat(fairyChat, "我在做一道数学题，求解方程：2x + 5 = 13，但不知道怎么开始，能帮我吗？");
        console.log("AI回答:", response1);
        
        const response2 = await gemini.handleChat(fairyChat, "我把5移到右边了，变成2x = 13 - 5，对吗？");
        console.log("AI回答:", response2);

        // 测试好奇树博士
        console.log("\n=== 与好奇树博士的对话 ===");
        const treeChat = await gemini.createChatSession(curiosityTree);
        
        console.log("\n[流式对话测试]");
        console.log("AI正在回答：");
        for await (const chunk of gemini.streamChat(treeChat, "为什么天空是蓝色的？")) {
            process.stdout.write(chunk);
        }
        
        console.log("\n\n继续提问：");
        for await (const chunk of gemini.streamChat(treeChat, "那为什么日落时天空会变成红色呢？")) {
            process.stdout.write(chunk);
        }
        console.log("\n");

    } catch (error) {
        console.error("测试过程中发生错误:", error);
    }
}

// 运行测试
testChat(); 
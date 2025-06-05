import dotenv from 'dotenv';
import { streamFetch } from './utils/streamFetch.js';
import readline from 'readline';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

// 创建readline接口
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// 配置流式处理
streamFetch.updateConfig({
    debug: false,
    onToken: (token) => {
        // 直接输出，不换行
        process.stdout.write(token);
    },
    onError: (error) => {
        console.error('\n\n错误:', error);
        rl.close();
    },
    onFinish: () => {
        console.log('\n\n回答完成！');
        askQuestion();  // 继续下一轮对话
    }
});

// 提问函数
function askQuestion() {
    rl.question('\n请输入您的问题 (输入 "exit" 退出): ', async (question) => {
        if (question.toLowerCase() === 'exit') {
            console.log('再见！');
            rl.close();
            return;
        }

        console.log('\nAI正在回答：');
        await streamFetch.streamChat(question, GEMINI_API_KEY);
    });
}

// 开始对话
console.log('欢迎使用Gemini AI聊天程序（流式响应版）\n');
askQuestion(); 
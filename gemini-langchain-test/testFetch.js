import dotenv from 'dotenv';
import { proxyFetch } from './utils/proxyFetch.js';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyAyMT4q99XsXiLpqQz22MpeiXJpqJ96-YM';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

// 配置代理fetch工具
proxyFetch.updateConfig({
    debug: true,  // 开启调试日志
    timeout: 30000,  // 设置30秒超时
    proxyUrl: 'http://127.0.0.1:10808',
    proxyType: 'http'
});

async function testGeminiAPI(prompt) {
    try {
        console.log('发送请求...');
        console.log('提示语:', prompt);

        const response = await proxyFetch.post(API_URL, {
            contents: [
                {
                    parts: [
                        {
                            text: prompt
                        }
                    ]
                }
            ]
        });

        if (!response.ok) {
            throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('\n=== API响应 ===');
        console.log('状态码:', response.status);
        console.log('完整响应:', JSON.stringify(data, null, 2));
        console.log('\n=== AI回答 ===');
        console.log(data.candidates[0].content.parts[0].text);

    } catch (error) {
        console.error('错误:', error);
        if (error.response) {
            const errorText = await error.response.text();
            console.error('API错误详情:', errorText);
        }
    }
}

// 测试不同的提示语
async function runTests() {
    const prompts = [
        "用简单的话解释AI是如何工作的",
        "写一个Python的Hello World程序",
        "解释量子计算机的基本原理"
    ];

    for (const prompt of prompts) {
        console.log('\n' + '='.repeat(50));
        await testGeminiAPI(prompt);
        // 在请求之间添加短暂延迟
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

// 运行测试
runTests(); 
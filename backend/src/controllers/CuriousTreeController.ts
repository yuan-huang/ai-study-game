import { BaseController } from './BaseController';
import { Request, Response } from 'express';
import { CuriousTreeChatModel, ICuriousTreeChat } from '../models/CuriousTreeChat';
import { CuriousTreeGrowthModel } from '../models/CuriousTreeGrowth';
import { getChatRole } from '../ai/roles/ChatRoles';
import dotenv from 'dotenv';
import { AIServiceFactory } from '../services/AIServiceFactory';
dotenv.config();

export class CuriousTreeController extends BaseController<ICuriousTreeChat> {
    private aiService = AIServiceFactory.getInstance().getService();

    constructor() {
        super(CuriousTreeChatModel);
    }

    async chat(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user.userId;

            const { message } = req.body;
            if (!message) {
                this.sendError(res, '缺少消息内容');
                return;
            }

            // 获取或创建对话记录
            let conversationModel = await CuriousTreeChatModel.findOne({ userId });
            if (!conversationModel) {
                conversationModel = new CuriousTreeChatModel({ userId, chatHistory: [] });
            }

            // 获取或创建成长值记录
            let growthModel = await CuriousTreeGrowthModel.findOne({ userId });
            if (!growthModel) {
                growthModel = new CuriousTreeGrowthModel({ userId, growthValue: 0, level: 1 });
            }

            const chatRole = getChatRole('curiosityTree');

            // 定义工具，可以让AI查询当前用户历史对话记录
            const tools = [
                {
                    type: 'function',
                    function: {
                        name: 'get_conversation_history',
                        description: '获取当前用户历史对话记录',
                        parameters: {
                            type: 'object',
                            properties: {
                                userId: { type: 'string', description: '用户ID' }
                            }
                        }
                    }
                }
            ];

            const userPrompt = `当前跟你对话的用户的ID是：${userId}，以下是用户的问题：${message}

请评估这个问题的好奇程度（0-20分），并给出评分理由。然后回答这个问题。
请按照以下格式返回：
评分：X分
评分理由：XXX
回答：XXX`


            // 获取AI响应
            const aiResponse = await this.aiService.chat([
                {
                    role: 'model',
                    parts: [{ text: chatRole.initialPrompt }]
                },
                {
                    role: 'user',
                    parts: [{ text: userPrompt }]
                }
            ]);

            // 解析AI响应，提取评分和回答内容
            const scoreMatch = aiResponse.content.match(/评分：(\d+)分/);
            const score = scoreMatch ? parseInt(scoreMatch[1]) : 0;
            
            // 提取回答内容
            const answerMatch = aiResponse.content.match(/回答：([\s\S]*)/);
            const answer = answerMatch ? answerMatch[1].trim() : aiResponse.content;

            // 更新成长值
            growthModel.growthValue = Math.min(100, growthModel.growthValue + score);
            // 每100分升一级
            growthModel.level = Math.floor(growthModel.growthValue / 100) + 1;
            await growthModel.save();

            // 添加AI响应
            conversationModel.chatHistory.push({
                role: 'assistant',
                question: message,
                aiResponse: answer,
                timestamp: new Date()
            });

            // 保存对话记录
            await conversationModel.save();

            this.sendSuccess(res, {
                message: answer,
                conversationId: conversationModel._id,
                growthInfo: {
                    growthValue: growthModel.growthValue,
                    level: growthModel.level,
                    score: score
                }
            });
        } catch (error) {
            console.error('聊天处理错误:', error);
            this.sendError(res, '处理聊天请求时发生错误', 500);
        }
    }

    async getConversationHistory(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user.userId;
            
            // 使用聚合管道在数据库层面完成筛选和排序
            const result = await CuriousTreeChatModel.aggregate([
                { $match: { userId } },
                { $unwind: "$chatHistory" },
                { $sort: { "chatHistory.timestamp": -1 } },
                { $limit: 10 },
                {
                    $group: {
                        _id: "$_id",
                        messages: { $push: "$chatHistory" }
                    }
                }
            ]);

            if (!result || result.length === 0) {
                this.sendSuccess(res, { data: { messages: [] } });
                return;
            }

            // 转换时间戳格式
            const messages = result[0].messages.map((msg: { timestamp: Date }) => ({
                ...msg,
                timestamp: msg.timestamp.toISOString()
            }));

            this.sendSuccess(res, { data: { messages } });
        } catch (error) {
            console.error('获取对话历史错误:', error);
            this.sendError(res, '获取对话历史时发生错误', 500);
        }
    }

    async getGrowth(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user.userId;

            // 获取成长值记录
            const growthModel = await CuriousTreeGrowthModel.findOne({ userId });
            if (!growthModel) {
                this.sendSuccess(res, {
                    growthValue: 0,
                    level: 1
                });
                return;
            }

            this.sendSuccess(res, {
                growthValue: growthModel.growthValue,
                level: growthModel.level
            });
        } catch (error) {
            console.error('获取成长值错误:', error);
            this.sendError(res, '获取成长值时发生错误', 500);
        }
    }

    async clearHistory(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user.userId;

            // 删除该用户的所有聊天记录
            await CuriousTreeChatModel.deleteMany({ userId });

            // 创建一个新的空记录
            const newChat = new CuriousTreeChatModel({
                userId,
                chatHistory: []
            });
            await newChat.save();

            this.sendSuccess(res, { message: '历史记录已清空' });
        } catch (error) {
            console.error('清空历史记录错误:', error);
            this.sendError(res, '清空历史记录时发生错误', 500);
        }
    }

    async chatStream(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user.userId;
            const { message } = req.body;

            if (!message) {
                this.sendError(res, '缺少消息内容');
                return;
            }

            // 设置响应头，启用流式传输
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');

            // 获取或创建对话记录
            let conversationModel = await CuriousTreeChatModel.findOne({ userId });
            if (!conversationModel) {
                conversationModel = new CuriousTreeChatModel({ userId, chatHistory: [] });
            }

            // 获取或创建成长值记录
            let growthModel = await CuriousTreeGrowthModel.findOne({ userId });
            if (!growthModel) {
                growthModel = new CuriousTreeGrowthModel({ userId, growthValue: 0, level: 1 });
            }

            const chatRole = getChatRole('curiosityTree');

            const userPrompt = `当前跟你对话的用户的ID是：${userId}，以下是用户的问题：${message}

请评估这个问题的好奇程度（0-20分），并给出评分理由。然后回答这个问题。
请按照以下格式返回：
评分：X分
评分理由：XXX
回答：XXX`;

            let lastResponse = '';
            // 调用Ollama进行流式对话
            await this.aiService.chatStream(
                [
                    {
                        role: 'model',
                        parts: [{ text: chatRole.initialPrompt }]
                    },
                    {
                        role: 'user',
                        parts: [{ text: userPrompt }]
                    }
                ],
                (chunk) => {
                    // 发送每个响应块
                    res.write(JSON.stringify({ content: chunk.content }) + '\n');
                    lastResponse = chunk.content;
                }
            );

            // 解析AI响应，提取评分和回答内容
            const scoreMatch = lastResponse.match(/评分：(\d+)分/);
            const score = scoreMatch ? parseInt(scoreMatch[1]) : 0;
            
            // 提取回答内容
            const answerMatch = lastResponse.match(/回答：([\s\S]*)/);
            const answer = answerMatch ? answerMatch[1].trim() : lastResponse;

            // 更新成长值
            growthModel.growthValue = Math.min(100, growthModel.growthValue + score);
            // 每100分升一级
            growthModel.level = Math.floor(growthModel.growthValue / 100) + 1;
            await growthModel.save();

            // 添加AI响应
            conversationModel.chatHistory.push({
                role: 'assistant',
                question: message,
                aiResponse: answer || lastResponse, // 确保aiResponse不为空
                timestamp: new Date()
            });

            // 保存对话记录
            await conversationModel.save();

            // 结束响应
            res.end();

        } catch (error) {
            console.error('流式聊天处理错误:', error);
            // 检查响应是否已经发送
            if (!res.headersSent) {
                res.status(500).json({ error: '处理聊天请求时发生错误' });
            } else {
                // 如果响应已经开始发送，尝试发送错误消息
                try {
                    res.write(JSON.stringify({ error: '处理聊天请求时发生错误' }) + '\n');
                    res.end();
                } catch (e) {
                    console.error('发送错误消息失败:', e);
                }
            }
        }
    }
}
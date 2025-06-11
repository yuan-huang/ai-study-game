import { BaseController } from './BaseController';
import { Request, Response } from 'express';
import { CuriousTreeChatModel, ICuriousTreeChat } from '../models/CuriousTreeChat';
import { CuriousTreeGrowthModel } from '../models/CuriousTreeGrowth';
import { GeminiService } from '../utils/GeminiService';
import { getChatRole } from '../ai/roles/ChatRoles';

export class CuriousTreeController extends BaseController<ICuriousTreeChat> {
    private geminiService: GeminiService;

    constructor() {
        super(CuriousTreeChatModel);
        this.geminiService = GeminiService.getInstance();
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

            const ai_model = "gemini-2.0-flash"
            // 获取AI响应
            const aiResponse = await this.geminiService.generateContent(chatRole.initialPrompt, userPrompt, ai_model);

            // 解析AI响应，提取评分和回答内容
            const scoreMatch = aiResponse.match(/评分：(\d+)分/);
            const score = scoreMatch ? parseInt(scoreMatch[1]) : 0;
            
            // 提取回答内容
            const answerMatch = aiResponse.match(/回答：([\s\S]*)/);
            const answer = answerMatch ? answerMatch[1].trim() : aiResponse;

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

            // 清空用户的对话历史
            await CuriousTreeChatModel.updateOne(
                { userId },
                { $set: { chatHistory: [] } }
            );

            this.sendSuccess(res, { message: '历史记录已清空' });
        } catch (error) {
            console.error('清空历史记录错误:', error);
            this.sendError(res, '清空历史记录时发生错误', 500);
        }
    }
}
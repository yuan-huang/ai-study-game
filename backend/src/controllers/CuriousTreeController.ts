import { BaseController } from './BaseController';
import { Request, Response } from 'express';
import { CuriousTreeModel, ICuriousTree } from '../models/CuriousTree';
import { GeminiService } from '../utils/GeminiService';
import { getChatRole } from '../ai/roles/ChatRoles';

export class CuriousTreeController extends BaseController<ICuriousTree> {
    private geminiService: GeminiService;

    constructor() {
        super(CuriousTreeModel);
        this.geminiService = GeminiService.getInstance();
    }

    async chat(req: Request, res: Response): Promise<void> {
        try {
            const { userId, message } = req.body;

            if (!userId || !message) {
                this.sendError(res, '缺少必要参数');
                return;
            }

            // 获取或创建对话记录
            let conversationModel = await CuriousTreeModel.findOne({ userId });
            if (!conversationModel) {
                conversationModel = new CuriousTreeModel({ userId, messages: [] });
            }

            //curiosityTree
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

            const userPrompt = `当前跟你对话的用户的ID是：${userId}，以下是用户的问题：${message}`
            const ai_model = "gemini-2.0-flash"
            // 获取AI响应
            const aiResponse = await this.geminiService.generateContent(chatRole.initialPrompt,userPrompt,ai_model,tools);


            // 添加AI响应
            conversationModel.chatHistory.push({
                role: 'assistant',
                question: message,
                aiResponse: aiResponse,
                timestamp: new Date()
            });

            // 保存对话记录
            await conversationModel.save();

            this.sendSuccess(res, {
                message: aiResponse,
                conversationId: conversationModel._id
            });
        } catch (error) {
            console.error('聊天处理错误:', error);
            this.sendError(res, '处理聊天请求时发生错误', 500);
        }
    }

    async getConversationHistory(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;
            
            // 使用聚合管道在数据库层面完成筛选和排序
            const result = await CuriousTreeModel.aggregate([
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
                this.sendSuccess(res, { messages: [] });
                return;
            }

            this.sendSuccess(res, { messages: result[0].messages });
        } catch (error) {
            console.error('获取对话历史错误:', error);
            this.sendError(res, '获取对话历史时发生错误', 500);
        }
    }
}
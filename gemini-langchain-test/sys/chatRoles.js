// 基础聊天角色类
export class BaseChatRole {
    constructor(name, description, initialPrompt) {
        this.name = name;
        this.description = description;
        this.initialPrompt = initialPrompt;
        this.history = [
            {
                role: "user",
                parts: [{ text: this.initialPrompt }]
            }
        ];
    }

    // 获取角色历史记录
    getHistory() {
        return this.history;
    }

    // 添加对话历史
    addToHistory(role, text) {
        this.history.push({
            role: role,
            parts: [{ text: text }]
        });
    }

    // 清除历史记录
    clearHistory() {
        this.history = [
            {
                role: "user",
                parts: [{ text: this.initialPrompt }]
            }
        ];
    }
}

// 精灵辅助角色
export class FairyTutorRole extends BaseChatRole {
    constructor() {
        super(
            "精灵辅助老师",
            "一个充满智慧和耐心的精灵导师，专门帮助学生解答练习题",
            `你是一个名叫"精灵辅助老师"的AI角色。你的特点是：
1. 充满耐心和鼓励，总是用积极的语气回答
2. 善于将复杂问题分解成简单步骤
3. 会引导学生思考，而不是直接给出答案
4. 擅长用比喻和例子来解释概念
5. 会在学生解题成功时给予赞美和鼓励

请保持这个角色的特征，用温和友善的语气回答问题。`
        );
    }
}

// 好奇树角色
export class CuriosityTreeRole extends BaseChatRole {
    constructor() {
        super(
            "好奇树博士",
            "一个充满智慧的智慧树，专门解答学生的各种好奇问题",
            `你是一个名叫"好奇树博士"的AI角色。你的特点是：
1. 像一棵古老的智慧树，拥有渊博的知识
2. 善于激发学生的好奇心和想象力
3. 会用有趣的故事和科学事实相结合
4. 鼓励探索和提出更多问题
5. 回答方式生动有趣，常常使用大自然的比喻

请保持这个角色的特征，用生动有趣的方式回答问题。`
        );
    }
}

// 导出预定义的角色实例
export const fairyTutor = new FairyTutorRole();
export const curiosityTree = new CuriosityTreeRole(); 
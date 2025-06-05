// 基础角色类
export class BaseRole {
    constructor(name, description) {
        this.name = name;
        this.description = description;
        this.systemPrompt = this.getDefaultSystemPrompt();
    }

    // 获取默认的系统提示语
    getDefaultSystemPrompt() {
        return `
你现在扮演一个名为 ${this.name} 的角色。
角色描述：${this.description}
请始终保持这个角色的特征和行为方式。
`;
    }

    // 设置自定义系统提示语
    setSystemPrompt(prompt) {
        this.systemPrompt = prompt;
    }

    // 获取当前系统提示语
    getSystemPrompt() {
        return this.systemPrompt;
    }

    // 生成完整的提示语
    async generatePrompt(userInput) {
        return `${this.systemPrompt}\n用户输入: ${userInput}`;
    }
}

// 助手角色类
export class AssistantRole extends BaseRole {
    constructor() {
        super(
            "AI助手",
            "一个专业、友好、有帮助的AI助手，擅长解答问题和提供建议。"
        );
    }
}

// 程序员角色类
export class ProgrammerRole extends BaseRole {
    constructor() {
        super(
            "程序员",
            "一个经验丰富的程序员，擅长编写代码、解决技术问题和提供最佳实践建议。"
        );
        this.setSystemPrompt(`
你是一个专业的程序员，具有以下特点：
1. 编写清晰、可维护的代码
2. 遵循编程最佳实践
3. 提供详细的代码解释
4. 考虑性能和安全性
5. 善于调试和问题排查

请用专业的方式回答用户的技术问题。
`);
    }
}

// 导出预定义的角色实例
export const assistant = new AssistantRole();
export const programmer = new ProgrammerRole(); 
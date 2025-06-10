export interface ChatMessage {
    role: 'user' | 'model';
    parts: Array<{
        text: string;
    }>;
}

export interface ChatRole {
    name: string;
    initialPrompt: string;
    history: ChatMessage[];
    addToHistory(role: 'user' | 'model', text: string): void;
}

export class BaseChatRole implements ChatRole {
    name: string;
    initialPrompt: string;
    history: ChatMessage[];

    constructor(name: string, initialPrompt: string) {
        this.name = name;
        this.initialPrompt = initialPrompt;
        this.history = [];
    }

    addToHistory(role: 'user' | 'model', text: string): void {
        this.history.push({
            role,
            parts: [{ text }]
        });
    }
} 
// 游戏事件类型定义
export interface GameEventMap {
    // 登录表单事件
    'showLoginForm': {};
    'hideLoginForm': {};
    'loginSuccess': { welcomeMessage?: string; userData: any };
    'loginError': { message: string };
    
    // 精灵对话事件
    'spiritClick': { position?: { x: number; y: number } };
    'showSpiritDialog': {};
    'hideSpiritDialog': {};
    
    // 通用UI事件
    'showLoading': { message?: string };
    'hideLoading': {};
    'showError': { message: string };
    'hideError': {};
}

// 事件发射器类
export class GameEventEmitter {
    private static instance: GameEventEmitter;
    
    static getInstance(): GameEventEmitter {
        if (!GameEventEmitter.instance) {
            GameEventEmitter.instance = new GameEventEmitter();
        }
        return GameEventEmitter.instance;
    }
    
    // 发射事件
    emit<K extends keyof GameEventMap>(eventType: K, data?: GameEventMap[K]): void {
        const event = new CustomEvent(eventType, { detail: data });
        window.dispatchEvent(event);
        console.log(`🎯 发射事件: ${eventType}`, data);
    }
    
    // 监听事件
    on<K extends keyof GameEventMap>(
        eventType: K, 
        handler: (data: GameEventMap[K]) => void
    ): () => void {
        const listener = (event: Event) => {
            const customEvent = event as CustomEvent<GameEventMap[K]>;
            handler(customEvent.detail);
        };
        
        window.addEventListener(eventType, listener);
        
        // 返回取消监听的函数
        return () => {
            window.removeEventListener(eventType, listener);
        };
    }
    
    // 一次性监听事件
    once<K extends keyof GameEventMap>(
        eventType: K, 
        handler: (data: GameEventMap[K]) => void
    ): void {
        const listener = (event: Event) => {
            const customEvent = event as CustomEvent<GameEventMap[K]>;
            handler(customEvent.detail);
            window.removeEventListener(eventType, listener);
        };
        
        window.addEventListener(eventType, listener);
    }
}

// 导出单例实例
export const gameEvents = GameEventEmitter.getInstance(); 